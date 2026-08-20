# Module 18: Caching & Queues — Speed and Decoupling

---

## 18.1 Why Cache

### Explain It

A cache is a fast, small storage tier that sits in front of a slow, big one. Its three selling points are **latency** (serve a user profile from memory in ~0.1ms instead of querying a database in 5–50ms), **DB load** (a hot key answered from cache doesn't consume a database query, so the DB stays cheap), and **cost** (fewer DB reads means a smaller database or fewer replicas). The trade-off is **staleness**: a cache serves a snapshot, so it can be wrong compared to the source of truth until it's invalidated or its TTL expires. This is why the joke is well-earned — Phil Karlton's "There are only two hard things in computer science: cache invalidation and naming things." Cache whatever is read-heavy (hot user data, config, expensive computations) and skip anything written constantly or unique per request. Remember the ordering of cache decisions: is it read often? is it tolerant of stale data? how do we invalidate it?

### Prove It

```js
// 02-cache-aside.js — run: node 02-cache-aside.js  (miss→fetch→hit timings)
// 01-lru-cache.js — run: node 01-lru-cache.js        (finite capacity)
```

#### Gotchas / Edge Cases

- A cache is **not durable** — it can be flushed, restarted into, or thrashed. The database must always contain the truth.
- **Cold start**: a fresh/evicted cache serves nothing, so all reads hit the DB at once (see 18.2's stampede).
- Don't cache everything: tiny, high-write, or per-user-unique keys waste memory and give you nothing.
- Cache keys must be **namespaced and versioned** or a deploy can mix old and new formats (see 18.4).
- Caching the wrong layer (e.g., page-level instead of data-level) can serve stale or even wrong cross-user data after a permission change.

---

## 18.2 Cache-Aside (Lazy Loading)

### Explain It

Cache-aside, also called **lazy loading**, is the pattern behind most in-process and Redis caches. **Read path:** check the cache; on a hit, return immediately. On a **miss**, load from the database, write the value into the cache, return it. **Write path:** update the database, then **invalidate** (delete) the cache entry — never bother keeping the cache perfectly in sync, because the next read repopulates it. It's the most common pattern because it's lazy (only actually-read keys occupy cache memory), the cache is fully disposable (crash it and everything still works, just slower), and it's simple to reason about. Its weakness is the **stampede** (thundering herd): if a popular key expires, thousands of concurrent requests miss simultaneously and all slam the database. The fix is a **single-flight** guard — while one miss is in flight, concurrent callers await the *same* promise instead of issuing their own fetches — so the DB receives exactly one query.

### Prove It

```js
// 02-cache-aside.js — run: node 02-cache-aside.js
```

#### Gotchas / Edge Cases

- Mutating cache entries in place from multiple processes can corrupt shared data — treat cached values as immutable snapshots.
- **Invalidate, don't just update**: cache-update-on-write leaves a window where a race between two writers stores an older value.
- The single-flight promise must be **cleared in a `finally`** — if the fetch rejects, you must not leave a permanently rejected promise for the next caller.
- Distributed stampedes are worse than single-process ones — your single-flight map only sees local requests; Redis/Lua locks or TTL jitter help across servers.
- If the DB is down, a cache-aside app is suddenly *also* down on its hot keys — consider serving stale-but-present cache on failure (degraded mode).

---

## 18.3 Write-Through vs Write-Back (vs Write-Around)

### Explain It

These three strategies differ in *where data hits first on a write*. **Write-through** writes to the cache and the database synchronously: reads are always consistent with writes, at the cost of the full DB write latency being paid on the request path. **Write-back (write-behind)** writes to the cache immediately and marks the key **dirty**, then a background process flushes it to the database later: writes are blazing fast, but if the process crashes before the flush, the data is **lost**. **Write-around** writes straight to the database and invalidates the cache entry, so the next read is a cache miss that repopulates from DB: the DB write is un-refereed but the cache can't go stale on that key for long. Choose write-through when reads must reflect writes immediately (inventory, account balances), write-back when write volume is high and losing a few recent writes on a crash is acceptable (analytics, session logs), and write-around when writes are rare and reads are hot (profile edits).

### Prove It

```js
// 03-cache-policies.js — run: node 03-cache-policies.js
```

#### Gotchas / Edge Cases

- Write-back's dirty set is the exact width of the data-loss window — a crash or a power fail discards everything in it.
- Write-through doubles the write latency of the request path; batch or async-flush if you can tolerate eventual consistency.
- Write-around means the first read after a write is a guaranteed **miss** (you just deleted the good copy) — fine for rare writes, wasteful for hot writes.
- Flushing dirty keys in the wrong order can violate foreign-key or ordering constraints in the DB — flush per-key dependencies carefully.

---

## 18.4 TTL & Invalidation

### Explain It

**TTL** (time-to-live) makes a cache entry self-expire after N seconds — it's the cache's safety net that bounds how long stale data can be served. **Explicit invalidation** deletes or updates the key at the moment of a write, so the cache never serves a known-outdated value. TTL **alone is not enough**: between a write and the entry's expiry, every read still returns the stale value — so high-write, low-tolerance data must be actively invalidated, not left to expire. Versioned keys handle the other big invalidation problem: deploys. When a schema or serialization format changes, a bumped version suffix (`user:v2:<id>` vs `user:v1:<id>`) instantly blocks old-format entries from being read without needing to sweep the whole cache. In practice you combine all three: explicit invalidation on writes for correctness, versioned keys across deploys, and TTL as a final backstop for keys you can't always invalidate (aggregates, external-fetched data).

### Prove It

```js
// 02-cache-aside.js — run: node 02-cache-aside.js  (TTLStore expiry demo)
// 08-simulated-redis.js — run: node 08-simulated-redis.js  (GET/SET EXPIRE)
```

#### Gotchas / Edge Cases

- A **too-long TTL** serves stale data for a long time; a **too-short TTL** makes the cache useless. Match the TTL to real staleness tolerance.
- **Jitter your TTLs** or hot keys expire simultaneously and restampede (relates to 18.2).
- Distributed caches suffer **clock skew** — if machines disagree on time, an `EXPIRE` computed on one server can write a past timestamp on another.
- Invalidation is a **race**: read-old-value-then-write-old-value can store a stale value *after* the invalidation. Version the value or use compare-and-set.
- Versioned keys leak memory unless you also TTL or sweep old versions — stale versions must be reaped.

---

## 18.5 Eviction Policies

### Explain It

A cache has finite memory, so when it's full something must leave. **LRU** (least recently used) evicts the entry used longest ago — the classic choice for user-data caches. **LFU** (least frequently used) evicts the least-used entry by *count*, better for workloads with permanent hot items but it must keep per-key frequency state. **FIFO** evicts the oldest-inserted entry regardless of use — dead simple but can evict a hot key just because it was inserted early. **Random** eviction picks a victim at random — cheapest, surprisingly effective for large uniform workloads. JavaScript's `Map` implements LRU for free because it promises **insertion order**: `get()` becomes `delete(key)` + `set(key, value)` (bumping the key to the newest end), and the eviction victim is always the **first key** — `map.keys().next().value`. That gives O(1) gets/sets/evictions with zero bookkeeping.

### Prove It

```js
// 01-lru-cache.js — run: node 01-lru-cache.js
```

#### Gotchas / Edge Cases

- **Scan pollution**: one massive one-time scan evicts everything via pure LRU; LFU or a "new entry stays older than existing" rule protects hot keys.
- `Map.keys().next().value` is the oldest-inserted key, but remember it's only a valid LRU victim if you *always* delete-then-reinsert on access.
- FIFO ignores access entirely — a key read a million times can still be evicted by age.
- Eviction is not the same as invalidation: evicting a dirty write-back key without flushing **loses data** (see 18.3).

---

## 18.6 Redis in Practice

### Explain It

Redis is the standard cache layer: an in-memory **data-structure server** (strings, hashes, lists, sets, sorted sets, streams) with sub-millisecond reads and optional persistence. The everyday commands: `SET key value EX <ttl>` + `GET key` cache a key with an automatic expiry; `INCR` makes an atomic counter for page views or rate-limit budgets; `SETNX key value` (or `SET key value NX EX <ttl>`) implements a **distributed lock** — only one client wins — with a TTL so the lock can't deadlock forever; `DEL` and `EXPIRE` clean up; `PUBLISH`/`SUBSCRIBE` fan messages out to every subscriber across processes. Because all these are **single-threaded and atomic**, multi-instruction operations that would race in app code are safe when server-side (via Lua scripts). Redis isn't installed in this environment, so the demo below is a faithful **in-memory simulation** of the same commands.

### Prove It

```js
// 08-simulated-redis.js — run: node 08-simulated-redis.js
```

#### Gotchas / Edge Cases

- Redis is **in-memory by default** — configure `RDB`/`AOF` persistence or a cached write is a lost write after a restart.
- `SETNX` without a TTL is a **deadlock trap**: if the holder crashes, the lock lives forever. Always combine NX with EXPIRE.
- Release a lock **only if you own it** — `if (GET(key) === myToken) DEL(key)` — or you can delete a lock a new owner just acquired.
- `PUBLISH`/`SUBSCRIBE` is **fire-and-forget** — a down subscriber misses messages permanently. For durable fan-out use Streams or a real queue.
- The keyspace is flat: collisions between features are real (prefix by feature: `user:123` vs `session:123`).

---

## 18.7 Queues: Why You Need Them

### Explain It

A message queue puts a buffer between **producers** (who create work) and **consumers** (who do it). The request handler enqueues a job and returns immediately — `await queue.push({sendEmail, to})` — while the heavy work happens in the background. That **decouples** components (the web tier doesn't need to know how emails get sent), takes **slow work off the request path** (a 200ms email send becomes a 1ms enqueue, so the API stays fast and doesn't time out), and enables **fan-out** (one event → many queues: email, invoice, analytics). It also gives you **retries** — a failed job can be requeued and tried again, which a synchronous function never gets. The decision is *sync vs async*: if work must be reflected in the response and is fast, do it synchronously; if it's slow, can tolerate delay, or can fail independently of the user's request, push it to a queue.

### Prove It

```js
// 04-job-queue.js — run: node 04-job-queue.js
```

#### Gotchas / Edge Cases

- A queue adds **latency and complexity**: the work isn't done when the request returns, so the caller needs a way to check status later.
- If nothing monitors it, a "queue" is just a **black hole** — you need DLQ handling (18.11) and throughput alerts.
- Queues are **not magic ordering**: consumers, retries, and priorities all reorder jobs (see 18.8).
- Sync-vs-async is a contract decision — once a feature is async, changing it back is an API-breaking change for callers.

---

## 18.8 Queue Semantics: FIFO, Priority, Delayed Jobs

### Explain It

The simplest queue is **FIFO** — first in, first out — and if you only need ordering, an array works. Some workloads need **priority**: urgent jobs (charge a credit card) jump the line over background jobs (purge old rows). You can implement that by keeping jobs sorted by priority and popping the highest — with a stability guarantee so equal-priority jobs stay FIFO. **Delayed jobs** (BullMQ's `delayUntil`) aren't ready when pushed: a **scheduler** keeps them in a time-sorted structure, watches for the soonest due time, and moves due jobs into the waiting list at the right moment. In BullMQ terms the layers are: **queues** (named, typed channels for two kinds of jobs), **workers** (process that pulls and executes), and **schedulers** (a separate process that promotes delayed/repeating jobs onto the queue). Prioritization and delays trade the simplicity of "arrival order" for control over *when* work runs.

### Prove It

```js
// 05-priority-queue.js — run: node 05-priority-queue.js
// 06-delayed-jobs.js — run: node 06-delayed-jobs.js
```

#### Gotchas / Edge Cases

- Priority queues can **starve** low-priority jobs if high-priority work never stops arriving — age buckets or max-wait overrides fix this.
- Delay timers are **not precise** — a +300ms delayed job may fire slightly late under load; design with tolerance.
- Breaking FIFO shifts the reality of your system: if "order of creation" matters anywhere, priority and retries will surprise you.
- Sorting on every push is O(n log n) per push; for high throughput use a **heap**, not an array sort.

---

## 18.9 Producer/Consumer & Worker Pools

### Explain It

Producers call `enqueue()`; **consumers** (workers) pull jobs from the other end. Instead of having one worker process everything serially, a **worker pool** runs N consumers concurrently, each grabbing the next available job — actual throughput becomes `min(concurrency, resource headroom)`. The critical detail is **acknowledgment**: a consumer tells the queue "I finished this job" after processing; only then is the job removed. In **no-ack** mode the broker marks a job done the moment it's handed out — if the worker crashes, that job is permanently lost. With acks, an unacknowledged job is **redelivered** to another worker after a visibility timeout, so jobs are never lost, only possibly duplicated. That's why pull-based queues (SQS, BullMQ, RabbitMQ) are safe: the producer enqueues once, and the broker tracks delivery state per job.

### Prove It

```js
// 04-job-queue.js — run: node 04-job-queue.js  (serial worker loop in _pump)
```

#### Gotchas / Edge Cases

- **Ack before processing** = jobs lost on crash. **Ack after processing but before side effects** = same. Ack only when the *entire* job effect is durable.
- Ack-too-late causes **duplicate delivery** — make the worker idempotent (18.12), not just retry-happy.
- Raise worker concurrency to reduce latency, but cap it: too many concurrent jobs against one DB is just a stampede by another name.
- Polling for work wastes resources — use long-polling or push-based delivery where the broker supports it.

---

## 18.10 Retries with Exponential Backoff + Jitter

### Explain It

If a job is genuinely transient (a database restart, a slow dependency), one retry might succeed — but the retry schedule matters more than the count. **Fixed-interval retries** share a fatal flaw: when the dependency comes back, every retrying worker fires at the *same instant*, re-creating the exact load spike that caused the outage. **Exponential backoff** fixes the cadence — delays grow `100ms, 200ms, 400ms...` — so recovery pressure ramps gently. **Jitter** fixes the herd: each retry adds random noise (`delay = min(base * 2^n, max) + rand(0, jitterWindow)`), so even thousands of retriers spread out instead of converging. Always cap it with **maxAttempts** — infinite retries churn forever on a permanent error — and skip retrying errors that are guaranteed permanent (validation, bad payloads). The queue code below implements exactly this: backoff doubling per attempt, a retry budget, and survivors dumped to the DLQ.

### Prove It

```js
// 04-job-queue.js — run: node 04-job-queue.js  (see [retry] delay = backoffMs * 2^n)
```

#### Gotchas / Edge Cases

- **Count attempts, not retries** — `attempts <= maxAttempts` reads clearly; off-by-one here causes infinite loops or premature failure.
- Never infinitely retry permanent errors — a poison job will block the queue (that's what DLQs are for, 18.11).
- Backoff too long delays honest recovery; jitter too wide breaks SLA on recovery. Tune `max` alongside `base`.
- Retrying after a **successful side effect** (email already sent) duplicates work — backoff must be wrapped in idempotency.

---

## 18.11 Dead-Letter Queues

### Explain It

A **dead-letter queue** is the hospital ward of the queue system: after a job exhausts its retries (the **maxAttempts** budget from 18.10) it's a **poison message** — the payload, schema, or downstream shape is broken in a way retries can't fix. Instead of looping forever and blocking later jobs, the worker moves it to a DLQ. The DLQ exists so you can **inspect**: you pull the batch, look at the raw payload, and find the root cause (a versioned API change, a malformed row, an upstream outage). Fixing the bug, you then **manually reprocess** — re-push the recovered jobs onto the main queue (or fix the payloads and retry them directly). A DLQ also protects the happy path: a poison job failing forever must not stall the FIFO work behind it. The pattern is the same across BullMQ, SQS, and RabbitMQ — the queue on the other side of "gave up".

### Prove It

```js
// 04-job-queue.js — run: node 04-job-queue.js  (see the [dlq] line + inspection block)
```

#### Gotchas / Edge Cases

- A DLQ nobody watches is a **slightly slower black hole** — alert on DLQ depth or your "lost work" is just delayed.
- DLQ messages can contain **sensitive data** — redact or permission-lock the DLQ the same as the main queue.
- Reprocessing must be **idempotent** — replaying a DLQ restores work, but a duplicate [insert] job must not double-insert.
- Poison detection is heuristic: "failed N times" can misclassify a *slow* recovery as permanent. Pair with a duration cap.
- Track DLQ entry age — messages can sit unreprocessed for months if nobody owns them.

---

## 18.12 Delivery Semantics

### Explain It

Delivery guarantees describe what happens between "producer sends" and "consumer receives". **At-most-once**: the message may be dropped (fire-and-forget pub/sub, no ack). **At-least-once**: the message is guaranteed delivered, but may be **redelivered** — the consumer receives a duplicate if the first ack was lost or the worker crashed mid-job; this is the default for acked queues and it's safe *only if processing is idempotent*. **Exactly-once** is famously impossible to guarantee in general distributed systems — you can't atomically decide "Did the other side process this?" across machines. The practical substitute is an **idempotency key**: the producer includes a unique key (UUID, order ID); the consumer records "key → done" (in the DB, inside the same transaction as the side effect) and treats a second delivery of the same key as a no-op. Exactly-once then holds *per key* — the key is the lock that makes duplicates harmless.

### Prove It

```js
// Idempotency pattern (pair with 04-job-queue.js):
async function handle(job) {
  const done = await db.get("processed", job.idempotencyKey);
  if (done) return;                    // already handled -- duplicate delivery
  await db.transaction(async (tx) => { // side effect + marker commit atomically
    await tx.insert("orders", job.order);
    await tx.set("processed", job.idempotencyKey, "1");
  });
}
```

#### Gotchas / Edge Cases

- Choose your guarantee knowingly: fire-and-forget is fine for notifications, deadly for billing — pick per-message, not per-system.
- The idempotency key must be **stable** across retries (derived from business data), not freshly generated per attempt.
- The dedup marker must live in the **same transaction/DB** as the side effect, or crash-between-second-step breaks the guarantee.
- "Exactly-once" marketing (SQS FIFO dedup, Kafka transactions, BullMQ `discardOnFail`) is always *at-least-once + dedup window*, not a magic guarantee.

---

## 18.13 Rate Limiting

### Explain It

Rate limiting protects a service from any single source consuming too much. **Fixed window** counts requests per wall-clock bucket (`now .. now+windowMs`): dead simple and atomic with `INCR` + `EXPIRE` in Redis, but two bursts straddling a bucket boundary can do 2× the limit. **Sliding window** keeps request timestamps and drops ones older than the window, so the count is true per *rolling* interval — accurate but stores more state. **Token bucket** refills tokens at a fixed rate up to a capacity: bursts up to capacity sail through, sustained load is capped at the refill rate — the most forgiving for API consumers. When the limit is hit, respond **429 Too Many Requests** with a `Retry-After` header so clients back off correctly (and honor it client-side!). In production you must make the increment **atomic** so two servers don't both read 9 and both pass — Redis `INCR` + `EXPIRE` (or a Lua script) is the standard implementation.

### Prove It

```js
// 07-rate-limiter.js — run: node 07-rate-limiter.js
```

#### Gotchas / Edge Cases

- **Fixed window's boundary burst**: 3 allowed at 99ms + 3 allowed at 101ms = 6 in 2ms. Sliding window or token bucket smooths it.
- Per-server in-memory limiters must be scaled by N servers — **always use a shared store** (Redis) or your limit is multiplied.
- Don't forget `EXPIRE` after `INCR` — a Redis key that never expires is a memory leak and a permanently-counted bucket.
- The `429` body is almost as important as the status: include the `Retry-After` seconds and the remaining-limit headers.
- Limit the enforcement point (API gateway? app middleware?) deliberately — limiting too far from the resource wastes the protection.

---

## 18.14 Interview Questions (Say It Out Loud)

### Explain It

Say these out loud: Why would you add a cache to your system? What is cache-aside and why is it the most common pattern? What is a cache stampede and how do you fix it? Write-through vs write-back vs write-around? Why isn't TTL alone enough for cache invalidation? How do you implement an LRU cache in JavaScript? Which Redis commands matter for caching, counters, locks, and pub/sub? Why do you need a message queue at all? What do FIFO, priority, and delayed jobs mean (BullMQ terms)? What does ack mean for a consumer, and why does it matter? Why exponential backoff with jitter for retries? What is a dead-letter queue? At-most-once vs at-least-once vs exactly-once — and what are idempotency keys? How do fixed window, sliding window, and token bucket rate limiters work, and what does 429 mean?

### Prove It

```js
// 09-interview-caching-queues.js — run: node 09-interview-caching-queues.js
```

---

## Sources

- Redis command reference: https://redis.io/docs/latest/commands/
- BullMQ docs — queues, workers, and delayed jobs: https://docs.bullmq.io/
- AWS SQS — delivery guarantees and DLQs: https://docs.aws.amazon.com/sqs/latest/dg/sqs-concepts.html
- MDN HTTP caching (TTL/expiration semantics): https://developer.mozilla.org/en-US/docs/Web/HTTP/Caching
- "There are only two hard things..." — Phil Karlton: https://en.wikipedia.org/wiki/Phil_Karlton