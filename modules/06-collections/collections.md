# Module 06: Collections — Arrays, Maps, Sets & TypedArrays

---

## 6.1 Arrays

### Explain It

Arrays are **ordered collections** indexed by non-negative integers. JavaScript arrays are **dynamic** — they grow and shrink automatically. Internally, V8 uses different strategies (packed elements, holey elements, or dictionary mode) depending on usage patterns.

**Creation methods:**

| Method | Description | Example |
|--------|-------------|---------|
| `[]` | Array literal (preferred) | `const arr = [1, 2, 3]` |
| `new Array()` | Constructor | `new Array(5)` — creates 5 empty slots |
| `Array.from()` | From iterable/array-like | `Array.from('hello')` → `['h','e','l','l','o']` |
| `Array.of()` | From arguments | `Array.of(1, 2, 3)` → `[1, 2, 3]` |

**Sparse vs Dense Arrays:**

```js
// Dense array — every index has a value
const dense = [1, 2, 3];
console.log(dense.length); // 3

// Sparse array — holes/gaps exist
const sparse = [1, , 3];        // length 3, index 1 is empty
console.log(1 in sparse);       // false
console.log(sparse[1]);         // undefined
console.log(Object.keys(sparse)); // ['0', '2']
```

Sparse arrays are slower to iterate because V8 cannot optimize them with contiguous memory.

---

### Prove It

```js
// --- Creating arrays ---
const literal = [10, 20, 30];
const fromStr = Array.from("JS");
const ofArr = Array.of(7, 8, 9);

console.log(literal);   // [10, 20, 30]
console.log(fromStr);   // ['J', 'S']
console.log(ofArr);     // [7, 8, 9]

// --- new Array pitfall ---
const sparse = new Array(3);
console.log(sparse);          // [ <3 empty items> ]
console.log(sparse.length);   // 3

// --- Mutating methods ---
const arr = [1, 2, 3, 4, 5];

arr.push(6);            // [1, 2, 3, 4, 5, 6]
console.log(arr);

arr.pop();              // removes 6 → [1, 2, 3, 4, 5]
console.log(arr);

arr.unshift(0);         // [0, 1, 2, 3, 4, 5]
console.log(arr);

arr.shift();            // removes 0 → [1, 2, 3, 4, 5]
console.log(arr);

arr.splice(2, 1, 99);   // removes index 2, inserts 99 → [1, 2, 99, 4, 5]
console.log(arr);

arr.sort((a, b) => a - b); // [1, 2, 4, 5, 99]
console.log(arr);

arr.reverse();          // [99, 5, 4, 2, 1]
console.log(arr);

// --- Non-mutating methods ---
const nums = [1, 2, 3, 4, 5];

const sliced = nums.slice(1, 3);     // [2, 3]
const concat = nums.concat([6, 7]);  // [1, 2, 3, 4, 5, 6, 7]
const mapped = nums.map(x => x * 2); // [2, 4, 6, 8, 10]
const filtered = nums.filter(x => x > 3); // [4, 5]
const reduced = nums.reduce((acc, v) => acc + v, 0); // 15

console.log(sliced, concat, mapped, filtered, reduced);

// --- find, findIndex, includes ---
const users = [
  { id: 1, name: "Alice" },
  { id: 2, name: "Bob" },
  { id: 3, name: "Charlie" }
];

const found = users.find(u => u.name === "Bob");
const idx = users.findIndex(u => u.name === "Bob");
console.log(found); // { id: 2, name: 'Bob' }
console.log(idx);   // 1

// --- flat and flatMap ---
const nested = [1, [2, 3], [4, [5, 6]]];
console.log(nested.flat(Infinity)); // [1, 2, 3, 4, 5, 6]

const sentences = ["Hello world", "Goodbye moon"];
const words = sentences.flatMap(s => s.split(" "));
console.log(words); // ['Hello', 'world', 'Goodbye', 'moon']

// --- Destructuring ---
const [first, second, ...rest] = [10, 20, 30, 40, 50];
console.log(first);  // 10
console.log(rest);   // [30, 40, 50]

// --- Spread ---
const merged = [...[1, 2], ...[3, 4]];
console.log(merged); // [1, 2, 3, 4]

// --- Array.from with mapping ---
const range = Array.from({ length: 5 }, (_, i) => i + 1);
console.log(range); // [1, 2, 3, 4, 5]
```

---

### Method Reference Table

**Mutating methods:**

| Method | Returns | Description |
|--------|---------|-------------|
| `push()` | new length | Add to end |
| `pop()` | removed element | Remove from end |
| `unshift()` | new length | Add to start |
| `shift()` | removed element | Remove from start |
| `splice()` | removed items | Insert/remove/replace |
| `sort()` | sorted array | Sort in place |
| `reverse()` | reversed array | Reverse in place |
| `fill()` | modified array | Fill with static value |
| `copyWithin()` | modified array | Copy portion in place |

**Non-mutating methods:**

| Method | Returns | Description |
|--------|---------|-------------|
| `slice()` | new array | Extract portion |
| `concat()` | new array | Merge arrays |
| `flat()` | new array | Flatten depth |
| `flatMap()` | new array | Map + flatten one level |
| `map()` | new array | Transform each element |
| `filter()` | new array | Keep matching elements |
| `reduce()` | single value | Accumulate into one result |
| `reduceRight()` | single value | Accumulate right-to-left |
| `find()` | element/undefined | First match |
| `findIndex()` | index/-1 | Index of first match |
| `findLast()` | element/undefined | Last match (ES2023) |
| `findLastIndex()` | index/-1 | Index of last match (ES2023) |
| `every()` | boolean | All elements pass test |
| `some()` | boolean | At least one passes test |
| `includes()` | boolean | Value exists |
| `indexOf()` | index/-1 | First index of value |
| `lastIndexOf()` | index/-1 | Last index of value |
| `join()` | string | Join into string |
| `toString()` | string | String representation |
| `at()` | element | Index (supports negative) |
| `keys()` | iterator | Array indices |
| `values()` | iterator | Array values |
| `entries()` | iterator | [index, value] pairs |

---

## 6.2 Map

### Explain It

A `Map` is a collection of **key-value pairs** where keys can be **any type** (objects, functions, primitives). Maps maintain **insertion order** and provide an efficient `size` property.

**Map vs Object:**

| Feature | Map | Object |
|---------|-----|--------|
| Key types | Any type | Strings/Symbols only |
| Size | `map.size` | `Object.keys(obj).length` |
| Order | Insertion order (guaranteed) | Mostly insertion order (not guaranteed) |
| Performance | Optimized for frequent add/remove | Better for known keys |
| Prototype | No prototype pollution risk | Inherits from Object.prototype |
| Serialization | No native JSON support | Native JSON support |

**Core methods:**

| Method | Description |
|--------|-------------|
| `set(key, value)` | Add/update entry |
| `get(key)` | Retrieve value by key |
| `has(key)` | Check if key exists |
| `delete(key)` | Remove entry |
| `clear()` | Remove all entries |
| `size` | Number of entries |
| `forEach()` | Iterate over entries |
| `entries()` | Iterator of [key, value] |
| `keys()` | Iterator of keys |
| `values()` | Iterator of values |

---

### Prove It

```js
// --- Basic usage ---
const map = new Map();
map.set("name", "Alice");
map.set(42, "answer");
map.set(true, "yes");

console.log(map.get("name"));  // "Alice"
console.log(map.get(42));      // "answer"
console.log(map.size);         // 3
console.log(map.has(true));    // true

// --- Objects as keys ---
const objKey = { id: 1 };
map.set(objKey, "metadata");
console.log(map.get(objKey)); // "metadata"

// --- Chaining ---
const map2 = new Map()
  .set("a", 1)
  .set("b", 2)
  .set("c", 3);

console.log(map2.size); // 3

// --- Iteration ---
for (const [key, value] of map2) {
  console.log(`${key}: ${value}`);
}
// a: 1, b: 2, c: 3

// --- Converting to/from Object ---
const obj = { x: 1, y: 2, z: 3 };
const mapFromObj = new Map(Object.entries(obj));
console.log(mapFromObj.get("x")); // 1

const objFromMap = Object.fromEntries(map2);
console.log(objFromMap); // { a: 1, b: 2, c: 3 }

// --- Practical use case: counting ---
const words = ["apple", "banana", "apple", "cherry", "banana", "apple"];
const count = new Map();

for (const word of words) {
  count.set(word, (count.get(word) || 0) + 1);
}
console.log(count.get("apple"));  // 3
console.log(count.get("banana")); // 2
console.log(count.size);          // 3
```

---

## 6.3 Set

### Explain It

A `Set` is a collection of **unique values**. It uses the **SameValueZero algorithm** for equality, meaning `NaN === NaN` returns `true` inside a Set, but `-0` and `0` are considered equal.

**Core methods:**

| Method | Description |
|--------|-------------|
| `add(value)` | Add value (returns Set for chaining) |
| `has(value)` | Check if value exists |
| `delete(value)` | Remove value |
| `clear()` | Remove all values |
| `size` | Number of values |
| `forEach()` | Iterate over values |
| `entries()` | Iterator of [value, value] |
| `keys()` | Alias for values() |
| `values()` | Iterator of values |

**Set Operations (manual):**

```js
const setA = new Set([1, 2, 3, 4]);
const setB = new Set([3, 4, 5, 6]);

// Union
const union = new Set([...setA, ...setB]);
// Set {1, 2, 3, 4, 5, 6}

// Intersection
const intersection = new Set(
  [...setA].filter(x => setB.has(x))
);
// Set {3, 4}

// Difference (A - B)
const difference = new Set(
  [...setA].filter(x => !setB.has(x))
);
// Set {1, 2}
```

---

### Prove It

```js
// --- Unique values ---
const nums = [1, 2, 2, 3, 3, 3, 4];
const unique = new Set(nums);
console.log(unique);        // Set {1, 2, 3, 4}
console.log([...unique]);   // [1, 2, 3, 4]

// --- NaN handling ---
const special = new Set([NaN, NaN, undefined, 0, -0]);
console.log(special.size);  // 2 (NaN, undefined + 0===-0)
console.log(special.has(NaN)); // true

// --- Deduplication use case ---
const users = [
  { id: 1, name: "Alice" },
  { id: 2, name: "Bob" },
  { id: 1, name: "Alice" }  // duplicate reference
];

// Reference dedup
const uniqueUsers = [...new Set(users)];
console.log(uniqueUsers.length); // 2 (different references would not dedup)

// --- Practical: array uniqueness ---
const arr = ["a", "b", "a", "c", "b"];
const deduped = [...new Set(arr)];
console.log(deduped); // ['a', 'b', 'c']

// --- Checking membership efficiently ---
const fastLookup = new Set([100, 200, 300]);
const data = [50, 100, 150, 200, 250];

const found = data.filter(x => fastLookup.has(x));
console.log(found); // [100, 200]
```

---

## 6.4 WeakMap and WeakSet

### Explain It

`WeakMap` and `WeakSet` hold **weak references** to objects. This means the garbage collector can free the object if there are no other references to it, even if it's in a WeakMap/WeakSet.

**Key differences from Map/Set:**

| Feature | WeakMap/WeakSet | Map/Set |
|---------|-----------------|---------|
| Keys/Values | Objects only | Any type |
| Size | No `.size` property | `.size` available |
| Iteration | No `entries()`, `keys()`, `values()` | Full iteration support |
| `forEach()` | Not available | Available |
| GC behavior | Entries can be garbage collected | Prevents garbage collection |

**Why no iteration?** The order and contents could change unpredictably as objects are garbage collected. This would make iteration unreliable.

**Use cases:**

```js
// 1. Private data
const privateData = new WeakMap();

class User {
  constructor(name, password) {
    this.name = name;
    privateData.set(this, { password });
  }

  checkPassword(pw) {
    return privateData.get(this).password === pw;
  }
}

const user = new User("Alice", "secret123");
console.log(user.name);              // "Alice"
console.log(privateData.get(user));  // { password: "secret123" }
// When user is garbage collected, privateData entry is also cleaned up

// 2. Caching / memoization
const cache = new WeakMap();

function process(obj) {
  if (cache.has(obj)) {
    return cache.get(obj);
  }
  const result = /* expensive computation */ obj.value * 2;
  cache.set(obj, result);
  return result;
}

// 3. Storing metadata on DOM elements
const metadata = new WeakMap();
const element = document.createElement("div");

metadata.set(element, { clicks: 0, hoverTime: 0 });
// When element is removed from DOM and no refs exist, metadata is cleaned up
```

**WeakSet use cases:**

```js
// Track which objects have been processed
const processed = new WeakSet();

function process(obj) {
  if (processed.has(obj)) {
    return; // already processed
  }
  // ... process obj
  processed.add(obj);
}

// Tag objects
const tags = new WeakSet();
const item = { name: "Widget" };
tags.add(item);

console.log(tags.has(item)); // true
```

---

## 6.5 TypedArrays

### Explain It

TypedArrays provide a mechanism for reading and writing raw binary data in memory buffers. They consist of:

1. **ArrayBuffer** — Fixed-length binary data buffer (raw memory)
2. **DataView** — Read/write at specific byte offsets
3. **TypedArray views** — Interprets buffer as a typed array of fixed-size elements

**ArrayBuffer:**

```js
const buffer = new ArrayBuffer(8); // 8 bytes
console.log(buffer.byteLength);   // 8
```

**TypedArray types:**

| Type | Size | Range |
|------|------|-------|
| `Int8Array` | 1 byte | -128 to 127 |
| `Uint8Array` | 1 byte | 0 to 255 |
| `Uint8ClampedArray` | 1 byte | 0 to 255 (clamped) |
| `Int16Array` | 2 bytes | -32768 to 32767 |
| `Uint16Array` | 2 bytes | 0 to 65535 |
| `Int32Array` | 4 bytes | -2^31 to 2^31-1 |
| `Uint32Array` | 4 bytes | 0 to 2^32-1 |
| `Float32Array` | 4 bytes | IEEE 754 |
| `Float64Array` | 8 bytes | IEEE 754 |

**DataView for custom layouts:**

```js
const buffer = new ArrayBuffer(16);
const view = new DataView(buffer);

view.setInt8(0, 42);     // Write byte at offset 0
view.setFloat32(4, 3.14); // Write float32 at offset 4

console.log(view.getInt8(0));    // 42
console.log(view.getFloat32(4)); // 3.14
```

---

### Prove It

```js
// --- Creating TypedArrays ---
const a = new Uint8Array([1, 2, 3, 4]);
const b = new Float32Array([1.5, 2.5, 3.5]);

console.log(a); // Uint8Array [1, 2, 3, 4]
console.log(b); // Float32Array [1.5, 2.5, 3.5]

// --- From ArrayBuffer ---
const buf = new ArrayBuffer(12);
const intView = new Int32Array(buf);
intView[0] = 100;
intView[1] = 200;
intView[2] = 300;

console.log(intView); // Int32Array [100, 200, 300]
console.log(buf.byteLength); // 12

// --- Shared buffer views ---
const bytes = new Uint8Array(buf);
console.log(bytes[0]); // 100 (as 4-byte int, first byte)

// --- Practical: converting string to bytes ---
const encoder = new TextEncoder();
const bytes2 = encoder.encode("Hello");
console.log(bytes2); // Uint8Array [72, 101, 108, 108, 111]

// --- Practical: reading binary protocol ---
const packet = new ArrayBuffer(16);
const header = new DataView(packet);
header.setUint8(0, 0x01);      // version
header.setUint16(1, 0x0100);   // flags
header.setFloat32(4, 3.14);    // value

const version = header.getUint8(0);
const value = header.getFloat32(4);
console.log(version); // 1
console.log(value);   // 3.14

// --- Performance: TypedArray vs regular Array ---
const typedArr = new Float64Array(1000000);
const regularArr = new Array(1000000).fill(0);

// TypedArray is much faster for numeric operations
// and uses significantly less memory
console.log(typedArr.BYTES_PER_ELEMENT); // 8
```

---

## 6.6 JSON

### Explain It

JSON (JavaScript Object Notation) is a lightweight data interchange format. JavaScript provides two main methods: `JSON.parse()` and `JSON.stringify()`.

**JSON.stringify() syntax:**

```js
JSON.stringify(value, replacer, space)
```

- `replacer`: Function or array to filter/transform values
- `space`: Number of spaces or string for indentation

**JSON.parse() syntax:**

```js
JSON.parse(text, reviver)
```

- `reviver`: Function to transform parsed values before returning

**Limitations:**

| Type | JSON behavior |
|------|---------------|
| Functions | Omitted |
| `undefined` | Omitted |
| `Symbol` | Omitted |
| `Date` | Converted to string |
| `Map`, `Set`, `WeakMap` | Empty `{}` |
| `RegExp` | Empty `{}` |
| Circular references | Throws error |
| `Infinity`, `NaN` | `null` |
| Classes | Lost (becomes plain object) |

**structuredClone() for deep copy:**

```js
// Supports most types JSON doesn't
const original = {
  date: new Date(),
  data: new Map([["key", "value"]]),
  nested: { arr: [1, 2, 3] }
};

const cloned = structuredClone(original);
```

---

### Prove It

```js
// --- Basic stringify/parse ---
const obj = { name: "Alice", age: 30, hobbies: ["reading", "gaming"] };
const json = JSON.stringify(obj);
console.log(json);
// '{"name":"Alice","age":30,"hobbies":["reading","gaming"]}'

const parsed = JSON.parse(json);
console.log(parsed); // { name: 'Alice', age: 30, hobbies: ['reading', 'gaming'] }

// --- Replacer function ---
const user = {
  name: "Alice",
  password: "secret",
  age: 30
};

const safe = JSON.stringify(user, (key, value) => {
  if (key === "password") return undefined;
  return value;
});
console.log(safe); // '{"name":"Alice","age":30}'

// --- Replacer array (whitelist) ---
const minimal = JSON.stringify(user, ["name", "age"]);
console.log(minimal); // '{"name":"Alice","age":30}'

// --- Pretty printing ---
const pretty = JSON.stringify({ a: 1, b: [2, 3] }, null, 2);
console.log(pretty);
// {
//   "a": 1,
//   "b": [
//     2,
//     3
//   ]
// }

// --- Reviver function ---
const dateStr = '{"date":"2024-01-15T00:00:00.000Z","name":"Meeting"}';
const obj2 = JSON.parse(dateStr, (key, value) => {
  if (key === "date") return new Date(value);
  return value;
});
console.log(obj2.date instanceof Date); // true

// --- Limitations demo ---
const problematic = {
  fn: () => {},
  undef: undefined,
  sym: Symbol("test"),
  nan: NaN,
  inf: Infinity,
  date: new Date(),
  map: new Map([["a", 1]])
};

const result = JSON.stringify(problematic, null, 2);
console.log(result);
// {
//   "nan": null,
//   "inf": null,
//   "date": "2024-01-15T...",
//   "map": {}
// }
// Functions, undefined, Symbol are dropped!

// --- Deep copy with JSON (limited) ---
const original = { a: 1, b: { c: 2 } };
const deepCopy = JSON.parse(JSON.stringify(original));
deepCopy.b.c = 99;
console.log(original.b.c); // 2 (unchanged)

// --- Deep copy with structuredClone (preferred) ---
const original2 = {
  date: new Date(),
  data: new Map([["key", "value"]]),
  nested: { arr: [1, 2, 3] }
};
const deepCopy2 = structuredClone(original2);
console.log(deepCopy2.date instanceof Date); // true
console.log(deepCopy2.data instanceof Map);  // true
```

---

## 6.7 Interview Questions

### Q1: Which array methods mutate the original array?

**Answer:**

Mutating methods: `push()`, `pop()`, `shift()`, `unshift()`, `splice()`, `sort()`, `reverse()`, `fill()`, `copyWithin()`

Non-mutating: `slice()`, `concat()`, `flat()`, `flatMap()`, `map()`, `filter()`, `reduce()`, `find()`, `findIndex()`, `every()`, `some()`, `includes()`, `join()`

**Prove it:**

```js
const arr = [3, 1, 2];
arr.sort();           // mutates
console.log(arr);     // [1, 2, 3]

const arr2 = [3, 1, 2];
arr2.slice().sort();  // slice creates copy, sort mutates the copy
console.log(arr2);    // [3, 1, 2] (unchanged)
```

---

### Q2: When would you use a Map over an Object?

**Use Map when:**
- Keys are not strings (objects, functions, primitives)
- You need frequent add/remove operations
- You need guaranteed insertion order
- You need the `.size` property
- Keys are user-provided (avoids prototype collision)

**Use Object when:**
- Keys are known strings
- You need JSON serialization
- You're working with simple key-value pairs
- You want to use object destructuring

**Prove it:**

```js
// Object fails with non-string keys
const obj = {};
const fn = () => {};
obj[fn] = "function key";
console.log(obj[fn]);              // "function key"
console.log(Object.keys(obj)[0]);  // "() => {}" (converted to string)

// Map handles any key type natively
const map = new Map();
map.set(fn, "function key");
console.log(map.get(fn));          // "function key"

// Map.size is O(1), Object.keys is O(n)
const map2 = new Map();
for (let i = 0; i < 1000; i++) map2.set(i, i);
console.log(map2.size); // 1

const obj2 = {};
for (let i = 0; i < 1000; i++) obj2[i] = i;
console.log(Object.keys(obj2).length); // 1 (must create array first)
```

---

### Q3: How does Set deduplicate values?

**Answer:**

Set uses the **SameValueZero algorithm**:
- `===` comparison for most values
- Exception: `NaN` is considered equal to `NaN` (unlike `===`)
- `-0` and `0` are considered equal

```js
const s = new Set();
s.add(1);
s.add(1);         // ignored (same value)
s.add(NaN);
s.add(NaN);       // ignored (NaN === NaN in Set)
s.add("1");
s.add(true);

console.log([...s]); // [1, NaN, '1', true]
```

---

### Q4: What is the difference between WeakMap and Map?

| Feature | WeakMap | Map |
|---------|---------|-----|
| Keys | Objects only | Any type |
| Size | Not available | `.size` |
| Iteration | No methods | `entries()`, `keys()`, `values()`, `forEach()` |
| GC | Entries can be collected | Prevents GC |
| Use case | Private data, caching | General-purpose collection |

**Prove it:**

```js
// WeakMap allows garbage collection
let obj = { data: 123 };
const weakMap = new WeakMap();
weakMap.set(obj, "metadata");

obj = null; // obj is now eligible for GC
// weakMap entry will be cleaned up automatically

// Map prevents garbage collection
obj = { data: 456 };
const map = new Map();
map.set(obj, "metadata");

obj = null; // obj is NOT eligible for GC (Map holds reference)
```

---

### Q5: How do you deep clone an object?

**Answer:**

| Method | Pros | Cons |
|--------|------|------|
| `structuredClone()` | Supports most types, fast | No functions, no DOM nodes |
| `JSON.parse(JSON.stringify())` | Simple, widely supported | No functions, undefined, dates become strings, no circular refs |
| Manual recursive | Full control | Slow, complex |
| Libraries (lodash `_.cloneDeep`) | Battle-tested | Extra dependency |

**Prove it:**

```js
// structuredClone (preferred)
const original = {
  date: new Date(),
  map: new Map([["a", 1]]),
  set: new Set([1, 2, 3]),
  nested: { deep: true }
};

const clone = structuredClone(original);
clone.nested.deep = false;
console.log(original.nested.deep); // true (unchanged)

// JSON method (limited)
const clone2 = JSON.parse(JSON.stringify(original));
console.log(clone2.date instanceof Date); // false (it's a string)
console.log(clone2.map instanceof Map);   // false (it's an empty object)

// Spread operator (shallow only)
const shallow = { ...original };
shallow.nested.deep = false;
console.log(original.nested.deep); // false (nested object shared!)
```

---

## Sources

- MDN: [Indexed Collections](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Indexed_Collections)
- MDN: [Keyed Collections](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Keyed_Collections)
- MDN: [Typed Arrays](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Typed_arrays)
- MDN: [JSON](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON)
