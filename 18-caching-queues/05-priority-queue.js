/**
 * Module 18 — 18.8 Queue Semantics: FIFO vs Priority
 * A plain array is FIFO (first-in, first-out). A priority queue re-sorts by
 * priority so urgent work jumps the line. Array.prototype.sort is stable in
 * modern engines, so equal-priority jobs still run in insertion order.
 *
 * Run: node 05-priority-queue.js
 */

class PriorityQueue {
  constructor() {
    this.items = []; // [{ item, priority }]
  }
  push(item, priority) {
    this.items.push({ item, priority });
    this.items.sort((a, b) => b.priority - a.priority); // higher priority first
  }
  pop() {
    const top = this.items.shift();
    return top ? top.item : undefined;
  }
  get size() {
    return this.items.length;
  }
}

// name, priority (higher = more urgent)
const jobs = [
  ["render-thumbnail", 1],
  ["send-welcome-email", 2],
  ["purge-old-rows", 0],
  ["charge-credit-card", 5],
  ["send-newsletter", 0],
];

console.log("=== FIFO (plain array) -- processed in push order ===");
for (const [name] of jobs) console.log("  processed:", name);

console.log("\n=== Priority queue -- highest priority first, FIFO within equal priority ===");
const pq = new PriorityQueue();
for (const [name, priority] of jobs) pq.push(name, priority);
while (pq.size > 0) console.log("  processed:", pq.pop());

console.log("\nTakeaway: charge-credit-card (5) jumps the line; the two 0-priority");
console.log("jobs still run in insertion order thanks to sort() stability.");