/**
 * Module 04 — 4.2 Event Loop
 * Microtask vs macrotask ordering, nested microtasks
 *
 * Run: node 02-event-loop.js
 */

console.log("--- Basic event loop ordering ---");
setTimeout(() => console.log("1: setTimeout"), 0);
Promise.resolve().then(() => console.log("2: Promise"));
queueMicrotask(() => console.log("3: queueMicrotask"));
console.log("4: sync");
// Output: 4 → 2 → 3 → 1
// sync runs first, then ALL microtasks (Promise, queueMicrotask), then macrotask (setTimeout)

console.log("\n--- Nested microtasks drain completely ---");
Promise.resolve().then(() => {
  console.log("micro 1");
  Promise.resolve().then(() => console.log("micro 2"));
});
console.log("sync");
// Output: sync → micro 1 → micro 2
// Microtask queue is drained completely before macrotasks

console.log("\n--- Macrotask interleaving ---");
setTimeout(() => console.log("timeout 1"), 0);
setTimeout(() => console.log("timeout 2"), 0);
Promise.resolve().then(() => console.log("promise 1"));
Promise.resolve().then(() => console.log("promise 2"));
// Output: promise 1 → promise 2 → timeout 1 → timeout 2
// All microtasks first, then macrotasks one at a time

// --- Expected Output ---
// --- Basic event loop ordering ---
// 4: sync
// 2: Promise
// 3: queueMicrotask
// 1: setTimeout
//
// --- Nested microtasks drain completely ---
// sync
// micro 1
// micro 2
//
// --- Macrotask interleaving ---
// promise 1
// promise 2
// timeout 1
// timeout 2
