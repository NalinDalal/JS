/**
 * Module 11 — 11.3 WebSocket signaling server (auth + rooms + relay)
 * Ties into module 10: the socket handshake is authenticated with a token,
 * then peers in the same room exchange { type: offer|answer|ice } messages.
 * The SDP/ICE bytes are RELAYED, never interpreted — media never touches this server.
 *
 * Run: node 02-signaling-server.js   (self-test included: two clients relay an offer)
 * Browser demo: open peer.html in two tabs (same ?room= value).
 */

const http = require("node:http");
const crypto = require("node:crypto");

const WS_GUID = "258EAFA5-E914-47DA-95CA-C5AB0DC85B11";
const VALID_TOKENS = new Set(["webrtc-demo-token"]); // module 10: one-time/short-lived tokens

const rooms = new Map(); // roomName -> Set<socket>
const server = http.createServer((req, res) => {
  res.writeHead(426, { "Content-Type": "text/plain" });
  res.end("This is a WebSocket signaling server — connect with a WS client.");
});

// ---------- minimal WS server (handshake + masked frame parsing) ----------
server.on("upgrade", (req, socket) => {
  const url = new URL(req.url, "http://localhost");
  const token = url.searchParams.get("token");
  const room = url.searchParams.get("room") || "default";

  if (!token || !VALID_TOKENS.has(token)) {
    socket.write("HTTP/1.1 401 Unauthorized\r\n\r\n");
    socket.destroy();
    console.log("  [rejected] invalid token");
    return;
  }

  const key = (req.headers["sec-websocket-key"] || "").trim();
  const accept = crypto.createHash("sha1").update(key + WS_GUID).digest("base64");
  socket.write(
    "HTTP/1.1 101 Switching Protocols\r\nUpgrade: websocket\r\nConnection: Upgrade\r\n" +
      `Sec-WebSocket-Accept: ${accept}\r\n\r\n`
  );

  // join room — any other peer already here receives a "peer-joined" notice
  if (!rooms.has(room)) rooms.set(room, new Set());
  rooms.get(room).add(socket);
  console.log(`  [joined] room=${room} peers=${rooms.get(room).size}`);
  for (const peer of rooms.get(room)) {
    if (peer !== socket) sendText(peer, JSON.stringify({ type: "peer-joined", by: 1 }));
  }

  socket.on("close", () => {
    rooms.get(room)?.delete(socket);
    console.log(`  [left]   room=${room} peers=${rooms.get(room)?.size ?? 0}`);
  });

  // ---------- frames ----------
  let buffer = Buffer.alloc(0);

  socket.on("data", (chunk) => {
    buffer = Buffer.concat([buffer, chunk]);
    while (buffer.length >= 2) {
      const b0 = buffer[0];
      const b1 = buffer[1];
      const opcode = b0 & 0x0f;
      const masked = (b1 & 0x80) !== 0;
      let len = b1 & 0x7f;
      let offset = 2;
      if (len === 126) { len = buffer.readUInt16BE(2); offset = 4; }
      if (buffer.length < offset + (masked ? 4 : 0) + len) return;
      const maskKey = masked ? buffer.subarray(offset, offset + 4) : null;
      offset += masked ? 4 : 0;
      const payload = buffer.subarray(offset, offset + len);
      buffer = buffer.subarray(offset + len);

      if (opcode === 0x8) return socket.destroy(); // close
      if (opcode === 0x9) sendFrame(socket, 0xA, unmask(payload, maskKey)); // ping -> pong
      if (opcode === 0x1) relay(room, socket, unmask(payload, maskKey).toString());
    }
  });
});

const unmask = (payload, key) =>
  key ? Buffer.from(payload.map((b, i) => b ^ key[i % 4])) : payload;

const sendFrame = (socket, opcode, payload) => {
  const len = payload.length;
  const header = Buffer.alloc(2);
  header[0] = 0x80 | opcode;
  header[1] = len;
  socket.write(Buffer.concat([header, payload]));
};

const sendText = (socket, text) => sendFrame(socket, 0x1, Buffer.from(text));

// relay an application message (offer/answer/ice) to every OTHER peer in the room
function relay(room, from, message) {
  console.log(`  [relay] room=${room} -> ${(rooms.get(room)?.size ?? 1) - 1} peer(s): ${message.slice(0, 60)}...`);
  for (const peer of rooms.get(room) ?? []) {
    if (peer !== from && !peer.destroyed) sendText(peer, message);
  }
}

server.listen(3000, async () => {
  console.log("Signaling server on ws://localhost:3000  (token: webrtc-demo-token)\n");

  // ---------- self-test: two Node clients relay an offer through the server ----------
  const net = require("node:net");
  const connect = (path) =>
    new Promise((resolve, reject) => {
      const sock = net.createConnection({ host: "127.0.0.1", port: 3000 });
      sock.on("connect", () => {
        sock.write(
          `GET ${path} HTTP/1.1\r\nHost: localhost\r\nUpgrade: websocket\r\nConnection: Upgrade\r\n` +
            `Sec-WebSocket-Key: ${crypto.randomBytes(16).toString("base64")}\r\nSec-WebSocket-Version: 13\r\n\r\n`
        );
      });
      sock.on("data", (d) => {
        if (d.toString().startsWith("HTTP/1.1 101")) resolve(sock);
        if (d.toString().startsWith("HTTP/1.1 401")) { sock.destroy(); reject(new Error("401")); }
      });
      sock.on("error", reject);
    });

  const maskFrame = (msg) => {
    const payload = Buffer.from(msg);
    const key = crypto.randomBytes(4);
    const masked = Buffer.from(payload.map((b, i) => b ^ key[i % 4]));
    const header = Buffer.alloc(2);
    header[0] = 0x81;
    header[1] = 0x80 | payload.length;
    return Buffer.concat([header, key, masked]);
  };

  // extract payload of ONE unmasked server text frame (server frames are never masked)
  const framePayload = (d) => d.subarray(2, 2 + (d[1] & 0x7f)).toString();

  const buffers = new Map();
  const queueFor = (s, b) => (buffers.get(s) ?? (buffers.set(s, []), buffers.get(s))).push(b);

  const clientA = await connect("/?room=selftest&token=webrtc-demo-token");
  const clientB = await connect("/?room=selftest&token=webrtc-demo-token");
  console.log("  self-test: A and B connected");

  const onData = (s) =>
    new Promise((resolve) => {
      const q = buffers.get(s);
      if (q?.length) return resolve(q.shift());
      s.once("data", (d) => {
        const str = d.toString();
        const idx = str.indexOf("\r\n\r\n");
        // 101 headers and the first frame may arrive in one TCP segment:
        if (idx >= 0) {
          const rest = d.subarray(idx + 4);
          queueFor(s, rest.length ? framePayload(rest) : "");
        } else {
          queueFor(s, framePayload(d));
        }
        resolve(buffers.get(s).shift());
      });
    });

  clientA.write(maskFrame(JSON.stringify({ type: "offer", sdp: "v=0 ... fake", mid: "0" })));
  const relayed = await onData(clientB);
  console.log("  self-test: B received A's offer:", relayed.startsWith('{"type":"offer"'));

  clientA.destroy();
  clientB.destroy();
  // Server keeps running for the browser demo: open peer.html twice with ?room=test
  console.log("Ctrl+C to stop.");
});