/**
 * Module 09 — 9.7 Date & Time
 * Date constructor, methods, Intl.DateTimeFormat, date math, Temporal
 *
 * Run: node 07-date-time.js
 */

console.log("--- Date creation ---");
const now = new Date();
console.log("now:", now);

const specific = new Date(2024, 0, 15, 10, 30, 0); // month is 0-indexed!
console.log("Jan 15, 2024 10:30:", specific);

const fromString = new Date("2024-01-15T10:30:00");
console.log("from ISO string:", fromString);

const fromMs = new Date(0); // epoch: Jan 1, 1970 UTC
console.log("epoch:", fromMs);
console.log("+1 hour:", new Date(3600000)); // Jan 1, 1970 01:00 UTC

console.log("\n--- Getting values (local time) ---");
const d = new Date(2024, 5, 15, 14, 30, 45);
console.log("getFullYear():", d.getFullYear());      // 2024
console.log("getMonth():", d.getMonth());             // 5 (June)
console.log("getDate():", d.getDate());               // 15
console.log("getDay():", d.getDay());                 // 6 (Saturday)
console.log("getHours():", d.getHours());             // 14
console.log("getMinutes():", d.getMinutes());         // 30
console.log("getSeconds():", d.getSeconds());         // 45

console.log("\n--- UTC methods ---");
console.log("getUTCHours():", d.getUTCHours());      // depends on timezone

console.log("\n--- Timestamps ---");
console.log("getTime():", d.getTime());           // ms since epoch
console.log("Date.now():", Date.now());           // current ms
console.log("+d:", +d);                          // same as getTime()

console.log("\n--- Date formatting ---");
// toISOString()
console.log("toISOString():", d.toISOString()); // "2024-06-15T18:30:45.000Z"

// toLocaleString with options
console.log("toLocaleDateString():", d.toLocaleDateString("en-US", {
  weekday: "long",   // "Saturday"
  year: "numeric",   // 2024
  month: "long",     // "June"
  day: "numeric",    // 15
}));

console.log("\n--- Intl.DateTimeFormat (preferred) ---");
const formatter = new Intl.DateTimeFormat("en-GB", {
  dateStyle: "full",
  timeStyle: "short",
  timeZone: "America/New_York",
});
console.log("formatter.format(d):", formatter.format(d));

console.log("\n--- Date math ---");
const future = new Date(d);
future.setDate(future.getDate() + 7); // +7 days
console.log("+7 days:", future);

// Month math (handle overflow correctly?)
const nextMonth = new Date(d);
nextMonth.setMonth(nextMonth.getMonth() + 1);
console.log("+1 month:", nextMonth);

// Time difference
const diff = future.getTime() - d.getTime();
console.log("diff in ms:", diff);
console.log("diff in days:", diff / (1000 * 60 * 60 * 24)); // 7

console.log("\n--- Temporal (future proposal) ---");
// Temporal is a Stage 3 proposal for modern date/time handling
// Not available in Node.js without polyfill
// import { Temporal } from "@js-temporal/polyfill";
console.log("Temporal.PlainDate, PlainTime, ZonedDateTime — see tc39/proposal-temporal");
