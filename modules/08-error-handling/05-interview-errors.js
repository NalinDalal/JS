/**
 * Module 08 — Interview Questions
 * TypeError vs ReferenceError, custom error, async errors, guard clause
 *
 * Run: node 05-interview-errors.js
 */

// ============================================================
// Q1: TypeError vs ReferenceError
// ============================================================
console.log("--- Q1: TypeError vs ReferenceError ---");

// TypeError — variable exists, wrong operation
let x = "hello";
try { x.foo(); } catch (e) {
  console.log("TypeError:", e.name); // TypeError
}

// ReferenceError — variable doesn't exist
try { console.log(y); } catch (e) {
  console.log("ReferenceError:", e.name); // ReferenceError
}

// ============================================================
// Q2: Custom error (InsufficientFundsError)
// ============================================================
console.log("\n--- Q2: Custom error ---");
class InsufficientFundsError extends Error {
  constructor(balance, amount) {
    super(`Cannot withdraw ${amount}, balance is ${balance}`);
    this.balance = balance;
    this.amount = amount;
    this.name = "InsufficientFundsError";
  }
}

function withdraw(balance, amount) {
  if (amount > balance) {
    throw new InsufficientFundsError(balance, amount);
  }
  return balance - amount;
}

try {
  withdraw(100, 200);
} catch (e) {
  if (e instanceof InsufficientFundsError) {
    console.log("Insufficient funds:", e.message);
    console.log("Balance:", e.balance, "Amount:", e.amount);
  }
}

// ============================================================
// Q3: Async error handling
// ============================================================
console.log("\n--- Q3: Async error handling ---");

// 1. async/await with try/catch
async function fetchData() {
  try {
    const res = await fetch("/api/data");
    const data = await res.json();
    return data;
  } catch (e) {
    console.error("Failed:", e.message);
    return null;
  }
}
console.log("(fetchData defined — call with fetchData() to test)");

// 2. Promise chain with .catch
// fetch("/api/data")
//   .then(res => res.json())
//   .catch(e => console.error("Failed:", e));

// 3. Global handler for uncaught
// window.addEventListener("unhandledrejection", (e) => {
//   console.error("Unhandled:", e.reason);
// });

console.log("\nKey rule: Never leave promises without .catch or try/catch with await");

// ============================================================
// Q4: Guard clause comparison
// ============================================================
console.log("\n--- Q4: Guard clause ---");

// WITHOUT guards — nested
function processOrderNested(order) {
  if (order !== null) {
    if (order.items !== undefined) {
      if (order.items.length > 0) {
        return order.items.reduce((sum, i) => sum + i.price, 0);
      }
    }
  }
  return 0;
}

// WITH guards — flat
function processOrder(order) {
  if (!order) return 0;
  if (!order.items) return 0;
  if (order.items.length === 0) return 0;
  return order.items.reduce((sum, i) => sum + i.price, 0);
}

console.log("With guards:", processOrder({ items: [{ price: 10 }, { price: 20 }] })); // 30
console.log("With guards (null):", processOrder(null)); // 0
