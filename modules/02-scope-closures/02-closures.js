/**
 * Module 02 — 2.3 Closures
 * makeCounter, loop patterns, memory retention
 *
 * Run: node 02-closures.js
 */

// --- Basic closure: makeCounter ---
console.log("--- makeCounter ---");
function makeCounter() {
  let count = 0; // private variable
  return {
    increment: () => ++count,
    decrement: () => --count,
    getCount: () => count,
  };
}

const counter = makeCounter();
counter.increment();
counter.increment();
console.log(counter.getCount()); // 2
console.log(counter.decrement()); // 1
// count is not accessible directly — it's private via closure

// --- Closure in a loop: var pitfall ---
console.log("\n--- var in loop (no block scope) ---");
for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log("var:", i), 100);
}
// Output: var: 3, var: 3, var: 3 — all closures share the same `i`

// --- Closure in a loop: let fix ---
console.log("\n--- let in loop (block scope) ---");
for (let j = 0; j < 3; j++) {
  setTimeout(() => console.log("let:", j), 100);
}
// Output: let: 0, let: 1, let: 2 — each iteration gets its own `j`

// --- Closure retains reference, not value ---
console.log("\n--- Closure captures variable, not copy ---");
function outer() {
  let x = 10;
  return function inner() {
    console.log(x); // references outer's x, live value
  };
}

let fn = outer();
let x = 999; // global x — doesn't affect closure
fn(); // 10 — closure captures the variable, not a copy

// --- Memory: closure keeps outer scope alive ---
console.log("\n--- Memory retention ---");
function createHeavy() {
  const largeArray = new Array(1000).fill("data");
  return function () {
    return largeArray.length; // largeArray stays in memory
  };
}
const getter = createHeavy();
console.log(getter()); // 1000

// --- Expected Output ---
// --- makeCounter ---
// 2
// 1
//
// --- var in loop (no block scope) ---
// --- let in loop (block scope) ---
// --- Closure captures variable, not copy ---
// 10
//
// --- Memory retention ---
// 1000
//
// (setTimeout outputs appear after ~100ms)
// var: 3
// var: 3
// var: 3
// let: 0
// let: 1
// let: 2
