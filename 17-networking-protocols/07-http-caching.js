/**
 * Module 17 — 17.7 HTTP Caching: Cache-Control & ETag Simulation
 * A tiny in-memory "server" + "browser cache" showing the full exchange:
 * first fetch (200 + ETag), fresh-from-cache (max-age, zero network),
 * then stale -> revalidation (If-None-Match) -> 304 -> cached body reused.
 * No network involved — pure logic.
 *
 * Run: node 07-http-caching.js
 */

// ---- The "server": one resource with an ETag + Cache-Control ----
const store = {
  "/docs/page1": {
    etag: '"page1-v3"',
    body: { title: "Page 1", version: 3, author: "nlin" },
  },
};

function serverRequest(path, headers = {}) {
  const res = store[path];
  if (!res) return { status: 404, headers: {}, body: null };
  const responseHeaders = { ETag: res.etag, "Cache-Control": "public, max-age=60" };
  const cond = headers["If-None-Match"];
  console.log(`[server] GET ${path}${cond ? ` with If-None-Match: ${cond}` : ""}`);
  if (cond === res.etag) {
    console.log(`[server]    ETag matches -> sending 304 Not Modified (no body!)`);
    return { status: 304, headers: responseHeaders, body: null };
  }
  console.log(`[server]    sending 200 with ETag: ${res.etag}, Cache-Control: max-age=60`);
  return { status: 200, headers: responseHeaders, body: res.body };
}

// ---- The "browser": a cache that honors the headers ----
const browserCache = new Map(); // path -> { etag, body, expiresAt }

function browserFetch(path) {
  const cached = browserCache.get(path);
  if (cached && Date.now() < cached.expiresAt) {
    console.log(`[browser] ${path}: FRESH (still inside max-age) -> serving from cache, ZERO network`);
    return { fromCache: true, body: cached.body };
  }
  // Stale -> conditional request with If-None-Match
  const res = serverRequest(path, cached ? { "If-None-Match": cached.etag } : {});
  if (res.status === 304) {
    console.log(`[browser] got 304 -> keeping cached body (revalidated, bandwidth saved)`);
    browserCache.set(path, { ...cached, expiresAt: Date.now() + 60_000 });
    return { fromCache: true, body: cached.body };
  }
  console.log(`[browser] got 200 -> storing fresh copy (ETag: ${res.headers.ETag})`);
  browserCache.set(path, { etag: res.headers.ETag, body: res.body, expiresAt: Date.now() + 60_000 });
  return { fromCache: false, body: res.body };
}

// ---- The demo ----
console.log("=== fetch #1: cold cache (nothing stored) ===");
let r = browserFetch("/docs/page1");
console.log(`   result: ${r.fromCache ? "CACHE" : "SERVER"} ->`, r.body);

console.log("\n=== fetch #2: immediately after (still within max-age=60) ===");
r = browserFetch("/docs/page1");
console.log(`   result: ${r.fromCache ? "CACHE" : "SERVER"} ->`, r.body);

console.log("\n=== fetch #3: max-age expired -> conditional request (If-None-Match) ===");
browserCache.get("/docs/page1").expiresAt = Date.now() - 1; // force expiry
r = browserFetch("/docs/page1");
console.log(`   result: ${r.fromCache ? "CACHE" : "SERVER"} ->`, r.body);

console.log("\n[demo] complete — the 304 exchange is exactly what browsers do on every reload");
process.exit(0);
