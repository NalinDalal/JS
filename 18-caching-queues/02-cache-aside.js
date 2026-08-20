/**
 * Module 18 — 18.2 Cache-Aside (Lazy Loading)
 * A TTLStore with per-key expiry, the cache-aside read pattern wrapped around
 * a simulated slow DB (300ms queries), and a single-flight guard that turns
 * 5 concurrent misses into exactly 1 DB hit (the thundering-herd fix).
 *
 * Run: node 02-cache-aside.js
 */

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// A tiny cache that forgets entries after their TTL.
class TTLStore {
  constructor() {
    this.data = new Map(); // key -> { value, expiresAt }
  }
  get(key) {
    const entry = this.data.get(key);
    if (!entry) return undefined;
    if (Date.now() > entry.expiresAt) {
      this.data.delete(key); // expired -> treat as a miss
      return undefined;
    }
    return entry.value;
  }
  set(key, value, ttlMs) {
    this.data.set(key, { value, expiresAt: Date.now() + ttlMs });
  }
  invalidate(key) {
    this.data.delete(key); // explicit invalidation on writes
  }
  get size() {
    return this.data.size;
  }
}

// Simulated slow database: every query takes 300ms.
const db = new Map([
  [1, { name: "Alice", city: "Austin" }],
  [2, { name: "Bob", city: "Berlin" }],
]);

let dbHits = 0;
function fetchUser(id) {
  return new Promise((resolve) => {
    setTimeout(() => {
      dbHits++;
      console.log(`    [db] SELECT user ${id} (300ms) -- hit #${dbHits}`);
      resolve(db.get(id));
    }, 300);
  });
}

// Cache-aside read path with single-flight: while one miss is in flight,
// concurrent callers share the same promise instead of hammering the DB.
function cacheAside(store, fetchFn) {
  const inflight = new Map(); // key -> in-flight promise
  return async function get(key, ttlMs = 5000) {
    const cached = store.get(key);
    if (cached !== undefined) {
      console.log(`    [cache] HIT for ${key}`);
      return cached;
    }
    if (inflight.has(key)) {
      console.log(`    [cache] MISS for ${key} -- joining in-flight fetch (no stampede)`);
      return inflight.get(key);
    }
    console.log(`    [cache] MISS for ${key} -- fetching from DB...`);
    const promise = fetchFn(key).then((value) => {
      store.set(key, value, ttlMs); // populate the cache on the way out
      return value;
    });
    inflight.set(key, promise);
    try {
      return await promise;
    } finally {
      inflight.delete(key);
    }
  };
}

async function main() {
  const store = new TTLStore();
  const get = cacheAside(store, fetchUser);

  console.log("=== 1) Normal cache-aside: miss -> fetch -> hit ===");
  const t0 = Date.now();
  await get(1);
  console.log(`    first read took ${Date.now() - t0}ms, cache size = ${store.size}`);
  await get(1); // now served from cache, no DB call
  console.log(`    second read took ${Date.now() - t0}ms total (instant hit)`);

  console.log("\n=== 2) Thundering herd: 5 concurrent misses, 1 DB hit ===");
  const t1 = Date.now();
  const results = await Promise.all([get(2), get(2), get(2), get(2), get(2)]);
  console.log(
    `    all 5 callers got the same user (${results[0].name})?`,
    results.every((r) => r.name === "Bob")
  );
  console.log(`    5 concurrent reads took ${Date.now() - t1}ms total (one 300ms fetch)`);

  console.log("\n=== 3) TTL expiry: the entry disappears after its TTL ===");
  store.set("short-lived", "v1", 30);
  console.log(`    immediately: ${store.get("short-lived")}`);
  await sleep(60);
  console.log(`    after 60ms:  ${store.get("short-lived")} (expired -> miss)`);

  console.log("\nTotal DB hits:", dbHits, "(1 miss + 1 herd fetch = 2, not 6)");
}

main().then(() => console.log("\nDone."));
