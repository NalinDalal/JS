/**
 * Module 11 — 11.10 Interview Questions (say the answer out loud BEFORE reading it)
 *
 * Run: node 08-interview-webrtc.js
 */

const qa = [
  ["What is WebRTC?", "Browser-to-browser real-time audio/video/data, P2P. Server handles signaling only; media flows directly between peers, encrypted with DTLS-SRTP."],
  ["WebRTC vs WebSocket — when to choose which?", "WebSocket = server-relayed duplex channel, fine for chat/dashboards and signaling itself. WebRTC = low latency + media + P2P bandwidth savings: calls, games, file transfer, screen share."],
  ["Walk through call setup on a whiteboard.", "A creates offer SDP -> signaling -> B answers with answer SDP -> both trickle ICE candidates -> connectivity checks (STUN) -> best pair wins -> DTLS handshake -> SRTP keys derived -> media flows. States: signaling stable->have-local-offer->have-remote-offer->stable."],
  ["What is SDP?", "Session Description Protocol — plain text describing codecs (Opus/VP8/H.264), m-lines (audio/video/application), directions (sendrecv), ICE ufrag/pwd, DTLS fingerprints. It's metadata, not media — safe to relay."],
  ["What are STUN and TURN?", "STUN: 'what's my public IP:port?' — discovers server-reflexive candidate, enables NAT hole punching. TURN: relays packets through a public server when traversal fails (symmetric NAT/firewalls). TURN = last resort, costs bandwidth; you know it's needed when candidate-pair shows relay type or connection fails without it."],
  ["How is WebRTC secured?", "Every packet encrypted: DTLS for the handshake, SRTP for media, SCTP-over-DTLS for DataChannels. Signaling only sees SDP/ICE. Plus: secure context + user permission for capture, authenticated signaling, fingerprint verification."],
  ["What are the connection states?", "connectionState: new -> connecting -> connected -> disconnected -> failed -> closed. iceConnectionState: new/checking/connected/completed/disconnected/failed. Listen to connectionstatechange; on disconnected try ICE restart (fresh ufrag via new offer) before declaring failure."],
  ["What is renegotiation / ICE restart?", "renegotiationneeded fires when tracks change (add/remove/swap), direction flips, or codec prefs change — app creates a new offer. ICE restart = new offer with fresh ice-ufrag/ice-pwd to re-check connectivity after network changes."],
  ["Multi-user video call: mesh vs SFU?", "Mesh: RTCPeerConnection to every peer — N² connections, ~4 participants max. SFU (Selective Forwarding Unit): one connection to a media server that forwards streams — scales to hundreds; same JS API. That's what Meet/Zoom run."],
  ["RTCDataChannel reliable vs unreliable?", "SCTP-over-DTLS. reliable+ordered = TCP semantics (chat, files). unreliable+unordered with maxRetransmits/maxPacketLifetime = UDP semantics (game positions, live cursors) where latest state beats completeness. Watch bufferedAmount for backpressure."],
  ["How do you get camera/mic and send media?", "navigator.mediaDevices.getUserMedia({audio, video: constraints}) -> MediaStream -> pc.addTrack(track, stream); remote side gets ontrack with the remote stream. Screen share: getDisplayMedia. Switch camera: replaceTrack — no renegotiation."],
  ["Can a signaling server read the video?", "No. It relays SDP/ICE only; keys derive from the DTLS handshake which happens directly between peers. Server sees metadata: who connects, when, how big the packets are."],
  ["Why does a call fail at work but work at home?", "Corporate firewalls/symmetric NAT block UDP hole punching — STUN fails -> needs TURN. Check candidate-pair stats: host/srflx working + no relay = firewall. Add TURN server and it connects."],
  ["How would you debug a WebRTC app?", "Log all three states, use pc.getStats(): currentRoundTripTime, packetsLost, framesPerSecond, candidate-pair componentState, inbound-rtp codec. Check permission errors (NotAllowedError), secure-context, media (track.readyState), and codec agreement in SDP."],
];

let n = 0;
for (const [q, a] of qa) {
  n++;
  console.log(`\n${String(n).padStart(2)}. ${q}`);
  console.log("   →", a);
}

console.log("\n--- Whiteboard practice ---");
console.log("1. Two boxes (A, B) + server box. Draw WS signaling arrows, then UDP media arrows.");
console.log("2. Write the three m-lines of a mini SDP: audio/video/application with rtpmap lines.");
console.log("3. Timeline: offer -> answer -> trickle candidates -> checking -> connected.");