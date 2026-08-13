/**
 * Module 07 — 7.4 Events Basics
 * addEventListener, event object, propagation (bubbling/capturing), preventDefault
 *
 * Paste in browser DevTools console to run.
 */

console.log("--- addEventListener ---");
const btn = document.getElementById("myButton");
if (btn) {
  btn.addEventListener("click", function handler(event) {
    console.log("Event type:", event.type);        // "click"
    console.log("Target:", event.target);            // element clicked
    console.log("Current target:", event.currentTarget); // listener attached to
  });
  // Remove listener later: btn.removeEventListener("click", handler);
}

console.log("\n--- Event propagation: bubbling (default) ---");
// Structure: div#outer > div#inner
const outer = document.querySelector("#outer");
const inner = document.querySelector("#inner");
if (outer && inner) {
  outer.addEventListener("click", () => console.log("outer"));
  inner.addEventListener("click", (e) => {
    console.log("inner");
    // e.stopPropagation(); // prevents bubbling to outer
    // e.stopImmediatePropagation(); // also prevents other listeners on same element
  });
  // Clicking inner: logs "inner" then "outer" (bubbles up)
}

console.log("\n--- Capturing phase ---");
if (outer) {
  outer.addEventListener("click", () => console.log("outer capture"), true);
  // third argument true means capture phase
  // Clicking inner: "outer capture" → "inner" → "outer"
}

console.log("\n--- preventDefault ---");
const link = document.querySelector("a");
if (link) {
  link.addEventListener("click", (e) => {
    e.preventDefault(); // stops default navigation
    console.log("Link clicked, navigation prevented");
    // e.defaultPrevented === true
  });
}

console.log("\n--- Once option ---");
if (btn) {
  btn.addEventListener("click", () => console.log("Runs once"), { once: true });
}

console.log("\n--- Passive option ---");
if (btn) {
  btn.addEventListener("wheel", (e) => {
    // e.preventDefault(); // ignored because passive: true
  }, { passive: true });
}
