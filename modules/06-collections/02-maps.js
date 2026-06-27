/**
 * Module 06 — 6.2 Map
 * set/get/has, iteration, Object.entries/fromEntries, word counting
 *
 * Run: node 02-maps.js
 */

console.log("--- Basic Map usage ---");
const map = new Map();
map.set("name", "Alice");
map.set(42, "answer");
map.set(true, "yes");

console.log("get('name'):", map.get("name"));  // "Alice"
console.log("get(42):", map.get(42));           // "answer"
console.log("size:", map.size);                 // 3
console.log("has(true):", map.has(true));       // true

// --- Objects as keys ---
console.log("\n--- Objects as keys ---");
const objKey = { id: 1 };
map.set(objKey, "metadata");
console.log("get(objKey):", map.get(objKey)); // "metadata"

// For comparison: Object converts keys to strings
const plain = {};
const fn = () => {};
plain[fn] = "function key";
console.log("Object key:", Object.keys(plain)[0]); // "() => {}" (converted to string)

// --- Chaining ---
console.log("\n--- Chaining ---");
const map2 = new Map()
  .set("a", 1)
  .set("b", 2)
  .set("c", 3);

console.log("size:", map2.size); // 3

// --- Iteration ---
console.log("\n--- Iteration ---");
for (const [key, value] of map2) {
  console.log(`  ${key}: ${value}`);
}

// --- Converting to/from Object ---
console.log("\n--- Convert to/from Object ---");
const obj = { x: 1, y: 2, z: 3 };
const mapFromObj = new Map(Object.entries(obj));
console.log("Map from Object:", mapFromObj.get("x")); // 1

const objFromMap = Object.fromEntries(map2);
console.log("Object from Map:", objFromMap); // { a: 1, b: 2, c: 3 }

// --- Word counting ---
console.log("\n--- Word counting with Map ---");
const words = ["apple", "banana", "apple", "cherry", "banana", "apple"];
const count = new Map();

for (const word of words) {
  count.set(word, (count.get(word) || 0) + 1);
}

console.log("apple count:", count.get("apple"));   // 3
console.log("banana count:", count.get("banana")); // 2
console.log("cherry count:", count.get("cherry")); // 1
console.log("size:", count.size);                  // 3

// --- Map vs Object ---
console.log("\n--- Map vs Object ---");
const mapObj = {};
const mapMap = new Map();

// Map maintains insertion order, Object doesn't guarantee
mapMap.set("c", 3);
mapMap.set("a", 1);
mapMap.set("b", 2);
console.log("Map order:", [...mapMap]); // ["c",3], ["a",1], ["b",2]

// Map.size is O(1), Object.keys.length is O(n)
console.log("Map.size:", mapMap.size); // 3
console.log("Object.keys length:", Object.keys({ a: 1, b: 2, c: 3 }).length); // 3
