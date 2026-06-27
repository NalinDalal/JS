/**
 * Module 05 — 5.4 Symbols
 * Creating, global registry, object keys, well-known symbols
 *
 * Run: node 04-symbols.js
 */

// --- Creating Symbols ---
console.log("--- Creating Symbols ---");
const sym1 = Symbol();
const sym2 = Symbol("description"); // description is for debugging only

console.log(sym1 === sym2); // false — always unique
console.log(Symbol("foo") === Symbol("foo")); // false

console.log(String(sym1)); // "Symbol()"
console.log(String(sym2)); // "Symbol(description)"

// --- Global Symbol Registry ---
console.log("\n--- Global Symbol Registry ---");
const s1 = Symbol.for("shared");
const s2 = Symbol.for("shared");
console.log(s1 === s2); // true — same global symbol

console.log(Symbol.keyFor(s1)); // "shared"
console.log(Symbol.keyFor(Symbol("test"))); // undefined (not global)

// --- Symbols as Object Keys ---
console.log("\n--- Symbols as Object Keys ---");
const ID = Symbol("id");
const NAME = Symbol("name");

const user = {
  [ID]: 123,
  [NAME]: "Alice",
  age: 30
};

console.log(user[ID]);   // 123
console.log(user[NAME]); // "Alice"
console.log(user.id);    // undefined (not accessible via string)
console.log(user["id"]); // undefined

// Object.keys() and for...in don't include symbol keys
console.log(Object.keys(user));        // ["age"]
console.log(Object.getOwnPropertySymbols(user)); // [Symbol(id), Symbol(name)]
console.log(Reflect.ownKeys(user));    // ["age", Symbol(id), Symbol(name)]

// --- Well-Known Symbols ---
console.log("\n--- Well-Known Symbols ---");

// Symbol.toPrimitive
class Money {
  constructor(amount) { this.amount = amount; }
  [Symbol.toPrimitive](hint) {
    switch (hint) {
      case "number": return this.amount;
      case "string": return `$${this.amount}`;
      default: return this.amount;
    }
  }
}

const price = new Money(99);
console.log(+price);     // 99 (number hint)
console.log(`${price}`); // "$99" (string hint)
console.log(price + 1);  // 100 (default hint)

// Symbol.toStringTag
class Validator {
  get [Symbol.toStringTag]() { return "Validator"; }
}

const v = new Validator();
console.log(Object.prototype.toString.call(v)); // "[object Validator]"

// --- Practical: Private-like properties ---
console.log("\n--- Private-like properties ---");
const _privateData = Symbol("private");

class User {
  constructor(name) {
    this.name = name;
    this[_privateData] = { password: "secret123" };
  }

  checkPassword(pwd) {
    return this[_privateData].password === pwd;
  }
}

const user2 = new User("Alice");
console.log(user2.name); // "Alice"
console.log(user2.checkPassword("secret123")); // true
console.log(user2[_privateData]); // { password: "secret123" } (only if you have the Symbol)

// Symbol as unique constants
const STATUS = {
  LOADING: Symbol("loading"),
  SUCCESS: Symbol("success"),
  ERROR: Symbol("error")
};

function handleStatus(status) {
  switch (status) {
    case STATUS.LOADING: return "Loading...";
    case STATUS.SUCCESS: return "Done!";
    case STATUS.ERROR: return "Failed!";
    default: return "Unknown";
  }
}

console.log(handleStatus(STATUS.LOADING)); // "Loading..."
console.log(handleStatus(STATUS.SUCCESS)); // "Done!"
console.log(handleStatus(STATUS.ERROR));   // "Failed!"
