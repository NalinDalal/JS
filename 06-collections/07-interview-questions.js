/**
 * Module 06 — Question Bank: likely-asked interview questions (collections)
 *
 * Run: node 07-interview-questions.js
 */

const qa = [
  ["map vs filter vs reduce — when each?", "map: transform EVERY element 1:1. filter: KEEP elements passing a predicate. reduce: fold the array into ONE value (sum, group-by, histogram, flatten). Any map/filter combo can be reduced — but use the clearest tool."],
  ["forEach vs map?", "forEach: side effects, returns undefined — NOT chainable, can't break/continue (use for...of + break). map: pure transform, returns a NEW array, chainable. Rule: if you produce an array, return it (map); if you mutate/print, forEach."],
  ["Mutating vs non-mutating methods?", "Mutating: push/pop/shift/unshift/splice/sort/reverse/fill/copyWithin. Non-mutating (return new): map/filter/slice/concat/spread/toSorted/toReversed/with. sort and reverse MUTATE — copy first [...arr].sort() unless you want the original destroyed."],
  ["How to find an item? find vs indexOf vs includes", "find(cb): first element passing a callback — can match objects by property. findIndex: its index. indexOf(x): first index by ===. includes(x): boolean by ===. includes handles NaN (SameValueZero), indexOf doesn't."],
  ["Map vs plain object?", "Map: any keys (objects, NaN), insertion order, size property, iterable directly (entries), O(1) key ops without prototype-pollution risks, better for dynamic key sets. Object: string/symbol keys, prototype chain (hasOwnProperty gotchas), JSON-serializable, syntax literals."],
  ["Set — why use it?", "Unique values only (SameValueZero), O(1) has/delete, perfect for: dedupe ([...new Set(arr)]), membership checks, difference/intersection via filtering. Iteration order = insertion order."],
  ["WeakMap vs Map?", "WeakMap: keys MUST be objects, WEAK references — no GC retention (entries vanish when key is GC'd), no iteration/size (can't inspect), non-enumerable for...of. Use: private data per object (closure replacement), per-instance metadata, caching keyed by objects."],
  ["WeakSet vs Set?", "Same deal: object elements only, weak — no memory leak for bookkeeping flags (e.g. 'already processed' sets on DOM nodes). No iteration. Perfect for tracking visited without holding nodes alive."],
  ["Sparse arrays — what are they?", "Arrays with holes: new Array(5), arr[10] = 1. Hole behavior differs: map SKIPS holes (and preserves them), forEach skips, for...of visits them AS undefined, .flat() removes holes, spread → undefined. Lengthening + holes = classic interview trap."],
  ["TypedArray vs regular array?", "TypedArray (Int32Array, Float64Array, Uint8Array...): fixed-size buffers of real binary numbers — no boxing, fast, view over ArrayBuffer (shares memory with gl/WASM/streams). Regular array: JS values, holes, dynamic, slower. Use typed for binary/streams perf."],
  ["JSON.stringify gotchas?", "undefined/functions/symbols: dropped in objects, → null in arrays. NaN/Infinity → null. Date → ISO string (via toJSON). BigInt THROWS. Circular structures throw — use a replacer to walk manually. Order = insertion order (strings)."],
  ["Shallow vs deep copy?", "Spread/structuredClone... — spread copies one level: nested objects still shared. Deep: structuredClone (native, handles Dates/Maps/typed arrays, throws on functions), or JSON.parse(JSON.stringify(x)) — loses undefined/functions."],
  ["Array.from vs spread on iterables?", "Array.from(iterable, mapFn?) — works on any iterable OR array-like (arguments, {length:2}), optional map in one pass (avoids intermediate array). Spread needs a real iterable. Array.from({length:3}, (_,i)=>i) → [0,1,2]."],
  ["Stable sort?", "Array.prototype.sort is guaranteed stable since ES2019 — equal elements keep relative order. sort() WITHOUT comparator sorts by string conversion (10 < 2!). Always pass (a,b)=>a-b for numbers."],
];

let n = 0;
for (const [q, a] of qa) {
  n++;
  console.log(`\n${String(n).padStart(2)}. ${q}`);
  console.log("   →", a);
}

// --- Whiteboard drills ---
// 1. Implement groupBy with reduce (objects by role).
// 2. Intersection of two arrays in one line with Sets.
// 3. arr.flat(Infinity) vs manual flatten — which wins and when?
