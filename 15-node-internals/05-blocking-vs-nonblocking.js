/**
 * Module 15 — 15.6 Blocking vs Non-Blocking
 * Timing comparison: async fs.readFile lets timers run; readFileSync stalls
 * every timer and callback in the process for its whole duration.
 *
 * Run: node 05-blocking-vs-nonblocking.js
 */

const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

// Build a 32MB scratch file so the sync read takes measurable time.
const bigPath = path.join(os.tmpdir(), "node-internals-15-big.bin");
const bigData = Buffer.alloc(32 * 1024 * 1024, 0x61);
fs.writeFileSync(bigPath, bigData);
console.log(`scratch file: ${bigPath} (${(bigData.length / 1024 / 1024) | 0}MB)\n`);

const t0 = Date.now();

// ---- 1) NON-BLOCKING: readFile with a callback ----
// A 0ms timer is scheduled FIRST. Because async I/O runs on the libuv thread
// pool, the loop keeps turning and the timer fires while the read is pending.
fs.readFile(bigPath, () => {
  console.log(`   [async] read completed at +${Date.now() - t0}ms (loop stayed alive)`);
});
setTimeout(() => {
  console.log(`   [async] 0ms timer fired at +${Date.now() - t0}ms — the 32MB read was still in flight`);
  console.log("   (async I/O hands the work to the thread pool; the main thread never waits)");

  // ---- 2) BLOCKING: the same work, synchronously ----
  // A 0ms timer is scheduled again — and by the time it can fire, we are done.
  setTimeout(() => {
    console.log(`   [sync] the 0ms timer scheduled BEFORE readFileSync fired at +${Date.now() - t0}ms`);
    console.log("   -> it waited out the entire sync read: one thread, one job at a time.");
    fs.unlinkSync(bigPath);
    console.log("\nLesson: async I/O leaves the loop responsive; sync I/O freezes ALL callbacks.");
    console.log("Never use readFileSync / dns.lookupSync / pbkdf2Sync in a server request path.");
  }, 0);

  const t1 = Date.now();
  console.log("\nBLOCKING readFileSync starts (a 0ms timer is pending above, ready to fire)...");
  const buf = fs.readFileSync(bigPath); // hijacks the only JS thread for its duration
  let checksum = 0;
  for (const b of buf) checksum += b; // two extra passes to keep the main thread busy
  for (const b of buf) checksum += b;
  console.log(`   [sync] readFileSync + 2 passes returned after ${Date.now() - t1}ms (checksum ${checksum})`);
}, 0);