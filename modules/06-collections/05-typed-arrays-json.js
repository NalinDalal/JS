/**
 * Module 06 — 6.5 TypedArrays + 6.6 JSON
 * ArrayBuffer, DataView, JSON.stringify/parse, structuredClone
 *
 * Run: node 05-typed-arrays-json.js
 */

// ============================================================
// 6.5 TYPED ARRAYS
// ============================================================

console.log("--- TypedArrays ---");
const a = new Uint8Array([1, 2, 3, 4]);
const b = new Float32Array([1.5, 2.5, 3.5]);

console.log("Uint8Array:", a); // Uint8Array [1, 2, 3, 4]
console.log("Float32Array:", b); // Float32Array [1.5, 2.5, 3.5]

// --- ArrayBuffer ---
console.log("\n--- ArrayBuffer ---");
const buf = new ArrayBuffer(12);
const intView = new Int32Array(buf);
intView[0] = 100;
intView[1] = 200;
intView[2] = 300;

console.log("Int32Array:", intView); // Int32Array [100, 200, 300]
console.log("buffer byteLength:", buf.byteLength); // 12

// --- DataView ---
console.log("\n--- DataView ---");
const packet = new ArrayBuffer(16);
const header = new DataView(packet);
header.setUint8(0, 0x01);     // version
header.setUint16(1, 0x0100);  // flags
header.setFloat32(4, 3.14);   // value

const version = header.getUint8(0);
const value = header.getFloat32(4);
console.log("version:", version); // 1
console.log("value:", value);     // 3.14

// --- Text encoding ---
console.log("\n--- TextEncoder ---");
const encoder = new TextEncoder();
const bytes = encoder.encode("Hello");
console.log("'Hello' bytes:", bytes); // Uint8Array [72, 101, 108, 108, 111]

// ============================================================
// 6.6 JSON
// ============================================================

console.log("\n--- JSON.stringify / parse ---");
const obj = { name: "Alice", age: 30, hobbies: ["reading", "gaming"] };
const json = JSON.stringify(obj);
console.log("stringify:", json);
// '{"name":"Alice","age":30,"hobbies":["reading","gaming"]}'

const parsed = JSON.parse(json);
console.log("parsed:", parsed);

// --- Replacer function (hide password) ---
console.log("\n--- Replacer function ---");
const user = { name: "Alice", password: "secret", age: 30 };
const safe = JSON.stringify(user, (key, value) => {
  if (key === "password") return undefined;
  return value;
});
console.log("safe:", safe); // '{"name":"Alice","age":30}'

// --- Replacer array (whitelist) ---
const minimal = JSON.stringify(user, ["name", "age"]);
console.log("minimal:", minimal); // '{"name":"Alice","age":30}'

// --- Pretty print ---
console.log("\n--- Pretty print ---");
const pretty = JSON.stringify({ a: 1, b: [2, 3] }, null, 2);
console.log(pretty);
// {
//   "a": 1,
//   "b": [
//     2,
//     3
//   ]
// }

// --- Reviver function (convert date strings back to Date) ---
console.log("\n--- Reviver function ---");
const dateStr = '{"date":"2024-01-15T00:00:00.000Z","name":"Meeting"}';
const withDate = JSON.parse(dateStr, (key, value) => {
  if (key === "date") return new Date(value);
  return value;
});
console.log("withDate.date instanceof Date:", withDate.date instanceof Date); // true
console.log("withDate.date:", withDate.date);

// --- Limitations ---
console.log("\n--- JSON limitations ---");
const problematic = {
  fn: () => {},
  undef: undefined,
  sym: Symbol("test"),
  nan: NaN,
  inf: Infinity,
  date: new Date(),
  map: new Map([["a", 1]])
};

const result = JSON.stringify(problematic, null, 2);
console.log(result);
// Functions, undefined, Symbol are dropped
// NaN/Infinity → null
// Date → string
// Map → empty {}

// --- Deep clone with structuredClone ---
console.log("\n--- structuredClone (preferred deep copy) ---");
const original = {
  date: new Date(),
  map: new Map([["a", 1]]),
  set: new Set([1, 2, 3]),
  nested: { deep: true }
};

const clone = structuredClone(original);
clone.nested.deep = false;
console.log("original.nested.deep:", original.nested.deep); // true (unchanged)
console.log("clone.nested.deep:", clone.nested.deep);       // false
console.log("clone.date instanceof Date:", clone.date instanceof Date); // true
console.log("clone.map instanceof Map:", clone.map instanceof Map);   // true
