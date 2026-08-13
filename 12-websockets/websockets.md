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

## 12.9 Interview Questions

### Explain It

Say these out loud: What is a WebSocket and how does the handshake work? What is the frame format? How do you implement rooms and broadcasting? What is a heartbeat and why do you need it? How do you authenticate a WebSocket connection? How do you handle reconnection on the client? How do you scale WebSocket across multiple processes? When would you use SSE instead of WebSocket? What is the difference between WebSocket and Server-Sent Events? How do you handle binary data over WebSocket?

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
