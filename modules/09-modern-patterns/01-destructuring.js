/**
 * Module 09 — 9.1 Destructuring
 * Array destructuring, object destructuring, nested, defaults, rest in destructuring
 *
 * Run: node 01-destructuring.js
 */

console.log("--- Array destructuring ---");
const rgb = [255, 127, 0];
const [r, g, b] = rgb;
console.log(r, g, b); // 255 127 0

// Skip elements, rest
const [first, , third] = rgb;
console.log(first, third); // 255 0

const [head, ...tail] = rgb;
console.log(head, tail); // 255 [127, 0]

// Default values
const [a = 0, , , d = 100] = rgb;
console.log(a, d); // 255 100 (d gets default)

console.log("\n--- Object destructuring ---");
const user = { name: "Alice", age: 30, city: "NYC" };
const { name, age } = user;
console.log(name, age); // Alice 30

// Rename
const { name: fullName, city: location } = user;
console.log(fullName, location); // Alice NYC

// Defaults
const { country = "USA" } = user;
console.log(country); // USA

console.log("\n--- Nested destructuring ---");
const response = {
  status: 200,
  data: { user: { id: 1, name: "Alice" }, meta: { page: 1 } },
};
const { data: { user: { name: userName }, meta: { page } } } = response;
console.log(userName, page); // Alice 1

console.log("\n--- Function parameter destructuring ---");
function printUser({ name, age, city = "Unknown" }) {
  console.log(`${name} (${age}) — ${city}`);
}
printUser(user); // Alice (30) — NYC

// Array of objects
const users = [
  { id: 1, name: "Alice" },
  { id: 2, name: "Bob" },
];
users.forEach(({ id, name }) => console.log(`#${id}: ${name}`));

console.log("\n--- Swapping variables ---");
let x = 1, y = 2;
[x, y] = [y, x];
console.log(x, y); // 2 1
