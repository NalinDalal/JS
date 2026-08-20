/**
 * Module 15 — 15.2/15.3 Event Loop Order + nextTick vs Promise vs Macrotask
 * The classic ordering demo. Comments explain WHY each line prints where it does.
 *
 * Run: node 02-event-loop-order.js
 */

const fs = require("node:fs");

console.log("1. start             (sync code, always first)");

// --- Scheduled in the MAIN module (before the loop has any phases visited) ---
process.nextTick(() => console.log("2. top-level nextTick   (runs right after EVERY callback, before promises)"));
Promise.resolve().then(() => console.log("3. top-level Promise    (microtask, after nextTick)"));

// setTimeout(0) -> timers phase; setImmediate -> check phase.
setImmediate(() => console.log("4. top-level setImmediate (check phase — wins the 0ms race on most machines, but see 03)"));
setTimeout(() => console.log("5. top-level setTimeout(0) (timers phase — can beat check in some runs)"));

// fs.readFile completes on the libuv thread pool, queued for the POLL phase.
fs.readFile(__filename, () => {
  console.log("6. fs.readFile callback  (POLL phase — I/O completion)");

  // Inside an I/O callback the ordering is GUARANTEED:
  process.nextTick(() => console.log("7. nextTick inside I/O   (microtask drain, before anything else)"));
  Promise.resolve().then(() => console.log("8. Promise inside I/O   (microtask, right after nextTick)"));

  // timers phase comes BEFORE check in the NEXT iteration...
  setTimeout(() => console.log("9. setTimeout inside I/O  (next iteration's timers phase)"), 0);
  // ...so the check phase of THIS iteration fires first. setImmediate always wins here.
  setImmediate(() => console.log("10. setImmediate inside I/O (SAME iteration's check phase — wins)"));
});

console.log("11. end                (synchronous tail)");

// Expected output (top-level 4/5 may swap, everything else is deterministic):
//   1, 11, 2, 3, [4|5 race], 6, 7, 8, 10, 9
// Why? Microtasks drain after every callback; an I/O callback sits in poll,
// so check (setImmediate) fires before the next timers phase (setTimeout).
// Run it a few times: rows 4 and 5 shuffle, rows 7-10 never do.