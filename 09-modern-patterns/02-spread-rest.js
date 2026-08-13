/**
 * Module 09 — 9.2 Spread & Rest
 * Spread: arrays, objects, iterables; Rest: parameters, destructuring
 *
 * Run: node 02-spread-rest.js
 */

console.log("--- Spread (...) for arrays ---");
const arr1 = [1, 2, 3];
const arr2 = [4, 5, 6];
const combined = [...arr1, ...arr2];
console.log("combined:", combined); // [1, 2, 3, 4, 5, 6]

const copy = [...arr1];
console.log("copy:", copy); // [1, 2, 3] — shallow
console.log("copy === arr1:", copy === arr1); // false

console.log("\n--- Spread for objects ---");
const defaults = { theme: "light", lang: "en" };
const overrides = { theme: "dark" };
const config = { ...defaults, ...overrides };
console.log("config:", config); // { theme: "dark", lang: "en" }

// Object spread: second argument wins on conflict
const obj = { a: 1, b: 2 };
const merged = { ...obj, ...{ b: 3, c: 4 } };
console.log("merged:", merged); // { a: 1, b: 3, c: 4 }

console.log("\n--- Spread iterables (strings) ---");
const chars = [..."hello"];
console.log("chars:", chars); // ["h", "e", "l", "l", "o"]

console.log("\n--- Spread into arguments ---");
function sum(a, b, c) { return a + b + c; }
const nums = [1, 2, 3];
console.log("sum(...nums):", sum(...nums)); // 6

console.log("\n--- Rest parameters ---");
function logAll(...args) {
  console.log("Args:", args); // Array of all arguments
}
logAll(1, 2, 3, 4); // [1, 2, 3, 4]

// Regular + rest
function multiply(factor, ...nums) {
  return nums.map(n => n * factor);
}
console.log("multiply(2, 1, 2, 3):", multiply(2, 1, 2, 3)); // [2, 4, 6]

console.log("\n--- Rest in destructuring ---");
const [first, ...rest] = [1, 2, 3, 4];
console.log(first, rest); // 1 [2, 3, 4]

const { name, ...otherProps } = { name: "Alice", age: 30, city: "NYC" };
console.log(name, otherProps); // Alice { age: 30, city: "NYC" }
