/**
 * Module 10 — 10.6 Full HTTP Auth Flow (10.2 + 10.5 + 10.6 in one server)
 * A plain-node HTTP server proving: register/login -> access token -> auth middleware ->
 * refresh endpoint with rotation -> logout with revocation.
 * Concepts map 1:1 to Express: routes = if/else here, middleware = wrapRoute here.
 *
 * Run: node 06-http-auth-middleware.js   (then curl the endpoints)
 */

const http = require("node:http");
const crypto = require("node:crypto");

// ---------- helpers ----------
const b64url = (buf) => buf.toString("base64url");
const encodeSegment = (obj) => b64url(Buffer.from(JSON.stringify(obj)));
const readBody = (req) =>
  new Promise((resolve) => {
    let data = "";
    req.on("data", (c) => (data += c));
    req.on("end", () => resolve(data ? JSON.parse(data) : {}));
  });

const ACCESS_SECRET = "access-token-secret";
const ACCESS_TTL = 60; // seconds — short-lived

const issueAccessToken = (userId) => {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: "HS256", typ: "JWT" };
  const payload = { sub: String(userId), iat: now, exp: now + ACCESS_TTL, iss: "demo", aud: "api" };
  const input = `${encodeSegment(header)}.${encodeSegment(payload)}`;
  return `${input}.${crypto.createHmac("sha256", ACCESS_SECRET).update(input).digest("base64url")}`;
};

// ---------- state ----------
const users = new Map(); // username -> { id, passwordHash }  (see 07-hashing for real hashing)
const refreshTokens = new Map(); // refresh token -> { userId, family }  ROTATION! family survives
const sessions = new Map(); // for session-style auth as well

// ---------- middleware chain (Express style) ----------
const authMiddleware = (req, res) => {
  const auth = req.headers.authorization || "";
  if (!auth.startsWith("Bearer ")) {
    res.writeHead(401, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Missing Bearer token" }));
    return null;
  }
  const token = auth.slice(7);
  const [h, p, s] = token.split(".");
  if (token.split(".").length !== 3) {
    res.writeHead(401, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Invalid token" }));
    return null;
  }
  const expected = crypto.createHmac("sha256", ACCESS_SECRET).update(`${h}.${p}`).digest("base64url");
  if (expected !== s) {
    res.writeHead(401, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Bad signature" }));
    return null;
  }
  const payload = JSON.parse(Buffer.from(p, "base64url").toString());
  if (payload.exp <= Math.floor(Date.now() / 1000)) {
    res.writeHead(401, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Expired — refresh and retry", code: "TOKEN_EXPIRED" }));
    return null;
  }
  return payload; // req.user in Express terms
};

const json = (res, code, obj) => {
  res.writeHead(code, { "Content-Type": "application/json" });
  res.end(JSON.stringify(obj));
};

// ---------- routes ----------
const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, "http://localhost");
  const path = url.pathname;

  // POST /register — create user
  if (req.method === "POST" && path === "/register") {
    const { username, password } = await readBody(req);
    if (users.has(username)) return json(res, 409, { error: "User exists" });
    // NOTE: real code stores a bcrypt/argon2 hash, never the plaintext (see 07)
    users.set(username, { id: users.size + 1, passwordHash: `simulated-hash(${password})` });
    return json(res, 201, { ok: true });
  }

  // POST /login — verify credentials, issue access token + rotated refresh token
  if (req.method === "POST" && path === "/login") {
    const { username, password } = await readBody(req);
    const user = users.get(username);
    if (!user || user.passwordHash !== `simulated-hash(${password})`) {
      return json(res, 401, { error: "Invalid credentials" });
    }
    const refreshToken = crypto.randomBytes(32).toString("hex");
    const family = crypto.randomBytes(16).toString("hex");
    refreshTokens.set(refreshToken, { userId: user.id, family });
    return json(res, 200, {
      accessToken: issueAccessToken(user.id),
      refreshToken,
    });
  }

  // POST /refresh — rotate: new access token + NEW refresh token, old one dies
  if (req.method === "POST" && path === "/refresh") {
    const { refreshToken } = await readBody(req);
    const stored = refreshTokens.get(refreshToken);
    if (!stored) return json(res, 401, { error: "Unknown refresh token" });

    refreshTokens.delete(refreshToken); // rotate: old refresh token now invalid
    const newRefresh = crypto.randomBytes(32).toString("hex");
    refreshTokens.set(newRefresh, { userId: stored.userId, family: stored.family });
    return json(res, 200, {
      accessToken: issueAccessToken(stored.userId),
      refreshToken: newRefresh,
    });
  }

  // POST /logout — revoke the refresh token (and optionally whole family)
  if (req.method === "POST" && path === "/logout") {
    const { refreshToken } = await readBody(req);
    const stored = refreshTokens.get(refreshToken);
    if (stored) {
      // revoke family: attacker replaying an old token burns all siblings too
      for (const [tok, s] of refreshTokens) if (s.family === stored.family) refreshTokens.delete(tok);
    }
    return json(res, 200, { ok: true });
  }

  // GET /me — PROTECTED ROUTE (authMiddleware guards it)
  if (req.method === "GET" && path === "/me") {
    const user = authMiddleware(req, res); // -> null short-circuits with 401
    if (!user) return;
    return json(res, 200, { userId: user.sub, message: "You are authenticated" });
  }

  // GET /health — public, no auth
  if (path === "/health") return json(res, 200, { status: "up" });

  json(res, 404, { error: "Not found" });
});

if (require.main === module) {
  server.listen(3000, () => console.log("Auth demo on http://localhost:3000"));
  console.log("\nTry these:");
  console.log(`  curl -X POST localhost:3000/register -d '{"username":"alice","password":"pw"}'`);
  console.log(`  curl -X POST localhost:3000/login -d '{"username":"alice","password":"pw"}'`);
  console.log(`  curl localhost:3000/me -H "Authorization: Bearer <accessToken>"`);
  console.log(`  curl -X POST localhost:3000/refresh -d '{"refreshToken":"<refreshToken>"}'`);
}