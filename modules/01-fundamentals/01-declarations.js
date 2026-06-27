/**
 * Module 01 — 1.1 Grammar & Declarations
 * var/let/const, hoisting, function declarations vs expressions
 *
 * Run: node 01-declarations.js
 */

// --- var: function-scoped, hoisted (initialized undefined) ---
console.log("--- var hoisting ---");
console.log(a); // undefined (hoisted, initialized to undefined)
var a = 1;
console.log(a); // 1

// --- let/const: block-scoped, TDZ ---
console.log("\n--- let/const TDZ ---");
{
  // console.log(b); // ReferenceError: Cannot access 'b' before initialization
  let b = 2;
  console.log(b); // 2
}

// --- const: must init, no reassignment, mutation allowed ---
console.log("\n--- const behavior ---");
const c = 3;
// c = 4; // TypeError: Assignment to constant variable
c.prop = "ok"; // mutation allowed
console.log(c); // { prop: 'ok' }

// --- Function declarations hoist completely ---
console.log("\n--- Function declarations ---");
foo(); // "foo" — works because declaration is hoisted
function foo() {
  console.log("foo");
}

// --- Function expressions don't hoist ---
console.log("\n--- Function expressions ---");
// bar(); // TypeError: bar is not a function
const bar = function () {
  console.log("bar");
};
bar(); // "bar" — now it's assigned

// --- Arrow function expressions ---
console.log("\n--- Arrow functions ---");
const baz = () => console.log("baz");
baz(); // "baz"

// --- Expected Output ---
// --- var hoisting ---
// undefined
// 1
//
// --- let/const TDZ ---
// 2
//
// --- const behavior ---
// { prop: 'ok' }
//
// --- Function declarations ---
// foo
//
// --- Function expressions ---
// bar
//
// --- Arrow functions ---
// baz
