/**
 * Module 03 — 3.1 The `this` Keyword (4 Rules)
 * Default, implicit, explicit, new binding + arrow lexical this
 *
 * Run: node 01-this-rules.js
 */

// ============================================================
// Rule 1: Default Binding
// ============================================================
console.log("--- Rule 1: Default Binding ---");

function nonStrict() {
  console.log("non-strict this:", typeof this);
}
nonStrict(); // global object (or undefined in strict mode)

function strict() {
  "use strict";
  console.log("strict this:", this); // undefined
}
strict();

// ============================================================
// Rule 2: Implicit Binding
// ============================================================
console.log("\n--- Rule 2: Implicit Binding ---");

const user = {
  name: "Alice",
  greet() {
    console.log(`Hello, ${this.name}`);
  },
};

user.greet(); // "Hello, Alice" — `this` is `user`

// Lost binding (common pitfall)
const greetFn = user.greet;
// greetFn(); // this = global/undefined — implicit binding lost

// ============================================================
// Rule 3: Explicit Binding (call, apply, bind)
// ============================================================
console.log("\n--- Rule 3: Explicit Binding ---");

function greet(greeting) {
  console.log(`${greeting}, ${this.name}`);
}

const person = { name: "Bob" };

greet.call(person, "Hello"); // "Hello, Bob"
greet.apply(person, ["Hi"]); // "Hi, Bob"
const bound = greet.bind(person);
bound("Hey"); // "Hey, Bob"

// ============================================================
// Rule 4: `new` Binding
// ============================================================
console.log("\n--- Rule 4: new Binding ---");

function Person(name) {
  this.name = name;
}

const alice = new Person("Alice");
console.log(alice.name); // "Alice"

// ============================================================
// Arrow Functions: Lexical `this`
// ============================================================
console.log("\n--- Arrow: Lexical this ---");

const team = {
  name: "Dev",
  members: ["Alice", "Bob"],
  listMembers() {
    this.members.forEach((m) => {
      console.log(`${m} is in ${this.name}`);
      // `this` here = team (lexical, not forEach's callback)
    });
  },
};
team.listMembers();

// ============================================================
// Prove It: regular vs arrow
// ============================================================
console.log("\n--- Prove It ---");
const obj = {
  name: "Test",
  regular() {
    console.log("regular:", this.name);
  },
  arrow: () => {
    console.log("arrow:", this.name);
  },
};

obj.regular(); // "Test" (implicit binding)
obj.arrow(); // undefined (arrow = lexical, `this` is global)

// Explicit override
obj.regular.call({ name: "Override" }); // "Override"
obj.arrow.call({ name: "Override" }); // undefined (call doesn't affect arrow fn)

// --- Expected Output ---
// --- Rule 1: Default Binding ---
// non-strict this: object
// strict this: undefined
//
// --- Rule 2: Implicit Binding ---
// Hello, Alice
//
// --- Rule 3: Explicit Binding ---
// Hello, Bob
// Hi, Bob
// Hey, Bob
//
// --- Rule 4: new Binding ---
// Alice
//
// --- Arrow: Lexical this ---
// Alice is in Dev
// Bob is in Dev
//
// --- Prove It ---
// regular: Test
// arrow: undefined
// regular: Override
// arrow: undefined
