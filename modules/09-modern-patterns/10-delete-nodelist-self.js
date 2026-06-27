/**
 * Module 09 — 9.10 delete keyword, NodeList vs HTMLCollection, self
 * delete operator, live vs static collections, window.self
 *
 * Run: node 10-delete-nodelist-self.js
 */

console.log("--- delete operator ---");

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
console.log("\n--- Array.splice vs delete ---");
const arr2 = [1, 2, 3];
arr2.splice(1, 1);
console.log("arr2 after splice:", arr2); // [1, 3]
console.log("arr2.length:", arr2.length); // 2

// Cannot delete var/let/const or function-scoped variables
var x = 10;
delete x; // false (in strict mode throws)
console.log("var x still exists:", x); // 10

console.log("\n--- NodeList vs HTMLCollection ---");
console.log("NodeList (querySelectorAll):");
console.log("  - Static snapshot (live only for childNodes)");
console.log("  - Has forEach, entries, keys, values");
console.log("  - NodeList has item() method");

console.log("HTMLCollection (getElementsBy*):");
console.log("  - LIVE — updates automatically when DOM changes");
console.log("  - Does NOT have forEach (must convert to Array first)");
console.log("  - Has namedItem() and item() methods");

// Conversion
const nodeList = document?.querySelectorAll("div");
// Array.from(nodeList) or [...nodeList]

console.log("\n--- self (window.self) ---");
console.log("window.self === window:", true); // always true
console.log("self refers to the current window/global scope");
console.log("In Workers: self is the global scope (no window)");

// Common pattern
const global = typeof window !== "undefined" ? window : self;
console.log("global pointer works in both window and worker contexts");
