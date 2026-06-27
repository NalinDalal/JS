/**
 * Module 09 — 9.4 Nullish Coalescing (??)
 * Unlike ||, ?? only checks for null/undefined, not falsy values
 *
 * Run: node 04-nullish-coalescing.js
 */

console.log("--- || vs ?? ---");
const score = 0;
const name = "";
const isActive = false;

console.log("score || 100:", score || 100);     // 100 (0 is falsy)
console.log("score ?? 100:", score ?? 100);     // 0 (0 is not nullish)

console.log('name || "default":', name || "default");     // "default"
console.log('name ?? "default":', name ?? "default");     // "" (empty string is not nullish)

console.log('isActive || true:', isActive || true);       // true
console.log('isActive ?? true:', isActive ?? true);       // false

console.log("\n--- null and undefined trigger ?? ---");
let a = null;
let b = undefined;
console.log("null ?? 'fallback':", a ?? "fallback");       // "fallback"
console.log("undefined ?? 'fallback':", b ?? "fallback");  // "fallback"

console.log("\n--- Chaining with ?. ---");
const user = { profile: { nickname: "" } };
// Correct way to get display name
const displayName = user?.profile?.nickname ?? "Anonymous";
console.log("displayName:", displayName); // "" (empty string kept)
// Wrong way with ||:
const displayName2 = user?.profile?.nickname || "Anonymous";
console.log("displayName2:", displayName2); // "Anonymous" (wrong — lost empty string)

console.log("\n--- Precendence: ?? is lower than || and && ---");
// Must use parentheses when mixing with || or &&
// const x = a ?? b || c; // SyntaxError
const x = (a ?? b) || c; // OK
console.log("x:", x);
