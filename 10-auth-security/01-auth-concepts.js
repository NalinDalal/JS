/**
 * Module 10 — 10.1 Authentication vs Authorization
 * + 10.2 Session-based vs Token-based comparison
 *
 * Run: node 01-auth-concepts.js
 */

// --- Authentication vs Authorization ---

// Authentication: verifying WHO you are
function authenticate(credentials) {
  const { username, password } = credentials;
  // In reality: check against hashed password (see 07-password-hashing.js)
  if (username === "alice" && password === "correct-horse") {
    return { userId: 1, username: "alice" }; // verified identity
  }
  return null; // identity not verified -> reject
}

// Authorization: checking WHAT the verified identity may do
const roles = { 1: ["read:posts", "write:posts"], 2: ["read:posts"] };

function authorize(user, permission) {
  if (!user) return false;
  return roles[user.userId]?.includes(permission) ?? false;
}

const alice = authenticate({ username: "alice", password: "correct-horse" });
console.log("alice authenticated:", alice !== null); // true
console.log("alice can write:", authorize(alice, "write:posts")); // true
console.log("alice can delete:", authorize(alice, "delete:posts")); // false

const mallory = authenticate({ username: "alice", password: "wrong-pass" });
console.log("mallory authenticated:", mallory !== null); // false

// Order matters: authenticate FIRST, then authorize on every request
function handleRequest(user, permission) {
  if (!user) return "401 Unauthorized"; // not authenticated
  if (!authorize(user, permission)) return "403 Forbidden"; // authenticated but not allowed
  return "200 OK";
}

console.log(handleRequest(mallory, "read:posts")); // 401
console.log(handleRequest(alice, "delete:posts")); // 403
console.log(handleRequest(alice, "read:posts")); // 200

// --- Session-based vs Token-based (comparison) ---

// Comparison table (see auth-security.md 10.2 for full prose):
//   Where state lives:      server (memory/Redis/DB)  | JWT: stateless
//   What client sends:      opaque session id in cookie | Bearer token (self-contained)
//   Server work per request: lookup session in store (I/O) | verify signature only (CPU)
//   Revocation:              instant — delete the session | hard before exp — needs deny-list/rotation
//   Scaling:                 needs shared store across servers | no shared storage needed
//   CSRF risk:               cookies auto-attach — needs SameSite/CSRF tokens | low with Authorization header
//   Stateless:               no | yes

// Rule of thumb: sessions = revocable web app; JWT = stateless/API/microservices
