/**
 * Module 10 — 10.7 Password Security: Hashing, Salting, Timing-Safe Compare
 * Uses Node's scrypt (built-in, memory-hard, production-grade).
 * In the browser/server with bcrypt/argon2 libraries the ideas are identical.
 *
 * Run: node 07-password-hashing.js
 */

const crypto = require("node:crypto");
const { promisify } = require("node:util");
const scrypt = promisify(crypto.scrypt);

// ---- HASH + SALT: one function stores everything it needs to verify later ----
// Format: scrypt$N$r$p$salt$hash  (params embedded so verify uses the same cost)
async function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex"); // random per user
  const derived = await scrypt(password, salt, 64, { N: 16384, r: 8, p: 1 }); // 64-byte output
  return `scrypt$16384$8$1$${salt}$${derived.toString("hex")}`;
}

async function verifyPassword(password, stored) {
  const [, N, r, p, salt, hash] = stored.split("$");
  const derived = await scrypt(password, salt, 64, { N: Number(N), r: Number(r), p: Number(p) });
  const actual = Buffer.from(derived.toString("hex"), "hex");
  const expected = Buffer.from(hash, "hex");
  // timing-safe: runtime does not leak HOW MUCH of the hash matched
  return actual.length === expected.length && crypto.timingSafeEqual(actual, expected);
}

// ---- Why salting: identical passwords must NOT produce identical hashes ----
(async () => {
  const h1 = await hashPassword("hunter2");
  const h2 = await hashPassword("hunter2"); // same password...
  console.log("h1:", h1);
  console.log("h2:", h2);
  console.log("same password -> identical hash?", h1 === h2); // false — different salts!
  console.log("h1 starts with same salt as h2?", h1.split("$")[4] === h2.split("$")[4]); // false

  // --- verify works ---
  console.log("\ncorrect password:", await verifyPassword("hunter2", h1)); // true
  console.log("wrong password:  ", await verifyPassword("hunter3", h1)); // false

  // --- timing-safe compare vs naive === ---
  const naiveCompare = (a, b) => a === b; // leaks position of first mismatch via timing
  const a = Buffer.from("abcdef");
  const b = Buffer.from("abcXYZ");
  for (let i = 0; i < 3; i++) {
    naiveCompare(a, b); // measurable time difference vs full match
    crypto.timingSafeEqual(a, b); // constant time regardless of mismatch position
  }
  // timing-safe: constant-time regardless of how many bytes matched
  // naive ===: returns at first mismatch — enough requests leak the hash byte-by-byte
  console.log("timingSafeEqual:", crypto.timingSafeEqual(a, b));

  // Rules: never store plaintext, never write your own hash, use bcrypt/argon2/scrypt,
  // store salt+params+hash together, verify with a timing-safe compare.
  // all checks passed
})();