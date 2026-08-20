/**
 * Module 18 — 18.8 Delayed Jobs (BullMQ-style scheduler)
 * A scheduler keeps jobs in a time-sorted array of { at, payload } and arms
 * a timer for the soonest due job. When the timer fires it drains every job
 * whose time has come, in time order -- so a fan-out across +100/+200/+300ms
 * executes small-to-large regardless of push order.
 *
 * Run: node 06-delayed-jobs.js
 */

class DelayedQueue {
  constructor() {
    this.scheduled = []; // sorted ascending by `at` (a poor-man's min-heap)
    this.seq = 0;
    this.timer = null;
    this.draining = false;
    this.worker = async () => {}; // set by the caller
  }

  schedule(payload, delayMs) {
    const entry = { id: ++this.seq, at: Date.now() + delayMs, payload };
    let i = this.scheduled.length;
    while (i > 0 && this.scheduled[i - 1].at > entry.at) i--; // keep sorted
    this.scheduled.splice(i, 0, entry);
    this._arm();
    return entry.id;
  }

  // Arm a timer for the soonest due job.
  _arm() {
    if (this.timer) clearTimeout(this.timer);
    if (!this.scheduled.length) return;
    const next = this.scheduled[0];
    this.timer = setTimeout(() => this._drain(), Math.max(0, next.at - Date.now()));
  }

  // Dispatch every job that is due right now, in time order.
  async _drain() {
    this.draining = true;
    while (this.scheduled.length && this.scheduled[0].at <= Date.now()) {
      const job = this.scheduled.shift();
      await this.worker(job);
    }
    this.draining = false;
    this._arm();
  }

  // Resolves once the queue is empty and no drain is in progress.
  idle() {
    return new Promise((resolve) => {
      const check = () =>
        !this.scheduled.length && !this.draining ? resolve() : setTimeout(check, 20);
      check();
    });
  }
}

async function main() {
  const queue = new DelayedQueue();
  const start = Date.now();
  let done = 0;
  const total = 3;

  queue.worker = async (job) => {
    done++;
    console.log(`  [process] job #${job.id} "${job.payload}" at t=${Date.now() - start}ms`);
    if (done === total) console.log(`\nAll ${total} jobs processed in time order (rising scheduled time).`);
  };

  console.log("=== Delayed queue: schedule at +100 / +200 / +300ms ===");
  queue.schedule("third", 300);
  queue.schedule("first", 100);
  queue.schedule("second", 200);
  console.log("(pushed third, first, second -- but execution follows time, not push order)\n");

  await queue.idle();
  console.log("Done.");
}

const safety = setTimeout(() => {
  console.error("safety timeout");
  process.exit(1);
}, 3000);
main().then(() => clearTimeout(safety));