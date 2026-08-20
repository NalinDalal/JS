/**
 * Module 15 — 15.9 Streams (Readable/Writable/Transform) + Backpressure
 * Part 1: Readable.from -> Transform (uppercase) -> Writable (stdout) via pipe,
 *         which manages backpressure automatically.
 * Part 2: a manual backpressure demo: write() returns false when the sink's
 *         internal buffer is saturated, and 'drain' says "write more".
 *
 * Run: node 08-streams.js
 */

const { Readable, Transform, Writable } = require("node:stream");

// ---- Part 1: the pipeline ----
const source = Readable.from(["node ", "streams ", "are ", "chunked\n"]);
let bytes = 0;

const upper = new Transform({
  transform(chunk, _enc, cb) {
    cb(null, chunk.toString().toUpperCase()); // chunk in -> transformed chunk out
  },
});

const sink = new Writable({
  write(chunk, _enc, cb) {
    process.stdout.write(chunk); // print as it arrives
    bytes += chunk.length;
    cb(); // we consumed it — pipe proceeds immediately
  },
});

// pipe() performs chunk-wise flow AND backpressure: if `sink` ever returns
// false, `upper` (and its source) are paused automatically until drain.
source.pipe(upper).pipe(sink).on("finish", () => {
  console.log(`\n[pipeline done — ${bytes} bytes written]`);
  backpressureDemo();
});

// ---- Part 2: manual backpressure ----
function backpressureDemo() {
  console.log("\n== manual backpressure demo ==");
  // A deliberately slow sink: 50ms per tiny chunk, 16-byte highWaterMark
  // (default is 16KB) so the buffer fills almost instantly.
  const slow = new Writable({
    highWaterMark: 16,
    write(chunk, _enc, cb) {
      setTimeout(() => {
        console.log(`   sink consumed ${chunk.length}B (${chunk.toString()})`);
        cb();
      }, 50);
    },
  });

  let written = 0;
  let drains = 0;
  const TOTAL = 6;
  slow.on("drain", () => {
    drains++;
    console.log(`   'drain' fired (#${drains}) — buffer below highWaterMark, resume writing`);
    writeLoop();
  });
  slow.on("finish", () => {
    console.log(`\n[sink finished: ${written} chunks written, ${drains} drains — no memory blown up]`);
    console.log("Takeaway: check write()'s return value; on false, wait for 'drain' instead of buffering forever.");
  });

  function writeLoop() {
    let ok = true;
    while (written < TOTAL && ok) {
      const chunk = Buffer.from(`chunk-${written++}`);
      ok = slow.write(chunk); // false = internal buffer is full
      if (!ok) console.log(`   write() returned false after ${written} writes (buffer full)`);
    }
    if (written >= TOTAL) slow.end();
  }
  writeLoop();
  // Note: with a 16-byte buffer, every chunk returns false → we write one per
  // drain cycle, exactly like a slow network client. That is backpressure.
}