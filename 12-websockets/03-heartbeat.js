/**
 * Module 12 — 12.4 Heartbeat & Keepalive
 * Ping/pong pattern: server sends pings, tracks pongs, closes dead sockets.
 *
 * Run: node 03-heartbeat.js
 */

const http = require("node:http");
const crypto = require("node:crypto");

const WS_GUID = "258EAFA5-E914-47DA-95CA-C5AB0DC85B11";

function acceptKey(key) {
  return crypto.createHash("sha1").update(key + WS_GUID).digest("base64");
}

function encodeTextFrame(text) {
  const payload = Buffer.from(text, "utf8");
  const len = payload.length;
  let header;
  if (len < 126) {
    header = Buffer.alloc(2);
    header[0] = 0x81;
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

function encodePingFrame(payload = Buffer.alloc(0)) {
  const len = payload.length;
  let header;
  if (len < 126) {
    header = Buffer.alloc(2);
    header[0] = 0x89; // FIN + ping opcode
    header[1] = len;
  } else {
    header = Buffer.alloc(4);
    header[0] = 0x89;
    header[1] = 126;
    header.writeUInt16BE(len, 2);
  }
  return Buffer.concat([header, payload]);
}

function encodePongFrame(payload) {
  const len = payload.length;
  let header;
  if (len < 126) {
    header = Buffer.alloc(2);
    header[0] = 0x8A; // FIN + pong opcode
    header[1] = len;
  } else {
    header = Buffer.alloc(4);
    header[0] = 0x8A;
    header[1] = 126;
    header.writeUInt16BE(len, 2);
  }
  return Buffer.concat([header, payload]);
}

function decodeFrame(buffer) {
  const byte0 = buffer[0];
  const opcode = byte0 & 0x0f;
  const byte1 = buffer[1];
  let payloadLen = byte1 & 0x7f;
  let payloadOffset = 2;
  if (payloadLen === 126) {
    payloadLen = buffer.readUInt16BE(2);
    payloadOffset = 4;
  } else if (payloadLen === 127) {
    payloadLen = Number(buffer.readBigUInt64BE(2));
    payloadOffset = 10;
  }
  const mask = buffer.slice(payloadOffset, payloadOffset + 4);
  payloadOffset += 4;
  const payload = buffer.slice(payloadOffset, payloadOffset + payloadLen);
  const unmasked = Buffer.alloc(payloadLen);
  for (let i = 0; i < payloadLen; i++) unmasked[i] = payload[i] ^ mask[i % 4];
  return { opcode, payload: unmasked };
}

// ---- Server with heartbeat ----

const PING_INTERVAL = 10_000; // send ping every 10s
const PONG_TIMEOUT = 15_000; // close if no pong for 15s

const clients = new Map(); // socket -> { lastPong, pingSeq }

const server = http.createServer((req, res) => {
  res.writeHead(426, { "Content-Type": "text/plain" });
  res.end("WebSocket heartbeat server on ws://localhost:3002");
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

  clients.set(socket, { lastPong: Date.now(), pingSeq: 0 });
  socket.write(encodeTextFrame("Connected. This server sends pings every 10s."));

  socket.on("data", (data) => {
    const frame = decodeFrame(data);

    if (frame.opcode === 0x8) {
      // Close
      socket.write(encodeTextFrame("Bye!"));
      clients.delete(socket);
      socket.destroy();
      return;
    }

    if (frame.opcode === 0xA) {
      // Pong — update timestamp
      const state = clients.get(socket);
      if (state) {
        state.lastPong = Date.now();
        console.log(`  [pong] seq=${frame.payload.readUInt16BE(0)}`);
      }
      return;
    }

    if (frame.opcode === 0x1) {
      const text = frame.payload.toString("utf8");
      console.log(`  [rx] ${text}`);
      socket.write(encodeTextFrame(`echo: ${text}`));
    }
  });

  socket.on("close", () => clients.delete(socket));
  socket.on("error", () => clients.delete(socket));
});

server.listen(3002, () => {
  console.log(`Heartbeat server on ws://localhost:3002 (ping every ${PING_INTERVAL / 1000}s, timeout ${PONG_TIMEOUT / 1000}s)`);
});

// ---- Heartbeat loop ----

setInterval(() => {
  const now = Date.now();
  for (const [socket, state] of clients) {
    if (now - state.lastPong > PONG_TIMEOUT) {
      console.log("  [timeout] no pong for 15s — closing");
      socket.write(encodeTextFrame("Connection timeout — closing."));
      socket.destroy();
      clients.delete(socket);
      continue;
    }

    if (!socket.destroyed) {
      state.pingSeq++;
      const payload = Buffer.alloc(2);
      payload.writeUInt16BE(state.pingSeq, 0);
      socket.write(encodePingFrame(payload));
      console.log(`  [ping] seq=${state.pingSeq}`);
    }
  }
}, PING_INTERVAL);
