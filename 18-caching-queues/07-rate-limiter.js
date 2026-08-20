/**
 * Module 18 — 18.13 Rate Limiting: Fixed Window, Sliding Window, Token Bucket
 * Three classic limiters (limit 3 per 100ms) fed the same request timeline
 * so you can compare who allows and who denies. Prints ALLOW/DENY per request.
 *
 * Run: node 07-rate-limiter.js
 */

// Fixed window: a counter per wall-clock bucket [windowStart, windowStart+windowMs).
class FixedWindow {
  constructor(limit, windowMs) {
    this.limit = limit;
    this.windowMs = windowMs;
    this.windows = new Map(); // key -> { start, count }
  }
  check(key, now) {
    let w = this.windows.get(key);
    if (!w || now - w.start >= this.windowMs) {
      w = { start: now, count: 0 }; // start a fresh bucket
      this.windows.set(key, w);
    }
    if (w.count >= this.limit) return false;
    w.count++;
    return true;
  }
}

// Sliding window: keep request timestamps, drop ones older than windowMs.
class SlidingWindow {
  constructor(limit, windowMs) {
    this.limit = limit;
    this.windowMs = windowMs;
    this.hits = new Map(); // key -> [timestamps]
  }
  check(key, now) {
    const arr = this.hits.get(key) || [];
    while (arr.length && now - arr[0] >= this.windowMs) arr.shift();
    if (arr.length >= this.limit) return false;
    arr.push(now);
    this.hits.set(key, arr);
    return true;
  }
}

// Token bucket: tokens refill continuously, so bursts up to capacity pass
// but sustained traffic is capped at the refill rate.
class TokenBucket {
  constructor(capacity, refillPerMs) {
    this.capacity = capacity;
    this.refillPerMs = refillPerMs;
    this.tokens = capacity; // start full for a burst
    this.last = 0; // last refill timestamp
  }
  check(key, now) {
    this.tokens = Math.min(this.capacity, this.tokens + (now - this.last) * this.refillPerMs);
    this.last = now;
    if (this.tokens < 1) return false;
    this.tokens -= 1;
    return true;
  }
}

// Feed a limiter a timeline of request times and print allow/deny.
function demo(label, limiter, key, requests, limitNote) {
  console.log(`\n=== ${label} (${limitNote}) ===`);
  for (const t of requests) {
    const ok = limiter.check(key, t);
    console.log(`  t=${String(t).padStart(3)}ms  ${ok ? "ALLOW" : "DENY "}`);
  }
}

const timeline = [0, 10, 20, 30, 40, 105]; // 5 burst requests, then one after a gap

// Limit 3 per 100ms.
demo("Fixed window", new FixedWindow(3, 100), "user:1", timeline, "limit 3 per 100ms");
demo("Sliding window", new SlidingWindow(3, 100), "user:1", timeline, "limit 3 per 100ms");
demo("Token bucket  ", new TokenBucket(3, 0.03), "user:1", timeline, "capacity 3, refill 3 per 100ms");

console.log("\nObservations:");
console.log("- Fixed window: burst at t=0,10,20 fills the bucket; t=105 starts a fresh window.");
console.log("- Sliding window: no burst boundary, so t=105 is allowed as soon as t=0 slides out.");
console.log("- Token bucket: same idea but continuous -- refills 3 tokens per 100ms.");