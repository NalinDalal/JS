/**
 * Module 08 — 8.1 Error Types
 * TypeError, ReferenceError, RangeError, URIError
 *
 * Run: node 01-error-types.js
 */

console.log("--- TypeError ---");
try {
  const fn = "hello";
  fn(); // calling a string as a function
} catch (e) {
  console.log("instanceof TypeError:", e instanceof TypeError); // true
  console.log("message:", e.message);
}

console.log("\n--- ReferenceError ---");
try {
  console.log(x); // x is not declared
} catch (e) {
  console.log("instanceof ReferenceError:", e instanceof ReferenceError); // true
}

console.log("\n--- RangeError ---");
try {
  const arr = new Array(-5);
} catch (e) {
  console.log("instanceof RangeError:", e instanceof RangeError); // true
  console.log("message:", e.message);
}

console.log("\n--- URIError ---");
try {
  decodeURIComponent("%");
} catch (e) {
  console.log("instanceof URIError:", e instanceof URIError); // true
}

console.log("\n--- All errors instanceof Error ---");
console.log(new TypeError() instanceof Error); // true
console.log(new ReferenceError() instanceof Error); // true
console.log(new RangeError() instanceof Error); // true

// Key: SyntaxError is caught at parse time, not runtime
// eval('var x = ;'); // SyntaxError — parse-time error
console.log("\n(SyntaxError is a parse-time error, not catchable at runtime)");
