/**
 * Module 05 — Interview Questions
 * ESM vs CJS, iterator, generator, proxy, yield*, disposable
 *
 * Run: node 07-interview-advanced.js
 */

// ============================================================
// Q1: ESM vs CommonJS
// ============================================================
console.log("--- Q1: ESM vs CommonJS ---");
console.log(`
ESM:
  - import/export (static, hoisted)
  - Asynchronous loading
  - Strict mode by default
  - Tree-shakable
  - import resolved at parse time

CommonJS:
  - require()/module.exports (dynamic, runtime)
  - Synchronous loading
  - Modules cached after first require
  - Not strict by default
  - Not tree-shakable

Examples:
  ESM:          import { readFile } from 'fs/promises';
                export const data = "hello";
  CommonJS:     const fs = require('fs');
                module.exports = { data: "hello" };
  Conditional:  if (cond) { require('./mod'); }  // OK in CJS, not in ESM
`);

// ============================================================
// Q2: Iterator protocol
// ============================================================
console.log("\n--- Q2: Iterator protocol ---");
const arr = [1, 2, 3];
const iter = arr[Symbol.iterator]();
console.log(iter.next()); // { value: 1, done: false }
console.log(iter.next()); // { value: 2, done: false }
console.log(iter.next()); // { value: 3, done: false }
console.log(iter.next()); // { value: undefined, done: true }

// ============================================================
// Q3: Generator flow
// ============================================================
console.log("\n--- Q3: Generator flow ---");
function* gen() {
  const a = yield 1;
  const b = yield 2;
  return a + b;
}

const g = gen();
console.log(g.next());      // { value: 1, done: false }
console.log(g.next(10));    // { value: 2, done: false } — a = 10
console.log(g.next(20));    // { value: 30, done: true } — b = 20

// ============================================================
// Q4: Proxy for validation
// ============================================================
console.log("\n--- Q4: Proxy validation ---");
const validated = new Proxy({}, {
  set(target, prop, value) {
    if (prop === "email" && typeof value === "string" && !value.includes("@")) {
      throw new Error("Invalid email");
    }
    return Reflect.set(target, prop, value);
  }
});

validated.email = "alice@example.com"; // OK
console.log("Valid email set");
try {
  validated.email = "invalid";
} catch (e) {
  console.log("Caught:", e.message); // Invalid email
}

// ============================================================
// Q5: yield vs yield*
// ============================================================
console.log("\n--- Q5: yield vs yield* ---");
function* inner() { yield 1; yield 2; }
function* outer() {
  yield "a";
  yield* inner(); // delegates — yields 1, 2
  yield "b";
}

console.log([...outer()]); // ["a", 1, 2, "b"]

// ============================================================
// Q6: Disposable pattern
// ============================================================
console.log("\n--- Q6: Disposable pattern ---");
console.log(`
// The Disposable pattern provides auto cleanup using Symbol.dispose.
// Instead of:
const conn = new Connection();
try {
  conn.query("...");
} finally {
  conn.close();
}

// You write:
// using conn = new Connection();
// conn.query("...");
// auto-closed!

// Key: Symbol.dispose for sync, Symbol.asyncDispose for async
// Multiple disposables are cleaned in reverse order (LIFO)
`);
