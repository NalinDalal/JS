/**
 * Module 18 — Interview Questions (Caching & Queues)
 * Say the answer out loud BEFORE reading it. Run for a quick daily drill.
 *
 * Run: node 09-interview-caching-queues.js
 */

const qa = [
  [
    "Why would you add a cache to your system?",
    "To serve hot data without touching the database: lower latency (ms vs tens of ms), less load on the DB, and lower infrastructure cost for the same request volume. The trade-off is staleness -- the cache can serve outdated values until it is invalidated or the TTL expires. Caching is the classic 'two hard problems: cache invalidation and naming things'.",
  ],
  [
    "What is cache-aside and why is it the most common pattern?",
    "On a read: check cache; on miss, load from the DB, populate the cache, return. On a write: update the DB and invalidate the cache (or update it). It's the most common because it's lazy (only hot keys are cached), simple, and the cache is disposable -- if it dies, the DB still has the truth.",
  ],
  [
    "What is a cache stampede (thundering herd) and how do you fix it?",
    "A stampede is when a popular key expires and many requests all miss at once, so they all hit the database simultaneously and bring it down. Fixes: single-flight (share one in-flight fetch promise among concurrent misses), jitter your TTLs so keys don't expire together, or a background refresh that refreshes before expiry.",
  ],
  [
    "Write-through vs write-back vs write-around: what's the difference?",
    "Write-through writes DB + cache synchronously -- strong consistency, but double the write latency. Write-back writes the cache and flushes to the DB later (async) -- fast, but you can lose data if the process crashes before the flush. Write-around writes the DB directly and invalidates the cache -- the next read is a miss.",
  ],
  [
    "Why isn't TTL alone enough for cache invalidation?",
    "TTL limits how long stale data can be served, but it doesn't remove stale data from users: a value can be wrong for the whole TTL window after a write. You must also explicitly invalidate or update the cache key on writes. TTL is a backstop, not a coherent update strategy.",
  ],
  [
    "How do you implement an LRU cache in JavaScript?",
    "Use a Map: it preserves insertion order, so on get() you delete + re-insert the key to 'bump' it to the newest end, and the first key in the Map is always the least recently used. On set(), delete-then-insert too, and if size exceeds capacity, remove the first key. That gives O(1) get/set/evict.",
  ],
  [
    "Which Redis commands matter for caching, counters, locks, and pub/sub?",
    "SET key val EX <ttl> and GET for caching. INCR for counters and rate-limit budgets. SETNX (or SET with NX) + EXPIRE for distributed locks, DEL only when the value matches your owner token. PUBLISH/SUBSCRIBE for fan-out across processes. Lua scripting (or MULTI) makes multi-step ops atomic.",
  ],
  [
    "Why do you need a message queue at all?",
    "To decouple producers from consumers: the request handler enqueues work and returns immediately, a queue guarantees someone will process it. This takes slow work (emails, image resizing, billing) off the request path, lets you fan out to multiple workers, and gives you retries and visibility into failed work.",
  ],
  [
    "What do FIFO, priority, and delayed jobs mean in a queue (BullMQ terms)?",
    "FIFO processes jobs in arrival order. Priority queues dequeue higher-priority jobs first (stabilized so equal priorities stay FIFO). Delayed jobs wait until a scheduled time -- a scheduler scans for due jobs and moves them into the waiting list. BullMQ separates job, queue, worker, and scheduler responsibilities.",
  ],
  [
    "What does 'ack' mean for a queue consumer, and why does it matter?",
    "An ack tells the queue 'I finished this job, you can discard it.' Without acks (or with no-ack), a consumer that crashes mid-job loses its work permanently. With acks, in-flight jobs are returned to the queue (or DLQ) if the consumer dies, so jobs are 'at-least-once' rather than lost.",
  ],
  [
    "Why exponential backoff with jitter for retries?",
    "Fixed-interval retries are dangerous: when a dependency recovers, every retrying worker fires at the same moment and re-created the outage (a thundering herd). Exponential backoff (100ms, 200ms, 400ms) backs off proportionally to the outage, and jitter -- randomizing each delay -- spreads the retries so the herd never forms. Always cap maxAttempts too.",
  ],
  [
    "What is a dead-letter queue (DLQ)?",
    "A DLQ stores jobs that exhausted their retries and still failed -- 'poison' jobs that will never succeed (bad payload, schema drift). It keeps them out of the main queue so good jobs aren't blocked behind them, and gives you a place to inspect the batch, fix the root cause, and manually reprocess.",
  ],
  [
    "At-most-once vs at-least-once vs exactly-once: which is realistic?",
    "At-most-once: message may be dropped (fire-and-forget). At-least-once: message is redelivered on failure -- common and safe IF work is idempotent. Exactly-once is impossible to guarantee across distributed systems in general; you approximate it with idempotency keys (a unique key stored with the result so a duplicate attempt is a no-op) or transactional outboxes.",
  ],
  [
    "How do fixed window, sliding window, and token bucket rate limiters work, and what does 429 mean?",
    "Fixed window counts requests per wall-clock bucket -- simple but lets a burst at the boundary double the limit. Sliding window keeps request timestamps and drops expired ones -- accurate, more memory. Token bucket refills tokens at a fixed rate up to a capacity, so it allows bursts but caps sustained load. When a limit is hit you respond 429 Too Many Requests, ideally with a Retry-After header. In production you make the counter atomic with Redis INCR + EXPIRE.",
  ],
];

let i = 0;
function next() {
  if (i >= qa.length) {
    console.log("\nDone! Loop back to the top for another round.");
    process.exit(0);
  }
  const [q, a] = qa[i++];
  console.log(`\nQ${i}: ${q}`);
  if (!process.stdin.isTTY) {
    // Headless (piped stdin): there's no interactive peek, so show the
    // answer immediately and exit instead of hanging on a non-TTY stream.
    console.log(`   A${i}: ${a}`);
    process.exit(0);
  }
  console.log("   (press Enter to see the answer, or Ctrl+C to quit)");
}

if (process.stdin.isTTY) {
  process.stdin.setRawMode(true);
  process.stdin.resume();
  process.stdin.on("data", () => next());
}
console.log("Say each answer out loud, then press Enter to check.");
next();