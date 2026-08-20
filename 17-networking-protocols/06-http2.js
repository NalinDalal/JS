/**
 * Module 17 — 17.8 HTTP/2: Multiplexing on One Connection
 * http2.connect to a real h2 host (nghttp2.org first, with fallbacks).
 * Three concurrent requests run over ONE shared TCP+TLS socket
 * (session.socket) — that's multiplexing, impossible on HTTP/1.1.
 *
 * Run: node 06-http2.js
 */

const http2 = require("node:http2");

const HOSTS = ["https://nghttp2.org", "https://www.google.com", "https://github.com"];
const ATTEMPT_TIMEOUT_MS = 4000;

// Fire one request; resolve with its status (or reject on error/timeout)
function probe(session, path = "/") {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("attempt timed out")), ATTEMPT_TIMEOUT_MS);
    const req = session.request({ ":path": path });
    req.on("response", (headers) => {
      clearTimeout(timer);
      req.resume();
      req.on("end", () => resolve(headers[":status"]));
    });
    req.on("error", (err) => {
      clearTimeout(timer);
      reject(err);
    });
  });
}

function demo(session, url) {
  return new Promise((resolve, reject) => {
    console.log(`\n--- 3 CONCURRENT requests over the SAME connection (${url}) ---`);
    const started = Date.now();
    const socket = session.socket; // ONE underlying TCP+TLS socket for all streams
    console.log(`  session.socket: one shared socket (${socket.remoteAddress}:${socket.remotePort})`);
    console.log("  on HTTP/1.1 these 3 requests would each need their own connection — h2 multiplexes:");
    let done = 0;
    for (let i = 1; i <= 3; i++) {
      const req = session.request({ ":path": "/" });
      req.on("response", (headers) => {
        const status = headers[":status"];
        req.resume();
        req.on("end", () => {
          done++;
          console.log(`  stream #${i}: status ${status} — ${done}/3 multiplexed on one socket (${Date.now() - started}ms)`);
          if (done === 3) resolve();
        });
      });
      req.on("error", reject);
    }
  });
}

(async () => {
  for (const url of HOSTS) {
    console.log(`trying ${url} ...`);
    const session = http2.connect(url);
    try {
      const status = await probe(session);
      console.log(`  connected! (first response status: ${status})`);
      await demo(session, url);
      session.close();
      console.log("\n[done]");
      process.exit(0);
    } catch (err) {
      console.log(`  failed: ${err.code || err.message}`);
      session.destroy();
    }
  }
  console.log("[offline] none of the HTTP/2 hosts responded — are you offline? Exiting gracefully.");
  process.exit(0);
})();

// Global safety: never run longer than ~15s
setTimeout(() => {
  console.log("[safety] 15s global timeout — exiting");
  process.exit(0);
}, 15_000);
