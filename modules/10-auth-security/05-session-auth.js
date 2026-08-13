/**
 * Module 10 — 10.2 Session-Based Auth (stateful)
 * Server stores sessions, client presents an opaque session id cookie.
 * Instant revocation: delete the session server-side.
 *
 * Run: node 05-session-auth.js
 */

const randomId = () =>
  require("node:crypto").randomBytes(24).toString("hex");

// ---- Session store (in memory; Redis/DB in production) ----
// keyed by session id -> { userId, expiresAt }
const sessions = new Map();
const SESSION_TTL_MS = 30 * 60 * 1000; // 30 min

function createSession(userId) {
  const sid = randomId();
  sessions.set(sid, {
    userId,
    expiresAt: Date.now() + SESSION_TTL_MS,
    // track last activity to implement sliding expiration:
    lastActive: Date.now(),
  });
  return sid;
}

function getSession(sid) {
  const session = sessions.get(sid);
  if (!session) return null;
  if (session.expiresAt < Date.now()) {
    sessions.delete(sid); // expired -> gone, revoked for good
    return null;
  }
  return session;
}

function destroySession(sid) {
  sessions.delete(sid); // logout = instant revocation
}

// ---- Cookie handling (simplified, no browser here) ----
// Real Set-Cookie attributes: HttpOnly; Secure; SameSite=Lax; Path=/
const setCookie = (sid) => `sid=${sid}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${SESSION_TTL_MS / 1000}`;

// ---- Simulated requests ----
function request(sid) {
  const session = getSession(sid);
  if (!session) return "401 Unauthorized — no valid session";
  return `200 OK — welcome user #${session.userId}`;
}

// Login: password verified (07 covers hashing) -> session issued
const sid = createSession(1);
console.log("Set-Cookie:", setCookie(sid));

console.log(request(sid)); // 200 OK
console.log(request(sid)); // 200 OK

// Logout deletes the session server-side
destroySession(sid);
console.log(request(sid)); // 401 — revoked instantly, even though cookie still exists

// Expired sessions die on next access
const sid2 = createSession(2);
sessions.get(sid2).expiresAt = Date.now() - 1000; // simulate time passing
console.log(request(sid2)); // 401; entry removed from store

console.log("\nKey point: cookie is just an opaque reference ('siamese key') —");
console.log("all state lives server-side, so revocation is immediate.");