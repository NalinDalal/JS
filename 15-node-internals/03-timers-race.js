/**
 * Module 15 — 15.4 setImmediate vs setTimeout(0)
 * The race outside I/O, and the guaranteed winner inside an I/O callback.
 *
 * Run: node 03-timers-race.js
 */

const fs = require("node:fs");

// ---- Race 1: both scheduled at the TOP LEVEL of a script (no I/O yet) ----
// Non-deterministic by design: the OS timer may or may not have expired by the
// time the loop reaches the check phase. Run this file several times.
console.log("Race 1 — top level (outside I/O): result is a coin flip");
setImmediate(() => console.log("   [top] setImmediate fired (check phase, same iteration)"));
setTimeout(() => console.log("   [top] setTimeout(0) fired (timers phase)"), 0);

// ---- Race 2: both scheduled INSIDE an fs.readFile callback ----
// The callback runs in the POLL phase. The check phase (setImmediate) comes
// next in THIS iteration; the new timeout can only fire in the NEXT timers
// phase. Result: setImmediate wins 100% of the time. Guaranteed.
fs.readFile(__filename, () => {
  console.log("\nRace 2 — inside fs.readFile callback (poll phase): setImmediate ALWAYS wins");
  setImmediate(() => console.log("   [inside] setImmediate fired  -> check phase, same iteration"));
  setTimeout(() => console.log("   [inside] setTimeout(0) fired  -> timers phase, NEXT iteration"), 0);
});

// Why the difference? Timeline for race 2:
//   iteration N:  timers(empty) -> poll(fs callback runs, schedules both)             
//   iteration N:  check -> setImmediate fires        [winner!]                         
//   iteration N+1: timers -> setTimeout fires                                          
// The 0ms deadline is irrelevant: phases, not deadlines, dictate the order.