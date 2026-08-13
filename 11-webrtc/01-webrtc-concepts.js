/**
 * Module 11 — 11.1 WebRTC vs WebSocket + architecture overview
 * When to pick which, and the roles of every piece of the stack.
 *
 * Run: node 01-webrtc-concepts.js
 */

// --- WebRTC vs WebSocket: the decision table ---

// Decision table (see webrtc.md 11.1 for full prose):
//   Latency:              WebRTC: Sub-500ms P2P (media: 100-300ms) | WS: Server-relayed (adds a hop)
//   Media:                WebRTC: Native — getUserMedia, codecs, jitter buffers | WS: Not possible — bytes only
//   Server bandwidth:     WebRTC: Peers carry the traffic (P2P) | WS: Every byte flows through your server
//   NAT traversal:        WebRTC: STUN/TURN deal with NAT | WS: None needed — server has a public IP
//   Server role:          WebRTC: Signaling only (SDP/ICE/control) | WS: Relays 100% of application data
//   Use cases:            WebRTC: Video calls, games, file transfer, live collab | WS: Chat, dashboards, notifications, signaling for WebRTC!

// --- Architecture map ---
//   getUserMedia()        -> MediaStream -> tracks (audio/video)
//   createDataChannel()   -> RTCDataChannel (SCTP over DTLS) for data
//   RTCPeerConnection     -> owns tracks+channels, runs ICE, negotiates SDP
//   Signaling (WS)        -> exchanges offer/answer + ICE candidates BEFORE media flows
//   STUN                  -> 'what's my public IP?' (NAT traversal)
//   TURN                  -> relay fallback when NAT traversal fails
//   DTLS                  -> end-to-end encryption of all media + data

// --- The one-line summary ---
// WebRTC = negotiated P2P (signaling on WS, media over DTLS-encrypted UDP);
// WebSocket = always-on server relay, simpler and right for app-data.

// --- Classic hybrid architecture ---
// Client A ----WS signaling----> Server ----WS signaling----> Client B
// Client A <----------encrypted P2P media/data-----------> Client B
