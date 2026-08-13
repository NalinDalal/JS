/**
 * Module 10 — 10.12 Interview Questions (explain out loud, in your words)
 * Quick Q&A run-through. Say the answer BEFORE looking at the printed one.
 *
 * Run: node 12-interview-questions.js
 */

const qa = [
  ["Auth vs authorization?", "Authentication = who you are (verify identity). Authorization = what you may do (permissions). AuthN first, then AuthZ on every request."],
  ["How does a JWT work?", "base64url header.payload.signature. Server signs header+payload; client sends Bearer token; server recomputes the signature and validates claims (exp, iss, aud, sub). Stateless: no server lookup."],
  ["Is a JWT encrypted?", "No — only signed. The payload is base64url, readable by anyone. Signature proves it wasn't tampered with, not that it's secret."],
  ["HS256 vs RS256?", "HS256: symmetric shared secret, fast, single service. RS256: private key signs / public key verifies, safe across untrusted microservices. Pin the algorithm to prevent alg:none / downgrade."],
  ["Session vs JWT — when to use which?", "Session: same-origin web apps needing instant revocation (server-side store). JWT: APIs / microservices / stateless scaling; revocation needs deny-list or short exp + refresh rotation."],
  ["How can a JWT be revoked before it expires?", "Not natively. Options: short expiry + refresh tokens (revoke the refresh), server-side deny-list of jti, or token version/blacklist claims checked per request."],
  ["What is a refresh token and why rotate it?", "Long-lived credential exchanged for new access tokens. Rotation: issue a new refresh token and invalidate the old one on every refresh — a stolen token becomes single-use and reuse signals compromise."],
  ["Storing JWTs — where and why?", "Access token in memory (XSS-resistant, refreshed on reload); refresh token in HttpOnly + Secure + SameSite=Strict cookie (XSS-proof, CSRF-mitigated). Avoid localStorage from injected scripts."],
  ["XSS vs CSRF?", "XSS: attacker runs script inside your page (steals tokens/cookies) — defend with escaping, CSP, HttpOnly. CSRF: attacker's page forces the victim browser to send authenticated requests — defend with SameSite, CSRF tokens, Origin checks."],
  ["OAuth 2.0 authorization code + PKCE?", "App redirects to /authorize; user approves; one-time code returns to the callback; code + code_verifier exchanged at the token endpoint; provider hashes the verifier against the stored challenge. Code alone is worthless."],
  ["OAuth vs OIDC?", "OAuth 2.0 = authorization (delegated access to resources). OIDC = identity above OAuth: adds the ID token (JWT about the user) and discovery/keys endpoint."],
  ["How do you auth a WebSocket?", "At the HTTP handshake: one-time token in query string, HttpOnly cookie (browser default), or subprotocol/Authorization header. Mid-session expiry: server closes 4001/4401, client reconnects with a fresh token."],
  ["How do you protect passwords?", "Never store plaintext. Hash with a slow, memory-hard function (bcrypt/argon2/scrypt + per-user salt), store salt+params+hash together, verify with timing-safe compare. Slowness is a feature: it defeats brute force."],
  ["What is SameSite?", "Cookie attribute: Strict (never cross-site), Lax (top-level GET only), None (requires Secure). With SameSite=Strict/Lax most CSRF is blocked because cookies don't attach cross-site."],
  ["Why timing-safe compare?", "=== returns at the first differing byte — measuring response time over many requests leaks the hash byte-by-byte. timingSafeEqual runs constant-time regardless of match position."],
  ["What's wrong with '*' CORS + credentials?", "Browsers refuse it: with creentials the server must echo a specific origin, never a wildcard. And CORS only gates READING responses — it never blocks requests."],
  ["How would you brute-force a login endpoint?", "Rate limit per IP AND per account, exponential backoff, lockout after N failures, CAPTCHA after anomalies. Never just per-IP — attackers rotate IPs; per-account limits still catch credential stuffing."],
  ["Your session store is down — what happens?", "Session auth fails closed: all requests unauthenticated. That's why JWTs shine for availability (stateless) and sessions for consistency/revocation — hybrid patterns exist (short JWT + session-managed refresh)."],
];

let n = 0;
for (const [q, a] of qa) {
  n++;
  console.log(`\n${String(n).padStart(2)}. ${q}`);
  console.log("   →", a);
}

// --- Bonus: draw these on the whiteboard ---
// 1. JWT lifecycle: login -> access (mem) + refresh (cookie) -> 401 -> refresh -> replay
// 2. OAuth code+PKCE: app -> authorize -> code -> token(t+verifier) -> API calls
// 3. Handshake: GET /?socket_token -> 101 + Sec-WebSocket-Accept -> frames
