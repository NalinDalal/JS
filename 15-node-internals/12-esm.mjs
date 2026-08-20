/**
 * Module 15 — 15.12 ESM (import/export, import.meta.url, top-level await)
 * The ESM twin of 11-cjs.cjs: same greeting module + main, but this file is
 * ESM (the .mjs extension forces it regardless of package.json "type").
 * Highlights: import.meta.url instead of __dirname, top-level await, static
 * import syntax. If the nearest package.json had "type": "module", the .js
 * extension would be ESM too; "type": "commonjs" (or no field) keeps .js CJS.
 *
 * Run: node 12-esm.mjs
 */

import { readFile } from "node:fs/promises";
import { dirname, basename } from "node:path";
import { fileURLToPath } from "node:url";

// ---- the "module" ----
export function greet(name) {
  return `hello, ${name} (from ESM)`;
}

export function sum(numbers) {
  return numbers.reduce((acc, n) => acc + n, 0);
}

// ---- the "main" ----
// ESM gets no __dirname/__filename globals — derive them from import.meta.url.
const thisFile = fileURLToPath(import.meta.url);
const thisDir = dirname(thisFile);
console.log("== ESM module executing ==");
console.log(`  import.meta.url : ${import.meta.url}`);
console.log(`  basename        : ${basename(thisFile)}  (no free __filename in ESM)`);
console.log(`  dirname         : ${thisDir}`);

// Top-level await: CJS orders you to wrap in an async function; ESM just works.
const ownSource = await readFile(thisFile, "utf8");
console.log(`  top-level await: read my own source (${ownSource.split("\n").length} lines)`);

console.log(`  greet("World") = ${greet("World")}`);
console.log(`  sum([1,2,3])   = ${sum([1, 2, 3])}`);

console.log("\nESM facts: static (analyzable) imports, hoisted, top-level await,");
console.log(`"type": "module" in package.json makes .js ESM; .mjs is always ESM.`);