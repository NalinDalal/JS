/**
 * Module 07 — 7.2 DOM Manipulation
 * createElement, appendChild, insertAdjacent, innerHTML vs textContent, DocumentFragment
 *
 * Paste in browser DevTools console.
 */

// --- createElement + appendChild ---
const div = document.createElement("div");
div.textContent = "Hello DOM";
document.body.appendChild(div);

// --- append (multiple) ---
const p = document.createElement("p");
p.textContent = "Paragraph";
const span = document.createElement("span");
span.textContent = "Span";
document.body.appendChild(p); // appendChild: one at a time
document.body.append(span, " Some text "); // append: multiple nodes + strings
// Node: appendChild vs append — appendChild returns the node, append does not

// --- insertAdjacentHTML/Element ---
// Positions: "beforebegin", "afterbegin", "beforeend", "afterend"
const target = document.getElementById("app");
target?.insertAdjacentHTML("beforeend", "<li>Inserted</li>");

// --- innerHTML vs textContent ---
const box = document.createElement("div");
box.innerHTML = "<b>Bold</b> <script>alert('xss')</script>";
console.log("innerHTML parses HTML:", box.innerHTML);

box.textContent = "<b>Not bold</b> <script>safe</script>";
console.log("textContent escapes:", box.textContent); // literal string

// --- DocumentFragment (batch insert) ---
const fragment = document.createDocumentFragment();
for (let i = 0; i < 100; i++) {
  const li = document.createElement("li");
  li.textContent = `Item ${i}`;
  fragment.appendChild(li);
}
// One reflow instead of 100
// document.querySelector("ul").appendChild(fragment);
console.log("Fragment has", fragment.childElementCount, "items — avoids reflows");

// --- removeChild / remove ---
const temp = document.createElement("div");
temp.id = "temp-node";
document.body.appendChild(temp);
document.body.removeChild(temp); // older API
// temp.remove(); // modern API — no parent needed

// --- cloneNode ---
const original = document.createElement("div");
original.textContent = "Original";
const shallow = original.cloneNode(false); // no children
const deep = original.cloneNode(true);     // with children
console.log("Original !== shallow:", original !== shallow); // true
