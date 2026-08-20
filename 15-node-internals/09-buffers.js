/**
 * Module 15 — 15.10 Buffers (Buffer vs String, memory sharing, encodings)
 * Buffer.from/alloc, byte-vs-character counts, encodings, subarray (view)
 * vs concat (copy), comparison, and interop with TypedArray.
 *
 * Run: node 09-buffers.js
 */

// ---- 1) Buffer is BYTES; a string is UTF-16 characters ----
const emoji = "é"; // 1 JS character, 2 bytes in UTF-8 (a plain 'a' would be 1)
const b1 = Buffer.from(emoji, "utf8");
console.log(`1) "${emoji}".length               = ${emoji.length} (characters)`);
console.log(`   Buffer.from("${emoji}").length   = ${b1.length} (bytes)`);
console.log(`   emoji string "🚀".length = ${"🚀".length}, bytes = ${Buffer.byteLength("🚀")}`);

// ---- 2) Allocation: zero-filled vs uninitialized ----
const zeroed = Buffer.alloc(4, 0xab);
const raw = Buffer.allocUnsafe(4); // fast, but may contain stale bytes — always overwrite!
raw.fill(0x42);
console.log(`\n2) Buffer.alloc(4, 0xab)  = ${zeroed.toString("hex")}`);
console.log(`   Buffer.allocUnsafe(4) filled with 0x42 = ${raw.toString("hex")}`);

// ---- 3) Encodings round-trip ----
const msg = Buffer.from("node internals", "utf8");
console.log(`\n3) utf8:   ${msg.toString("utf8")}`);
console.log(`   hex:    ${msg.toString("hex")}`);
console.log(`   base64: ${msg.toString("base64")}  -> back: ${Buffer.from(msg.toString("base64"), "base64").toString("utf8")}`);

// ---- 4) subarray is a VIEW — mutations leak into the parent ----
const parent = Buffer.from("hello");
const view = parent.subarray(1, 3); // "el"
view[0] = 88; // 'X'
console.log(`\n4) parent after mutating $view: "${parent.toString()}"  (view shares memory!)`);
const copy = Buffer.from(parent); // a real COPY — safe to mutate
copy[0] = 90;
console.log(`   copy after mutation: "${copy.toString()}" vs parent "${parent.toString()}" (independent)`);

// ---- 5) compare, equals, concat ----
const a = Buffer.from("apple");
const b = Buffer.from("banana");
const c = Buffer.from("apple");
console.log(`\n5) compare("apple","banana") = ${a.compare(b)}  equals("apple","apple") = ${a.equals(c)}`);
const parts = Buffer.concat([Buffer.from("a"), Buffer.from("b"), Buffer.from("c")]);
console.log(`   concat: ${parts.toString()}`);

// ---- 6) Buffer <-> TypedArray interop (zero-copy) ----
const buf = Buffer.from([1, 2, 3, 4]);
const u8 = new Uint8Array(buf.buffer, buf.byteOffset, buf.length); // same memory
console.log(`\n6) Buffer is a Uint8Array subclass: ${buf instanceof Uint8Array}`);
console.log(`   TypedArray view over the same memory: ${u8[0]},${u8[1]},${u8[2]},${u8[3]}`);
u8[2] = 99; // mutates the Buffer too
console.log(`   after u8[2]=99, buffer bytes: ${[...buf]}`);
console.log("\nTakeaway: strings count characters, buffers count bytes; use subarray/views for zero-copy, concat/copy for safety.");