/**
 * Module 03 — Interview Questions
 * All 4 this rules, __proto__ vs prototype, bind
 *
 * Run: node 06-interview-this-prototypes.js
 */

// ============================================================
// Q1: All 4 rules of `this` in one example
// ============================================================
console.log("--- Q1: All 4 this rules ---");

function show() {
  console.log("this:", this);
}

// Rule 1: Default
show(); // global/undefined

// Rule 2: Implicit
const obj = { show };
obj.show(); // obj

// Rule 3: Explicit
show.call({ a: 1 }); // { a: 1 }

// Rule 4: new
const instance = new show(); // new object

// ============================================================
// Q2: What does `new` do internally?
// ============================================================
console.log("\n--- Q2: new internals ---");
// 1. Creates empty object {}
// 2. Sets [[Prototype]] to Constructor.prototype
// 3. Calls constructor with `this` bound to new object
// 4. Returns object (unless constructor returns non-primitive)

function Foo(name) {
  this.name = name;
}
Foo.prototype.greet = function () {
  return `Hi, ${this.name}`;
};

const bar = new Foo("bar");
console.log(bar.greet()); // "Hi, bar"
console.log(bar instanceof Foo); // true

// ============================================================
// Q3: __proto__ vs prototype
// ============================================================
console.log("\n--- Q3: __proto__ vs prototype ---");
console.log(bar.__proto__ === Foo.prototype); // true
console.log(Foo.prototype.__proto__ === Object.prototype); // true
console.log(bar.__proto__.__proto__ === Object.prototype); // true

// ============================================================
// Q4: bind with partial application
// ============================================================
console.log("\n--- Q4: bind ---");
function greet(greeting) {
  return `${greeting}, ${this.name}`;
}
const alice = greet.bind({ name: "Alice" }, "Hello");
console.log(alice()); // "Hello, Alice"

// ============================================================
// Q5: Arrow functions — lexical this
// ============================================================
console.log("\n--- Q5: Arrow lexical this ---");
const team = {
  name: "Dev",
  members: ["Alice", "Bob"],
  listMembers() {
    this.members.forEach((m) => {
      console.log(`${m} is in ${this.name}`);
    });
  },
};
team.listMembers();

// --- Expected Output ---
// --- Q1: All 4 this rules ---
// this: <global/undefined>
// this: { show: [Function: show] }
// this: { a: 1 }
// this: Foo { name: 'bar' }
//
// --- Q2: new internals ---
// Hi, bar
// true
//
// --- Q3: __proto__ vs prototype ---
// true
// true
// true
//
// --- Q4: bind ---
// Hello, Alice
//
// --- Q5: Arrow lexical this ---
// Alice is in Dev
// Bob is in Dev
