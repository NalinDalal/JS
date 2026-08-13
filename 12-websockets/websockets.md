# Module 12: WebSockets — Full-Duplex Real-Time Communication

---

## 12.1 WebSocket Protocol Overview

### Explain It

WebSocket is a full-duplex, persistent TCP connection upgraded from a single HTTP request. The client sends an `Upgrade: websocket` handshake with `Sec-WebSocket-Key`; the server responds `101 Switching Protocols`. After that, both sides exchange **frames**: each frame has a FIN bit, opcode (`0x1` = text, `0x2` = binary, `0x8` = close, `0x9` = ping, `0xA` = pong), a mask bit (client-to-server frames are masked; server-to-client are unmasked), and a payload. Because it's a single long-lived TCP socket, both sides can send data at any time without polling. The browser API is `new WebSocket(url)` with `onopen`, `onmessage`, `onclose`, `onerror`. The Node.js `WebSocket` class in the `ws` package mirrors this API.

### Prove It

```js
// 01-websocket-protocol.js — run: node 01-websocket-protocol.js
```

---

## 12.2 Server Implementation (Zero-Dependency)

### Explain It

A WebSocket server starts as an HTTP server and listens for `Upgrade` events. The handshake validates the `Sec-WebSocket-Key` by concatenating it with the magic GUID `258EAFA5-E914-47DA-95CA-C5AB0DC85B11`, SHA-1 hashing, and base64-encoding the result into `Sec-WebSocket-Accept`. After upgrade, the raw TCP socket is used to read/write frames. The server must unmask client frames (XOR with a 4-byte masking key) and may send unmasked frames back. A minimal server handles text frames, close frames, and optionally ping/pong. The `ws` npm package handles all of this; the zero-dependency version below uses only `http`, `crypto`, and `net` built-ins.

### Prove It

```js
// 01-websocket-protocol.js — run: node 01-websocket-protocol.js
```

---

## 12.3 Rooms & Broadcasting

### Explain It

Most WebSocket apps need to group connections: a "room" is just a `Set<socket>` or `Map<roomId, Set<socket>>`. When a message arrives, the server iterates the room's sockets and writes the frame to each one. The message protocol typically includes a `type` field (`join`, `leave`, `message`, `broadcast`) and a `room` field so the server knows where to route it. Broadcasting to all sockets in a room is O(connections), which is fine for small rooms. For large rooms (thousands), consider fan-out via a message broker. The client never "joins" at the TCP level — it sends an application-level `join` message after `onopen`.

### Prove It

```js
// 02-rooms-broadcasting.js — run: node 02-rooms-broadcasting.js
```

---

## 12.4 Heartbeat & Keepalive

### Explain It

Idle WebSocket connections can die silently: NATs, load balancers, or proxies may drop them after N seconds of inactivity. A **ping/pong** heartbeat detects dead connections. The server sends a ping frame (`opcode 0x9`) with optional payload; the client must reply with a pong frame (`opcode 0xA`) carrying the same payload. If the server doesn't receive a pong within a timeout, it closes the socket. The browser's native WebSocket handles pong automatically — the server just needs to send pings on a timer and track expected pongs. In Node.js, you implement this with `setInterval` and a per-socket `lastPong` timestamp. Heartbeats also prevent intermediate proxies from closing idle connections.

### Prove It

```js
// 03-heartbeat.js — run: node 03-heartbeat.js
```

---

## 12.5 Authentication Patterns

### Explain It

WebSocket auth happens at handshake time because the browser cannot attach `Authorization` headers to `new WebSocket(url)`. Three options: **1) query string token** (`ws://host?socket_token=...` — works everywhere but lands in server logs, so use short-lived one-time tokens), **2) cookie** (sent automatically in the handshake — best for browser clients with HttpOnly cookies), **3) subprotocol** (`Sec-WebSocket-Protocol: auth, json` — the server validates the subprotocol and rejects the upgrade if invalid). After handshake, you can also do **application-level auth** (first message contains a token, server validates and sends `auth_ok` or closes with code 4401). Mid-session expiry: server sends a custom auth-required message or closes with code 4001/4401; client reconnects with a fresh token.

### Prove It

```js
// 04-auth.js — run: node 04-auth.js
```

---

## 12.6 Client-Side Reconnection

### Explain It

WebSocket connections drop: networks hiccup, servers restart, NATs re-map. A robust client must **reconnect**. The pattern: on `onclose` (or `onerror`), start a retry loop with **exponential backoff** + jitter (`delay = min(base * 2^attempt + jitter, maxDelay)`). While disconnected, queue outgoing messages in memory. On reconnect, flush the queue and re-subscribe to rooms/topics. The server should treat reconnecting clients as new connections — do not rely on the old socket's state. A **connection ID** (sent in the first message after reconnect) helps the server merge subscriptions. WebSocket libraries like `reconnecting-websocket` implement this; the zero-dependency version below shows the logic.

### Prove It

```js
// 05-client.js — run: node 05-client.js (simulated client/server)
```

---

## 12.7 Scaling WebSockets

### Explain It

A single Node.js process handles ~50K–100K concurrent WebSocket connections on a good server. Beyond that, you need **multiple processes** — but WebSocket is stateful (connections are pinned to a specific process). Solutions: **1) Sticky sessions** at the load balancer level (same client IP → same backend), **2) pub/sub message broker** (Redis Pub/Sub is standard: when process A receives a message for a user connected to process B, it publishes to Redis; process B receives and forwards). The broker turns N independent WebSocket servers into a logical cluster. For horizontal scaling across machines, use a **shared session store** (Redis) for auth state, subscriptions, and presence. CDNs and edge networks now offer **managed WebSocket** (e.g., Cloudflare Durable Objects, AWS API Gateway WebSocket) which abstracts the scaling problem.

### Prove It

```js
// 06-scaling.js — run: node 06-scaling.js
```

---

## 12.8 WebSocket vs SSE vs Long-Polling

### Explain It

| Feature | WebSocket | Server-Sent Events (SSE) | Long-Polling |
|---------|-----------|--------------------------|--------------|
| Direction | Full-duplex (both ways) | Server → client only | Client → server (request/response) |
| Protocol | `ws://` / `wss://` | HTTP/2 or HTTP/1.1 | HTTP |
| Browser API | `WebSocket` | `EventSource` | `fetch` / `XMLHttpRequest` |
| Binary data | Yes (ArrayBuffer, Blob) | No (text/event-stream only) | Yes |
| Reconnect | Manual (or library) | Automatic (browser) | Manual |
| Proxy-friendly | Sometimes blocked | Works over HTTP/2 | Works everywhere |
| Use case | Chat, games, live collab | Notifications, feeds | Legacy fallback |

**When to choose what:** Use WebSocket when you need low-latency bidirectional communication (chat, collaborative editing, gaming). Use SSE when the server pushes data but the client rarely sends (notifications, stock tickers, live logs) — it's simpler, auto-reconnects, and works over HTTP/2. Use long-polling only as a fallback when WebSocket and SSE are blocked (some corporate proxies).

### Prove It

```js
// 06-scaling.js — comparison section — run: node 06-scaling.js
```

---

## 12.9 Security, Origin Checking & Rate Limits

### Explain It

WebSocket is **not** protected by CORS. Any page can open `new WebSocket("ws://your-server")` and send messages — the browser does not enforce same-origin policy on the WebSocket protocol itself. You must validate the `Origin` header during the handshake and reject cross-origin upgrades if your app is browser-facing. Additionally: rate-limit messages per connection to prevent floods, cap payload length (`ws` library defaults to 100MB; set `maxPayload` to something sane like 1MB), and validate message schemas server-side. For internal services (server-to-server WS), origin checking is less critical but message authentication (token in first message or subprotocol) is still needed.

### Gotchas / Edge Cases

- `Origin: null` appears when connecting from `file://` or some extensions — decide whether to allow or reject.
- `Sec-WebSocket-Protocol` is **not** an auth mechanism by itself — it's a capability negotiation header. Pair it with a token or cookie if you need real auth.
- A malicious browser tab can open hundreds of WebSocket connections to your server (connection flooding). Rate-limit at the HTTP upgrade endpoint too.
- Message size: a single `ws.send(jsonString)` can be megabytes. Always validate and reject oversized payloads before processing.

### Prove It

```js
// Origin check pattern (add to 01-websocket-protocol.js):
const allowedOrigins = new Set(["https://my-app.com", "https://admin.my-app.com"]);
const origin = req.headers.origin;
if (origin && !allowedOrigins.has(origin)) {
  socket.write("HTTP/1.1 403 Forbidden\r\n\r\n");
  socket.destroy();
  return;
}
```

```js
// 04-auth.js — run: node 04-auth.js (shows query/cookie/subprotocol auth)
```

---

## 12.10 Close Codes & Graceful Shutdown

### Explain It

WebSocket close is a **two-way handshake**: one side sends a close frame (`opcode 0x8` + 2-byte status code + reason), the other replies with its own close frame, then both close the TCP socket. Status codes follow RFC 6455: `1000` normal closure, `1001` going away (server restart), `1006` abnormal closure (no close frame — network drop), `1011` unexpected server error. Application-level codes (`4001` mid-session expiry, `4401` invalid token) are in the 4xxx range. A graceful server shutdown: stop accepting new upgrades, send `1001` to all open sockets, wait for close acks or a timeout, then `server.close()`.

### Gotchas / Edge Cases

- `1006` is never sent on the wire — it's a local-only code meaning "connection lost without close frame."
- `ws.close()` without arguments sends `1000`. Pass a code and reason: `ws.close(4001, "session expired")`.
- After calling `ws.close()`, `ws.readyState` transitions to `CLOSING` (2), then `CLOSED` (3) after the ack. Don't reuse a socket after `close()`.
- During server shutdown, in-flight messages may be lost if you `process.exit()` before the close handshake completes. Drain first.

### Prove It

```js
// Add graceful shutdown to 01-websocket-protocol.js:
process.on("SIGINT", () => {
  console.log("\n[shutdown] sending 1001 to all clients...");
  for (const [socket] of clients) {
    if (!socket.destroyed) socket.write(encodeTextFrame("Server going away"));
    socket.destroy();
  }
  server.close(() => process.exit(0));
});
```

---

## 12.11 Message Fragmentation & Large Messages

### Explain It

A single WebSocket message can span **multiple frames**. The sender sets `FIN=0` on all frames except the last one (`FIN=1`). The receiver buffers fragments until it sees `FIN=1`, then delivers the complete message to the application. This means a 10MB JSON payload arrives as many small frames — the browser or `ws` library reassembles them for you. Fragmentation is automatic and transparent for most apps, but it matters when you implement your own frame parser or need backpressure. The `ws` library handles it internally; our zero-dep demos assume `FIN=1` (unfragmented) for simplicity.

### Gotchas / Edge Cases

- Don't send messages larger than the receiver's `maxPayload`. The `ws` library defaults to 100MB; our demos use much smaller limits.
- Fragmented frames must arrive in order. TCP guarantees this, but if you implement your own transport over WebSocket, don't assume it.
- Binary messages fragment the same way as text — opcode `0x2` for first fragment, `0x0` for continuation.
- Some old proxies drop connections if frames arrive too slowly. Keep fragment intervals short.

### Prove It

```js
// Fragmentation is handled by ws library automatically:
ws.send(veryLargeBuffer); // ws splits into multiple FIN=0 frames internally
// In zero-dep, you'd need to loop and set FIN=0 on all but the last chunk.
```

---

## 12.12 Subprotocols & Custom Protocols

### Explain It

The `Sec-WebSocket-Protocol` header lets client and server negotiate an **application-level protocol** on top of WebSocket. The client sends `Sec-WebSocket-Protocol: mqtt, json`; the server picks one and echoes it back in the response. The browser exposes the chosen protocol via `ws.protocol` after `onopen`. Common subprotocols: **MQTT** (IoT messaging), **GraphQL WS** (GraphQL subscriptions), **wamp** (remote procedure calls). In our zero-dep auth demo, `auth` is a custom subprotocol signaling "this connection requires token auth." Subprotocols are negotiated at handshake time — if the server doesn't pick one the client supports, it rejects the upgrade.

### Gotchas / Edge Cases

- The server must pick **exactly one** subprotocol from the client's list, or reject the connection. It cannot say "I support both."
- Subprotocol order matters: `Sec-WebSocket-Protocol: mqtt, json` means "I prefer mqtt, json is fallback."
- `ws.protocol` is empty string if no subprotocol was negotiated.
- Subprotocols are **not** a security boundary. They don't encrypt or authenticate — they just label the message format.

### Prove It

```js
// Client requests subprotocol:
const ws = new WebSocket("ws://localhost:3003", ["auth"]);
ws.addEventListener("open", () => {
  console.log("negotiated protocol:", ws.protocol); // "auth"
});

// Server picks (from 04-auth.js):
const requested = (req.headers["sec-websocket-protocol"] || "").split(",").map(s => s.trim());
if (requested.includes("auth")) {
  // echo back: Sec-WebSocket-Protocol: auth
}
```

---

## 12.13 Browser Client Patterns

### Explain It

The browser `WebSocket` API is small but has important gotchas. `new WebSocket(url, protocols?)` takes an optional array of subprotocols. The `readyState` enum is `CONNECTING (0)`, `OPEN (1)`, `CLOSING (2)`, `CLOSED (3)` — calling `send()` while `CONNECTING` throws `INVALID_STATE_ERR`. `event.data` is `string` for text frames; set `ws.binaryType = "arraybuffer"` or `"blob"` before `onopen` to control binary frame deserialization. Binary `send()` accepts `Blob`, `ArrayBuffer`, and `ArrayBufferView`. The browser handles pong automatically — you only need to implement ping if you want to detect dead connections from the client side. Connection limits per origin are ~255; reuse a single WebSocket for multiple features rather than opening per-feature sockets.

### Gotchas / Edge Cases

- `ws.send()` throws if `readyState !== OPEN`. Always check before sending, or queue messages.
- `ws.protocol` is empty unless the server returned `Sec-WebSocket-Protocol` in the handshake.
- `binaryType` must be set **before** the first `onmessage` fires — set it right after `new WebSocket()`.
- `onerror` does not give you an `Error` object with a message — it's mostly useful for logging + triggering reconnect.
- `EventSource` (SSE) auto-reconnects; `WebSocket` does not. Build reconnection logic yourself or use a library.
- Mixed content: browsers block `ws://` from `https://` pages. Use `wss://` in production.

### Prove It

```js
// 08-browser-client.js — paste into DevTools console while 01 is running
```

---

## 12.14 Scaling: Sticky Sessions, Pub/Sub & Managed Services

### Explain It

A single Node.js process handles ~50K–100K concurrent WebSocket connections. Beyond that, you need multiple processes — but WebSocket is stateful (connections are pinned to a specific process). **Sticky sessions** at the load balancer route the same client to the same backend (by IP hash, cookie, or path). When client A on process 1 sends a message to client B on process 2, process 1 must **publish** to a message broker; process 2 **subscribes** and forwards. Redis Pub/Sub is the standard broker. For global scale, managed services like **Cloudflare Durable Objects**, **AWS API Gateway WebSocket**, or **Pusher** abstract the scaling problem. The key invariant: the server must never assume two messages from the same user arrive on the same process.

### Gotchas / Edge Cases

- Sticky sessions break if the backend process crashes — connected clients are orphaned. The client's reconnection logic must handle this.
- Redis Pub/Sub is fire-and-forget. If process 2 is temporarily down, it misses messages. For durability, use Redis Streams or a proper message queue.
- `wss.clients.size` in `ws` only counts connections on **that** process — not the whole cluster.
- Load balancer timeouts must exceed your WebSocket heartbeat interval, or the LB will close idle connections.

### Prove It

```js
// 06-scaling.js — run: node 06-scaling.js
```

---

## 12.15 The `ws` Library: Production Quick-Start

### Explain It

The `ws` npm package is the de-facto standard for WebSocket in Node.js. `new WebSocketServer({ port })` creates a server with a `wss.clients` Set of all connections. `ws.send(data)` accepts `string`, `Buffer`, or `TypedArray` and automatically sets the correct opcode. `ws.close(code, reason)` sends the close handshake. The library handles: masked frame encode/decode, ping/pong, fragmentation, `permessage-deflate` compression, and `maxPayload` limits. For TLS, pass an existing `https.Server` to `new WebSocketServer({ server })`. The client API mirrors the browser's `WebSocket` almost exactly.

### Gotchas / Edge Cases

- `wss.clients` is a `Set<WebSocket>`, not a `Map`. You need a separate `Map<ws, userId>` if you want to track who is who.
- `ws.readyState` transitions: `CONNECTING` → `OPEN` → `CLOSING` → `CLOSED`. After `CLOSING`, the socket is unusable even if `CLOSED` hasn't arrived yet.
- `ws.send()` after `ws.close()` throws. Track `ws.readyState` or use a flag.
- `permessage-deflate` is **opt-in** in `ws` v8+ for performance reasons. Enable it if you're sending large text payloads.
- `WebSocketServer` does not emit `upgrade` — it handles the HTTP upgrade internally. You can't combine it with another HTTP router on the same port without a custom server.

### Prove It

```js
// 09-ws-library.js — run: node 09-ws-library.js
```

---

## 12.16 Interview Questions

### Explain It

Say these out loud: What is a WebSocket and how does the handshake work? What is the frame format? How do you implement rooms and broadcasting? What is a heartbeat and why do you need it? How do you authenticate a WebSocket connection? How do you handle reconnection on the client? How do you scale WebSocket across multiple processes? When would you use SSE instead of WebSocket? What is the difference between WebSocket and Server-Sent Events? How do you handle binary data over WebSocket? What are common WebSocket close codes? How does WebSocket security differ from HTTP CORS? What is message fragmentation and when does it matter? How do subprotocols work?

### Prove It

```js
// 07-interview-websockets.js — run: node 07-interview-websockets.js
```

---

## Sources

- RFC 6455 — The WebSocket Protocol: https://datatracker.ietf.org/doc/html/rfc6455
- MDN WebSocket API: https://developer.mozilla.org/en-US/docs/Web/API/WebSocket
- MDN Server-Sent Events: https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events
- `ws` npm package: https://github.com/websockets/ws
- Cloudflare Durable Objects: https://developers.cloudflare.com/durable-objects/

