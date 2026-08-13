# Module 10: Authentication, Authorization & Security

---

## 10.1 Authentication vs Authorization

### Explain It

Authentication is the process of verifying **who you are** — proving identity with something you know (password), have (token, device), or are (biometric). Authorization answers **what you're allowed to do** — which resources and actions a verified identity can access. The order matters: you must authenticate first, then authorization checks happen on every request (middleware-style). The two are easy to confuse in interviews: authentication is "ID check at the door", authorization is "which rooms your badge opens". In HTTP terms, auth happens at login (credentials → proof of identity) and authorization happens per-request (token/session → role/permission check).

### Prove It

```js
// 01-auth-concepts.js — run: node 01-auth-concepts.js
```

#### Gotchas / Edge Cases

- AuthN and AuthZ are separate concerns. A user can be authenticated (valid token) but unauthorized (insufficient permissions). Never conflate "is logged in" with "can do this action."
- The order is always: authenticate FIRST, then authorize on EVERY request. Session expiry, token revocation, and permission changes must be re-checked per request — not cached at login time.
- Authentication proves identity; authorization checks permissions. Interviewers love to test this distinction.

---

## 10.2 Session-Based vs Token-Based Auth

### Explain It

Session auth is **stateful**: the server stores the session (in memory, Redis, DB), hands the client an opaque session ID cookie, and looks the session up on every request. Token auth (JWT) is **stateless**: the server signs a self-contained token; the client sends it in an `Authorization: Bearer <token>` header and the server just verifies the signature — no lookup needed. Sessions are easier to revoke (delete server-side), which is why they're the default for web apps with cookies + CSRF protection. JWTs scale across microservices without shared storage but can't be revoked before `exp` without extra infrastructure (deny-list / refresh-token rotation). Bonus interview point: JWTs are usually stored in-memory or HttpOnly cookies, NOT localStorage if you care about XSS — see 10.10.

### Prove It

```js
// 05-session-auth.js — run: node 05-session-auth.js
```

#### Gotchas / Edge Cases

- Sessions are **stateful** — the server MUST store them. In-memory `Map` is fine for demos, but production needs Redis/DB for multi-server deployments.
- Session IDs must be **cryptographically random** (use `crypto.randomBytes`, not `Math.random`). Predictable session IDs enable session fixation attacks.
- Sessions can be revoked instantly (delete from store), which is their main advantage over JWTs.
- Cookie attributes that matter: `HttpOnly` (JS can't read), `Secure` (HTTPS only), `SameSite=Strict/Lax` (CSRF protection), `Max-Age`/`Expires` (lifetime).

---

## 10.3 JWT Structure: header.payload.signature

### Explain It

A JWT is three base64url-encoded segments joined by dots. The **header** declares the algorithm (`alg`) and token type (`typ: JWT`). The **payload** holds claims — registered claims like `sub` (subject = user id), `iat` (issued at), `exp` (expiry), `nbf` (not before), `iss` (issuer), `aud` (audience), plus your custom claims. The **signature** is computed over `header.payload` using a secret (HS256) or private key (RS256) — anyone can read the base64 payload, so **never put passwords or secrets in a JWT**. The signature is what proves the token wasn't tampered with. base64url differs from base64 by using `-` and `_` instead of `+` and `/`, and omitting padding `=`. Key interview point: "Is a JWT encrypted?" — No, it's signed, not encrypted. Anyone can decode it.

### Prove It

```js
// 02-jwt-structure.js — run: node 02-jwt-structure.js
```

#### Gotchas / Edge Cases

- JWT payload is **NOT encrypted** — only base64url encoded. Anyone who intercepts the token can decode and read the payload. Never put secrets, passwords, or PII in the payload.
- `alg: none` attack: if the server blindly trusts the header's `alg`, an attacker can strip the signature and set `alg: none`. Always pin the expected algorithm server-side.
- `exp`, `nbf`, `iss`, `aud` are **registered claims** but not enforced by the JWT spec — your server must validate them.
- The three segments are `base64url(header).base64url(payload).base64url(signature)` — any deviation (extra dots, wrong encoding) breaks the token.

---

## 10.4 Signing Algorithms: HS256 vs RS256

### Explain It

HS256 (HMAC-SHA256) is **symmetric**: the same shared secret signs and verifies the token. Fast and simple, but every service holding the secret can forge tokens — fine for a single server, dangerous across many microservices. RS256 (RSA-SHA256) is **asymmetric**: a private key signs, a public key verifies. Services that verify only need the public key, so verification scales safely; only the auth server can sign. RS256 also enables public-key rotation without re-signing. Industry rule of thumb: use RS256/ES256 for multi-service systems and when you don't trust verifying parties; use HS256 in a monolith where only you hold the secret. Also worth knowing: `alg: none` attacks — a verifier blindly accepting the `alg` header allows an attacker to forge a token with `"alg":"none"`; always pin the expected algorithm.

### Prove It

```js
// 03-jwt-signing.js — run: node 03-jwt-signing.js
// 04-jwt-verification.js — run: node 04-jwt-verification.js
```

#### Gotchas / Edge Cases

- HS256 is symmetric — the same secret both signs and verifies. Any service holding the secret can **forge tokens**. Fine for a monolith, dangerous across microservices.
- RS256 is asymmetric — only the private key signs; the public key verifies. Verification services never need the private key, so they can't forge.
- Key size matters: RSA keys should be at least 2048 bits (4096 for long-lived tokens). Smaller keys are breakable.
- `crypto.verify()` with RSA returns `true`/`false` — it does NOT throw on bad signatures. Check the return value explicitly.

---

## 10.5 JWT Verification & Claims Validation

### Explain It

Verification is a three-step gauntlet. **1) Signature check** — recompute the HMAC (or verify with the public key) over `header.payload`; if it fails, the token was tampered with, reject it. **2) Algorithm check** — confirm the `alg` in the header matches the algorithm you expect; never trust the header blindly. **3) Claims validation** — check `exp` (expired?), `nbf` (too early?), `iss` (is it our issuer?), `aud` (was it meant for us?), and `sub` (a valid user). Verification failure must reject the request, and inexpired-but-currently-valid vs expired is the eternal 401-but-interviewers-want-refresh answer: on expiry the client should use a refresh token to get a new access token, or re-login. Server-side decode without verifying is only useful for reading, never for trusting.

### Prove It

```js
// 04-jwt-verification.js — run: node 04-jwt-verification.js
```

#### Gotchas / Edge Cases

- Verification is a **three-step gauntlet**: signature → algorithm → claims. Skipping any step is a vulnerability.
- `exp` (expiry) is the most critical claim. An expired token must be rejected, even if the signature is valid. Libraries often do this automatically — verify yours does.
- Clock skew between servers can cause `nbf`/`exp` failures. Allow a small leeway (e.g., 30–60 seconds) in production.
- `aud` and `iss` prevent token reuse across services. A token issued for `api.example.com` must NOT be accepted by `admin.example.com`.

---

## 10.6 Refresh Tokens & Token Rotation

### Explain It

Access tokens are short-lived (minutes) so a stolen token is useful for a short window. Refresh tokens are long-lived (days/weeks) and are exchanged for new access tokens, but only sent over the refresh endpoint (and ideally stored in an HttpOnly cookie). **Rotation**: on every refresh, issue a *new* refresh token and **invalidate the old one** — this way a stolen refresh token can only be used once, and if a replayed old token shows up you know it was compromised (detect-and-revoke the session). The trade-off: rotation turns the stateless system into a stateful one because the server must track valid refresh tokens (in DB/Redis) to revoke them. This is the standard modern flow: access token in memory, refresh token in HttpOnly cookie, `POST /auth/refresh` to swap.

### Prove It

```js
// 06-http-auth-middleware.js — run: node 06-http-auth-middleware.js
```

#### Gotchas / Edge Cases

- Refresh token rotation turns a **stateless** system into a **stateful** one — the server must track valid refresh tokens in DB/Redis to support revocation.
- A stolen refresh token is dangerous because it can be exchanged for new access tokens indefinitely. Rotation limits the blast radius to a single use.
- Replay detection: if an old (already-rotated) refresh token shows up, revoke the entire session — that signals theft.
- Refresh tokens must be stored in **HttpOnly cookies** or secure storage, never in `localStorage` or exposed to JS.

---

## 10.7 Password Security: Hashing, Salting, Timing Attacks

### Explain It

Never store passwords — store a **hash** with a **salt**. Hashing is one-way (bcrypt, argon2, scrypt, PBKDF2); encryption is reversible and useless for passwords. A **salt** is random per-user data mixed into the hash so identical passwords produce different hashes, defeating rainbow tables and precomputation. Production-strength hashers (bcrypt/argon2) are deliberately **slow** (work factor) — that slowness is the point: it makes brute-forcing expensive. Verify with **timing-safe comparison** (`crypto.timingSafeEqual`) so the response time doesn't leak how many leading bytes of the hash match — a naive `===` comparison can be measured over many requests and used to guess the hash one byte at a time. Never write your own hash function; use a vetted library.

### Prove It

```js
// 07-password-hashing.js — run: node 07-password-hashing.js
```

#### Gotchas / Edge Cases

- Never store plaintext passwords. Ever. Hash them with bcrypt, argon2, or scrypt — not SHA-256/MD5 (too fast to brute-force).
- A **salt** must be unique per user and random. Reusing salts or using a static salt defeats rainbow-table defense.
- Timing attacks: `===` on hashes short-circuits on the first mismatched byte. Over many requests, an attacker can guess the hash byte-by-byte. Use `crypto.timingSafeEqual` for constant-time comparison.
- Work factor (`N`, `r`, `p` in scrypt) must be high enough to make hashing slow (100ms+) — that slowness is the security feature.

---

## 10.8 OAuth 2.0 & OpenID Connect

### Explain It

OAuth 2.0 is an **authorization framework** that lets a third-party app access a user's resources (GitHub, Google) **without ever seeing their password** — the resource owner delegates access via tokens. The **authorization code flow** is the standard web flow: app → `/authorize` (user logs in at the provider) → provider redirects back with a one-time **code** → app exchanges the code for an access token at the token endpoint. **PKCE** (Proof Key for Code Exchange) protects this: the app generates a random `code_verifier`, sends a hashed `code_challenge`, and must present the original verifier when exchanging. **OIDC** is OAuth 2.0 + an **ID token** (a JWT asserting who the user is, validated with the issuer's public keys), giving you identity on top of authorization. Interview favorite: implicit flow is deprecated — always use authorization code + PKCE for public clients.

### Prove It

```js
// 08-oauth-pkce.js — run: node 08-oauth-pkce.js
```

#### Gotchas / Edge Cases

- The **authorization code** is single-use. If intercepted, it is useless without the `code_verifier`. This is why PKCE protects public clients (mobile/SPAs) that can't keep a `client_secret`.
- The `code_challenge` is sent in the authorize URL (visible in logs, browser history). Only the `code_verifier` is secret — it never leaves the client.
- `redirect_uri` in the token request must **exactly match** the one registered. Mismatches are a common OAuth misconfiguration.
- Implicit flow (token returned directly from `/authorize`) is **deprecated** — always use authorization code + PKCE for new code.

---

## 10.9 WebSocket Auth

### Explain It

WebSockets are stateful in a different way: the connection is established once via an **HTTP upgrade handshake**, then it's raw two-way frames. Auth happens at **handshake time** — the browser can't set `Authorization` headers on `new WebSocket(url)`, so the three options are: **1)** token in query string (`ws://host?socket_token=...` — works but leaks into server logs, fine with short-lived one-time tokens), **2)** HttpOnly cookie presented in the handshake (automatic, no token in URL), **3)** subprotocol like `Sec-WebSocket-Protocol: auth, json`. The server responds `101 Switching Protocols` only if the token/cookie is valid; aborts the handshake otherwise (client gets `onerror`). Also relevant: frame-based auth for "session expires mid-connection" — server sends an auth-required frame or closes with code 4001/4401 and the client authenticates a fresh socket. Ping/pong keepalives are used to detect dead connections (and to keep proxies from closing idle sockets).

### Prove It

```js
// 09-websocket-auth.js — run: node 09-websocket-auth.js
```

#### Gotchas / Edge Cases

- The browser **cannot** set `Authorization` headers on `new WebSocket(url)`. Auth must happen via query string, cookies, or subprotocol at handshake time.
- Query string tokens leak into server access logs. Use one-time/short-lived tokens if you must use query strings, or prefer HttpOnly cookies.
- Mid-session expiry: the server must send an auth-required frame or close with code `4001`/`4401` — the client then re-authenticates a fresh socket.
- Ping/pong keepalives prevent proxies/NATs from closing idle WebSocket connections.

---

## 10.10 Token Storage & Browser Strategy

### Explain It

Where to put the token is a security trade-off, and the interview answer has nuance. **localStorage**: vulnerable to XSS — any injected script reads your token (`localStorage.getItem`). **HttpOnly cookie**: XSS-proof (JS can't read it) but vulnerable to CSRF on cookie-authenticated requests unless you use `SameSite=Strict/Lax` and/or CSRF tokens — and it couples you to browser cookie policies (cross-site contexts break it). The modern recommended stack: **access token in memory** (XSS-resistant, lost on reload → refresh from cookie), **refresh token in HttpOnly + Secure + SameSite cookie**, and an **interceptor** that catches 401, silently calls `/auth/refresh`, and replays the original request. Remember: HttpOnly means no XSS can steal the refresh token; SameSite=Lax/Strict kills most CSRF; Secure means HTTPS-only.

### Prove It

```js
// 10-token-storage.js — run: node 10-token-storage.js
// 06-http-auth-middleware.js (refresh flow reference)
```

#### Gotchas / Edge Cases

- `localStorage` is **XSS-vulnerable**: any injected script reads your tokens. Never store refresh tokens there.
- `sessionStorage` is slightly safer (cleared on tab close) but still XSS-vulnerable — any script in the tab can read it.
- **In-memory** storage is XSS-resistant but lost on reload — requires a silent refresh flow from an HttpOnly cookie.
- **HttpOnly cookies** are XSS-proof but CSRF-vulnerable unless paired with `SameSite=Strict/Lax` and/or CSRF tokens.
- The modern stack: access token in memory, refresh token in HttpOnly + Secure + SameSite cookie, interceptor handles 401 → refresh → replay.

---

## 10.11 Web Attacks: XSS, CSRF, CORS, CSP & Headers

### Explain It

**XSS**: attacker injects script into your page (reflected/stored/DOM) which runs with your origin's privileges — steal tokens, cookies, data. Defense: escape output, sanitize user HTML, CSP `script-src`, HttpOnly cookies. **CSRF**: attacker's site makes the *browser* send an authenticated request to your site (cookie auto-attached); the server can't tell it wasn't a legitimate form. Defense: `SameSite` cookies, CSRF tokens (double-submit, synchronizer pattern), `Origin`/`Referer` checks. **CORS** is the opposite direction — it's the *browser* enforcing, per response header `Access-Control-Allow-Origin`, whether *your* page may read cross-origin responses; it's not a server-side privacy wall. Core-response headers: `Content-Security-Policy`, `X-Content-Type-Options: nosniff`, `Strict-Transport-Security`, `X-Frame-Options: DENY`, `Referrer-Policy`. Rate limiting slows credential-stuffing; never roll your own crypto.

### Prove It

```js
// 11-web-attacks.js — run: node 11-web-attacks.js
```

#### Gotchas / Edge Cases

- **CORS is a browser enforcement, not a server security wall**. `curl`, scripts, and WebSocket clients are not blocked by CORS — it only stops YOUR page from READING the response.
- Never use `Access-Control-Allow-Origin: *` with credentials — the browser rejects it. Specify exact origins.
- `SameSite=Strict` blocks ALL cross-site cookie sending (including legitimate top-level navigations). `SameSite=Lax` allows top-level GET navigations — use Lax unless you need Strict.
- `Content-Security-Policy` is a powerful XSS defense but easy to misconfigure. Start with `script-src 'self'` and add exceptions only as needed.

---

## 10.12 Interview Questions

### Explain It

Cover the classic ones out loud: What is the difference between authentication and authorization? How does JWT work? Why is JWT signed not encrypted? Session vs JWT — when to use which? How can a JWT be revoked? What is a refresh token and why rotate it? How does XSS differ from CSRF, and how does SameSite help? How does OAuth authorization code + PKCE work? How do you authenticate a WebSocket? Where do you store tokens and why? What's wrong with storing JWTs in localStorage? How do you protect passwords?

### Prove It

```js
// 12-interview-questions.js — run: node 12-interview-questions.js
```