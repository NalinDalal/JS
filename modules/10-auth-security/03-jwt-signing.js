/**
 * Module 10 — 10.4 Signing Algorithms: HS256 vs RS256
 * HS256 = symmetric (one shared secret). RS256 = asymmetric (private signs, public verifies).
 *
 * Run: node 03-jwt-signing.js
 */

const crypto = require("node:crypto");

const b64url = (buf) => buf.toString("base64url");
const encodeSegment = (obj) => b64url(Buffer.from(JSON.stringify(obj)));
const signInput = (header, payload) => `${encodeSegment(header)}.${encodeSegment(payload)}`;

// ---- HS256: HMAC-SHA256 with a shared secret ----
const hsSecret = "shared-secret-known-only-by-us";
const hsHeader = { alg: "HS256", typ: "JWT" };
const hsPayload = { sub: "1", exp: Math.floor(Date.now() / 1000) + 3600 };
const hsSigningInput = signInput(hsHeader, hsPayload);
const hsSignature = crypto.createHmac("sha256", hsSecret).update(hsSigningInput).digest("base64url");
const hsJwt = `${hsSigningInput}.${hsSignature}`;
console.log("HS256 JWT:\n", hsJwt);
console.log("HS256: anyone with the secret can FORGE tokens (symmetric)");

// ---- RS256: RSA — private key signs, public key verifies ----
const { privateKey, publicKey } = crypto.generateKeyPairSync("rsa", {
  modulusLength: 2048,
});

const rsHeader = { alg: "RS256", typ: "JWT" };
const rsPayload = { sub: "2", exp: Math.floor(Date.now() / 1000) + 3600 };
const rsSigningInput = signInput(rsHeader, rsPayload);

// Sign with PRIVATE key
const rsSignature = crypto.sign("sha256", Buffer.from(rsSigningInput), privateKey).toString("base64url");
const rsJwt = `${rsSigningInput}.${rsSignature}`;
console.log("\nRS256 JWT:\n", rsJwt);

// Verify with PUBLIC key
const [h, p, s] = rsJwt.split(".");
const valid = crypto.verify(
  "sha256",
  Buffer.from(`${h}.${p}`),
  publicKey,
  Buffer.from(s, "base64url")
);
console.log("RS256 verified with public key:", valid); // true

// A verifier holding ONLY the public key cannot forge tokens
// (forging requires the private key, which never leaves the auth server)
console.log("RS256: only the private key can sign — public key can only verify");

console.log("\n--- Comparison ---");
console.log("HS256:  symmetric, 1 secret, fast, forgery risk if secret leaks, single service");
console.log("RS256:  asymmetric, key pair, verifiers only need public key, microservices-safe");
console.log("alg=none attack: never trust the header's alg — always pin the expected algorithm");
