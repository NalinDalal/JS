/**
 * Module 17 — 17.4 UDP: Connectionless Ping/Pong
 * dgram echo server + client. NO handshake, NO ordering, NO retransmission —
 * the client just fires a datagram and the server fires one back.
 *
 * Run: node 03-udp.js
 */

const dgram = require("node:dgram");

const server = dgram.createSocket("udp4");
const client = dgram.createSocket("udp4");

server.on("message", (msg, rinfo) => {
  const text = msg.toString();
  console.log(
    `[server] rx '${text}' from ${rinfo.address}:${rinfo.port} — no handshake, a datagram just arrived`
  );
  server.send(text, rinfo.port, rinfo.address); // echo back, fire-and-forget
});

server.bind(0, "127.0.0.1", () => {
  const port = server.address().port;
  console.log(`[server] UDP server on 127.0.0.1:${port} — connectionless: no SYN, no sessions`);

  const t0 = Date.now();
  client.send("ping", port, "127.0.0.1", (err) => {
    if (err) console.log(`[client] send error: ${err.code}`);
    else console.log("[client] sent 'ping' (one datagram — fire and forget, no connect())");
  });

  client.on("message", (msg) => {
    console.log(`[client] rx '${msg}' — round trip took ${Date.now() - t0}ms`);
    console.log("[client] demo done — closing sockets");
    client.close();
    server.close(() => process.exit(0));
  });

  client.on("error", (err) => {
    console.log(`[client] error: ${err.code}`);
    process.exit(0);
  });
});

// Safety: never hang — force exit after 2s
setTimeout(() => {
  console.log("[safety] 2s timeout reached — exiting");
  process.exit(0);
}, 2000);
