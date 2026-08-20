/**
 * Module 18 — 18.10 Retries with Exponential Backoff + Dead-Letter Queue
 * A tiny job queue: push() enqueues work with retry config; a serial worker
 * loop processes jobs one at a time; failures retry with exponential backoff
 * (100ms, 200ms, 400ms...) and exhausted jobs land in a dead-letter queue
 * (DLQ) for later inspection and manual reprocessing.
 *
 * Run: node 04-job-queue.js
 */

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

class JobQueue {
  constructor() {
    this.queue = [];
    this.deadLetter = []; // poison jobs land here after maxAttempts
    this.seq = 0;
    this.processing = false;
    this.worker = async () => {}; // set by the caller
  }

  push(payload, { retries = 0, backoffMs = 100 } = {}) {
    this.queue.push({ id: ++this.seq, payload, attempts: 0, maxAttempts: retries, backoffMs });
    this._pump(); // fire-and-forget; the loop is re-entrant safe
    return this.seq;
  }

  async _pump() {
    if (this.processing) return;
    this.processing = true;
    while (this.queue.length) {
      const job = this.queue.shift();
      try {
        await this.worker(job.payload);
        console.log(`  [ok]    job #${job.id} ${JSON.stringify(job.payload)}`);
      } catch (err) {
        job.attempts++;
        if (job.attempts <= job.maxAttempts) {
          const delay = job.backoffMs * 2 ** (job.attempts - 1); // 100, 200, 400...
          console.log(`  [retry] job #${job.id} failed (${err.message}) -> retry #${job.attempts} in ${delay}ms`);
          await sleep(delay);
          this.queue.push(job); // requeue at the end of the line
        } else {
          console.log(`  [dlq]   job #${job.id} gave up (${err.message}) -> DEAD LETTER`);
          this.deadLetter.push(job);
        }
      }
    }
    this.processing = false;
  }
}

async function main() {
  const queue = new JobQueue();

  // A worker that simulates success, transient failures, and a poison job.
  queue.worker = async (payload) => {
    if (payload.kind === "poison") throw new Error("permanent error: bad payload");
    if (payload.kind === "flaky" && payload.fails > 0) {
      payload.fails--; // each retry gets closer to success
      throw new Error("transient error (network hiccup)");
    }
  };

  console.log("=== JobQueue: exponential backoff + dead letters ===");
  queue.push({ kind: "flaky", fails: 2, label: "flaky job" }, { retries: 3, backoffMs: 100 });
  queue.push({ kind: "clean", label: "clean job" });
  queue.push({ kind: "poison", label: "poison job" }, { retries: 1, backoffMs: 60 });

  while (queue.queue.length || queue.processing) await sleep(25); // wait for idle

  console.log("\n=== Dead-letter inspection ===");
  console.log("  DLQ entries:", queue.deadLetter.map((j) => j.payload.label).join(", ") || "(empty)");
  console.log("  A DLQ is monitored and reprocessed manually after fixing the root cause.");
  console.log("\nDone.");
}

const safety = setTimeout(() => {
  console.error("safety timeout");
  process.exit(1);
}, 5000);
main().then(() => clearTimeout(safety));