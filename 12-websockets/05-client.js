/**
 * Module 12 — 12.6 Client-Side Reconnection
 * Simulated WebSocket client with exponential backoff + jitter reconnection.
 * Uses the echo server from 01-websocket-protocol.js.
 *
 * Run: node 05-client.js
 */

const net = require("node:net");
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
    header[0] = 0x89;
    header[1] = len;
  } else {
    header = Buffer.alloc(4);
    header[0] = 0x89;
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

// ---- Reconnecting client ----

class ReconnectingClient {
  constructor(url, options = {}) {
    this.url = url;
    this.maxRetries = options.maxRetries ?? 10;
    this.baseDelay = options.baseDelay ?? 1000;
    this.maxDelay = options.maxDelay ?? 30_000;
    this.retries = 0;
    this.connected = false;
    this.messageQueue = [];
    this.socket = null;
  }

  get jitteredDelay() {
    const delay = Math.min(this.baseDelay * 2 ** this.retries, this.maxDelay);
    const jitter = Math.random() * 0.3 * delay; // ±30% jitter
    return Math.floor(delay + jitter);
  }

  connect() {
    const url = new URL(this.url);
    const socket = net.createConnection({ host: url.hostname, port: Number(url.port) }, () => {
      const key = Buffer.from(crypto.randomBytes(16).toString("base64"));
      socket.write(
        `GET ${url.pathname}${url.search} HTTP/1.1\r\n` +
          "Upgrade: websocket\r\n" +
          "Connection: Upgrade\r\n" +
          `Sec-WebSocket-Key: ${key}\r\n` +
          `Sec-WebSocket-Version: 13\r\n` +
          "Host: " + url.host + "\r\n\r\n"
      );
    });

    this.socket = socket;
    let handshakeBuffer = Buffer.alloc(0);

    socket.on("data", (data) => {
      handshakeBuffer = Buffer.concat([handshakeBuffer, data]);

      if (handshakeBuffer.toString("utf8", 0, 4) === "HTTP") {
        const end = handshakeBuffer.indexOf("\r\n\r\n");
        if (end === -1) return;

        const headers = handshakeBuffer.toString("utf8", 0, end).split("\r\n").slice(1);
        const status = headers[0];
        const hasUpgrade = headers.some((h) => h.toLowerCase().includes("upgrade: websocket"));

        if (!status.startsWith("HTTP/1.1 101") || !hasUpgrade) {
          console.log("  [error] handshake failed:", status);
          socket.destroy();
          this.scheduleReconnect();
          return;
        }

        this.connected = true;
        this.retries = 0;
        console.log(`  [connected] ${this.url}`);

        // Flush queued messages
        while (this.messageQueue.length > 0) {
          const msg = this.messageQueue.shift();
          socket.write(encodeTextFrame(msg));
        }

        // Handle frames
        socket.on("data", (frameData) => {
          try {
            const frame = decodeFrame(frameData);
            if (frame.opcode === 0x8) {
              console.log("  [server closed]");
              socket.end();
              this.scheduleReconnect();
              return;
            }
            if (frame.opcode === 0x1) {
              console.log(`  [rx] ${frame.payload.toString("utf8")}`);
            }
          } catch {
            // ignore partial frames in this simplified demo
          }
        });

        socket.on("close", () => {
          this.connected = false;
          console.log("  [disconnected]");
          this.scheduleReconnect();
        });

        socket.on("error", (err) => {
          console.log("  [socket error]", err.message);
          this.scheduleReconnect();
        });

        // Send initial message
        socket.write(encodeTextFrame("hello from reconnecting client"));
        return;
      }
    });
  }

  send(message) {
    if (this.connected && this.socket && !this.socket.destroyed) {
      this.socket.write(encodeTextFrame(message));
    } else {
      this.messageQueue.push(message);
      console.log(`  [queued] "${message}" (not connected yet)`);
    }
  }

  scheduleReconnect() {
    if (this.retries >= this.maxRetries) {
      console.log("  [give up] max retries reached");
      return;
    }

    const delay = this.jitteredDelay;
    console.log(`  [reconnect] attempt ${this.retries + 1}/${this.maxRetries} in ${delay}ms`);
    this.retries++;
    setTimeout(() => this.connect(), delay);
  }
}

// ---- Demo ----

const client = new ReconnectingClient("ws://localhost:3000", {
  baseDelay: 1000,
  maxDelay: 10_000,
  maxRetries: 10,
});

client.connect();

// Simulate sending messages while reconnecting
setTimeout(() => client.send("msg 1"), 500);
setTimeout(() => client.send("msg 2"), 1000);

// To test reconnection: kill the server from 01-websocket-protocol.js
// (Ctrl+C) and watch the client reconnect automatically.
setTimeout(() => {
  console.log("\n  [tip] kill the echo server (01) to see reconnection in action.");
  console.log("  [tip] restart it: node 01-websocket-protocol.js");
}, 2000);
