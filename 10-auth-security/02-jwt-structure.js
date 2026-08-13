/**
 * Module 10 — 10.3 JWT Structure: header.payload.signature
 * Builds a real JWT from scratch with Node built-ins (no libraries).
 *
 * Run: node 02-jwt-structure.js
 */

const crypto = require("node:crypto");

// base64url: like base64 but - and _ instead of + and /, no padding =
const base64url = (data) =>
  Buffer.from(data).toString("base64url");

const encodeSegment = (obj) => base64url(JSON.stringify(obj));

// --- 1. HEADER: algorithm + token type ---
const header = { alg: "HS256", typ: "JWT" };
const encodedHeader = encodeSegment(header);

// --- 2. PAYLOAD: claims (all public-readable, never secrets!) ---
const now = Math.floor(Date.now() / 1000);
const payload = {
  sub: "1234567890", // subject = who the token is about (user id)
  name: "Alice", // custom claim
  iat: now, // issued at (seconds)
  nbf: now - 10, // not before (allows small clock skew)
  exp: now + 3600, // expires in 1 hour
  iss: "auth.example.com", // issuer
  aud: "api.example.com", // audience = who may accept this token
};
const encodedPayload = encodeSegment(payload);

// --- 3. SIGNATURE: HMAC-SHA256 over "header.payload" ---
const secret = "super-secret-key-keep-out";
const signingInput = `${encodedHeader}.${encodedPayload}`;
const signature = crypto
  .createHmac("sha256", secret)
  .update(signingInput)
  .digest("base64url");

// --- The JWT: three dot-separated segments ---
const jwt = `${signingInput}.${signature}`;
console.log("JWT:\n", jwt);
console.log("\nSegments:", jwt.split(".").length); // 3

console.log("\n--- Decoding WITHOUT verification (read-only!) ---");
const [h, p, s] = jwt.split(".");
console.log("header:", JSON.parse(Buffer.from(h, "base64url").toString()));
console.log("payload:", JSON.parse(Buffer.from(p, "base64url").toString()));

// Anyone can decode — the payload is NOT encrypted
console.log("\nKey fact: JWT is signed, not encrypted.");
console.log("Payload is base64url — decode it, read it, modify it (then the signature fails).");

console.log("\n--- Tamper test ---");
const tamperedPayload = encodeSegment({ ...payload, name: "Mallory" });
const tampered = `${encodedHeader}.${tamperedPayload}.${signature}`; // old signature!
const verify = (jwt, secret) => {
  const [hh, pp, ss] = jwt.split(".");
  const expected = crypto.createHmac("sha256", secret).update(`${hh}.${pp}`).digest("base64url");
  return expected === ss;
};
console.log("original valid:", verify(jwt, secret)); // true
console.log("tampered valid:", verify(tampered, secret)); // false — signature no longer matches
