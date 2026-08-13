/**
 * Module 07 — 7.5 Events Advanced
 * Delegation, CustomEvent, event cleanup, focus/blur
 *
 * Paste in browser DevTools console.
 */

// --- Event delegation ---
// Instead of attaching one listener per button, attach to parent
document.getElementById("button-group")?.addEventListener("click", (e) => {
  const btn = e.target.closest("button");
  if (!btn) return; // ignore clicks on non-button children
  console.log("Button clicked:", btn.textContent);
});
// Delegation: one listener for all buttons in #button-group

// --- CustomEvent ---
const list = document.getElementById("todo-list");
if (list) {
  list.addEventListener("item-added", (e) => {
    console.log("Custom event fired:", e.type);
    console.log("Detail:", e.detail); // { text: "Buy milk" }
  });

  const li = document.createElement("li");
  li.textContent = "Buy milk";
  list.appendChild(li);

  li.dispatchEvent(new CustomEvent("item-added", {
    detail: { text: "Buy milk", priority: 1 },
    bubbles: true,
    cancelable: true,
  }));
}

// --- Event cleanup (AbortController) ---
const controller = new AbortController();
const { signal } = controller;

const el = document.getElementById("cleanup-target");
if (el) {
  el.addEventListener("mouseenter", () => console.log("hover"), { signal });
  el.addEventListener("mouseleave", () => console.log("leave"), { signal });
}

// Later: controller.abort() removes both listeners at once
// Pass { signal } to add listeners — abort() removes them all
// controller.abort(); // removes all listeners with this signal

// --- focus / blur (no bubbling) ---
// Focus/blur do NOT bubble — use focusin/focusout for delegation
document.addEventListener("focusin", (e) => {
  console.log("Input focused:", e.target.id);
});
// Use focusin/focusout for delegation (they bubble)

// --- window event cleanup ---
// window.addEventListener("beforeunload", (e) => {
//   e.preventDefault();
//   e.returnValue = ""; // triggers "Leave site?" dialog
// });
