/**
 * Module 02 — 2.4 IIFE
 * Classic IIFE, arrow IIFE, use cases
 *
 * Run: node 03-iife.js
 */

// --- Classic IIFE ---
// --- Classic IIFE ---
(function () {
  var secret = "hidden";
  console.log(secret); // "hidden"
})();

try {
  console.log(secret); // ReferenceError — not global
} catch (e) {
  // secret is not global
}

// --- Arrow function IIFE (requires parentheses) ---
// --- Arrow IIFE ---
(() => {
  // Arrow IIFE runs immediately
})();

// --- IIFE for async loop fix (pre-let era) ---
// --- IIFE fixing async loop ---
for (var i = 0; i < 3; i++) {
  (function (capturedI) {
    setTimeout(() => console.log("IIFE:", capturedI), 100);
  })(i);
}
// Output: 0, 1, 2

// --- IIFE returning a value ---
// --- IIFE returning computed value ---
const result = (function () {
  const data = [1, 2, 3];
  return data.map((x) => x * 2);
})();
console.log(result); // [2, 4, 6]

// --- Expected Output ---
// --- Classic IIFE ---
// hidden
// secret is not global
//
// --- Arrow IIFE ---
// Arrow IIFE runs immediately
//
// --- IIFE fixing async loop ---
// --- IIFE returning computed value ---
// [ 2, 4, 6 ]
//
// (setTimeout outputs appear after ~100ms)
// IIFE: 0
// IIFE: 1
// IIFE: 2
