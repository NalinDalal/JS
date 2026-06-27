/**
 * Module 06 — Interview Questions
 * Sort mutation, Map vs Object, Set dedup, WeakMap GC, deep clone
 *
 * Run: node 06-interview-collections.js
 */

// ============================================================
// Q1: Mutating vs non-mutating sort
// ============================================================
console.log("--- Q1: Mutating vs non-mutating sort ---");
const arr = [3, 1, 2];
arr.sort();        // mutates
console.log("arr.sort():", arr); // [1, 2, 3]

const arr2 = [3, 1, 2];
arr2.slice().sort();  // slice creates copy, sort mutates the copy
console.log("arr2.slice().sort():", arr2); // [3, 1, 2] (unchanged)

// ============================================================
// Q2: Map vs Object
// ============================================================
console.log("\n--- Q2: Map vs Object ---");
// Object fails with non-string keys
const obj = {};
const fn = () => {};
obj[fn] = "function key";
console.log("Object key (fn → string):", Object.keys(obj)[0]); // "() => {}"

// Map handles any key type natively
const map = new Map();
map.set(fn, "function key");
console.log("Map.get(fn):", map.get(fn)); // "function key"

// Map.size is O(1), Object.keys is O(n)
const map2 = new Map();
for (let i = 0; i < 1000; i++) map2.set(i, i);
console.log("Map.size (O(1)):", map2.size); // 1000

const obj2 = {};
for (let i = 0; i < 1000; i++) obj2[i] = i;
console.log("Object.keys length (O(n)):", Object.keys(obj2).length); // 1000

// ============================================================
// Q3: Set deduplication with SameValueZero
// ============================================================
console.log("\n--- Q3: Set SameValueZero ---");
const s = new Set();
s.add(1);
s.add(1);    // ignored (same value)
s.add(NaN);
s.add(NaN);  // ignored (NaN === NaN in Set, unlike ===)
s.add("1");
s.add(true);

console.log([...s]); // [1, NaN, "1", true]

// ============================================================
// Q4: WeakMap allows GC vs Map prevents GC
// ============================================================
console.log("\n--- Q4: WeakMap vs Map GC ---");
console.log(`
// WeakMap: GC can collect
let obj = { data: 123 };
const wm = new WeakMap();
wm.set(obj, "metadata");
obj = null; // wm entry eligible for GC

// Map: holds reference, prevents GC
obj = { data: 456 };
const m = new Map();
m.set(obj, "metadata");
obj = null; // m still holds reference
`);

// ============================================================
// Q5: Deep clone comparison
// ============================================================
console.log("\n--- Q5: Deep clone comparison ---");
const original = {
  date: new Date(),
  map: new Map([["a", 1]]),
  set: new Set([1, 2, 3]),
  nested: { deep: true }
};

// structuredClone (preferred)
const clone = structuredClone(original);
clone.nested.deep = false;
console.log("structuredClone preserves deep:", original.nested.deep); // true

// JSON method (limited)
const clone2 = JSON.parse(JSON.stringify(original));
console.log("JSON date is string:", clone2.date instanceof Date); // false
console.log("JSON map is empty obj:", clone2.map instanceof Map); // false

// Shallow spread
const shallow = { ...original };
shallow.nested.deep = false;
console.log("spread shares nested ref:", original.nested.deep); // false (shared!)
