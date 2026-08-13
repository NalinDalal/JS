/**
 * Module 11 — 11.8 Security: DTLS-SRTP, and why a signaling/TURN server can't read media
 * Demonstrates the DTLS key-derivation relationship in miniature and the threat model.
 *
 * Run: node 07-webrtc-security.js
 */

const crypto = require("node:crypto");

// --- Why media is unreadable even by the server that relays signaling ---
// 1. SDP offers/answers flow through signaling (readable, but only metadata)
// 2. Media does NOT flow through signaling — peers send UDP directly to each other
// 3. Before any media, peers run DTLS directly (over the ICE-selected path):
//    - each peer has a self-signed cert; the SDP carried its fingerprint
//    - the DTLS handshake authenticates the fingerprint and derives SRTP keys
// 4. Media = SRTP (encrypted RTP). DataChannels = SCTP over the SAME DTLS session
//    => signaling server, ISP, and TURN relay see encrypted packets only

// ---- DTLS key derivation (the real primitive, ECDHE-style) ----
const alice = crypto.createECDH("prime256v1");
const bob = crypto.createECDH("prime256v1");
const alicePub = alice.generateKeys();
const bobPub = bob.generateKeys();
const sharedA = alice.computeSecret(bobPub);
const sharedB = bob.computeSecret(alicePub);
console.log("DTLS ECDHE shared secret (equal both sides):", sharedA.equals(sharedB)); // true

// SRTP master key is derived (via HKDF) from this shared secret — each side independently
const srtpKey = crypto.createHash("sha256").update(Buffer.concat([sharedA, Buffer.from("SRTP-master-key")])).digest();
console.log("SRTP master key (only peers can compute it):", srtpKey.toString("hex").slice(0, 32) + "...");

// ---- Encrypt a fake media packet: server/TURN relay has NO key ---- 
const plainRtp = Buffer.from("RTP/audio frame bytes"); // what a packet looks like
const iv = crypto.randomBytes(12);
const cipher = crypto.createCipheriv("aes-128-gcm", srtpKey.subarray(0, 16), iv);
const encrypted = Buffer.concat([cipher.update(plainRtp), cipher.final()]);
console.log("\nSRTP packet on the wire:", JSON.stringify(encrypted.toString("latin1").slice(0, 12)) + "...");
console.log("A TURN relay that forwards this packet sees:", JSON.stringify(encrypted.toString("latin1").slice(0, 12)) + "...");
// It can forward bytes, count packets, and time them — but never decrypt them.
console.log("relay sees:", JSON.stringify(encrypted.toString("latin1").slice(0, 12)) + "... (encrypted bytes)");

// ---- Threat model (see webrtc.md 11.8 for full prose) ----
//   Signaling MITM:            Injects fake SDP / swaps fingerprints → Authenticated signaling
//   Stolen signaling token:    Attacker joins the room, gets SDP/ICE → Short-lived tokens, one-time use
//   Eavesdropper on the path:  Sees encrypted packets + metadata only → DTLS-SRTP — nothing else needed
//   TURN relay operator:       Can't decrypt; can analyze metadata → Run your own TURN; use only when STUN fails
//   Malicious page getUserMedia: Camera/mic theft → Secure context + explicit user permission prompt

// --- Interview one-liners ---
// DTLS: like TLS but over UDP — used for the RTP/SCTP crypto handshake.
// SRTP keys come FROM the DTLS session — no keys ever pass through signaling.
// getUserMedia requires a secure context (HTTPS/localhost) AND user permission.
// WebRTC in production: always TLS + token-gated signaling + TURN-only-when-needed.