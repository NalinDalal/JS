/**
 * Module 15 — 15.12 CommonJS (require/module.exports)
 * A tiny module + main in ONE file (the same code, both roles), showing the
 * CJS niceties: __dirname/__filename, synchronous require, module.exports.
 * The ESM twin lives in 12-esm.mjs.
 *
 * Run: node 11-cjs.cjs
 */

// ---- the "module" ----
const path = require("node:path");

function greet(name) {
  return `hello, ${name} (from CommonJS)`;
}

function sum(numbers) {
  return numbers.reduce((acc, n) => acc + n, 0);
}

module.exports = { greet, sum };

// ---- the "main" ----
// In CJS, __dirname/__filename exist as globals; require() is synchronous and
// cached, and module.exports is just a plain object we augmented above.
console.log("== CJS module executing ==");
console.log(`  __filename : ${path.basename(__filename)}`);
console.log(`  __dirname  : ${__dirname}`);
console.log(`  require.cache has this file: ${!!require.cache[__filename]}`);

const api = require("./11-cjs.cjs"); // self-require — returns the same module.exports
console.log(`  greet("World") = ${api.greet("World")}`);
console.log(`  sum([1,2,3])   = ${api.sum([1, 2, 3])}`);

console.log("\nCJS facts: sync require, module-level cache, exports object shared");
console.log("(switch to 12-esm.mjs to see the same module as ESM).");