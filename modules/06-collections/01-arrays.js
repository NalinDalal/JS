/**
 * Module 06 — 6.1 Arrays
 * Sparse/dense, mutating vs non-mutating, flat, destructuring
 *
 * Run: node 01-arrays.js
 */

console.log("--- Creating arrays ---");
const literal = [10, 20, 30];
const fromStr = Array.from("JS");
const ofArr = Array.of(7, 8, 9);

console.log(literal); // [10, 20, 30]
console.log(fromStr); // ["J", "S"]
console.log(ofArr);   // [7, 8, 9]

// new Array pitfall
const sparse = new Array(3);
console.log(sparse);        // [ <3 empty items> ]
console.log(sparse.length); // 3

// --- Sparse vs Dense ---
console.log("\n--- Sparse vs Dense ---");
const dense = [1, 2, 3];
console.log("dense length:", dense.length);       // 3

const sparseArr = [1, , 3]; // length 3, index 1 is empty
console.log("sparse length:", sparseArr.length);   // 3
console.log("1 in sparse:", 1 in sparseArr);       // false
console.log("sparse[1]:", sparseArr[1]);           // undefined
console.log("Object.keys(sparse):", Object.keys(sparseArr)); // ["0", "2"]

// --- Mutating methods ---
console.log("\n--- Mutating methods ---");
const arr = [1, 2, 3, 4, 5];

arr.push(6);
console.log("after push(6):", arr); // [1,2,3,4,5,6]

arr.pop();
console.log("after pop():", arr);   // [1,2,3,4,5]

arr.unshift(0);
console.log("after unshift(0):", arr); // [0,1,2,3,4,5]

arr.shift();
console.log("after shift():", arr);    // [1,2,3,4,5]

arr.splice(2, 1, 99);
console.log("after splice(2,1,99):", arr); // [1,2,99,4,5]

arr.sort((a, b) => a - b);
console.log("after sort:", arr);            // [1,2,4,5,99]

arr.reverse();
console.log("after reverse:", arr);          // [99,5,4,2,1]

// --- Non-mutating methods ---
console.log("\n--- Non-mutating methods ---");
const nums = [1, 2, 3, 4, 5];
const sliced = nums.slice(1, 3);            // [2, 3]
const concat = nums.concat([6, 7]);         // [1,2,3,4,5,6,7]
const mapped = nums.map(x => x * 2);        // [2,4,6,8,10]
const filtered = nums.filter(x => x > 3);   // [4,5]
const reduced = nums.reduce((acc, v) => acc + v, 0); // 15

console.log("slice(1,3):", sliced);
console.log("concat:", concat);
console.log("map:", mapped);
console.log("filter:", filtered);
console.log("reduce:", reduced);

// --- find, findIndex, includes ---
console.log("\n--- find / findIndex / includes ---");
const users = [
  { id: 1, name: "Alice" },
  { id: 2, name: "Bob" },
  { id: 3, name: "Charlie" }
];

const found = users.find(u => u.name === "Bob");
const idx = users.findIndex(u => u.name === "Bob");
console.log("find:", found);           // { id: 2, name: 'Bob' }
console.log("findIndex:", idx);        // 1
console.log("includes:", nums.includes(3)); // true

// --- flat and flatMap ---
console.log("\n--- flat / flatMap ---");
const nested = [1, [2, 3], [4, [5, 6]]];
console.log("flat(Infinity):", nested.flat(Infinity)); // [1,2,3,4,5,6]

const sentences = ["Hello world", "Goodbye moon"];
const words = sentences.flatMap(s => s.split(" "));
console.log("flatMap:", words); // ["Hello", "world", "Goodbye", "moon"]

// --- Destructuring ---
console.log("\n--- Destructuring & Spread ---");
const [first, second, ...rest] = [10, 20, 30, 40, 50];
console.log("first:", first);  // 10
console.log("rest:", rest);    // [30, 40, 50]

const merged = [...[1, 2], ...[3, 4]];
console.log("spread merge:", merged); // [1,2,3,4]

// Array.from with mapping
const range = Array.from({ length: 5 }, (_, i) => i + 1);
console.log("Array.from + map:", range); // [1,2,3,4,5]
