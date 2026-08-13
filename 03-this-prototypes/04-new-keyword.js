/**
 * Module 03 — 3.4 The `new` Keyword
 * Constructor, new, manual myNew, constructor return
 *
 * Run: node 04-new-keyword.js
 */

// --- Basic new ---
console.log("--- Basic new ---");
function User(name) {
  this.name = name;
}
User.prototype.sayHi = function () {
  return `Hi, I'm ${this.name}`;
};

const bob = new User("Bob");
console.log(bob.sayHi()); // "Hi, I'm Bob"
console.log(bob instanceof User); // true

// --- Manual implementation of `new` ---
console.log("\n--- Manual myNew ---");
function myNew(Constructor, ...args) {
  const obj = Object.create(Constructor.prototype); // Step 1 + 2
  const result = Constructor.apply(obj, args); // Step 3
  return result instanceof Object ? result : obj; // Step 4
}

const carol = myNew(User, "Carol");
console.log(carol.sayHi()); // "Hi, I'm Carol"
console.log(carol instanceof User); // true

// --- Constructor returning an object ---
console.log("\n--- Constructor returning object ---");
function Weird() {
  this.a = 1;
  return { b: 2 }; // returns this object instead
}

const w = new Weird();
console.log(w); // { b: 2 }
console.log(w.a); // undefined

// --- Constructor returning a primitive (ignored) ---
console.log("\n--- Constructor returning primitive ---");
function AlsoWeird() {
  this.a = 1;
  return 42; // primitive — ignored
}

const aw = new AlsoWeird();
console.log(aw); // { a: 1 }

// --- Expected Output ---
// --- Basic new ---
// Hi, I'm Bob
// true
//
// --- Manual myNew ---
// Hi, I'm Carol
// true
//
// --- Constructor returning object ---
// { b: 2 }
// undefined
//
// --- Constructor returning primitive ---
// { a: 1 }
