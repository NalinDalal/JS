/**
 * Module 09 — 9.11 DOM Patterns & Projects
 * Draggable API, FormData API, Calendar, LeaderBoard
 * Cross-reference: 13-interview-questions.js (text bank)
 *
 * Run in browser DevTools console.
 */

// --- Draggable API ---

/*
// Make element draggable
const el = document.getElementById("drag-me");
el.draggable = true;

el.addEventListener("dragstart", (e) => {
  e.dataTransfer.setData("text/plain", el.id);
  e.dataTransfer.effectAllowed = "move";
});

el.addEventListener("dragend", (e) => {
  console.log("Dragged to:", e.clientX, e.clientY);
});

// Drop target
const target = document.getElementById("drop-zone");
target.addEventListener("dragover", (e) => e.preventDefault()); // allow drop
target.addEventListener("drop", (e) => {
  e.preventDefault();
  const id = e.dataTransfer.getData("text/plain");
  const draggedEl = document.getElementById(id);
  target.appendChild(draggedEl);
});
*/

// --- FormData API ---

/*
// Browser: new FormData(formElement)
const form = document.getElementById("myForm");
const formData = new FormData(form);

// Add/append fields
formData.append("key", "value");
formData.set("username", "alice"); // replaces existing

// Read
console.log(formData.get("username"));     // "alice"
console.log(formData.getAll("hobbies"));   // ["reading", "coding"]

// Iterate
for (const [key, value] of formData.entries()) {
  console.log(key, value);
}

// Send as multipart/form-data
// fetch("/api/upload", { method: "POST", body: formData });
// (Content-Type is set automatically by browser)
*/

// --- Calendar Project (Guided/) ---
// Logic: generate 42 days around current month
// Key: findDay(1) → pad days before; findDay(total) → pad after
// new Date(year, month, 1).getDay() → first weekday
// new Date(year, month + 1, 0).getDate() → total days

// --- LeaderBoard Project ---
// Logic: sort players by score desc, assign ranks
// Ties: same rank but skip next (1, 2, 2, 4)
// Array sort + reduce to assign ranks
