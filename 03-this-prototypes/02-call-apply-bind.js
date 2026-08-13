/**
 * Module 03 — 3.2 call, apply, bind
 * Basic usage, borrowing, partial application
 *
 * Run: node 02-call-apply-bind.js
 */

// --- Basic call/apply/bind ---
console.log("--- Basic call/apply/bind ---");

function multiply(a, b) {
  return a * b;
}

// call — pass args individually
console.log(multiply.call(null, 3, 4)); // 12

// apply — pass args as array
console.log(multiply.apply(null, [3, 4])); // 12

// bind — returns new function, args partially applied
const double = multiply.bind(null, 2);
console.log(double(5)); // 10

// --- Borrowing array methods ---
console.log("\n--- Borrowing array methods ---");
const arrayLike = { 0: "a", 1: "b", length: 2 };
const arr = Array.prototype.slice.call(arrayLike);
console.log(arr); // ["a", "b"]

// Modern alternative
const arr2 = Array.from(arrayLike);
console.log(arr2); // ["a", "b"]

// --- Partial application with bind ---
console.log("\n--- Partial application ---");
function log(level, msg) {
  console.log(`[${level}] ${msg}`);
}
const errorLog = log.bind(null, "ERROR");
errorLog("Something broke"); // [ERROR] Something broke

// --- Constructor borrowing (old pattern) ---
console.log("\n--- Constructor borrowing ---");
function Dog(name) {
  this.name = name;
}
function Puppy(name) {
  Dog.call(this, name); // borrow Dog constructor
  this.isPuppy = true;
}

const puppy = new Puppy("Rex");
console.log(puppy.name); // "Rex"
console.log(puppy.isPuppy); // true

// --- Expected Output ---
// --- Basic call/apply/bind ---
// 12
// 12
// 10
//
// --- Borrowing array methods ---
// [ 'a', 'b' ]
// [ 'a', 'b' ]
//
// --- Partial application ---
// [ERROR] Something broke
//
// --- Constructor borrowing ---
// Rex
// true
