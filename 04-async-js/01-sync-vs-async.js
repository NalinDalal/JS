/**
 * Module 04 — 4.1 Synchronous vs Asynchronous
 * Sync/async examples, blocking proof
 *
 * Run: node 01-sync-vs-async.js
 */

console.log("--- Synchronous code ---");
console.log("A");
console.log("B");
console.log("C");
// Output: A → B → C

console.log("\n--- Asynchronous code ---");
console.log("A");
setTimeout(() => console.log("B"), 0);
console.log("C");
// Output: A → C → B

console.log("\n--- Single-threaded proof ---");
console.log("start");
const start = Date.now();
while (Date.now() - start < 1500) {} // block for 1.5s
console.log("end");
// Both lines appear 1.5 seconds apart — JS cannot do anything else during that block

// --- Expected Output ---
// --- Synchronous code ---
// A
// B
// C
//
// --- Asynchronous code ---
// A
// C
// <setTimeout: B appears after sync code>
// B
//
// --- Single-threaded proof ---
// start
// <... 1.5 second freeze ...>
// end
