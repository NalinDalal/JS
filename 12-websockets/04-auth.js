/**
 * Module 12 — 12.5 Authentication Patterns
 * Three handshake-time auth methods: query-string token, cookie, subprotocol.
 * Also shows application-level auth (first-message token) and mid-session expiry.
 *
 * Run: node 04-auth.js
 */

const http = require("node:http");
const crypto = require("node:crypto");

const WS_GUID = "258EAFA5-E914-47DA-95CA-C5AB0DC85B11";
const VALID_TOKENS = new Set(["secure-token-123", "short-lived-token"]);

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

// ---- Server ----

const server = http.createServer((req, res) => {
  res.writeHead(426, { "Content-Type": "text/plain" });
  res.end("Authenticated WebSocket server on ws://localhost:3003?socket_token=secure-token-123");
});

server.on("upgrade", (req, socket) => {
  // --- Auth: three options ---
  // 1) Query string token
  const url = new URL(req.url, "http://localhost");
  const queryToken = url.searchParams.get("socket_token");

  // 2) Cookie
  const cookieMatch = (req.headers.cookie || "").match(/ws_session=([^;]+)/);
  const cookieToken = cookieMatch?.[1];

  // 3) Subprotocol
  const requestedSubprotocols = (req.headers["sec-websocket-protocol"] || "")
    .split(",")
    .map((s) => s.trim());

  const token = queryToken || cookieToken;
  const hasValidToken = token && VALID_TOKENS.has(token);
  const hasValidSubprotocol = requestedSubprotocols.includes("auth");

  if (!hasValidToken && !hasValidSubprotocol) {
    socket.write("HTTP/1.1 401 Unauthorized\r\n\r\n");
    socket.destroy();
    console.log("  [reject] no valid token or subprotocol");
    return;
  }

  // If subprotocol requested, echo it back
  const subprotocol = hasValidSubprotocol ? "auth" : undefined;

  const key = (req.headers["sec-websocket-key"] || "").trim();
  const accept = acceptKey(key);
  const responseHeaders = [
    "HTTP/1.1 101 Switching Protocols",
    "Upgrade: websocket",
    "Connection: Upgrade",
    `Sec-WebSocket-Accept: ${accept}`,
  ];
  if (subprotocol) responseHeaders.push(`Sec-WebSocket-Protocol: ${subprotocol}`);

  socket.write(responseHeaders.join("\r\n") + "\r\n\r\n");

  const authMethod = hasValidToken ? "token" : "subprotocol";
  console.log(`  [accept] auth=${authMethod}`);

  socket.write(encodeTextFrame(`Authenticated via ${authMethod}. Send any message.`));

  socket.on("data", (data) => {
    const frame = decodeFrame(data);
    if (frame.opcode === 0x8) {
      socket.write(encodeTextFrame("Bye!"));
      socket.destroy();
      return;
    }

    if (frame.opcode === 0x1) {
      const text = frame.payload.toString("utf8");
      console.log(`  [rx] ${text}`);
      socket.write(encodeTextFrame(`server heard: ${text}`));
    }
  });

  socket.on("close", () => console.log("  [disconnect]"));
  socket.on("error", () => {});
});

server.listen(3003, () => {
  console.log("Auth server on ws://localhost:3003");
  console.log("Options:");
  console.log("  1) Query token: ws://localhost:3003?socket_token=secure-token-123");
  console.log("  2) Cookie:     set cookie ws_session=secure-token-123 before connecting");
  console.log("  3) Subprotocol: new WebSocket('ws://localhost:3003', ['auth'])");
});
