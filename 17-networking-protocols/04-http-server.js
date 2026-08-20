/**
 * Module 17 — 17.6/17.7 HTTP: Status Codes, Headers, Cookies, CORS
 * A zero-dep HTTP server on an ephemeral port that demos: 200/201/304/404/405/500,
 * Cache-Control + ETag revalidation, HttpOnly/SameSite cookies, CORS headers,
 * and JSON POST bodies — then a built-in client exercises every path.
 *
 * Run: node 04-http-server.js
 */

const http = require("node:http");

const server = http.createServer((req, res) => {
  // CORS: headers browsers require before cross-origin JS may read responses
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    // CORS preflight
    res.writeHead(204);
    res.end();
    return;
  }

  const path = req.url.split("?")[0];

  if (path === "/") {
    res.setHeader("Content-Type", "text/html");
    res.setHeader("Cache-Control", "public, max-age=60"); // cacheable for 60s
    res.setHeader("ETag", '"home-v1"'); // strong validator
    // HttpOnly: JS can't read it; SameSite=Lax: sent on top-level navigation
    res.setHeader("Set-Cookie", "sid=abc123; HttpOnly; SameSite=Lax; Path=/");
    res.writeHead(200);
    res.end("<h1>Home</h1>");
    return;
  }

  if (path === "/data") {
    const etag = '"data-v1"';
    if (req.headers["if-none-match"] === etag) {
      res.writeHead(304); // Not Modified: client reuses cached copy, no body sent
      res.end();
      return;
    }
    res.setHeader("Content-Type", "application/json");
    res.setHeader("Cache-Control", "max-age=30");
    res.setHeader("ETag", etag);
    res.writeHead(200);
    res.end(JSON.stringify({ version: 1, fresh: true }));
    return;
  }

  if (path === "/items") {
    if (req.method !== "POST") {
      res.setHeader("Allow", "POST, OPTIONS"); // 405 must advertise what's allowed
      res.writeHead(405); // Method Not Allowed
      res.end(JSON.stringify({ error: "only POST is allowed here" }));
      return;
    }
    let body = "";
    req.on("data", (chunk) => (body += chunk));
    req.on("end", () => {
      res.setHeader("Content-Type", "application/json");
      res.writeHead(201); // Created
      res.end(JSON.stringify({ ok: true, youSent: JSON.parse(body || "{}") }));
    });
    return;
  }

  if (path === "/boom") {
    res.writeHead(500, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Internal Server Error" }));
    return;
  }

  res.writeHead(404, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ error: "Not Found" }));
});

server.listen(0, "127.0.0.1", () => {
  const { port } = server.address();
  console.log(`[server] listening on http://127.0.0.1:${port}`);
  runClient(port);
});

// ---- Self-test client: exercises every route ----
function request(port, { method = "GET", path, headers = {}, body } = {}) {
  return new Promise((resolve) => {
    const req = http.request(
      { host: "127.0.0.1", port, method, path, headers },
      (res) => {
        let data = "";
        res.on("data", (c) => (data += c));
        res.on("end", () => resolve({ status: res.statusCode, headers: res.headers, body: data }));
      }
    );
    if (body) req.write(body);
    req.end();
  });
}

async function runClient(port) {
  console.log("\n--- exercising the server ---");

  let r = await request(port, { path: "/" });
  console.log(`GET /                 -> ${r.status}`);
  console.log(`   Set-Cookie:        ${r.headers["set-cookie"]}`);
  console.log(`   Cache-Control:     ${r.headers["cache-control"]}   ETag: ${r.headers.etag}`);

  r = await request(port, { path: "/data" });
  console.log(`GET /data             -> ${r.status} (fresh copy, ETag: ${r.headers.etag})`);

  r = await request(port, { path: "/data", headers: { "If-None-Match": '"data-v1"' } });
  console.log(`GET /data (If-None-Match) -> ${r.status} (304 = reuse cached copy, no body)`);

  r = await request(port, { path: "/missing" });
  console.log(`GET /missing          -> ${r.status} (${r.body})`);

  r = await request(port, { path: "/items" });
  console.log(`GET /items            -> ${r.status} (Allow: ${r.headers.allow})`);

  r = await request(port, {
    method: "POST",
    path: "/items",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: "nails" }),
  });
  console.log(`POST /items           -> ${r.status} ${r.body}`);

  r = await request(port, { path: "/boom" });
  console.log(`GET /boom             -> ${r.status} (${r.body})`);

  console.log("\n[demo] done — shutting server down");
  server.close(() => process.exit(0));
}

// Safety: self-close ~3s no matter what (server.close also runs)
setTimeout(() => {
  console.log("[safety] 3s self-close — exiting");
  server.close();
  process.exit(0);
}, 3000);
