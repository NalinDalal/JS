/**
 * Module 12 — 12.2 Server Implementation (Zero-Dependency)
 * Minimal WebSocket server using Node's http + crypto + net built-ins.
 * Handles the 101 upgrade, unmasked text frames, and close frames.
 *
 * Run: node 01-websocket-protocol.js
 * Client:  wscat -c ws://localhost:3000  (or use the browser client below)
 */

const http = require("node:http");
const crypto = require("node:crypto");
const net = require("node:net");

const WS_GUID = "258EAFA5-E914-47DA-95CA-C5AB0DC85B11";

// ---- Helpers ----

function acceptKey(key) {
  return crypto.createHash("sha1").update(key + WS_GUID).digest("base64");
}

// Parse unmasked text frame (server receives unmasked frames from client? No — client MUST mask)
// Actually RFC 6455: client-to-server frames MUST be masked; server-to-client MUST NOT be masked.
// We'll handle masked client frames below.
function decodeFrame(buffer) {
  const byte0 = buffer[0];
  const fin = (byte0 >> 7) & 1;
  const opcode = byte0 & 0x0f;
  const byte1 = buffer[1];
  const masked = (byte1 >> 7) & 1;
  let payloadOffset = 2;
  let payloadLen = byte1 & 0x7f;

  if (payloadLen === 126) {
    payloadLen = buffer.readUInt16BE(2);
    payloadOffset = 4;
  } else if (payloadLen === 127) {
    payloadLen = Number(buffer.readBigUInt64BE(2));
    payloadOffset = 10;
  }

  let mask = null;
  if (masked) {
    mask = buffer.slice(payloadOffset, payloadOffset + 4);
    payloadOffset += 4;
  }

  const payload = buffer.slice(payloadOffset, payloadOffset + payloadLen);

  if (masked && mask) {
    const unmasked = Buffer.alloc(payloadLen);
    for (let i = 0; i < payloadLen; i++) {
      unmasked[i] = payload[i] ^ mask[i % 4];
    }
    return { fin, opcode, payload: unmasked };
  }

  return { fin, opcode, payload };
}

function encodeTextFrame(text) {
  const payload = Buffer.from(text, "utf8");
  const len = payload.length;
  let header;

  if (len < 126) {
    header = Buffer.alloc(2);
    header[0] = 0x81; // FIN + text opcode
    header[1] = len;
  } else if (len < 65536) {
    header = Buffer.alloc(4);
    header[0] = 0x81;
    header[1] = 126;
    header.writeUInt16BE(len, 2);
  } else {
    header = Buffer.alloc(10);
    header[0] = 0x81;
    header[1] = 127;
    header.writeBigUInt64BE(BigInt(len), 2);
  }

  return Buffer.concat([header, payload]);
}

// ---- Server ----

const clients = new Map(); // socket -> { alive, lastPong }

const server = http.createServer((req, res) => {
  res.writeHead(426, { "Content-Type": "text/plain" });
  res.end("This is a WebSocket server — connect with ws://localhost:3000");
});

server.on("upgrade", (req, socket) => {
  const key = (req.headers["sec-websocket-key"] || "").trim();
  if (!key) {
    socket.write("HTTP/1.1 400 Bad Request\r\n\r\n");
    socket.destroy();
    return;
  }

  const accept = acceptKey(key);
  socket.write(
    "HTTP/1.1 101 Switching Protocols\r\n" +
      "Upgrade: websocket\r\n" +
      "Connection: Upgrade\r\n" +
      `Sec-WebSocket-Accept: ${accept}\r\n\r\n`
  );

  clients.set(socket, { alive: true, lastPong: Date.now() });

  // Send welcome
  socket.write(encodeTextFrame("Welcome to the zero-dep WS server! Type anything."));

  socket.on("data", (data) => {
    const frame = decodeFrame(data);
    if (frame.opcode === 0x8) {
      // Close frame
      socket.write(encodeTextFrame("Goodbye!"));
      clients.delete(socket);
      socket.destroy();
      return;
    }

    if (frame.opcode === 0xA) {
      // Pong
      const client = clients.get(socket);
      if (client) client.lastPong = Date.now();
      return;
    }

    if (frame.opcode === 0x1) {
      const text = frame.payload.toString("utf8");
      console.log(`  [rx] ${text}`);

      // Echo back with a prefix
      socket.write(encodeTextFrame(`echo: ${text}`));

      // Broadcast to all other clients
      for (const [sock] of clients) {
        if (sock !== socket && !sock.destroyed) {
          sock.write(encodeTextFrame(`broadcast: ${text}`));
        }
      }
    }
  });

  socket.on("close", () => clients.delete(socket));
  socket.on("error", () => clients.delete(socket));
});

server.listen(3000, () => {
  console.log("WebSocket server on ws://localhost:3000");
  console.log("Try: wscat -c ws://localhost:3000");
  console.log("Or paste this in browser DevTools:");
  console.log(`
    const ws = new WebSocket("ws://localhost:3000");
    ws.onmessage = (e) => console.log("[rx]", e.data);
    ws.onopen = () => ws.send("hello from browser");
  `);
});

// Heartbeat: ping every 30s, close if no pong for 60s
setInterval(() => {
  const now = Date.now();
  for (const [socket, state] of clients) {
    if (now - state.lastPong > 60_000) {
      console.log("  [timeout] closing dead socket");
      socket.destroy();
      clients.delete(socket);
      continue;
    }
    // Send ping
    if (!socket.destroyed) {
      socket.write(Buffer.from([0x89, 0x00])); // ping, no payload
    }
  }
}, 30_000);
