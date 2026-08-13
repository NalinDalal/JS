/**
 * Module 11 — 11.1 WebRTC vs WebSocket + architecture overview
 * When to pick which, and the roles of every piece of the stack.
 *
 * Run: node 01-webrtc-concepts.js
 */

console.log("--- WebRTC vs WebSocket: the decision table ---");

const decision = [
  ["Latency", "Sub-500ms P2P (media: 100-300ms)", "Server-relayed (adds a hop)"],
  ["Media (audio/video/screen)", "Native — getUserMedia, codecs, jitter buffers", "Not possible — bytes only"],
  ["Server bandwidth", "Peers carry the traffic (P2P)", "Every byte flows through your server"],
  ["NAT traversal", "STUN/TURN deal with NAT", "None needed — server has a public IP"],
  ["Server role", "Signaling only (SDP/ICE/control)", "Relays 100% of application data"],
  ["Use cases", "Video calls, games, file transfer, live collab", "Chat, dashboards, notifications, signaling for WebRTC!"],
];
for (const [k, webrtc, ws] of decision) {
  console.log(`${k.padEnd(22)} WebRTC: ${webrtc}`);
  console.log(" ".repeat(23) + `WS:     ${ws}`);
}

console.log("\n--- Architecture map ---");
const map = [
  "getUserMedia()        -> MediaStream -> tracks (audio/video)",
  "createDataChannel()   -> RTCDataChannel (SCTP over DTLS) for data",
  "RTCPeerConnection     -> owns tracks+channels, runs ICE, negotiates SDP",
  "Signaling (WS)        -> exchanges offer/answer + ICE candidates BEFORE media flows",
  "STUN                  -> 'what's my public IP?' (NAT traversal)",
  "TURN                  -> relay fallback when NAT traversal fails",
  "DTLS                  -> end-to-end encryption of all media + data",
];
for (const line of map) console.log("  " + line);

console.log("\n--- The one-line summary ---");
// WebRTC = negotiated P2P (signaling on WS, media over DTLS-encrypted UDP);
console.log("WebSocket = always-on server relay, simpler and right for app-data.");

console.log("\n--- Classic hybrid architecture ---");
console.log("Client A ----WS signaling----> Server ----WS signaling----> Client B");
console.log("Client A <----------encrypted P2P media/data-----------> Client B");