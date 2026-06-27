/**
 * Module 03 — 3.3 Prototype Chain
 * Object.create, prototype chain, property lookup
 *
 * Run: node 03-prototype-chain.js
 */

// --- Basic prototype chain ---
console.log("--- Basic prototype chain ---");
const animal = { eats: true };
const rabbit = Object.create(animal);
rabbit.jumps = true;

console.log(rabbit.eats); // true (inherited from animal)
console.log(rabbit.jumps); // true (own property)
console.log(Object.getPrototypeOf(rabbit) === animal); // true

// --- Property lookup through chain ---
console.log("\n--- Property lookup ---");
const grandparent = { family: "Smith" };
const parent = Object.create(grandparent);
parent.job = "Engineer";
const child = Object.create(parent);
child.age = 25;

console.log(child.age); // 25 (own)
console.log(child.job); // "Engineer" (parent)
console.log(child.family); // "Smith" (grandparent)
console.log(child.unknown); // undefined (not found)

// --- Object.create with methods ---
console.log("\n--- Object.create with methods ---");
const base = {
  greet() {
    return `Hi, I'm ${this.name}`;
  },
};

const user = Object.create(base);
user.name = "Charlie";
console.log(user.greet()); // "Hi, I'm Charlie"

// --- Truly empty object (no prototype) ---
console.log("\n--- Object.create(null) ---");
const bare = Object.create(null);
console.log(bare.toString); // undefined (no inherited methods)

// --- Prototype chain with constructor ---
console.log("\n--- Constructor prototype chain ---");
function Person(name) {
  this.name = name;
}
Person.prototype.greet = function () {
  return `Hi, I'm ${this.name}`;
};

const alice = new Person("Alice");

console.log(Object.getPrototypeOf(alice) === Person.prototype); // true
console.log(Object.getPrototypeOf(Person.prototype) === Object.prototype); // true
console.log(Object.getPrototypeOf(Object.prototype) === null); // true

// hasOwnProperty vs in
console.log(alice.hasOwnProperty("name")); // true (own)
console.log(alice.hasOwnProperty("greet")); // false (inherited)
console.log("greet" in alice); // true (own or inherited)

// --- Expected Output ---
// --- Basic prototype chain ---
// true
// true
// true
//
// --- Property lookup ---
// 25
// Engineer
// Smith
// undefined
//
// --- Object.create with methods ---
// Hi, I'm Charlie
//
// --- Object.create(null) ---
// undefined
//
// --- Constructor prototype chain ---
// true
// true
// true
// true
// false
// true
