/**
 * Module 15 — 15.5 libuv Thread Pool
 * 5 × crypto.pbkdf2 with 4 pool threads: 4 finish together, the 5th waits
 * for a free thread before it even starts its work.
 *
 * Run: node 04-thread-pool.js   (~1-2s)
 */

const crypto = require("node:crypto");
const os = require("node:os");

console.log(`CPU cores: ${os.cpus().length} | default UV_THREADPOOL_SIZE: 4`);
console.log("(set UV_THREADPOOL_SIZE before any pool work to change it)\n");

const WORK = 400_000; // pbkdf2 iterations — enough to take a few hundred ms per call
const STARTED = new Map(); // idx -> timestamp when the call was queued
const done = [];

for (let i = 0; i < 5; i++) {
  STARTED.set(i, Date.now());
  crypto.pbkdf2("secret", `salt-${i}`, WORK, 64, "sha512", (err, key) => {
    if (err) throw err;
    const elapsed = Date.now() - STARTED.get(i);
    done.push({ i, elapsed });
    console.log(`   pbkdf2 #${i} completed after ${elapsed}ms of pool time`);
    if (done.length === 5) summarize();
  });
}

function summarize() {
  console.log("\nWhy this shape:");
  console.log("  • 4 threads share the pool -> #0-#3 start immediately and finish nearly together.");
  console.log("  • #4 was queued behind them -> its clock only starts when a thread is free.");
  console.log("  • Every pool API (fs, zlib, dns.lookup, pbkdf2) competes for the same 4 threads.");
  const totals = done.map((d) => d.elapsed);
  console.log(`  • Fastest: ${Math.min(...totals)}ms | Slowest (the 5th): ${Math.max(...totals)}ms`);
  console.log("  • Restart with UV_THREADPOOL_SIZE=8 node 04-thread-pool.js to see #4 join the pack.");
}