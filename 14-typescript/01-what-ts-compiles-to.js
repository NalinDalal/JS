/**
 * Module 14 — 14.1 What TypeScript Compiles To
 * TypeScript types are ERASABLE: tsc strips annotations and emits plain JS.
 * This file shows a .ts snippet side-by-side with its compiled .js output,
 * prints both, and proves nothing type-related survives at runtime.
 *
 * Run: node 01-what-ts-compiles-to.js
 */

// ---- The .ts source (a comment here — this is what you'd write) ----

const tsSource = `
// greet.ts  (TypeScript source)
function greet(name: string, times?: number): string {
  if (times === undefined) times = 1;
  return (name + "! ").repeat(times).trim();
}

interface User {
  id: number;
  name: string;
}

const users: User[] = [
  { id: 1, name: "Ada" },
  { id: 2, name: "Grace" },
];
`;

// ---- The equivalent compiled JS (what tsc would EMIT — no types) ----

const compiledJs = `
// greet.js  (tsc output — types erased, zero runtime overhead)
function greet(name, times) {
  if (times === undefined) times = 1;
  return (name + "! ").repeat(times).trim();
}

const users = [
  { id: 1, name: "Ada" },
  { id: 2, name: "Grace" },
];
`;

// ---- A live hand-erased demo: write TS-style code, strip it "by hand" ----

function typeCheckedOnly(/* name: string */ name, /* times?: number */ times) {
  // The annotations above are comments called "fat arrow /* */" style —
  // TS strips them; JS just runs. Same business logic, no type checks.
  if (times === undefined) times = 1;
  return (name + "! ").repeat(times).trim();
}

function printTsSnippet() {
  console.log("\n── What you write (.ts) ──────────────────────────────");
  console.log(tsSource);
}

function printCompiled() {
  console.log("\n── What tsc emits (.js) — types completely removed ──────");
  console.log(compiledJs);
}

function printRuntimeProof() {
  console.log("\n── Runtime proof: types are NOT enforced at runtime ────");
  console.log("greet(42, 2)          ->", JSON.stringify(typeCheckedOnly(42, 2)));
  console.log("greet(undefined, 3)   ->", JSON.stringify(typeCheckedOnly(undefined, 3)));
  console.log("typeof greet          ->", typeof typeCheckedOnly);
  console.log("greet.length (arity)  ->", typeCheckedOnly.length);
  console.log("\ngreet compiled output:", JSON.stringify(typeCheckedOnly("TS", 2)));
}

function main() {
  printTsSnippet();
  printCompiled();
  printRuntimeProof();
  console.log("\nKey takeaway: every ':' annotation compiles to nothing.");
  console.log("The JS engine never sees `string`, `User`, or `?:` —");
  console.log("tsc erased them before the file ever ran.");
}

main();