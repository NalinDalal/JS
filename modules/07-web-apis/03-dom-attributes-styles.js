/**
 * Module 07 — 7.3 Attributes, Styles, Dataset
 * getAttribute/setAttribute, className, classList, dataset, style, getComputedStyle
 *
 * Paste in browser DevTools console.
 */

console.log("--- className vs classList ---");
const el = document.getElementById("my-element");
console.log("className (string):", el?.className);

// classList methods
if (el) {
  el.classList.add("active", "highlighted");     // add one or more
  el.classList.remove("inactive");                // remove
  el.classList.toggle("dark-mode");               // toggle on/off
  el.classList.replace("old", "new");              // replace class
  console.log("contains 'active':", el.classList.contains("active")); // true
}

console.log("\n--- dataset (data-* attributes) ---");
// <div data-id="123" data-user-name="Alice"></div>
const userCard = document.querySelector('[data-id]');
console.log("dataset.id:", userCard?.dataset.id);         // "123"
console.log("dataset.userName:", userCard?.dataset.userName); // camelCase: "Alice"

// Set data attributes via dataset
if (userCard) {
  userCard.dataset.role = "admin";
  console.log("dataset.role:", userCard.dataset.role); // "admin"
}

console.log("\n--- getAttribute / setAttribute ---");
console.log("getAttribute('data-id'):", userCard?.getAttribute("data-id"));
userCard?.setAttribute("aria-label", "User card");

console.log("\n--- style property (inline) ---");
const box = document.getElementById("box");
if (box) {
  box.style.backgroundColor = "blue";
  box.style.fontSize = "16px";
  box.style.cssText = "color: red; margin: 10px"; // override all inline
  console.log("style.color:", box.style.color);
}

console.log("\n--- getComputedStyle (read actual, including CSS) ---");
const computed = getComputedStyle(box);
console.log("computed font-size:", computed.fontSize); // includes stylesheets
