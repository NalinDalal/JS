/**
 * Module 01 — 1.2 Types + 1.3 Coercion + 1.4 Special Values
 * 8 types, typeof, implicit/explicit coercion, == vs ===, NaN, Infinity
 *
 * Run: node 02-types-and-coercion.js
 */

// ============================================================
// 1.2 TYPES
// ============================================================

console.log("--- typeof for all types ---");
console.log(typeof undefined); // "undefined"
console.log(typeof null); // "object" (legacy bug from JS 1.0)
console.log(typeof true); // "boolean"
console.log(typeof 42); // "number"
console.log(typeof 42n); // "bigint"
console.log(typeof "hello"); // "string"
console.log(typeof Symbol()); // "symbol"

console.log("\n--- typeof for objects ---");
console.log(typeof {}); // "object"
console.log(typeof []); // "object" (use Array.isArray instead)
console.log(typeof function () {}); // "function" (special case)

console.log("\n--- Auto-wrapping (primitives access methods temporarily) ---");
console.log("hello".length); // 5 — String wrapper created temporarily
console.log((42).toString()); // "42" — Number wrapper

// ============================================================
// 1.3 TYPE COERCION
// ============================================================

console.log("\n--- Implicit coercion ---");
console.log("5" + 3); // "53" (string concat — + with string wins)
console.log("5" - 3); // 2 (number — - always numeric)
console.log(true + 1); // 2 (true → 1)
console.log(null + 1); // 1 (null → 0)
console.log(undefined + 1); // NaN (undefined → NaN)

console.log("\n--- == loose equality (avoid!) ---");
console.log(0 == false); // true
console.log("" == false); // true
console.log("5" == 5); // true
console.log(null == undefined); // true (only case!)

console.log("\n--- === strict equality (prefer) ---");
console.log(0 === false); // false
console.log("5" === 5); // false
console.log(null === undefined); // false

console.log("\n--- Object.is (same-value equality) ---");
console.log(Object.is(NaN, NaN)); // true (unlike ===)
console.log(Object.is(+0, -0)); // false (unlike ===)
console.log(Object.is(0, false)); // false

console.log("\n--- Explicit coercion (clear intent) ---");
console.log(Number("42")); // 42
console.log(+"42"); // 42 (unary +)
console.log(String(42)); // "42"
console.log(42 + ""); // "42"
console.log(Boolean(0)); // false
console.log(!!"hello"); // true

// ============================================================
// 1.4 SPECIAL VALUES
// ============================================================

console.log("\n--- NaN ---");
console.log(NaN === NaN); // false (only value !== itself)
console.log(NaN !== NaN); // true
console.log(Number.isNaN(NaN)); // true
console.log(Number.isNaN("foo")); // false
// console.log(isNaN("foo")); // true — global isNaN coerces! Avoid.

console.log("\n--- Infinity ---");
console.log(1 / 0); // Infinity
console.log(-1 / 0); // -Infinity
console.log(Infinity - Infinity); // NaN

console.log("\n--- +0 vs -0 ---");
console.log(+0 === -0); // true
console.log(Object.is(+0, -0)); // false
console.log(1 / +0); // Infinity
console.log(1 / -0); // -Infinity

// --- Expected Output ---
// --- typeof for all types ---
// undefined
// object
// boolean
// number
// bigint
// string
// symbol
//
// --- typeof for objects ---
// object
// object
// function
//
// --- Auto-wrapping (primitives access methods temporarily) ---
// 5
// 42
//
// --- Implicit coercion ---
// 53
// 2
// 2
// 1
// NaN
//
// --- == loose equality (avoid!) ---
// true
// true
// true
// true
//
// --- === strict equality (prefer) ---
// false
// false
// false
//
// --- Object.is (same-value equality) ---
// true
// false
// false
//
// --- Explicit coercion (clear intent) ---
// 42
// 42
// 42
// 42
// false
// true
//
// --- NaN ---
// false
// true
// true
// false
//
// --- Infinity ---
// Infinity
// -Infinity
// NaN
//
// --- +0 vs -0 ---
// true
// false
// Infinity
// -Infinity
