/**
 * Module 02 — 2.1 Lexical Scope + 2.2 Hoisting
 * Scope chain, hoisting, TDZ, block scope, shadowing
 *
 * Run: node 01-scope-and-hoisting.js
 */

// ============================================================
// 2.1 LEXICAL SCOPE
// ============================================================

console.log("--- Nested functions form a scope chain ---");
let global = "I'm global";

function outer() {
  let outerVar = "I'm outer";

  function inner() {
    let innerVar = "I'm inner";
    console.log(global); // found in global scope
    console.log(outerVar); // found in outer's scope (scope chain)
    console.log(innerVar); // found in inner's scope
  }

  inner();
  // console.log(innerVar); // ReferenceError — not in scope
}

outer();

console.log("\n--- Var shadowing in nested functions ---");
var x = 10;

function foo() {
  var x = 20;
  function bar() {
    console.log(x); // 20 — resolves to foo's x, not global
  }
  bar();
}

foo();

console.log("\n--- Block scope proof ---");
let a = 1;
if (true) {
  let a = 2; // separate block-scoped variable
  console.log(a); // 2
}
console.log(a); // 1 — block-scoped let doesn't leak out

// ============================================================
// 2.2 HOISTING
// ============================================================

console.log("\n--- var hoisting ---");
console.log(b); // undefined (declared, not yet assigned)
var b = 5;

console.log("\n--- function hoisting ---");
sayHi(); // "Hi!" — works before declaration
function sayHi() {
  console.log("Hi!");
}

console.log("\n--- let/const TDZ ---");
try {
  console.log(c); // ReferenceError
} catch (e) {
  console.log("TDZ caught:", e.message);
}
let c = 10;

console.log("\n--- class TDZ ---");
try {
  const obj = new MyClass(); // ReferenceError
} catch (e) {
  console.log("Class TDZ:", e.message);
}
class MyClass {}

// --- Expected Output ---
// --- Nested functions form a scope chain ---
// I'm global
// I'm outer
// I'm inner
//
// --- Var shadowing in nested functions ---
// 20
//
// --- Block scope proof ---
// 2
// 1
//
// --- var hoisting ---
// undefined
//
// --- function hoisting ---
// Hi!
//
// --- let/const TDZ ---
// TDZ caught: Cannot access 'c' before initialization
//
// --- Class TDZ ---
// Class TDZ: Cannot access 'MyClass' before initialization
