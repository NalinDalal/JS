/**
 * Module 04 — 4.3 Callbacks
 * Basic callback, callback hell, error-first
 *
 * Run: node 03-callbacks.js
 */

console.log("--- Basic callback ---");
function fetchData(callback) {
  setTimeout(() => {
    callback(null, { name: "Alice" });
  }, 500);
}

fetchData((err, data) => {
  if (err) console.error(err);
  else console.log(data); // { name: "Alice" }
});

console.log("fetchData started (waiting 500ms)...");

console.log("\n--- Callback execution ordering (with fs) ---");
const fs = require("fs");

console.log("1: before readFile");
fs.readFile(__filename, "utf8", (err, data) => {
  console.log("3: inside callback (first 50 chars):", data.slice(0, 50));
});
console.log("2: after readFile");
// Output: 1 → 2 → 3

console.log("\n--- Callback Hell (pyramid of doom) ---");
// This demonstrates the pattern (nested callbacks)
function getUser(id, cb) {
  setTimeout(() => cb(null, { id, name: "Alice" }), 100);
}
function getOrders(userId, cb) {
  setTimeout(() => cb(null, [{ id: 1 }, { id: 2 }]), 100);
}
function getOrderDetails(orderId, cb) {
  setTimeout(() => cb(null, { id: orderId, total: 50 }), 100);
}

getUser(1, (err, user) => {
  if (err) return console.error(err);
  getOrders(user.id, (err, orders) => {
    if (err) return console.error(err);
    getOrderDetails(orders[0].id, (err, details) => {
      if (err) return console.error(err);
      console.log("Order details:", details);
    });
  });
});
// This is "callback hell" — nested, hard to read, error-prone

// --- Expected Output ---
// --- Basic callback ---
// fetchData started (waiting 500ms)...
// { name: "Alice" }  (after 500ms)
//
// --- Callback execution ordering (with fs) ---
// 1: before readFile
// 2: after readFile
// 3: inside callback (first 50 chars): <file content>
//
// --- Callback Hell ---
// Order details: { id: 1, total: 50 }
