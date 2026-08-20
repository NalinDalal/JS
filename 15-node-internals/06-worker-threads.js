/**
 * Module 15 — 15.7 worker_threads: True JS Parallelism
 * Main thread + one worker computing a heavy sum in parallel. The main thread
 * keeps running (its timers fire) while the worker grinds through pure JS —
 * something the libuv thread pool can NOT do (the pool runs C, not JS).
 *
 * Run: node 06-worker-threads.js
 */

const { Worker, parentPort, workerData } = require("node:worker_threads");

if (parentPort === null) {
  // ====================== MAIN THREAD ======================
  const N = 2_000_000_000; // 2 billion loop iterations in the worker (~1s of JS)
  console.log(`[main ${process.pid}] spawning a worker to sum 1..${N}...`);

  const worker = new Worker(__filename, { workerData: { n: N } });

  // While the worker churns CPU, the main event loop is free:
  let ticks = 0;
  const ticker = setInterval(() => {
    ticks++;
    console.log(`[main ${process.pid}] event loop alive — timer tick #${ticks}`);
  }, 150);

  worker.on("message", (msg) => {
    clearInterval(ticker);
    console.log(`\n[main ${process.pid}] worker result: 1..${N} = ${msg.sum}`);
    console.log(`[main ${process.pid}] worker took ${msg.ms}ms; main kept ticking the whole time.`);
    process.exit(0); // both threads stop once main exits
  });

  worker.on("error", (err) => {
    console.error("[main] worker crashed:", err.message);
    process.exit(1);
  });
} else {
  // ====================== WORKER THREAD ====================
  // Runs in a separate V8 isolate on a separate OS thread — real parallelism.
  const n = workerData.n;
  const started = Date.now();
  let sum = 0;
  for (let i = 1; i <= n; i++) sum += i; // pure CPU, blocks only THIS thread
  parentPort.postMessage({ sum, ms: Date.now() - started });
}