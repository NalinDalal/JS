/**
 * Module 09 — 9.10 delete keyword, NodeList vs HTMLCollection, self
 * delete operator, live vs static collections, window.self
 * Cross-reference: 13-interview-questions.js (text bank)
 *
 * Run: node 10-delete-nodelist-self.js
 */

// --- delete operator ---

// Objects: delete removes own property
const obj = { a: 1, b: 2, c: 3 };
console.log("before delete:", obj); // { a: 1, b: 2, c: 3 }
delete obj.b;
console.log("after delete b:", obj); // { a: 1, c: 3 }
console.log("obj.b:", obj.b); // undefined

// delete returns true on success
console.log("delete obj.a:", delete obj.a); // true
console.log("delete nonexistent:", delete obj.nonexistent); // true

// Arrays: delete leaves a hole (sparse array)
const arr = [1, 2, 3];
delete arr[1];
console.log("arr after delete arr[1]:", arr); // [1, empty, 3]
console.log("arr.length:", arr.length); // 3 (length unchanged!)
console.log("1 in arr:", 1 in arr); // false (index 1 deleted)

// Better to use .splice() for arrays
// --- Array.splice vs delete ---
const arr2 = [1, 2, 3];
arr2.splice(1, 1);
console.log("arr2 after splice:", arr2); // [1, 3]
console.log("arr2.length:", arr2.length); // 2

// Cannot delete var/let/const or function-scoped variables
var x = 10;
delete x; // false (in strict mode throws)
console.log("var x still exists:", x); // 10

// --- NodeList vs HTMLCollection ---
console.log("NodeList (querySelectorAll):");
// - Static snapshot (live only for childNodes)
// - Has forEach, entries, keys, values
// - NodeList has item() method

console.log("HTMLCollection (getElementsBy*):");
// - LIVE — updates automatically when DOM changes
// - Does NOT have forEach (must convert to Array first)
// - Has namedItem() and item() methods

// Conversion (browser only — there is no `document` in Node)
if (typeof document !== "undefined") {
  const nodeList = document.querySelectorAll("div"); // static snapshot
  // Array.from(nodeList) or [...nodeList]
}

// --- self (window.self) ---
console.log("window.self === window:", true); // always true
// self refers to the current window/global scope
// In Workers: self is the global scope (no window)

// Common pattern (browser or worker — self doesn't exist in Node, use globalThis)
const global = typeof window !== "undefined" ? window : (typeof self !== "undefined" ? self : globalThis);
// global pointer works in window, worker, and node contexts
