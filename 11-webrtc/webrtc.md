# Module 11: WebRTC — Real-Time Communication

---

## 11.1 What WebRTC Is & When to Use It (vs WebSocket)

### Explain It

WebRTC is a browser-to-browser (P2P) real-time communication framework: **audio/video streaming, data transfer, and file sharing directly between peers** over the internet, without a server forwarding the bytes. The server's role is limited to **signaling** — helping peers discover each other and exchange connection metadata — after which media and data flow peer-to-peer. WebSocket is the opposite model: a persistent tunnel through a server that forwards every message. Use WebSocket when data must be relayed through your own backend (chat with history, authoritative game state) or when you just need a simple duplex channel; use WebRTC when you need **low latency** (sub-500ms), **high throughput** (video), **media** (camera/mic/screen), or P2P **efficiency** (won't triple your server bandwidth). A classic hybrid: WebSocket for signaling, WebRTC for the actual media/data.

### Prove It

```js
// 01-webrtc-concepts.js — run: node 01-webrtc-concepts.js
```

#### Gotchas / Edge Cases

- WebRTC is **P2P only after** signaling — before that, peers know nothing about each other. Signaling is mandatory; media never touches the signaling server.
- WebSocket = always-on server relay (server sees every byte). WebRTC = negotiated P2P (server only sees signaling metadata).
- For ~4 peers, a full mesh (N² connections) is fine. Beyond that, use an SFU — the JS API stays the same, only the server architecture changes.
- TURN relays see packet sizes and timing but **cannot** decrypt DTLS-SRTP media.

---

## 11.2 Architecture: RTCPeerConnection, Tracks, SDP, ICE

### Explain It

`RTCPeerConnection` is the orchestra conductor: it owns the media tracks (from camera/mic via `getUserMedia`, or from `getDisplayMedia` for screen share), negotiates the session, and encrypts everything. The negotiation artifact is **SDP** (Session Description Protocol) — a text document describing media m-lines (`audio`, `video`, `application`), codecs (Opus/VP8/H.264), and connection metadata (ICE ufrag/pwd, DTLS fingerprints, candidate lines). **ICE** (Interactive Connectivity Establishment) figures out HOW each peer can reach the other: it collects **candidates** — local IPs, server-reflexive IPs via **STUN**, and relayed addresses via **TURN** — and both sides try every pairing until one works ("connectivity check"). During negotiation the signaling state machine runs: `stable → have-local-offer → have-remote-offer → stable`. The crypto handshake happens out-of-band of signaling: **DTLS** (which carries SRTCP keys) is negotiated directly over the UDP candidates, which is why signaling servers can't read the media even though they relay the SDP.

### Prove It

```js
// 03-rtc-lifecycle.js — run: node 03-rtc-lifecycle.js (full state machine run + ICE restart)
// 04-sdp-explained.js — run: node 04-sdp-explained.js
```

#### Gotchas / Edge Cases

- SDP is **plain text** and not secret — it can be logged. The secrets (DTLS keys) are negotiated directly over ICE candidates and never transit signaling.
- ICE restart requires a **new offer** with fresh `ice-ufrag`/`ice-pwd`. The old candidates are invalidated and new ones are gathered.
- `disconnected` is **not** `failed` — networks hiccup. Always try ICE restart before declaring the call dead.
- Perfect negotiation requires one peer to be "polite" (accepts renegotiation even when stable) and the other "impolite" (always triggers renegotiation).

---

## 11.3 Signaling: Server / Offer / Answer / ICE Trickle

### Explain It

Peers cannot talk to each other before they know how to reach each other — that discovery is signaling. One peer creates an **offer** (localDescription), the other answers with an **answer**, and **ICE candidates are trickled** (sent as they're found). Signaling is just a message-relay job: WebSocket to your own server is the standard implementation, and it's the PERFECT place to reuse module 10's auth — authenticate the socket handshake, then only join rooms you're allowed in. Because SDP is plain text and media is NOT negotiated through the signaling server, an authenticated signaling server + DTLS-encrypted media means the server never sees the actual streams. Signaling also carries control messages: join/leave, ICE restart ("let's renegotiate with fresh ufrag"), and renegotiation offers for adding tracks or changing codec mode.

### Prove It

```js
// 02-signaling-server.js — run: node 02-signaling-server.js   (auth + rooms + relay)
// peer.html — open TWO tabs in a browser, share camera + chat
```

#### Gotchas / Edge Cases

- Signaling must be **authenticated** — an unauthenticated WebSocket server lets anyone join any room and inject fake SDP.
- SDP is relayed but **never interpreted** by the signaling server — it is opaque text to the server.
- ICE candidates are **trickled** (sent as found), not batched. The offer/answer contains initial candidates; subsequent candidates arrive via the signaling channel.
- Token in the WebSocket query string leaks to server logs. Use HttpOnly cookies or short-lived one-time tokens.

---

## 11.4 SDP & ICE in Detail: STUN vs TURN

### Explain It

SDP is a CRLF-separated text format: `v=` version, `o=` origin, `m=` media lines (audio/video/application + port + transport + codecs), `a=` attributes (rtpmap, fmtp, ice-ufrag, ice-pwd, fingerprint, setup, candidate, mid), `c=` connection. ICE candidates carry transport addresses and priorities; each candidate pair (local × remote) is checked with STUN connectivity probes and the best usable pair wins. **STUN** tells a peer its public IP:port (server-reflexive candidate) — works behind most NATs (UDP hole punching). **TURN** is a relay: a public server that forwards the encrypted packets when NAT traversal fails (symmetric NAT, strict firewalls) — it's the last-resort that makes calls work, at the cost of bandwidth. You know you need TURN when stats show `candidate-pair` using the `relay` type. Modern perfect-negotiation pattern: two peers + polite/impolite logic for ICE restarts on `disconnected`/`failed`.

### Prove It

```js
// 04-sdp-explained.js — run: node 04-sdp-explained.js (parses a real offer line by line)
```

#### Gotchas / Edge Cases

- SDP `c=IN IP4 0.0.0.0` is a placeholder — the **real** address comes via ICE candidates. Never hardcode IPs in SDP.
- `a=ice-ufrag` and `a=ice-pwd` change on every ICE restart. They are not permanent session identifiers.
- `a=fingerprint` is the DTLS cert fingerprint — peers mutually authenticate the encryption. A mismatch means tampered or mismatched certificates.
- BUNDLE (`a=group:BUNDLE`) means all media shares one 5-tuple (one DTLS connection). More m-lines = more bandwidth, but BUNDLE collapses them.

---

## 11.5 Media: getUserMedia, Constraints & Tracks

### Explain It

`navigator.mediaDevices.getUserMedia({ audio, video })` returns a `MediaStream` of **tracks** (each a `MediaStreamTrack` of kind audio/video). Constraints can be ideal/exact: resolution, frame rate, facing mode, echo cancellation, noise suppression. `getDisplayMedia` captures a screen/window/tab (with the browser's permission UI). Tracks are added to the connection with `addTrack` (which triggers negotiation) or `addTransceiver` (proactive). Reflection points for interviews: `muted`/`enabled` vs actually removing tracks; `track.stop()` to release the camera LED; device enumeration via `enumerateDevices`; the fact that a stream can be sent to MULTIPLE `RTCPeerConnection`s (multi-party without SFU). Real apps don't just stream: they also handle track `onmute`/`onend`, and use `RTCRtpSender.replaceTrack` for camera switches without renegotiation.

### Prove It

```js
// 05-media.js — browser code; open inside your page (see peer.html for a full demo)
```

#### Gotchas / Edge Cases

- `getUserMedia` requires a **secure context** (HTTPS or localhost). It will throw on `http://` in production.
- `enumerateDevices()` returns labels only after the user has granted permission — before that, labels are empty strings for privacy.
- `track.stop()` releases the hardware (camera LED goes off). Removing a track from the connection does NOT stop the hardware — call `stop()` explicitly.
- A `MediaStream` can be sent to **multiple** `RTCPeerConnection`s simultaneously — useful for multi-party calls without an SFU.

---

## 11.6 RTCDataChannel: Reliable vs Unreliable, Ordered vs Unordered

### Explain It

`RTCDataChannel` is a SCTP-over-DTLS channel for arbitrary binary/string data — no media codec involved. The config choices matter: **reliable + ordered** (default; like TCP — file transfer, chat), **unreliable + unordered** with `maxRetransmits`/`maxPacketLifetime` (like UDP — game positions, live cursor where the latest state beats completeness). The channel has handshake-y states (`connecting → open → closing → closed`), its own buffering (watch `bufferedAmount` + `bufferedAmountLowThreshold` for backpressure on big transters), and can multiplex many channels per connection. Security note: same DTLS encryption as media. Interview gold: WebRTC is the only browser API where you can do **P2P UDP-ish data** — great for multiplayer games and file transfer without a server.

### Prove It

```js
// 06-datachannel-simulation.js — run: node 06-datachannel-simulation.js
// peer.html — real chat over a DataChannel between two tabs
```

#### Gotchas / Edge Cases

- `bufferedAmount` grows when you send faster than the network can drain. Check it before sending and wait for `bufferedamountlow` to avoid flooding.
- `maxRetransmits=0` = **unreliable, no retries** (like UDP). `maxPacketLifetime` = drop if not delivered within X ms.
- Reliable + ordered (default) is **TCP-like** — use for chat, file transfer. Unreliable + unordered is **UDP-like** — use for game state, live cursors.
- DataChannel message size is capped at ~256KB by default (`maxMessageSize`). Larger payloads need chunking at the application layer.

---

## 11.7 Connection Lifecycle, States & Renegotiation

### Explain It

Connection state is a single property with defined transitions: `new → connecting → connected → disconnected → failed → closed` (plus `checking/completed` variants historically under ICE state). You should listen on `connectionstatechange` rather than polling. A `disconnected` does NOT mean dead — networks hiccup; after a timeout you can attempt an **ICE restart** (new `offer` with fresh `ice-ufrag`/`ice-pwd`) and the connection recovers without re-auth. `renegotiationneeded` fires when you add/remove/swap tracks, change direction (sendrecv ↔ recvonly — e.g., muting one way), or change codec preference; the app responds by creating a new offer. Multi-user calls use `addTrack` per remote peer (mesh — N² connections, fine for ~4), or an SFU (selective forwarding unit) server for scale — that's what Meet/Zoom do. Even in an SFU, the JS side still uses RTCPeerConnection — one connection to the SFU instead of N peers.

### Prove It

```js
// 03-rtc-lifecycle.js — run: node 03-rtc-lifecycle.js (full state machine run + ICE restart)
```

#### Gotchas / Edge Cases

- `disconnected` is **not** `failed` — networks blip. Always try ICE restart before declaring the call dead.
- `renegotiationneeded` fires when tracks change, but **does not** fire if you just change a track's `enabled` state — mute/unmute doesn't trigger renegotiation.
- Adding a track to one peer requires signaling to the other peer — the remote peer must call `addTrack` on its own `RTCPeerConnection`.
- `connectionstatechange` and `iceconnectionstatechange` are the events to listen to, not polling. Polling misses transitions.

---

## 11.8 Security: DTLS, SRTP & Why Signaling Can't Read Media

### Explain It

Belt and braces: media and data are **encrypted end-to-end** — DTLS-SRTP for media (SRTP keys derived from the DTLS handshake), SCTP over DTLS for DataChannels — so even a signaling server relaying SDP/ICE or a TURN relay forwarding packets cannot decrypt the streams. WebRTC requires a **secure context** (HTTPS or localhost); `getUserMedia` additionally needs explicit user permission. The real attack surfaces are: 1) signaling (a rogue server could inject fake SDP or man-in-the-middle the handshake — hence authenticated signaling and good TLS), 2) session renewal (renegotiation offers should be authenticated peers' SDP you already trust), 3) TURN relays seeing encrypted-but-analyzed metadata (who talks to whom, when, packet sizes — that's why some apps run their own TURN). Firebase-style ephemeral room tokens (like module 10's one-time tokens on the WS handshake) are the standard way to gate signaling.

### Prove It

```js
// 08-interview-webrtc.js — run: node 08-interview-webrtc.js
```

#### Gotchas / Edge Cases

- WebRTC requires **HTTPS** (or localhost) — `http://` will block `getUserMedia` and RTCPeerConnection in production.
- A TURN relay is needed when **symmetric NAT** or strict firewalls block direct P2P. You know you need it when `candidate-pair` shows `relay` type.
- STUN is free (public servers like Google's); TURN costs bandwidth. Use STUN first, fall back to TURN only when needed.
- SDP is **not secret** — it can be logged. The secrets are the DTLS keys negotiated directly between peers.

---

## 11.9 Troubleshooting & Debugging

### Explain It

Debugging WebRTC is state inspection: log `connectionState`, `iceConnectionState`, and `signalingState` transitions; use `pc.getStats()` (promise-based metrics: `iceCandidatePair` currentRoundTripTime, `inbound-rtp` framesPerSecond/packetsLost, `candidate-pair` componentState) to see whether the problem is local capture, network, or codec. Common failures: camera permission denied (check secure context + permissions), STUN blocked (no public candidate → only host candidates → likely firewalled), TURN needed (relay candidate appears but never connects), SDP mismatch (codec not offered → "no compatible codec"), DTLS fingerprint mismatch (signaling tampered or PFX fixed), and NAT kinds where `candidate-pair` shows `srflx`-to-`host` working while `relay` needed elsewhere. Debugging heartbeats: implement your own app-level ping over the DataChannel to distinguish "WebRTC down" from "app logic broken".

### Prove It

```js
// 03-rtc-lifecycle.js (simulated states with logs) + peer.html (open DevTools, watch states)
```

#### Gotchas / Edge Cases

- `connectionstatechange` and `iceconnectionstatechange` are the events to listen to, not polling. Polling misses transitions.
- `disconnected` is recoverable — networks blip. Only `failed` means give up (or try ICE restart).
- `renegotiationneeded` fires when tracks change, but **does not** fire if you just change a track's `enabled` state — mute/unmute doesn't trigger renegotiation.
- Adding a track to one peer requires signaling to the other peer — the remote peer must call `addTrack` on its own `RTCPeerConnection`.

---

## 11.10 Interview Questions

### Explain It

Say these out loud: What is WebRTC and when would you choose it over WebSocket? Walk through call setup on a whiteboard (signaling → offer/answer → ICE trickle → DTLS → connected). What do STUN and TURN do — when is TURN required? What is SDP and what does a candidate represent? How is WebRTC secured and why can't a signaling server read the media? What are the connection state transitions? What is an ICE restart and renegotiation? How would you build a multi-user video call (mesh vs SFU)? How do you do file transfer / low-latency games (reliable vs unreliable channels)? What constraints can getUserMedia take, and how do you switch cameras without renegotiation?

### Prove It

```js
// 08-interview-webrtc.js — run: node 08-interview-webrtc.js
```