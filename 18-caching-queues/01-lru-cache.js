/**
 * Module 18 — 18.5 Eviction Policies: LRU with a Map
 * An LRU (Least Recently Used) cache implemented with a single Map:
 * Map preserves insertion order, so delete + re-insert "bumps" a key to the
 * newest end, and the first key in the Map is always the least recently used.
 *
 * Run: node 01-lru-cache.js
 */

class LRUCache {
  constructor(capacity) {
    this.capacity = capacity;
    this.map = new Map(); // insertion order == recency order (newest last)
    this.evictions = []; // log of evicted keys (for the demo only)
  }

  get(key) {
    if (!this.map.has(key)) return undefined;
    const value = this.map.get(key);
    this.map.delete(key); // delete + re-insert moves the key to the newest end
    this.map.set(key, value);
    return value;
  }

  set(key, value) {
    if (this.map.has(key)) this.map.delete(key);
    this.map.set(key, value);
    if (this.map.size > this.capacity) {
      const lruKey = this.map.keys().next().value; // first key == least recently used
      this.map.delete(lruKey);
      this.evictions.push(lruKey);
    }
  }
}

const cache = new LRUCache(3);

cache.set("A", 1);
cache.set("B", 2);
cache.set("C", 3);
console.log("after set A,B,C:    ", [...cache.map.keys()].join(" -> "));

cache.get("A"); // touch A -> it becomes most-recently-used
console.log("after get('A'):     ", [...cache.map.keys()].join(" -> "), "(A bumped to the end)");

cache.set("D", 4); // capacity 3 -> evict the LRU key, B
console.log("after set('D', 4):  ", [...cache.map.keys()].join(" -> "), "(B evicted)");

cache.get("C");
cache.set("E", 5);
console.log("after get C,set E:  ", [...cache.map.keys()].join(" -> "), "(A evicted)");

cache.set("B", 99); // re-inserting an evicted key is a fresh, newest entry
console.log("after set('B',99):  ", [...cache.map.keys()].join(" -> "));

console.log("\neviction order:", cache.evictions.join(" -> "), "(oldest-first)");
console.log("\nTakeaway: Map iteration order = insertion order. get() and set()");
console.log("both delete + re-insert, so the front of the Map is always LRU.");
