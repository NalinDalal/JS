/**
 * Module 08 — 8.2 try/catch/finally
 * Syntax, optional catch binding, finally, nested, propagation
 *
 * Run: node 02-try-catch.js
 */

// --- Basic try/catch ---
try {
  null.foo; // TypeError
} catch (e) {
  console.log("name:", e.name);     // "TypeError"
  console.log("message:", e.message);
}

// --- Optional catch binding (ES2019) ---
try {
  JSON.parse("invalid json");
} catch {
  // Caught without naming the error
}

// --- Finally ALWAYS runs ---
function testFinally() {
  try {
    return "from try";
  } finally {
    // finally runs before return!
  }
}
console.log("result:", testFinally()); // logs "finally runs..." then "from try"

// --- Finally overrides return if it also returns ---
function confusing() {
  try {
    return "try";
  } finally {
    return "finally wins"; // overrides try's return
  }
}
console.log("result:", confusing()); // "finally wins"

// --- Nested try/catch ---
try {
  try {
    JSON.parse("{invalid}");
  } catch (inner) {
    console.log("Inner catch:", inner.message);
    throw new Error("re-wrapped"); // re-throw to outer
  }
} catch (outer) {
  console.log("Outer catch:", outer.message); // "re-wrapped"
}

// --- Error propagation (re-throwing) ---
function fetchData(url) {
  try {
    const data = JSON.parse(url);
    return data;
  } catch (e) {
    console.log("Logging:", e.message);
    throw e; // re-throw
  }
}

try {
  fetchData("not json");
} catch (e) {
  console.log("Caller handles:", e.message);
}
