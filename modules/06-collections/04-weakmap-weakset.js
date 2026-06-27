/**
 * Module 06 — 6.4 WeakMap and WeakSet
 * Private data, caching, GC behavior
 *
 * Run: node 04-weakmap-weakset.js
 *
 * Note: GC behavior cannot be directly observed from JS.
 * This file demonstrates the PATTERNS that would benefit from WeakMap/WeakSet.
 */

// --- Private data with WeakMap ---
console.log("--- Private data with WeakMap ---");
const privateData = new WeakMap();

class User {
  constructor(name, password) {
    this.name = name;
    privateData.set(this, { password });
  }

  checkPassword(pw) {
    return privateData.get(this).password === pw;
  }
}

const user = new User("Alice", "secret123");
console.log("user.name:", user.name);                         // "Alice"
console.log("checkPassword:", user.checkPassword("secret123")); // true
console.log("privateData size (not available):", "WeakMap has no .size");

// --- Caching / memoization with WeakMap ---
console.log("\n--- Caching with WeakMap ---");
const cache = new WeakMap();

function process(obj) {
  if (cache.has(obj)) {
    console.log("  cache hit");
    return cache.get(obj);
  }
  const result = obj.value * 2;
  cache.set(obj, result);
  console.log("  cache miss: computed", result);
  return result;
}

const obj1 = { value: 5 };
const obj2 = { value: 10 };

console.log(process(obj1)); // miss → 10
console.log(process(obj1)); // hit → 10
console.log(process(obj2)); // miss → 20

// --- WeakSet for tracking ---
console.log("\n--- WeakSet for tracking ---");
const processed = new WeakSet();

function trackProcess(obj) {
  if (processed.has(obj)) {
    console.log("  already processed, skipping");
    return;
  }
  console.log("  processing...");
  processed.add(obj);
}

const item1 = { name: "A" };
const item2 = { name: "B" };

trackProcess(item1); // processing
trackProcess(item1); // already processed, skipping
trackProcess(item2); // processing

// --- GC behavior explanation ---
console.log("\n--- GC behavior ---");
console.log(`
// WeakMap: when obj is no longer referenced elsewhere, entry is GC'd
let obj = { data: 123 };
const wm = new WeakMap();
wm.set(obj, "metadata");
obj = null; // wm entry eligible for GC

// Map: entry persists even if obj is no longer referenced
obj = { data: 456 };
const m = new Map();
m.set(obj, "metadata");
obj = null; // m still holds reference, entry NOT GC'd
`);
