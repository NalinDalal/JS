/**
 * Module 12 — Interview Questions (WebSockets)
 * Say the answer out loud BEFORE reading it. Run for a quick daily drill.
 *
 * Run: node 07-interview-websockets.js
 */

const qa = [
  [
    "What is a WebSocket and how does the handshake work?",
    "WebSocket is a full-duplex TCP connection upgraded from HTTP. Client sends Upgrade: websocket + Sec-WebSocket-Key. Server responds 101 Switching Protocols with Sec-WebSocket-Accept = base64(sha1(key + GUID)). After that, both sides exchange frames (text/binary/ping/pong/close) over the same socket.",
  ],
  [
    "What is the WebSocket frame format?",
    "A frame has: FIN (1 bit, 1 = final fragment), RSV (3 bits), opcode (4 bits: 0x1=text, 0x2=binary, 0x8=close, 0x9=ping, 0xA=pong), MASK (1 bit, always 1 for client->server), payload len (7/16/64 bits), masking key (4 bytes if masked), payload. Client frames MUST be masked; server frames MUST NOT be masked.",
  ],
  [
    "How do you implement rooms and broadcasting?",
    "A room is a Set<socket>. On join, add the socket to the room's Set. On broadcast, iterate the room and write the frame to each socket. The protocol typically includes a type field (join, leave, message) and a room ID. The client sends application-level join/leave messages after onopen.",
  ],
  [
    "What is a WebSocket heartbeat and why do you need it?",
    "A heartbeat is a periodic ping (opcode 0x9) from server + pong (0xA) from client. It detects dead connections that idle TCP can't detect (NATs, proxies drop idle sockets). If the server doesn't receive a pong within a timeout, it closes the socket. The browser handles pong automatically — the server just sends pings and tracks lastPong timestamps.",
  ],
  [
    "How do you authenticate a WebSocket connection?",
    "Three handshake-time options: 1) Query string token (ws://host?socket_token=...), 2) Cookie (HttpOnly cookie sent automatically in handshake), 3) Subprotocol (Sec-WebSocket-Protocol). After handshake, you can also do application-level auth (first message contains a token, server validates and sends auth_ok or closes with 4401). Mid-session expiry: server closes with 4001/4401; client reconnects with fresh token.",
  ],
  [
    "How do you handle reconnection on the client?",
    "On close/error, start a retry loop with exponential backoff + jitter: delay = min(base * 2^attempt + jitter, maxDelay). Queue outgoing messages while disconnected. On reconnect, flush the queue and re-subscribe to rooms. The server treats reconnects as new connections — use a connection ID to merge state.",
  ],
  [
    "How do you scale WebSocket across multiple processes?",
    "1) Sticky sessions at the load balancer (same client IP or cookie -> same backend). 2) Pub/sub message broker (Redis): process A receives a message for a user on process B, publishes to Redis; process B receives and forwards. 3) Shared session store (Redis) for auth state and subscriptions.",
  ],
  [
    "When would you use SSE instead of WebSocket?",
    "Use SSE when the server pushes data but the client rarely sends (notifications, stock tickers, live logs). SSE is simpler: auto-reconnects, works over HTTP/2 and proxies, text-only. WebSocket is better when you need bidirectional low-latency communication (chat, games, collaborative editing).",
  ],
  [
    "What is the difference between WebSocket close codes 1000, 1001, 1006, 4001, 4401?",
    "1000 = normal closure. 1001 = going away (server restart). 1006 = abnormal closure (no close frame — network drop). 4001/4401 = application-level auth failure (custom codes; 4001 = mid-session expiry, 4401 = invalid token on reconnect). 1011 = unexpected server error.",
  ],
  [
    "How do you handle binary data over WebSocket?",
    "Use opcode 0x2 (binary). In the browser: ws.send(blob) or ws.send(arrayBuffer). In Node.js with ws library: ws.send(buffer). The frame format is the same — just the opcode changes. Binary frames are useful for files, images, or protocol buffers.",
  ],
  [
    "What is wss:// and when do you need it?",
    "wss:// is WebSocket over TLS (like https:// for HTTP). Required for: 1) Production (encryption), 2) Browsers block ws:// from secure pages (mixed content), 3) Corporate proxies that block plain ws. The handshake itself is over TLS, and all frames are encrypted.",
  ],
  [
    "How do you prevent WebSocket message floods?",
    "1) Rate-limit per connection (max messages/sec). 2) Message size limits (max payload length). 3) Backpressure: if a client's socket buffer is full, pause reading or drop oldest messages. 4) Room size limits. 5) Authentication before allowing broadcast.",
  ],
  [
    "What is the Sec-WebSocket-Key and why is the GUID used?",
    "Sec-WebSocket-Key is a random base64 string from the client. The server concatenates it with the magic GUID 258EAFA5-E914-47DA-95CA-C5AB0DC85B11, SHA-1 hashes, and base64-encodes the result as Sec-WebSocket-Accept. The GUID ensures the hash isn't a generic SHA-1 of the key alone — it's a WebSocket-specific handshake that prevents caching proxy confusion.",
  ],
  [
    "What is the difference between WebSocket and Server-Sent Events in practice?",
    "SSE is unidirectional (server -> client), uses EventSource API, auto-reconnects, works over HTTP/2, text-only. WebSocket is bidirectional, uses WebSocket API, requires manual reconnection (or library), supports binary, needs ws:// or wss://. For chat/games: WebSocket. For notifications/logs: SSE.",
  ],
];

let i = 0;
function next() {
  if (i >= qa.length) {
    console.log("\nDone! Loop back to the top for another round.");
    process.exit(0);
  }
  const [q, a] = qa[i++];
  console.log(`\nQ${i}: ${q}`);
  console.log("   (press Enter to see the answer, or Ctrl+C to quit)");
}

process.stdin.setRawMode(true);
process.stdin.resume();
process.stdin.on("data", () => next());
console.log("Say each answer out loud, then press Enter to check.");
next();
