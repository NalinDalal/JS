/**
 * Module 02 — 2.5 Module Pattern
 * Classic IIFE module, revealing module, private state
 *
 * Run: node 04-module-pattern.js
 */

// --- Classic Module Pattern ---
console.log("--- Classic Module Pattern ---");
var Calculator = (function () {
  var result = 0; // private

  return {
    add: function (a, b) {
      result = a + b;
      return result;
    },
    getResult: function () {
      return result;
    },
  };
})();

Calculator.add(5, 3);
console.log(Calculator.getResult()); // 8
// Calculator.result is undefined — private via closure

// --- Revealing Module Pattern ---
console.log("\n--- Revealing Module Pattern ---");
var BankAccount = (function () {
  var balance = 0; // private

  function deposit(amount) {
    if (amount > 0) balance += amount;
  }

  function withdraw(amount) {
    if (amount > 0 && amount <= balance) balance -= amount;
  }

  function getBalance() {
    return balance;
  }

  return {
    deposit: deposit,
    withdraw: withdraw,
    getBalance: getBalance,
  };
})();

BankAccount.deposit(100);
BankAccount.withdraw(30);
console.log(BankAccount.getBalance()); // 70

// --- UserModule with private name ---
console.log("\n--- UserModule (private name) ---");
var UserModule = (function () {
  var name = "Alice"; // private

  function setName(newName) {
    if (typeof newName === "string") {
      name = newName;
    }
  }

  function getName() {
    return name;
  }

  return { setName, getName };
})();

console.log(UserModule.getName()); // "Alice"
UserModule.setName("Bob");
console.log(UserModule.getName()); // "Bob"
// UserModule.name is undefined — private via closure

// --- Expected Output ---
// --- Classic Module Pattern ---
// 8
//
// --- Revealing Module Pattern ---
// 70
//
// --- UserModule (private name) ---
// Alice
// Bob
