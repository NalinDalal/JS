/**
 * Module 17 — 17.11 Reverse Proxy (the Week 19 build from plan.md)
 * An HTTP server that forwards every request to jsonplaceholder.typicode.com
 * (via HTTPS — typicode redirects port 80 away). Demonstrates L7 proxying:
 * per-request timeout -> 504, upstream failure -> 502, and streaming in
 * both directions with Node streams.
 *
 * Run: node 08-proxy.js
 */

const http = require("node:http");
const https = require("node:https");

const UPSTREAM = { hostname: "jsonplaceholder.typicode.com", port: 443 };

const proxy = http.createServer((clientReq, clientRes) => {
  const upstreamReq = https.request(
    {
      hostname: UPSTREAM.hostname,
      port: UPSTREAM.port,
      path: clientReq.url,
      method: clientReq.method,
      agent: false, // one-shot socket: no pooled keep-alive connections
      headers: { "user-agent": "module17-proxy", "accept": "application/json" },
    },
    (upstreamRes) => {
      console.log(`[proxy] ${clientReq.method} ${clientReq.url} -> upstream replied ${upstreamRes.statusCode}`);
      clientRes.writeHead(upstreamRes.statusCode, upstreamRes.headers);
      upstreamRes.pipe(clientRes); // stream the response back to the client
    }
  );

  // Per-request timeout: the upstream never answered
  upstreamReq.setTimeout(5000, () => {
    console.log(`[proxy] ${clientReq.method} ${clientReq.url} -> TIMEOUT, sending 504 Gateway Timeout`);
    clientRes.writeHead(504, { "Content-Type": "application/json" });
    clientRes.end(JSON.stringify({ error: "upstream timed out" }));
    upstreamReq.destroy();
  });

  // Offline / DNS failure / connection refused -> 502 Bad Gateway
  upstreamReq.on("error", (err) => {
    console.log(`[proxy] ${clientReq.method} ${clientReq.url} -> UPSTREAM ERROR ${err.code}, sending 502`);
    if (!clientRes.headersSent) {
      clientRes.writeHead(502, { "Content-Type": "application/json" });
    }
    clientRes.end(JSON.stringify({ error: "bad gateway", code: err.code }));
  });

  clientReq.pipe(upstreamReq); // stream the request forward
});

proxy.listen(0, "127.0.0.1", () => {
  const { port } = proxy.address();
  console.log(`[proxy] reverse proxy on http://127.0.0.1:${port} -> https://jsonplaceholder.typicode.com`);
  console.log(`        (equivalent: curl http://127.0.0.1:${port}/posts/1)`);

  // Self-test: hit the proxy the way a browser would
  http
    .get({ host: "127.0.0.1", port, path: "/posts/1" }, (res) => {
      let body = "";
      res.on("data", (c) => (body += c));
      res.on("end", () => {
        console.log(`[self-test] GET /posts/1 -> ${res.statusCode}: ${JSON.stringify(body.slice(0, 120))}`);
      });
    })
    .on("error", (err) => console.log(`[self-test] could not reach the proxy: ${err.code}`));
});

// Self-close after ~5s so the file terminates
setTimeout(() => {
  console.log("\n[shutdown] 5s up — closing the proxy. (If you saw 502s, you were offline — that was the graceful failure path.)");
  proxy.close(() => process.exit(0));
  setTimeout(() => process.exit(0), 500); // force-exit fallback (keep-alive sockets)
}, 5000);
