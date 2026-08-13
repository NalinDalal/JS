/**
 * Module 01 — 1.7 Operators + 1.8 Control Flow
 * Short-circuit, optional chaining, switch, try/catch, ternary
 *
 * Run: node 05-operators-control-flow.js
 */

// ============================================================
// 1.7 OPERATORS
// ============================================================

console.log("--- Short-circuit (returns operand, not boolean) ---");
const a = 0 || "default"; // "default" (0 is falsy)
const b = 1 && "value"; // "value" (1 is truthy)
const c = null ?? "fallback"; // "fallback" (only null/undefined)
console.log(a); // "default"
console.log(b); // "value"
console.log(c); // "fallback"

console.log("\n--- Nullish coalescing vs OR ---");
const d = "" || "fallback"; // "fallback" (empty string is falsy)
const e = "" ?? "fallback"; // "" (empty string is NOT nullish)
console.log(d); // "fallback"
console.log(e); // ""

const f = 0 || "fallback"; // "fallback" (0 is falsy)
const g = 0 ?? "fallback"; // 0 (0 is NOT nullish)
console.log(f); // "fallback"
console.log(g); // 0

console.log("\n--- Optional chaining ---");
const user = { profile: { name: "A" } };
console.log(user.profile?.name); // "A"
console.log(user.settings?.theme); // undefined (no error!)
console.log(user.address?.city?.zip); // undefined (safe nested access)

console.log("\n--- Destructuring with defaults ---");
const { x = 10, y = 20 } = { x: 5 };
console.log(x, y); // 5, 20

console.log("\n--- Ternary operator ---");
const age = 20;
const status = age >= 18 ? "adult" : "minor";
console.log(status); // "adult"

// ============================================================
// 1.8 CONTROL FLOW
// ============================================================

console.log("\n--- switch ---");
const val = "b";
switch (val) {
  case "a":
    console.log("A");
    break;
  case "b":
    console.log("B");
    break;
  default:
    console.log("Other");
}

console.log("\n--- switch fall-through (no break) ---");
const day = "Tue";
switch (day) {
  case "Mon":
  case "Tue":
  case "Wed":
  case "Thu":
  case "Fri":
    console.log("Weekday");
    break;
  case "Sat":
  case "Sun":
    console.log("Weekend");
    break;
}

console.log("\n--- try/catch/finally ---");
try {
  throw new TypeError("bad type");
} catch (err) {
  console.log(err.name); // "TypeError"
  console.log(err.message); // "bad type"
} finally {
  console.log("cleanup"); // always runs
}

console.log("\n--- Custom error ---");
class ValidationError extends Error {
  constructor(field) {
    super(`Invalid ${field}`);
    this.name = "ValidationError";
    this.field = field;
  }
}

try {
  throw new ValidationError("email");
} catch (err) {
  console.log(err.name); // "ValidationError"
  console.log(err.message); // "Invalid email"
  console.log(err.field); // "email"
  console.log(err instanceof ValidationError); // true
  console.log(err instanceof Error); // true
}

// --- Expected Output ---
// --- Short-circuit (returns operand, not boolean) ---
// default
// value
// fallback
//
// --- Nullish coalescing vs OR ---
// fallback
//
// fallback
// 0
//
// --- Optional chaining ---
// A
// undefined
// undefined
//
// --- Destructuring with defaults ---
// 5 20
//
// --- Ternary operator ---
// adult
//
// --- switch ---
// B
//
// --- switch fall-through (no break) ---
// Weekday
//
// --- try/catch/finally ---
// TypeError
// bad type
// cleanup
//
// --- Custom error ---
// ValidationError
// Invalid email
// email
// true
// true
