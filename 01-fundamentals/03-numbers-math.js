/**
 * Module 01 — 1.5 Numbers & Math
 * Safe integers, BigInt, Math methods
 *
 * Run: node 03-numbers-math.js
 */

// --- Safe Integers ---
console.log("--- Safe Integers ---");
console.log(Number.MAX_SAFE_INTEGER); // 9007199254740991
console.log(Number.MIN_SAFE_INTEGER); // -9007199254740991
console.log(Number.isSafeInteger(9007199254740991)); // true
console.log(Number.isSafeInteger(9007199254740992)); // false (unsafe!)

// --- BigInt ---
console.log("\n--- BigInt ---");
const big = 9007199254740991n;
console.log(typeof big); // "bigint"
console.log(big + 1n === big + 2n); // false — BigInt is precise!
console.log(BigInt(9007199254740991)); // 9007199254740991n
// big + 1  // TypeError: can't mix BigInt and Number

// --- Math methods ---
console.log("\n--- Math.floor / ceil / round / trunc ---");
console.log(Math.floor(3.7)); // 3 (round down)
console.log(Math.ceil(3.2)); // 4 (round up)
console.log(Math.round(3.5)); // 4 (nearest, .5 rounds up)
console.log(Math.trunc(3.7)); // 3 (remove decimal)
console.log(Math.trunc(-3.7)); // -3 (toward zero)

console.log("\n--- Math.random and range ---");
console.log(Math.random()); // 0 to 1 (exclusive)
// Random integer between min and max (inclusive)
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
console.log(randomInt(1, 10)); // 1-10

console.log("\n--- Math.min / max / hypot ---");
console.log(Math.max(1, 5, 3)); // 5
console.log(Math.min(1, 5, 3)); // 1
console.log(Math.hypot(3, 4)); // 5 (Pythagorean theorem)

console.log("\n--- Other Math methods ---");
console.log(Math.abs(-5)); // 5
console.log(Math.pow(2, 10)); // 1024
console.log(Math.sqrt(16)); // 4
console.log(Math.PI); // 3.141592653589793

// --- Expected Output:
// --- Safe Integers ---
// 9007199254740991
// -9007199254740991
// true
// false
//
// --- BigInt ---
// bigint
// false
// 9007199254740991n
//
// --- Math.floor / ceil / round / trunc ---
// 3
// 4
// 4
// 3
// -3
//
// --- Math.random and range ---
// <random 0-1>
// <random 1-10>
//
// --- Math.min / max / hypot ---
// 5
// 1
// 5
//
// --- Other Math methods ---
// 5
// 1024
// 4
// 3.141592653589793
