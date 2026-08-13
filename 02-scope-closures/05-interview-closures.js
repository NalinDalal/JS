/**
 * Module 02 — Interview Questions
 * makeGreeter, TDZ, var/let loop, private variables, scope chain, IIFE
 *
 * Run: node 05-interview-closures.js
 */

// ============================================================
// Q1: What is a closure? — makeGreeter
// ============================================================
console.log("--- Q1: Closure (makeGreeter) ---");
function makeGreeter(greeting) {
  return function (name) {
    return `${greeting}, ${name}!`;
  };
}
const hello = makeGreeter("Hello");
console.log(hello("Alice")); // "Hello, Alice!" — closure over `greeting`

// ============================================================
// Q2: What is TDZ?
// ============================================================
console.log("\n--- Q2: TDZ ---");
{
  // TDZ starts here for x
  try {
    x; // ReferenceError
  } catch (e) {
    console.log("In TDZ");
  }
  let x = 5; // TDZ ends here
  console.log(x); // 5
}

// ============================================================
// Q3: var vs let in for-loop with setTimeout
// ============================================================
console.log("\n--- Q3: var vs let in loop ---");
for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log("var:", i), 100);
}
// var: 3, var: 3, var: 3

for (let j = 0; j < 3; j++) {
  setTimeout(() => console.log("let:", j), 100);
}
// let: 0, let: 1, let: 2

// ============================================================
// Q4: Private variables — module pattern + class with #
// ============================================================
console.log("\n--- Q4: Private variables ---");
// Module pattern
function createAccount(balance) {
  return {
    deposit(amount) {
      balance += amount;
    },
    getBalance() {
      return balance;
    },
    // balance is private — inaccessible from outside
  };
}

const acct = createAccount(100);
acct.deposit(50);
console.log("Module pattern balance:", acct.getBalance()); // 150

// Modern: private class fields
class Account {
  #balance;
  constructor(balance) {
    this.#balance = balance;
  }
  deposit(amount) {
    this.#balance += amount;
  }
  getBalance() {
    return this.#balance;
  }
}

const acc = new Account(200);
acc.deposit(100);
console.log("Class # balance:", acc.getBalance()); // 300

// ============================================================
// Q5: Scope chain with nested example
// ============================================================
console.log("\n--- Q5: Scope chain ---");
const a = 1;
function outerFn() {
  const b = 2;
  function middle() {
    const c = 3;
    function inner() {
      console.log(a + b + c); // 6 — resolved via scope chain
    }
    inner();
  }
  middle();
}
outerFn();

// ============================================================
// Q6: IIFE returning computed value
// ============================================================
console.log("\n--- Q6: IIFE ---");
const result = (function () {
  const data = [1, 2, 3];
  return data.map((x) => x * 2);
})();
console.log(result); // [2, 4, 6]

// --- Expected Output ---
// --- Q1: Closure (makeGreeter) ---
// Hello, Alice!
//
// --- Q2: TDZ ---
// In TDZ
// 5
//
// --- Q3: var vs let in loop ---
// --- Q4: Private variables ---
// Module pattern balance: 150
// Class # balance: 300
//
// --- Q5: Scope chain ---
// 6
//
// --- Q6: IIFE ---
// [ 2, 4, 6 ]
//
// (setTimeout outputs appear after ~100ms)
// var: 3
// var: 3
// var: 3
// let: 0
// let: 1
// let: 2
