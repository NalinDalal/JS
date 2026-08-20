/**
 * Module 17 — 17.3 TCP: Handshake & Reliable Echo
 * A raw TCP echo server (node:net) plus a client, on an ephemeral port.
 * The invisible SYN -> SYN-ACK -> ACK handshake completes before 'connect'
 * fires; the FIN/ACK close happens at the end of the demo.
 *
 * Run: node 02-tcp-echo.js
 */

const net = require("node:net");

const server = net.createServer((socket) => {
  console.log("[server] client connected — 3-way handshake (SYN -> SYN-ACK -> ACK) is done");
  socket.on("data", (data) => {
    const text = data.toString().trim();
    console.log(`[server] received: ${text}`);
    // TCP guarantees delivery & ordering: lost segments are retransmitted
    socket.write(`echo: ${text}`);
  });
  socket.on("close", () => console.log("[server] client socket closed (FIN -> ACK)"));
  socket.on("error", () => {});
});

server.listen(0, "127.0.0.1", () => {
  const port = server.address().port;
  console.log(`[server] TCP server listening on 127.0.0.1:${port}`);

  const client = net.connect(port, "127.0.0.1", () => {
    // 'connect' fires only AFTER the handshake completes
    console.log("[client] connected — handshake complete, sending data");
    client.write("hello over TCP");
  });

  client.on("data", (data) => {
    console.log(`[client] got: ${data}`);
    console.log("[client] demo complete — closing both sides (FIN/ACK)");
    client.end();
    server.close(() => {
      console.log("[server] closed cleanly");
      process.exit(0);
    });
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
