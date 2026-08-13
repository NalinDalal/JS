/**
 * Module 10 — 10.9 WebSocket Auth
 * A from-scratch WebSocket server (no 'ws' library) proving the three handshake
 * auth options + mid-session expiry handling + ping/pong keepalives.
 *
 * Why this matters: the browser cannot add Authorization headers to
 * new WebSocket(url) — auth must happen at handshake time via
 * query string / cookie / subprotocol.
 *
 * Run: node 09-websocket-auth.js
 */

const crypto = require("node:crypto");
const http = require("node:http");
const net = require("node:net");

const WS_GUID = "258EAFA5-E914-47DA-95CA-C5AB0DC85B11";
const VALID_TOKENS = new Set(["valid-token-123", "short-lived-token"]);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const server = http.createServer((req, res) => {
  res.writeHead(426, { "Content-Type": "text/plain" });
  res.end("Upgrade required");
});

// ---------- handshake: check token FIRST, upgrade only if valid ----------
server.on("upgrade", (req, socket) => {
  const query = new URL(req.url, "http://localhost").searchParams;
  const fromQuery = query.get("socket_token"); // option 1: one-time/short-lived token in URL
  const fromHeader = req.headers.authorization?.replace("Bearer ", ""); // option 3: Authorization header (server-to-server; browser can't set it)
  const fromCookie = (req.headers.cookie || "").match(/ws_session=([^;]+)/)?.[1]; // option 2: HttpOnly cookie — browser default

  const token = fromQuery || fromHeader || fromCookie;
  if (!token || !VALID_TOKENS.has(token)) {
    socket.write("HTTP/1.1 401 Unauthorized\r\n\r\n"); // no "101" -> client fires onerror
    socket.destroy();
    console.log("  [handshake REJECTED] no/invalid token");
    return;
  }

  // compute Sec-WebSocket-Accept and reply 101
  const key = (req.headers["sec-websocket-key"] || "").trim();
  const accept = crypto.createHash("sha1").update(key + WS_GUID).digest("base64");
  socket.write(
    "HTTP/1.1 101 Switching Protocols\r\n" +
      "Upgrade: websocket\r\n" +
      "Connection: Upgrade\r\n" +
      `Sec-WebSocket-Accept: ${accept}\r\n\r\n`
  );
  console.log("  [handshake ACCEPTED] token:", token);

  // ---------- frame handling: parse masked client frames, send unmasked ----------
  let buffer = Buffer.alloc(0);

  const sendFrame = (opcode, payload) => {
    const len = payload.length;
    const header = Buffer.alloc(2 + (len > 125 ? 2 : 0));
    header[0] = 0x80 | opcode; // FIN + opcode
    if (len > 125) {
      header[1] = 126;
      header.writeUInt16BE(len, 2);
    } else {
      header[1] = len;
    }
    socket.write(Buffer.concat([header, payload]));
  };

  const sendText = (t) => sendFrame(0x1, Buffer.from(t));
  const sendClose = (code) => {
    const payload = Buffer.alloc(2);
    payload.writeUInt16BE(code);
    sendFrame(0x8, payload);
  };

  socket.on("data", (chunk) => {
    buffer = Buffer.concat([buffer, chunk]);
    while (buffer.length >= 2) {
      const b0 = buffer[0];
      const b1 = buffer[1];
      const opcode = b0 & 0x0f;
      const masked = (b1 & 0x80) !== 0;
      let len = b1 & 0x7f;
      let offset = 2;
      if (len === 126) {
        len = buffer.readUInt16BE(2);
        offset = 4;
      }
      if (buffer.length < offset + (masked ? 4 : 0) + len) return; // not a full frame yet
      const maskKey = masked ? buffer.subarray(offset, offset + 4) : null;
      offset += masked ? 4 : 0;
      const payload = buffer.subarray(offset, offset + len);
      const unmasked = masked
        ? Buffer.from(payload.map((byte, i) => byte ^ maskKey[i % 4]))
        : payload;
      buffer = buffer.subarray(offset + len);

      if (opcode === 0x8) { sendClose(1000); socket.destroy(); return; } // close handshake
      if (opcode === 0x9) sendFrame(0xA, unmasked); // ping -> pong
      if (opcode === 0x1) handleMessage(unmasked.toString());
    }
  });

  function handleMessage(msg) {
    console.log("  [message]", msg);
    if (msg.startsWith("chat:")) {
      sendText(`echo: ${msg.slice(5)}`);
      return;
    }
    if (msg === "expire-me") {
      // mid-session auth expiry: server closes with custom code 4001 (auth required)
      console.log("  [session expired] closing with code 4001");
      sendClose(4001);
      socket.destroy();
      return;
    }
    sendText("unknown command");
  }

  sendText("welcome — authenticated over WebSocket");
});

// ---------- minimal WS client (raw socket, mimics browser, masked frames) ----------
// Post-handshake server bytes are queued so waitPayload never races the handshake chunk.
const clientBuffers = new WeakMap();

const connect = (port, path) =>
  new Promise((resolve) => {
    const sock = net.createConnection({ host: "127.0.0.1", port });
    const key = crypto.randomBytes(16).toString("base64");
    let settled = false;
    sock.on("connect", () => {
      sock.write(
        `GET ${path} HTTP/1.1\r\nHost: localhost\r\nUpgrade: websocket\r\nConnection: Upgrade\r\n` +
          `Sec-WebSocket-Key: ${key}\r\nSec-WebSocket-Version: 13\r\n\r\n`
      );
    });
    sock.on("data", (d) => {
      const txt = d.toString();
      if (!settled) {
        if (txt.startsWith("HTTP/1.1 101")) {
          settled = true;
          clientBuffers.set(sock, []);
          const rest = d.subarray(txt.indexOf("\r\n\r\n") + 4); // frames that rode in with headers
          if (rest.length) clientBuffers.get(sock).push(rest);
          resolve({ sock, ok: true });
          if (clientBuffers.get(sock).length) sock.emit("queued"); // notify waiters
        } else if (txt.startsWith("HTTP/1.1 401")) {
          settled = true;
          resolve({ sock: null, ok: false });
          sock.destroy();
        }
      } else {
        clientBuffers.get(sock)?.push(d);
        sock.emit("queued");
      }
    });
    sock.on("error", () => !settled && resolve({ sock: null, ok: false }));
    sock.on("close", () => !settled && resolve({ sock: null, ok: false }));
  });

// Reads next server payload, preferring already-buffered bytes over a fresh event
const waitPayload = (sock) =>
  new Promise((resolve) => {
    const queue = clientBuffers.get(sock);
    if (queue && queue.length) return resolve(queue.shift());
    sock.once("queued", () => resolve(clientBuffers.get(sock).shift()));
  });

// client -> server frames MUST be masked
const maskFrame = (msg, opcode = 0x1) => {
  const payload = Buffer.from(msg);
  const key = crypto.randomBytes(4);
  const masked = Buffer.from(payload.map((b, i) => b ^ key[i % 4]));
  const header = Buffer.alloc(2);
  header[0] = 0x80 | opcode;
  header[1] = 0x80 | payload.length;
  return Buffer.concat([header, key, masked]);
};

server.listen(0, async () => {
  const { port } = server.address();
  console.log("WS auth demo on ws://localhost:" + port);

  console.log("\n-- client 1: valid token in query string --");
  const c1 = await connect(port, "/?socket_token=valid-token-123");
  console.log("handshake ok:", c1.ok); // true
  if (c1.sock) {
    const welcome = (await waitPayload(c1.sock)).toString().replace(/[^\x20-\x7e]/g, "");
    console.log("server sent:", welcome);
    c1.sock.write(maskFrame("chat:hello")); // client -> server must be masked
    await sleep(100);
    const echo = (await waitPayload(c1.sock)).toString().replace(/[^\x20-\x7e]/g, "");
    console.log("server replied:", echo);
  }

  console.log("\n-- client 2: NO token (attacker) --");
  const c2 = await connect(port, "/");
  console.log("handshake ok:", c2.ok); // false — 401

  console.log("\n-- client 3: valid, then session expires mid-connection --");
  const c3 = await connect(port, "/?socket_token=short-lived-token");
  console.log("handshake ok:", c3.ok);
  if (c3.sock) {
    await sleep(100);
    const welcome = (await waitPayload(c3.sock)).toString().replace(/[^\x20-\x7e]/g, "");
    console.log("server sent:", welcome);
    c3.sock.write(maskFrame("expire-me"));
    c3.sock.once("close", () => console.log("  connection closed by server (code 4001)"));
    await sleep(200);
  }

  console.log("\n-- client 4: ping/pong keepalive --");
  const c4 = await connect(port, "/?socket_token=valid-token-123");
  if (c4.sock) {
    await sleep(100);
    (await waitPayload(c4.sock)).toString();
    c4.sock.write(maskFrame("hi", 0x9)); // client ping
    await sleep(100);
    const pong = (await waitPayload(c4.sock)).toString().replace(/[^\x20-\x7e]/g, "");
    console.log("got pong echoing ping payload:", JSON.stringify(pong) === '"hi"');
  }

  console.log("\nAuth options recap:");
// 1) one-time token in query string (works everywhere, but lands in logs)
    // 2) HttpOnly cookie in handshake (browser default, no token in URL)
    // 3) subprotocol/Authorization header (server-to-server clients)
    // Mid-session expiry: server closes with 4001/4401; client reconnects
    // with a fresh token. Ping/pong keeps dead connections detected.
  process.exit(0);
});