/**
 * Module 11 — 11.4 SDP explained: parse a realistic Chrome offer line by line,
 * and see how ICE candidates + STUN/TURN fit in.
 *
 * Run: node 04-sdp-explained.js
 */

// This is what Chrome's RTCPeerConnection.createOffer() produces (trimmed for readability)
const realSdp = [
  "v=0", // protocol version
  "o=- 4586545861216319459 2 IN IP4 127.0.0.1", // origin: session id, version, nettype, addrtype, address
  "s=-", // session name
  "t=0 0", // session active times
  "a=group:BUNDLE 0 1 2", // BUNDLE: all m-lines share one 5-tuple (one DTLS connection)
  "a=msid-semantic: WMS", // media-stream-id semantics
  "",
  "m=audio 9 UDP/TLS/RTP/SAVPF 111 63 9", // audio m-line: port 9 (ICE fills real port), secure RTP profile, codec payload types
  "c=IN IP4 0.0.0.0", // connection address (real one comes via ICE)
  "a=rtcp-mux", // RTP + RTCP on one port
  "a=mid:0", // m-line id (BUNDLE uses this)
  "a=sendrecv", // direction: we send and receive audio
  "a=rtpmap:111 opus/48000/2", // payload 111 = Opus, 48kHz, 2ch
  "a=fmtp:111 minptime=10;useinbandfec=1", // Opus options: forward error correction on
  "a=rtpmap:63 red/48000/2", // redundancy payload
  "a=rtpmap:9 G722/8000", // legacy codec, still offered
  "a=ice-ufrag:qhB8", // ICE username fragment — changes on every ICE restart
  "a=ice-pwd:oi3kFz1mNx2qRk3pLm4nO5pQ", // ICE password
  "a=fingerprint:sha-256 4A:2B:...:9F", // DTLS cert fingerprint (mutual auth of peers)
  "a=setup:actpass", // DTLS role: we'll do whatever the remote picks (actpass -> active)
  "a=rtcp-fb:111 transport-cc", // congestion control feedback (WebRTC's GCC/BBR)
  "a=ssrc:123456789 cname:abc123", // sync source + canonical name (stream identity)
  "",
  "m=video 9 UDP/TLS/RTP/SAVPF 96 97 98", // video m-line
  "c=IN IP4 0.0.0.0",
  "a=mid:1",
  "a=sendrecv",
  "a=rtpmap:96 VP8/90000", // VP8 video
  "a=rtpmap:97 rtx/90000", // RTX: retransmission packets
  "a=fmtp:96 max-fs=12288;max-fr=60", // VP8 size/rate caps
  "a=rtcp-fb:96 nack", // NACK (loss recovery)
  "a=rtcp-fb:96 nack pli", // PLI: "I lost a frame, resend keyframe"
  "a=rtcp-fb:96 goog-remb", // older bitrate feedback
  "a=ssrc:987654321 cname:abc123",
  "",
  "m=application 9 UDP/DTLS/SCTP webrtc-datachannel", // DataChannel m-line (SCTP)
  "a=mid:2",
  "a=sctp-port:5000", // SCTP port for channels
  "a=max-message-size:262144", // max DataChannel message size (256KB)
].join("\r\n") + "\r\n";

console.log("=== A real SDP offer, annotated ===");
const annotations = {
  "v=": "version",
  "o=": "origin (session id + address; cosmetic)",
  "s=": "session name",
  "t=": "time the session is active",
  "a=group:BUNDLE": "all m-lines bundle onto ONE transport — one DTLS conn for audio+video+data",
  "m=audio": "audio media line — starts negotiation for audio",
  "m=video": "video media line",
  "m=application": "data channel (SCTP) media line",
  "c=IN IP4": "placeholder connection address — the REAL address arrives via ICE candidates",
  "a=rtpmap": "codec mapping (payload number -> codec/clock/channels)",
  "a=fmtp": "codec-specific params (FEC, max sizes)",
  "a=sendrecv": "direction — also sendonly / recvonly / inactive",
  "a=mid": "m-line identifier (BUNDLE groups by this)",
  "a=ice-ufrag": "ICE username fragment — FRESH value on every ICE restart",
  "a=ice-pwd": "ICE password — needed to authenticate connectivity checks",
  "a=fingerprint": "DTLS certificate fingerprint — peers mutually authenticate the ENCRYPTION",
  "a=setup:actpass": "DTLS role negotiation",
  "a=rtcp-fb": "RTCP feedback: nack / pli / transport-cc (loss + congestion)",
  "a=ssrc": "synchronization source — identifies the media stream to receivers",
  "a=sctp-port": "SCTP port used by DataChannels",
  "a=max-message-size": "largest DataChannel message the peer accepts",
};

for (const line of realSdp.trimEnd().split("\r\n")) {
  const key = Object.keys(annotations).find((k) => line.startsWith(k));
  console.log(`  ${line.padEnd(52)} ${key ? "→ " + annotations[key] : ""}`);
}

console.log("\n=== ICE candidates (the part that gets 'trickled') ===");
const candidates = [
  { type: "host", addr: "192.168.1.10:55555", priority: 1 },
  { type: "srflx", addr: "203.0.113.7:44444", priority: 2, via: "STUN", note: "public IP discovered with STUN — works through most NATs" },
  { type: "relay", addr: "turn.example.com:3478:33333", priority: 3, via: "TURN", note: "relayed through TURN server — last resort for symmetric NAT/firewalls" },
];
for (const c of candidates) {
  console.log(
    `  ${c.type.padEnd(6)} ${c.addr.padEnd(34)} priority ${c.priority}  ` +
      (c.via ? `(${c.via}) ${c.note}` : "(local network)")
  );
}

console.log("\n=== How a connection is chosen (simplified) ===");
console.log("For each candidate pair (local x remote), both sides run a STUN-style");
console.log("connectivity check over UDP. First pair that passes wins; pairs are");
console.log("ordered by priority (host > srflx > relay) and by candidate quality.");
console.log("\nKey interview facts:");
// - SDP is NOT secret: it is negotiated via signaling and can be logged.
// - Media IS secret: encrypted by DTLS-SRTP with keys from the DTLS handshake.
// - The candidate-pair in getStats() tells you host/srflx/relay in use.