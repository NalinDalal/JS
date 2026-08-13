/**
 * Module 12 — 12.x ws Library Quick-Start
 * Bridges zero-dep protocol knowledge to the production `ws` npm package.
 * Install: npm install ws
 *
 * Run: node 09-ws-library.js
 */

// ---- Server with `ws` ----

// import { WebSocketServer } from "ws"; // ESM
// CommonJS:
const { WebSocketServer, WebSocket } = require("ws");

const wss = new WebSocketServer({ port: 4000 });

wss.on("connection", (ws, req) => {
  const url = req.url || "/";
  console.log("  [upgrade]", url, "clients=", wss.clients.size);

  ws.send("Welcome from ws library!");

  ws.on("message", (data, isBinary) => {
    console.log("  [rx]", isBinary ? `<binary ${data.length} bytes>` : data.toString());

    if (!isBinary) {
      ws.send(`echo: ${data}`);
    }

    // Broadcast to everyone else
    for (const client of wss.clients) {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(`broadcast: ${data}`);
      }
    }
  });

  ws.on("close", (code, reason) => {
    console.log("  [close]", code, reason.toString(), "remaining=", wss.clients.size);
  });

  ws.on("error", (err) => {
    console.log("  [ws error]", err.message);
  });

  // Ping/pong is handled automatically by `ws` unless you disable it.
  // You can still listen:
  ws.on("pong", () => {
    console.log("  [pong]");
  });
});

console.log("ws server on ws://localhost:4000");

// ---- Client with `ws` ----

// import WebSocket from "ws"; // ESM client
// const c = new WebSocket("ws://localhost:4000");

// ---- Secure server (wss://) ----

// import { readFileSync } from "node:fs";
// const server = https.createServer({
//   cert: readFileSync("cert.pem"),
//   key: readFileSync("key.pem"),
// });
// const wssTls = new WebSocketServer({ server });
// server.listen(8443);

// ---- Quick comparison: zero-dep vs ws ----
// | Feature | 01-websocket-protocol.js | ws library |
// |---------|--------------------------|------------|
// | Dependencies | Node built-ins only | npm install ws |
// | Binary frames | Manual opcode 0x2 handling | Automatic via isBinary flag |
// | Compression | No | permessage-deflate (opt-in) |
// | Clustering | Manual | wss.clients Set + iterators |
// | TLS (wss) | Manual HTTPS + upgrade | WebSocketServer({ server }) |
// | Ping/pong | Manual frame encode | Automatic; override if needed |
// | Close codes | Manual opcode 0x8 | ws.close(code, reason) |
// | Production use | Learning only | Yes |

// ---- Cleanup ----

setTimeout(() => {
  console.log("\n  [shutdown] closing all clients");
  wss.close(() => {
    console.log("  [done] server closed");
    process.exit(0);
  });
}, 5_000);
