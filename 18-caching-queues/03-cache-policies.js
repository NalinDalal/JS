/**
 * Module 18 — 18.3 Write-Through vs Write-Back vs Write-Around
 * Three cache write strategies wrapped around a fake DB + cache, with a
 * scenario log showing exactly what each one writes where -- and a crash
 * simulation proving write-back can lose data.
 *
 * Run: node 03-cache-policies.js
 */

const db = { users: {} }; // fake database (the source of truth)
const cache = new Map(); // fake cache (the fast read layer)

// Write-through: write both synchronously. Strong consistency, double latency.
class WriteThrough {
  write(key, value) {
    cache.set(key, value);
    db.users[key] = value;
    return "db + cache updated synchronously";
  }
}

// Write-back: write cache only, flush to db later. Fast, but risky on crash.
class WriteBack {
  constructor() {
    this.dirty = new Set(); // keys that changed but are not yet in the db
  }
  write(key, value) {
    cache.set(key, value);
    this.dirty.add(key);
    return "cache updated; db write DEFERRED (key is dirty)";
  }
  flush() {
    for (const key of this.dirty) db.users[key] = cache.get(key);
    const count = this.dirty.size;
    this.dirty.clear();
    return count;
  }
}

// Write-around: write db only, invalidate the cache. First read is a miss.
class WriteAround {
  write(key, value) {
    db.users[key] = value;
    cache.delete(key); // invalidate, so the next read is a fresh miss
    return "db updated; cache invalidated";
  }
}

console.log("=== Scenario: update user 1's profile ===");

const wt = new WriteThrough();
console.log("[write-through]", wt.write(1, { name: "Alice v2" }));
console.log("   db:", JSON.stringify(db.users[1]), "| cache:", JSON.stringify(cache.get(1)));

const wb = new WriteBack();
console.log("\n[write-back]  ", wb.write(1, { name: "Alice v3" }));
console.log("   db:", JSON.stringify(db.users[1]), "| cache:", JSON.stringify(cache.get(1)), "<- db is STALE");
console.log("   flush() wrote", wb.flush(), "dirty key(s)");
console.log("   db after flush:", JSON.stringify(db.users[1]));

console.log("\n=== Crash simulation: write-back loses data ===");
const wb2 = new WriteBack();
wb2.write(2, { name: "Fresh user" });
console.log("   cache has:", JSON.stringify(cache.get(2)));
console.log("   db has:   ", JSON.stringify(db.users[2]), "(nothing -- write not flushed yet)");
console.log("   !! process crashes before flush() -> that write is LOST");

const wa = new WriteAround();
console.log("\n[write-around]", wa.write(3, { name: "Bob v1" }));
console.log("   db:", JSON.stringify(db.users[3]), "| cache:", cache.has(3) ? JSON.stringify(cache.get(3)) : "(invalidated -> next read is a miss)");
