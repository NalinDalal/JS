/**
 * Module 10 — 10.8 OAuth 2.0 Authorization Code + PKCE
 * The browser-app flow in miniature: code_verifier -> code_challenge ->
 * authorize (user logs in at provider) -> callback with one-time code ->
 * token exchange proves possession of the verifier.
 *
 * Run: node 08-oauth-pkce.js
 */

const crypto = require("node:crypto");

// ---- PKCE setup (done by the client app BEFORE redirecting) ----
const codeVerifier = crypto.randomBytes(32).toString("base64url"); // 43+ chars, random
const codeChallenge = crypto
  .createHash("sha256") // PKCE is 'S256' (plain is discouraged)
  .update(codeVerifier)
  .digest("base64url");
console.log("code_verifier :", codeVerifier.slice(0, 24) + "...");
console.log("code_challenge:", codeChallenge.slice(0, 24) + "...");

// Note: the challenge travels to the provider in the authorize URL.
// The verifier NEVER leaves the client (that's the whole point of PKCE).

// ---- Provider side ----
// 1) User clicks "Sign in with Provider" -> /authorize
//    Provider shows login page, then redirects the BROWSER back with a one-time code.
const oneTimeCodes = new Set();
function authorizeEndpoint() {
  const code = crypto.randomBytes(16).toString("hex");
  oneTimeCodes.add(code);
  return { redirect: `https://app.example.com/callback?code=${code}`, challenge: codeChallenge };
}

// 2) Client's backend swaps the code for a token — MUST also send:
//    - code_verifier (proves this client started the flow)
//    - client_secret (if confidential client; omitted for public clients)
//    - redirect_uri (must match the one registered)
function tokenEndpoint(code, verifierGuess) {
  if (!oneTimeCodes.has(code)) return { error: "invalid_grant — code already redeemed or unknown" };
  // Challenge verification: sha256(verifier) must equal the stored challenge
  const guess = crypto.createHash("sha256").update(verifierGuess).digest("base64url");
  if (guess !== codeChallenge) return { error: "invalid_grant — PKCE verifier mismatch, code rejected" };
  oneTimeCodes.delete(code); // one-time: replay fails
  return { access_token: "opaque-or-jwt-access-token", token_type: "Bearer", expires_in: 3600 };
}

// ---- Simulate the flow ----
const { redirect } = authorizeEndpoint();
const code = new URL(redirect).searchParams.get("code");
console.log("\nauthorize redirect:", redirect);

const goodSwap = tokenEndpoint(code, codeVerifier);
console.log("\nlegit client swap  :", goodSwap.access_token ?? goodSwap.error);

const replay = tokenEndpoint(code, codeVerifier); // same code twice
console.log("replay same code   :", replay.error); // invalid_grant

// Attacker somehow stole the code — but has no verifier:
const { redirect: r2 } = authorizeEndpoint();
const code2 = new URL(r2).searchParams.get("code");
const evilSwap = tokenEndpoint(code2, "attacker-guessed-verifier");
console.log("attacker w/o verifier:", evilSwap.error);

// Why PKCE: the authorization code travels through the URL query string —
// it can be logged/skimmed. Without the verifier it is worthless.
// Implicit flow (token in URL) is deprecated; auth-code + PKCE is the standard.