/**
 * Module 06 — 6.3 Set
 * union, intersection, difference, deduplication
 *
 * Run: node 03-sets.js
 */

console.log("--- Basic Set ---");
const unique = new Set([1, 2, 2, 3, 3, 3, 4]);
console.log(unique); // Set {1, 2, 3, 4}
console.log([...unique]); // [1, 2, 3, 4]

// --- Set Operations ---
console.log("\n--- Set Operations ---");
const setA = new Set([1, 2, 3, 4]);
const setB = new Set([3, 4, 5, 6]);

// Union
const union = new Set([...setA, ...setB]);
console.log("Union:", [...union]); // [1, 2, 3, 4, 5, 6]

// Intersection
const intersection = new Set([...setA].filter(x => setB.has(x)));
console.log("Intersection:", [...intersection]); // [3, 4]

// Difference (A - B)
const difference = new Set([...setA].filter(x => !setB.has(x)));
console.log("Difference A-B:", [...difference]); // [1, 2]

// Symmetric Difference (A ∪ B) - (A ∩ B)
const symmetricDiff = new Set(
  [...setA].filter(x => !setB.has(x)).concat(
    [...setB].filter(x => !setA.has(x))
  )
);
console.log("Symmetric Diff:", [...symmetricDiff]); // [1, 2, 5, 6]

// --- NaN handling ---
console.log("\n--- NaN handling ---");
const special = new Set([NaN, NaN, undefined, 0, -0]);
console.log("size:", special.size); // 3 (NaN deduped, 0 and -0 equal)
console.log("has NaN:", special.has(NaN)); // true

// --- Deduplication ---
console.log("\n--- Deduplication ---");
const arr = ["a", "b", "a", "c", "b"];
const deduped = [...new Set(arr)];
console.log("deduped:", deduped); // ["a", "b", "c"]

// --- Checking membership efficiently ---
console.log("\n--- Fast membership ---");
const fastLookup = new Set([100, 200, 300]);
const data = [50, 100, 150, 200, 250];
const found = data.filter(x => fastLookup.has(x));
console.log("found in set:", found); // [100, 200]
