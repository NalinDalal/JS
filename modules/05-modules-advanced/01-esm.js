/**
 * Module 05 — 5.1 ES Modules
 * Note: ESM examples need type:module or .mjs — this file is for reference.
 * Run: node --input-type=module < 01-esm.js (or rename to .mjs)
 *
 * Concepts: export types, import types, re-exports, dynamic import
 * Run: node 01-esm.js (demonstration patterns only — actual ESM needs module context)
 */

console.log("--- ES Modules — Reference ---");
console.log("(ESM must run as type:module or .mjs — showing patterns only)\n");

// Pattern: Named exports
console.log("Named exports patterns:");
console.log(`  export const PI = 3.14159;`);
console.log(`  export function add(a, b) { return a + b; }`);
console.log(`  export { PI, add };  // export list`);

// Pattern: Default export
console.log("\nDefault export:");
console.log(`  export default class User { }`);

// Pattern: Dynamic import
console.log("\nDynamic import (returns Promise):");
console.log(`  const module = await import('./math.js');
  module.default;  // default export
  module.namedExport;`);

// Pattern: Browser setup
console.log("\nBrowser:");
console.log(`  <script type="module" src="app.js"></script>`);

// Pattern: Node.js setup
console.log("\nNode.js:");
console.log(`  package.json: { "type": "module" }
  // or use .mjs extension`);

// Practical: demonstrating the object that would result
console.log("\n--- Practical: default + named import simulation ---");

// Simulating what the module exports look like
const mathModule = {
  PI: 3.14159,
  add: (a, b) => a + b,
  default: class Calculator {
    constructor() { this.result = 0; }
    add(n) { this.result += n; return this; }
    get value() { return this.result; }
  }
};

// Like: import Calculator, { PI, add } from './math.js';
const Calculator = mathModule.default;
const { PI, add } = mathModule;
console.log("PI =", PI);          // 3.14159
console.log("add(2, 3) =", add(2, 3)); // 5

const calc = new Calculator();
calc.add(10).add(20);
console.log("calc.value =", calc.value); // 30

// Like: import * as MathUtils from './math.js';
const MathUtils = mathModule;
console.log("MathUtils.PI =", MathUtils.PI); // 3.14159

// Like: dynamic import
async function dynamicDemo() {
  // const dynMod = await import('./math.js');
  // dynMod.PI, dynMod.default, etc.
  const dynMod = mathModule; // simulated
  console.log("Dynamic PI =", dynMod.PI);
}
dynamicDemo();
