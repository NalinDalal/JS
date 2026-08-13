/**
 * Module 10 — 10.1 Authentication vs Authorization
 * + 10.2 Session-based vs Token-based comparison
 *
 * Run: node 01-auth-concepts.js
 */

console.log("--- Authentication vs Authorization ---");

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

console.log("\n--- Session-based vs Token-based (comparison) ---");

const compare = {
  "Where state lives": "server (memory/Redis/DB)",
  "What client sends": "opaque session id in cookie",
  "Server work per request": "lookup session in store (I/O)",
  "Revocation": "instant — delete the session",
  "Scaling": "needs shared store across servers",
  "CSRF risk": "cookies auto-attach — needs SameSite/CSRF tokens",
  "Stateless": "no",
  "JWT": "stateless",
  "Client sends": "Bearer token (self-contained)",
  "Server work per request": "verify signature only (CPU)",
  "Revocation": "hard before exp — needs deny-list/rotation",
  "Scaling": "no shared storage needed",
  "CSRF risk": "low with Authorization header",
  "Stateless": "yes",
};

for (const [k, v] of Object.entries(compare)) console.log(`${k}: ${v}`);

console.log("\nRule of thumb: sessions = revocable web app; JWT = stateless/API/microservices");
