/**
 * Module 12 — 12.3 Rooms & Broadcasting
 * Room management pattern: join/leave rooms, broadcast to room members.
 *
 * Run: node 02-rooms-broadcasting.js
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

// ---- Room manager ----

const rooms = new Map(); // roomId -> Set<socket>
const clientRooms = new Map(); // socket -> Set<roomId>

function joinRoom(socket, roomId) {
  if (!rooms.has(roomId)) rooms.set(roomId, new Set());
  rooms.get(roomId).add(socket);
  if (!clientRooms.has(socket)) clientRooms.set(socket, new Set());
  clientRooms.get(socket).add(roomId);
}

function leaveRoom(socket, roomId) {
  const room = rooms.get(roomId);
  if (room) {
    room.delete(socket);
    if (room.size === 0) rooms.delete(roomId);
  }
  const cr = clientRooms.get(socket);
  if (cr) cr.delete(roomId);
}

function leaveAllRooms(socket) {
  const cr = clientRooms.get(socket);
  if (cr) {
    for (const roomId of cr) leaveRoom(socket, roomId);
    clientRooms.delete(socket);
  }
}

function broadcastToRoom(roomId, message, excludeSocket = null) {
  const room = rooms.get(roomId);
  if (!room) return;
  const frame = encodeTextFrame(message);
  for (const sock of room) {
    if (sock !== excludeSocket && !sock.destroyed) sock.write(frame);
  }
}

// ---- Server ----

const server = http.createServer((req, res) => {
  res.writeHead(426, { "Content-Type": "text/plain" });
  res.end("WebSocket room server on ws://localhost:3001");
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

  socket.write(encodeTextFrame("Joined lobby. Send: join:<roomId> or message:<roomId>:<text>"));

  socket.on("data", (data) => {
    const frame = decodeFrame(data);
    if (frame.opcode === 0x8) {
      socket.write(encodeTextFrame("Bye!"));
      leaveAllRooms(socket);
      socket.destroy();
      return;
    }

    if (frame.opcode !== 0x1) return;

    const text = frame.payload.toString("utf8");

    if (text.startsWith("join:")) {
      const roomId = text.slice(5).trim();
      joinRoom(socket, roomId);
      socket.write(encodeTextFrame(`joined room: ${roomId}`));
      broadcastToRoom(roomId, `Someone joined ${roomId}`, socket);
      console.log(`  [join] socket -> ${roomId} (${rooms.get(roomId)?.size || 0} members)`);
      return;
    }

    if (text.startsWith("leave:")) {
      const roomId = text.slice(6).trim();
      leaveRoom(socket, roomId);
      socket.write(encodeTextFrame(`left room: ${roomId}`));
      return;
    }

    if (text.startsWith("message:")) {
      const [, roomId, ...msgParts] = text.split(":");
      const msg = msgParts.join(":").trim();
      if (roomId && msg) {
        broadcastToRoom(roomId, `[${roomId}] ${msg}`, socket);
        console.log(`  [msg] ${roomId}: ${msg}`);
      }
      return;
    }

    socket.write(encodeTextFrame("Unknown command. Use join:, leave:, or message:"));
  });

  socket.on("close", () => {
    leaveAllRooms(socket);
    console.log("  [disconnect]");
  });
  socket.on("error", () => leaveAllRooms(socket));
});

server.listen(3001, () => {
  console.log("Room server on ws://localhost:3001");
  console.log("Try in two browser tabs:");
  console.log("  ws = new WebSocket('ws://localhost:3001');");
  console.log("  ws.onmessage = e => console.log(e.data);");
  console.log("  ws.onopen = () => ws.send('join:general');");
  console.log("  // tab2: ws.send('message:general:hello room!');");
});
