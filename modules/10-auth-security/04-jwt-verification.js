/**
 * Module 10 — 10.5 JWT Verification & Claims Validation
 * The 3-step gauntlet: signature -> algorithm -> claims.
 *
 * Run: node 04-jwt-verification.js
 */

const crypto = require("node:crypto");

const b64url = (buf) => buf.toString("base64url");
const encodeSegment = (obj) => b64url(Buffer.from(JSON.stringify(obj)));

// ---- Token factory (what the auth server does) ----
const secret = "verification-secret";
const issueToken = (claims, alg = "HS256") => {
  const header = { alg, typ: "JWT" };
  const signingInput = `${encodeSegment(header)}.${encodeSegment(claims)}`;
  const sig = crypto.createHmac("sha256", secret).update(signingInput).digest("base64url");
  return `${signingInput}.${sig}`;
};

// ---- Verifier (what every protected route does) ----
const ALGORITHM_WHITELIST = new Set(["HS256"]); // 2) pin expected algorithms

function verifyJwt(jwt, { issuer, audience, now = Math.floor(Date.now() / 1000) } = {}) {
  const parts = jwt.split(".");
  if (parts.length !== 3) throw new Error("Malformed token");

  const [h, p, s] = parts;
  const header = JSON.parse(Buffer.from(h, "base64url").toString());
  const payload = JSON.parse(Buffer.from(p, "base64url").toString());

  // STEP 1: signature check — was it tampered with?
  const expected = crypto.createHmac("sha256", secret).update(`${h}.${p}`).digest("base64url");
  // timing-safe comparison — leaks nothing about partial matches
  const sigBufA = Buffer.from(expected);
  const sigBufB = Buffer.from(s);
  if (sigBufA.length !== sigBufB.length || !crypto.timingSafeEqual(sigBufA, sigBufB)) {
    throw new Error("Invalid signature — token was tampered with");
  }

  // STEP 2: algorithm check — never trust the header blindly (alg=none attack)
  if (!ALGORITHM_WHITELIST.has(header.alg)) {
    throw new Error(`Unexpected algorithm: ${header.alg}`);
  }

  // STEP 3: claims validation
  if (payload.exp && payload.exp <= now) throw new Error("Token expired");
  if (payload.nbf && payload.nbf > now) throw new Error("Token not active yet");
  if (issuer && payload.iss !== issuer) throw new Error("Wrong issuer");
  if (audience && payload.aud !== audience) throw new Error("Wrong audience");
  if (!payload.sub) throw new Error("Missing subject");

  return payload; // verified and valid
}

// ---- Usage ----
const now = Math.floor(Date.now() / 1000);
const goodToken = issueToken({
  sub: "42",
  iat: now,
  exp: now + 3600,
  iss: "auth.example.com",
  aud: "api.example.com",
});

const expiredToken = issueToken({ sub: "42", iat: now - 7200, exp: now - 3600, iss: "auth.example.com", aud: "api.example.com" });
const wrongAudience = issueToken({ sub: "42", iat: now, exp: now + 3600, iss: "auth.example.com", aud: "other-api" });
const forgedAlgNone = `${encodeSegment({ alg: "none", typ: "JWT" })}.${encodeSegment({ sub: "hacker", exp: now + 3600 })}.`; // signed with nothing

const opts = { issuer: "auth.example.com", audience: "api.example.com" };

try { console.log("good token:", verifyJwt(goodToken, opts).sub); } catch (e) { console.log("good token FAILED:", e.message); }
try { verifyJwt(expiredToken, opts); console.log("expired: ACCEPTED (bug!)"); } catch (e) { console.log("expired:", e.message); }
try { verifyJwt(wrongAudience, opts); console.log("wrong audience: ACCEPTED (bug!)"); } catch (e) { console.log("wrong audience:", e.message); }
try { verifyJwt(forgedAlgNone, opts); console.log("alg=none: ACCEPTED (bug!)"); } catch (e) { console.log("alg=none:", e.message); }

console.log("\nSummary: signature -> pinned algorithm -> exp/nbf/iss/aud/sub");
