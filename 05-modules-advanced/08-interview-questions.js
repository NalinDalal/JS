/**
 * Module 05 — Question Bank: likely-asked interview questions (modules & advanced)
 *
 * Run: node 08-interview-questions.js
 */

const qa = [
  ["ESM vs CommonJS?", "ESM (import/export): static analysis → tree-shaking, top-level await, live bindings (exported values update), strict mode always, works in browser+Node (.mjs). CJS (require/module.exports): dynamic (can require conditionally), sync, non-strict, copies values, Node-only."],
  ["What is tree-shaking?", "Bundlers (webpack/rollup) analyze static import/export graphs and drop unused exports from the bundle. Requires ESM statics — CJS require can't be analyzed statically. Side-effect-free annotations (/*#__PURE__*/) improve it."],
  ["Named vs default exports?", "Named: multiple, required by exact name, minified safely, aliasing via 'as'. Default: one per module, convenient but hurts tree-shaking + renames freely, mixing discouraged. Re-export: export { x } from './m.js'."],
  ["Dynamic import()?", "import('./m.js') returns a promise — load on demand (route-level code splitting), conditional imports, worker-style lazy chunks. Static imports are hoisted and always loaded; dynamic stays out of the critical path."],
  ["Live bindings — what are they?", "ESM imports are read-only live views: the importing module sees the CURRENT value of the exported variable, changes propagate. No copies. 'Read-only' = you cannot assign to the import; the exporting side can rebind."],
  ["What makes something iterable?", "Having [Symbol.iterator] → iterator object with next() returning {value, done}. Arrays, strings, Maps, Sets are iterable (for...of works). Plain objects are NOT — you must Object.entries()/keys(), or provide your own iterator."],
  ["Generator vs normal function?", "function* — pausable: yield returns control, .next() resumes, .return()/.throw() control the stream. Lazy — computation on demand (infinite sequences!). for...of consumes them. Their .next() protocol makes them iterable automatically."],
  ["Bonus: async generators?", "async function* — yields promises, consumed with for await...of; the generator's execution waits for each yielded promise. Powers streams (readable streams are async iterable) and paginated data."],
  ["Symbols — why do they exist?", "Unique, non-string keys for object properties: avoids collisions (enum-like constants), enables protocol well-known symbols (Symbol.iterator, Symbol.toStringTag), and can be non-enumerable pattern (Symbol.for registry for shared symbols)."],
  ["Well-known symbols you should know?", "Symbol.iterator (for...of), Symbol.asyncIterator (for await), Symbol.toStringTag (name in Object.prototype.toString), Symbol.hasInstance, Symbol.toPrimitive (custom coercion), Symbol.match/replace/search/split (regex integration)."],
  ["Proxy use cases?", "Intercept get/set/delete/has/apply/construct with traps: validation, logging, reactive state (Vue/Vue reactivity, observable values), mocking in tests, virtualized properties. Reflect mirrors traps 1:1 for default behavior + correct this."],
  ["Proxy vs Object.defineProperty (legacy reactivity)?", "defineProperty: per-key interception, must re-run for new keys. Proxy: whole-object traps for ANY key, including future ones — that's why Vue 3 moved to Proxy. Proxies are slower than plain access — gate hot paths if possible."],
  ["WeakRef / FinalizationRegistry?", "WeakRef: a reference that doesn't prevent GC — allows caches of huge objects that die under memory pressure; after gc the .deref() returns undefined. FinalizationRegistry: runs a callback when an object is collected (cleanup, warnings only — GC timing is not guaranteed!)."],
  ["Circular imports — why are they a problem?", "CJS: partially-initialized exports at require-time → undefined reads (fix: defer access or restructure). ESM: hoisted + live bindings handle many cycles, but TDZ can still bite with const. Architecture fix: no cycles in dependency graph."],
];

let n = 0;
for (const [q, a] of qa) {
  n++;
  console.log(`\n${String(n).padStart(2)}. ${q}`);
  console.log("   →", a);
}

// --- Whiteboard drills ---
// 1. Write an infinite Fibonacci generator in 4 lines.
// 2. Draw the ESM graph: how tree-shaking decides what ships.
// 3. Why can't you use await WITHOUT dynamic import at module top level in CJS?
