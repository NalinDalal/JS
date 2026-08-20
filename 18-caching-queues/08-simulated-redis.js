/**
 * Module 18 — 18.6 Redis in Practice (Simulated)
 * A tiny in-memory stand-in for Redis: SET/GET with TTL, INCR, SETNX locks
 * with a safe "value-match" release, and PUBLISH/SUBSCRIBE via a channel
 * registry. Real Redis bundles these into fast, atomic server-side ops.
 *
 * Run: node 08-simulated-redis.js
 */

class SimRedis {
  constructor() {
    this.data = new Map(); // key -> string value
    this.expires = new Map(); // key -> epoch ms
    this.subscribers = new Map(); // channel -> Set<fn>
  }

  _expired(key) {
    const exp = this.expires.get(key);
    if (exp !== undefined && Date.now() > exp) {
      this.data.delete(key);
      this.expires.delete(key);
      return true;
    }
    return false;
  }

  set(key, value, ttlMs) {
    this.data.set(key, String(value));
    if (ttlMs !== undefined) this.expires.set(key, Date.now() + ttlMs);
    else this.expires.delete(key);
    return "OK";
  }

  get(key) {
    if (this._expired(key)) return null;
    return this.data.has(key) ? this.data.get(key) : null;
  }

  del(key) {
    if (this._expired(key)) return 0;
    const had = this.data.delete(key);
    this.expires.delete(key);
    return had ? 1 : 0;
  }

  expire(key, ttlMs) {
    if (!this.data.has(key) || this._expired(key)) return 0;
    this.expires.set(key, Date.now() + ttlMs);
    return 1;
  }

  incr(key) {
    const next = parseInt(this.get(key) || "0", 10) + 1; // atomic in real Redis
    this.set(key, next);
    return next;
  }

  // SETNX: set only if the key does not exist -- the basis of distributed locks.
  setnx(key, value, ttlMs) {
    if (this.get(key) !== null) return 0;
    this.set(key, value, ttlMs);
    return 1;
  }

  publish(channel, message) {
    const subs = this.subscribers.get(channel);
    if (!subs) return 0;
    for (const fn of [...subs]) fn(message);
    return subs.size;
  }

  subscribe(channel, fn) {
    if (!this.subscribers.has(channel)) this.subscribers.set(channel, new Set());
    this.subscribers.get(channel).add(fn);
    return fn;
  }
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function main() {
  const redis = new SimRedis();

  console.log("=== SET/GET + EXPIRE (TTL) ===");
  redis.set("session:alice", "token-123", 100); // self-expiring key
  console.log("  get session:alice:", redis.get("session:alice"));
  await sleep(120);
  console.log("  after 120ms, get  :", redis.get("session:alice"), "(key expired automatically)");

  console.log("\n=== INCR -- page-view counter ===");
  for (let i = 0; i < 5; i++) redis.incr("stats:pageviews");
  console.log("  pageviews:", redis.get("stats:pageviews"), "(atomic counter / rate-limit buddy)");

  console.log("\n=== SETNX -- distributed lock with TTL + safe release ===");
  const lockKey = "lock:checkout:order-42";
  const first = redis.setnx(lockKey, "worker-1", 1000);
  console.log("  acquire #1:", first === 1 ? "LOCKED by worker-1" : "denied");
  const second = redis.setnx(lockKey, "worker-2", 1000);
  console.log("  acquire #2:", second === 1 ? "LOCKED" : "DENIED (already held by worker-1)");
  // Release only if the value matches -- never clobber a lock someone else owns.
  if (redis.get(lockKey) === "worker-1") redis.del(lockKey);
  console.log("  worker-1 releases (value-match): lock now", redis.get(lockKey));
  const third = redis.setnx(lockKey, "worker-3", 1000);
  console.log("  acquire #3:", third === 1 ? "LOCKED by worker-3" : "denied");

  console.log("\n=== PUBLISH/SUBSCRIBE -- order-event round-trip ===");
  redis.subscribe("orders:created", (msg) => console.log(`  [email-svc]   got "${msg}" -> send confirmation email`));
  redis.subscribe("orders:created", (msg) => console.log(`  [invoice-svc] got "${msg}" -> generate invoice`));
  redis.publish("orders:created", "order-42");
  console.log("  (published to 2 subscribers; real Redis is fire-and-forget)");
  console.log("\nDone.");
}

const safety = setTimeout(() => {
  console.error("safety timeout");
  process.exit(1);
}, 3000);
main().then(() => clearTimeout(safety));