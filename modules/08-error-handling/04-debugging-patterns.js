/**
 * Module 08 — 8.5 Debugging + 8.6 Error Patterns
 * Console methods, guard clauses, result pattern, global handlers
 *
 * Run: node 04-debugging-patterns.js
 */

// ============================================================
// 8.5 DEBUGGING
// ============================================================

console.log("--- Console methods ---");
console.log("basic log");
console.warn("warning — yellow triangle");
console.error("error — red text");

console.table([
  { name: "Alice", age: 30 },
  { name: "Bob", age: 25 }
]);

console.time("loop");
for (let i = 0; i < 1000000; i++) {}
console.timeEnd("loop");

console.group("User");
console.log("Name: Alice");
console.log("Age: 30");
console.groupEnd();

console.trace("Where am I?");

// --- Reading stack traces ---
console.log("\n--- Stack traces ---");
function a() { b(); }
function b() { c(); }
function c() { throw new Error("trace demo"); }

try {
  a();
} catch (e) {
  console.log(e.stack);
}

// ============================================================
// 8.6 ERROR HANDLING PATTERNS
// ============================================================

console.log("\n--- Guard clauses ---");
function processUser(user) {
  if (!user) return null;
  if (typeof user.name !== "string") return null;
  if (user.age < 0) return null;
  return { name: user.name.toUpperCase(), age: user.age };
}

console.log(processUser({ name: "Alice", age: 30 })); // { name: "ALICE", age: 30 }
console.log(processUser(null)); // null

// --- Result pattern ---
console.log("\n--- Result pattern ---");
function divide(a, b) {
  if (b === 0) return { data: null, error: "Division by zero" };
  return { data: a / b, error: null };
}

const result = divide(10, 0);
if (result.error) {
  console.log("Handle error:", result.error);
} else {
  console.log("Result:", result.data);
}

// --- Async error handling ---
console.log("\n--- async error handling ---");
async function getUser(id) {
  try {
    const response = await fetch(`https://api.example.com/users/${id}`);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (e) {
    console.error("getUser failed:", e.message);
    throw e;
  }
}
console.log("(async function defined — call with getUser(1) to test)");
