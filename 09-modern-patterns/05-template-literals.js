/**
 * Module 09 — 9.5 Template Literals
 * Backtick strings, interpolation, tagged templates
 *
 * Run: node 05-template-literals.js
 */

console.log("--- Basic template literals ---");
const name = "Alice";
const age = 30;
const greeting = `Hello, ${name}! You are ${age} years old.`;
console.log("greeting:", greeting); // "Hello, Alice! You are 30 years old."

console.log("\n--- Multi-line strings ---");
const multi = `
  <div>
    <h1>${name}</h1>
    <p>Age: ${age}</p>
  </div>
`;
console.log("Multi-line:");
console.log(multi);

console.log("\n--- Expressions inside ${} ---");
const a = 10, b = 5;
console.log(`${a} + ${b} = ${a + b}`); // "10 + 5 = 15"
console.log(`Random: ${Math.random().toFixed(2)}`);

console.log("\n--- Tagged templates ---");
function highlight(strings, ...values) {
  return strings.reduce((result, str, i) => {
    const value = values[i] ? `<b>${values[i]}</b>` : "";
    return result + str + value;
  }, "");
}

const product = "Laptop";
const price = 999;
const result = highlight`Product: ${product} costs $${price}`;
console.log("highlight:", result); // "Product: <b>Laptop</b> costs $<b>999</b>"

console.log("\n--- Raw strings (String.raw) ---");
const raw1 = "Hello\nWorld";   // newline
const raw2 = String.raw`Hello\nWorld`; // literal \n
console.log("normal:", raw1);
console.log("String.raw:", raw2); // "Hello\\nWorld"

// Custom tag using raw
function rawTag(strings) {
  return strings.raw[0]; // unprocessed raw string
}
console.log("custom raw:", rawTag`Hello\nWorld`); // "Hello\\nWorld"

console.log("\n--- Nesting templates ---");
const items = ["Apple", "Banana", "Cherry"];
const html = `
  <ul>
    ${items.map(item => `      <li>${item}</li>`).join("\n")}
  </ul>
`;
console.log(html);
