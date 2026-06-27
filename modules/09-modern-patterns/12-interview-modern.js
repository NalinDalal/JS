/**
 * Module 09 — Interview Questions (Modern)
 * Destructuring, spread/rest, optional chaining, debounce/throttle, etc.
 *
 * Run: node 12-interview-modern.js
 */

// ============================================================
// Q1: Swap two variables without temp — with destructuring
// ============================================================
console.log("--- Q1: Variable swap ---");
let a = 1, b = 2;
[a, b] = [b, a];
console.log(a, b); // 2 1

// ============================================================
// Q2: Shallow merge two objects
// ============================================================
console.log("\n--- Q2: Object merge ---");
const obj1 = { a: 1, b: 2 };
const obj2 = { b: 3, c: 4 };
const merged = { ...obj1, ...obj2 };
console.log("merged:", merged); // { a: 1, b: 3, c: 4 }
// Same as Object.assign({}, obj1, obj2)

// ============================================================
// Q3: Optional chaining with nested access
// ============================================================
console.log("\n--- Q3: Safe nested access ---");
const data = { a: { b: [{ c: "found" }] } };
// Get c safely
const value = data?.a?.b?.[0]?.c ?? "fallback";
console.log("value:", value); // "found"

const missing = data?.x?.y?.z ?? "fallback";
console.log("missing:", missing); // "fallback"

// ============================================================
// Q4: Remove falsy values (not nullish only)
// ============================================================
console.log("\n--- Q4: Remove falsy vs nullish ---");
const mixed = [0, 1, "", "hello", false, null, undefined];
console.log("filter(Boolean):", mixed.filter(Boolean));       // [1, "hello"]
console.log("?? filter:", mixed.filter(x => x != null));       // [0, 1, "", "hello", false]
// (x != null) removes only null and undefined

// ============================================================
// Q5: Debounce implementation
// ============================================================
console.log("\n--- Q5: Debounce ---");
function debounce(fn, delay) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}
console.log("debounce defined — trailing edge only");

// ============================================================
// Q6: Currying — sum(1)(2)(3)
// ============================================================
console.log("\n--- Q6: Curried sum ---");
const sum = (a) => (b) => b !== undefined ? sum(a + b) : a;
// Recursive approach
const currySum = (...args) => {
  const fn = (...more) => more.length ? currySum(...args, ...more) : args.reduce((s, n) => s + n, 0);
  return fn;
};
console.log("currySum(1)(2)(3)():", currySum(1)(2)(3)()); // 6

// ============================================================
// Q7: Pipe/compose implementation
// ============================================================
console.log("\n--- Q7: Pipe ---");
const pipe = (...fns) => (x) => fns.reduce((acc, fn) => fn(acc), x);
const add1 = (x) => x + 1;
const doubleNum = (x) => x * 2;
const add1ThenDouble = pipe(add1, doubleNum);
console.log("pipe(add1, double)(5):", add1ThenDouble(5)); // 12

// ============================================================
// Q8: Deep clone (shallow vs deep)
// ============================================================
console.log("\n--- Q8: Deep clone ---");
const original = { a: 1, b: { c: 2 } };
const shallowCopy = { ...original };
shallowCopy.b.c = 99;
console.log("shallow copy affected original:", original.b.c); // 99

const deepCopy = structuredClone(original); // available in Node 17+
deepCopy.b.c = 42;
console.log("structuredClone isolated:", original.b.c); // 99

// ============================================================
// Q9: Event delegation
// ============================================================
console.log("\n--- Q9: Event delegation ---");
console.log("parent.addEventListener('click', e => {");
console.log("  const btn = e.target.closest('button');");
console.log("  if (!btn) return;");
console.log("  console.log(btn.dataset.action);");
console.log("});");

// ============================================================
// Q10: requestAnimationFrame vs setInterval
// ============================================================
console.log("\n--- Q10: rAF vs setInterval ---");
console.log("rAF: callback receives high-res timestamp, pauses when tab hidden");
console.log("setInterval: runs regardless of tab (throttled in background)");
console.log("Use rAF for visual updates, setInterval for polling");
