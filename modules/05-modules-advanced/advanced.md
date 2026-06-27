# Module 05: JavaScript Modules & Advanced Features

---

## 5.1 ES Modules (ESM)

### Explain It

ES Modules are the official standard format to package JavaScript code for reuse. Modules allow you to break your code into separate files, each with its own scope, and control what gets exported and imported.

**Key characteristics:**
- Each module is its own scope — variables, functions, classes are private by default
- Strict mode is enabled automatically (no `"use strict"` needed)
- Modules are loaded asynchronously
- Only the exported values are accessible from outside

**Export Types:**

```javascript
// Named exports — export individual pieces
export const PI = 3.14159;
export function add(a, b) { return a + b; }
export class Calculator { /* ... */ }

// Export list at the end
const PI = 3.14159;
function add(a, b) { return a + b; }
export { PI, add };

// Renamed exports
export { PI as pi, add as sum };

// Default export — one per module
export default class User {
  constructor(name) { this.name = name; }
}
```

**Import Types:**

```javascript
// Named imports
import { PI, add } from './math.js';

// Renamed imports
import { PI as pi, add as sum } from './math.js';

// Default import (name is arbitrary)
import User from './user.js';

// Namespace import — entire module as object
import * as MathUtils from './math.js';
MathUtils.PI; // 3.14159
MathUtils.add(1, 2);

// Side-effect only import (no bindings imported)
import './polyfill.js';
```

**Re-exports:**

```javascript
// Re-export from another module
export { PI, add } from './math.js';

// Re-export all
export * from './math.js';

// Re-export with renaming
export { PI as pi } from './math.js';
```

**Dynamic Import:**

```javascript
// Returns a promise — useful for code splitting
const module = await import('./heavy-module.js');
module.default; // default export
module.namedExport; // named export

// Conditional loading
if (needsAdvancedFeature) {
  const { advanced } = await import('./advanced.js');
  advanced();
}
```

**Browser Setup:**

```html
<!-- ES Modules in browser -->
<script type="module" src="app.js"></script>

<!-- Modules are deferred by default (run after HTML parsing) -->
<!-- Modules use CORS — must be served over HTTP, not file:// -->
```

**Node.js Setup:**

```json
// package.json
{
  "type": "module"
}
```

```javascript
// Or use .mjs extension
// file.mjs
export const greeting = "Hello";
import { greeting } from './file.mjs';
```

### Prove It

```javascript
// --- math.js ---
export const PI = 3.14159;
export function add(a, b) { return a + b; }
export default class Calculator {
  result = 0;
  add(n) { this.result += n; return this; }
  get value() { return this.result; }
}

// --- app.js ---
import Calculator, { PI, add } from './math.js';
import * as MathUtils from './math.js';

console.log(PI);              // 3.14159
console.log(add(2, 3));       // 5

const calc = new Calculator();
calc.add(10).add(20);
console.log(calc.value);      // 30

console.log(MathUtils.PI);    // 3.14159

// Dynamic import — returns Promise
const dynamicModule = await import('./math.js');
console.log(dynamicModule.PI); // 3.14159
```

---

## 5.2 Iterators

### Explain It

An iterator is an object that defines a sequence and provides a `next()` method that returns `{ value, done }`. The iterator protocol makes objects iterable.

**Iterator Protocol:**

```javascript
// An iterator must have a next() method
// next() returns { value: <any>, done: <boolean> }
const myIterator = {
  current: 0,
  last: 5,
  next() {
    if (this.current <= this.last) {
      return { value: this.current++, done: false };
    }
    return { value: undefined, done: true };
  }
};

myIterator.next(); // { value: 0, done: false }
myIterator.next(); // { value: 1, done: false }
// ...continues until done: true
```

**Iterable Protocol:**

```javascript
// An iterable must have a [Symbol.iterator] method
// That method returns an iterator
const range = {
  start: 1,
  end: 5,
  [Symbol.iterator]() {
    let current = this.start;
    const last = this.end;
    return {
      next() {
        if (current <= last) {
          return { value: current++, done: false };
        }
        return { value: undefined, done: true };
      }
    };
  }
};

// Now works with for...of
for (const num of range) {
  console.log(num); // 1, 2, 3, 4, 5
}

// Works with spread
const numbers = [...range]; // [1, 2, 3, 4, 5]
```

**Built-in Iterables:**

```javascript
// Array — iterates over elements
const arr = [10, 20, 30];
const arrIter = arr[Symbol.iterator]();
arrIter.next(); // { value: 10, done: false }

// String — iterates over characters
const str = "hello";
const strIter = str[Symbol.iterator]();
strIter.next(); // { value: "h", done: false }

// Map — iterates over [key, value] pairs
const map = new Map([["a", 1], ["b", 2]]);
const mapIter = map[Symbol.iterator]();
mapIter.next(); // { value: ["a", 1], done: false }

// Set — iterates over unique values
const set = new Set([1, 2, 3]);
const setIter = set[Symbol.iterator]();
setIter.next(); // { value: 1, done: false }

// TypedArray — iterates over numeric elements
const typed = new Uint8Array([100, 200, 255]);
for (const val of typed) console.log(val); // 100, 200, 255

// arguments — iterates over function arguments
function demo() {
  for (const arg of arguments) console.log(arg);
}
demo("a", "b"); // "a", "b"
```

**for...of Uses Iterators:**

```javascript
// for...of is syntactic sugar for iterator consumption
for (const val of range) { /* ... */ }

// Equivalent manual iteration
const iter = range[Symbol.iterator]();
let result = iter.next();
while (!result.done) {
  const val = result.value;
  // use val
  result = iter.next();
}
```

**Spread Uses Iterators:**

```javascript
// Spread (...) consumes the iterator
const arr = [...range];    // [1, 2, 3, 4, 5]
const str = [..."hello"];  // ["h", "e", "l", "l", "o"]
const setArr = [...new Set([1, 2, 2, 3])]; // [1, 2, 3]

// Array.from also uses iterators
const fromIter = Array.from(range); // [1, 2, 3, 4, 5]

// Destructuring uses iterators
const [first, second] = range; // first=1, second=2
```

### Prove It

```javascript
// Custom iterable: Fibonacci sequence (lazy)
const fibonacci = {
  [Symbol.iterator]() {
    let a = 0, b = 1;
    return {
      next() {
        const value = a;
        [a, b] = [b, a + b];
        return { value, done: false }; // infinite!
      }
    };
  }
};

// Take first 10 Fibonacci numbers
let count = 0;
for (const num of fibonacci) {
  console.log(num); // 0, 1, 1, 2, 3, 5, 8, 13, 21, 34
  if (++count === 10) break;
}

// Spread stops when iterator is exhausted (finite)
const finiteRange = {
  [Symbol.iterator]() {
    let current = 0;
    return {
      next() {
        return current < 3
          ? { value: current++, done: false }
          : { value: undefined, done: true };
      }
    };
  }
};
console.log([...finiteRange]); // [0, 1, 2]

// Destructuring from iterator
const [a, b, c] = fibonacci; // a=0, b=1, c=1
```

---

## 5.3 Generators

### Explain It

Generators are functions that can be paused and resumed. They return an iterator object and use the `yield` keyword to produce values lazily.

**Basic Syntax:**

```javascript
// * marks this as a generator function
function* countTo(n) {
  for (let i = 1; i <= n; i++) {
    yield i; // pauses here, returns i as value
  }
}

const counter = countTo(3);
counter.next(); // { value: 1, done: false }
counter.next(); // { value: 2, done: false }
counter.next(); // { value: 3, done: false }
counter.next(); // { value: undefined, done: true }

// for...of consumes generators automatically
for (const val of countTo(5)) {
  console.log(val); // 1, 2, 3, 4, 5
}
```

**yield vs return:**

```javascript
function* demo() {
  yield 1;       // pause, produce 1
  yield 2;       // pause, produce 2
  return 3;      // final value, done: true
  yield 4;       // NEVER reached
}

const gen = demo();
gen.next(); // { value: 1, done: false }
gen.next(); // { value: 2, done: false }
gen.next(); // { value: 3, done: true }
gen.next(); // { value: undefined, done: true }
```

**yield* for Delegation:**

```javascript
function* inner() {
  yield "a";
  yield "b";
}

function* outer() {
  yield 1;
  yield* inner(); // delegates to inner generator
  yield 2;
}

[...outer()]; // [1, "a", "b", 2]

// yield* with arrays
function* concat(...iterables) {
  for (const iter of iterables) {
    yield* iter;
  }
}

[...concat([1, 2], [3, 4], [5])]; // [1, 2, 3, 4, 5]
```

**Generator as Iterator:**

```javascript
// Generators implement the iterator protocol automatically
class Range {
  constructor(start, end) {
    this.start = start;
    this.end = end;
  }

  // This makes Range iterable
  *[Symbol.iterator]() {
    for (let i = this.start; i <= this.end; i++) {
      yield i;
    }
  }
}

const range = new Range(1, 5);
console.log([...range]); // [1, 2, 3, 4, 5]
for (const n of range) console.log(n); // 1, 2, 3, 4, 5
```

**Two-Way Communication:**

```javascript
function* conversation() {
  const name = yield "What is your name?";
  const age = yield `Hello ${name}, how old are you?`;
  return `${name} is ${age} years old`;
}

const conv = conversation();
conv.next();              // { value: "What is your name?", done: false }
conv.next("Alice");       // { value: "Hello Alice, how old are you?", done: false }
conv.next(30);            // { value: "Alice is 30 years old", done: true }
```

**Use Cases:**

```javascript
// Lazy evaluation — generate only what's needed
function* fibonacci() {
  let a = 0, b = 1;
  while (true) {
    yield a;
    [a, b] = [b, a + b];
  }
}

// Infinite sequence — take what you need
function* take(n, iterable) {
  let count = 0;
  for (const item of iterable) {
    if (count++ >= n) return;
    yield item;
  }
}

const fib = fibonacci();
const first10 = [...take(10, fib)]; // [0, 1, 1, 2, 3, 5, 8, 13, 21, 34]

// Async control flow (pre-async/await)
function* fetchUser() {
  const response = yield fetch("/api/user");
  const data = yield response.json();
  return data;
}

// State machine
function* trafficLight() {
  while (true) {
    yield "RED";
    yield "YELLOW";
    yield "GREEN";
  }
}

const lights = trafficLight();
lights.next().value; // "RED"
lights.next().value; // "YELLOW"
lights.next().value; // "GREEN"
```

### Prove It

```javascript
// Generator that memoizes previously computed values
function* memoizedFib() {
  const cache = new Map();
  let a = 0, b = 1;

  while (true) {
    if (!cache.has(a)) {
      cache.set(a, a);
      yield a;
    }
    [a, b] = [b, a + b];
  }
}

// Generator for tree traversal (in-order)
class TreeNode {
  constructor(value, left, right) {
    this.value = value;
    this.left = left;
    this.right = right;
  }
}

function* inOrder(node) {
  if (node) {
    yield* inOrder(node.left);
    yield node.value;
    yield* inOrder(node.right);
  }
}

const tree = new TreeNode(4,
  new TreeNode(2,
    new TreeNode(1),
    new TreeNode(3)
  ),
  new TreeNode(6,
    new TreeNode(5),
    new TreeNode(7)
  )
);

console.log([...inOrder(tree)]); // [1, 2, 3, 4, 5, 6, 7]

// Two-way communication — producer/consumer
function* producer() {
  let value = 0;
  while (true) {
    const consumerSignal = yield value++;
    if (consumerSignal === "stop") return "Done producing";
  }
}

const prod = producer();
prod.next();           // { value: 0, done: false }
prod.next();           // { value: 1, done: false }
prod.next("stop");     // { value: undefined, done: true, return: "Done producing" }
```

---

## 5.4 Symbols

### Explain It

A Symbol is a primitive value that is always unique. It's commonly used as an identifier for object properties to avoid name collisions.

**Creating Symbols:**

```javascript
const sym1 = Symbol();
const sym2 = Symbol("description"); // description is for debugging only

sym1 === sym2; // false — always unique
Symbol("foo") === Symbol("foo"); // false

// Convert to string
String(sym1); // "Symbol()"
String(sym2); // "Symbol(description)"
```

**Global Symbol Registry:**

```javascript
// Symbol.for() — creates or retrieves a global symbol
const s1 = Symbol.for("shared");
const s2 = Symbol.for("shared");
s1 === s2; // true — same global symbol

// Symbol.keyFor() — get key from global symbol
Symbol.keyFor(s1); // "shared"
Symbol.keyFor(Symbol("test")); // undefined (not global)
```

**Symbols as Object Keys:**

```javascript
const ID = Symbol("id");
const NAME = Symbol("name");

const user = {
  [ID]: 123,
  [NAME]: "Alice",
  age: 30
};

user[ID];   // 123
user[NAME]; // "Alice"

// Not accessible via string keys
user.id;    // undefined
user["id"]; // undefined

// Object.keys() and for...in don't include symbol keys
Object.keys(user);        // ["age"]
Object.getOwnPropertySymbols(user); // [Symbol(id), Symbol(name)]
Reflect.ownKeys(user);    // ["age", Symbol(id), Symbol(name)]
```

**Well-Known Symbols:**

```javascript
// Symbol.iterator — define custom iteration
class Collection {
  constructor(...items) { this.items = items; }
  [Symbol.iterator]() {
    return this.items[Symbol.iterator]();
  }
}

// Symbol.toPrimitive — customize type coercion
class Money {
  constructor(amount) { this.amount = amount; }
  [Symbol.toPrimitive](hint) {
    switch (hint) {
      case "number": return this.amount;
      case "string": return `$${this.amount}`;
      default: return this.amount;
    }
  }
}

const price = new Money(99);
+price;     // 99 (number hint)
`${price}`; // "$99" (string hint)
price + 1;  // 100 (default hint)

// Symbol.toStringTag — customize Object.prototype.toString
class Validator {
  get [Symbol.toStringTag]() { return "Validator"; }
}

const v = new Validator();
Object.prototype.toString.call(v); // "[object Validator]"
```

### Prove It

```javascript
// Private-like properties using symbols
const _privateData = Symbol("private");

class User {
  constructor(name) {
    this.name = name;
    this[_privateData] = { password: "secret123" };
  }

  checkPassword(pwd) {
    return this[_privateData].password === pwd;
  }
}

const user = new User("Alice");
user.name; // "Alice"
user[_privateData]; // undefined (can't access without reference)

// Symbol as unique constant
const STATUS = {
  LOADING: Symbol("loading"),
  SUCCESS: Symbol("success"),
  ERROR: Symbol("error")
};

function handleStatus(status) {
  switch (status) {
    case STATUS.LOADING: return "Loading...";
    case STATUS.SUCCESS: return "Done!";
    case STATUS.ERROR: return "Failed!";
  }
}

handleStatus(STATUS.LOADING); // "Loading..."

// Symbol.for ensures shared identity across modules
// file1.js
const EVENT_BUS = Symbol.for("eventBus");
// file2.js
const EVENT_BUS = Symbol.for("eventBus");
// file1.js === file2.js — same symbol instance
```

---

## 5.5 Proxy & Reflect

### Explain It

A Proxy wraps an object and intercepts fundamental operations (reading, writing, function calls, etc.). Reflect provides the default behavior for these operations.

**Basic Proxy:**

```javascript
const handler = {
  get(target, prop, receiver) {
    console.log(`Accessing property: ${String(prop)}`);
    return Reflect.get(target, prop, receiver);
  },
  set(target, prop, value, receiver) {
    console.log(`Setting ${String(prop)} = ${value}`);
    return Reflect.set(target, prop, value, receiver);
  }
};

const user = new Proxy({ name: "Alice", age: 30 }, handler);
user.name;          // logs "Accessing property: name", returns "Alice"
user.age = 31;      // logs "Setting age = 31"
```

**Common Traps:**

```javascript
const proxy = new Proxy(target, {
  // Intercept property reading
  get(target, prop, receiver) {},

  // Intercept property writing
  set(target, prop, value, receiver) {},

  // Intercept `in` operator
  has(target, prop) {},

  // Intercept `delete`
  deleteProperty(target, prop) {},

  // Intercept function calls
  apply(target, thisArg, args) {},

  // Intercept `new` operator
  construct(target, args) {},

  // Intercept Object.keys(), for...in
  ownKeys(target) {},

  // Intercept Object.getOwnPropertyDescriptor()
  getOwnPropertyDescriptor(target, prop) {},

  // Intercept Object.defineProperty()
  defineProperty(target, prop, descriptor) {},

  // Intercept Object.preventExtensions()
  preventExtensions(target) {},

  // Intercept `in` check (Object.setPrototypeOf)
  setPrototypeOf(target, proto) {},

  // Intercept property access before prototype lookup
  getPrototypeOf(target) {},

  // Intercept property access for non-existent properties
  getOwnPropertyNames(target) {}
});
```

**Reflect Mirrors Proxy Traps:**

```javascript
const handler = {
  get(target, prop, receiver) {
    console.log(`Reading: ${String(prop)}`);
    return Reflect.get(target, prop, receiver); // default behavior
  },
  set(target, prop, value, receiver) {
    console.log(`Writing: ${String(prop)} = ${value}`);
    return Reflect.set(target, prop, value, receiver);
  },
  has(target, prop) {
    console.log(`Checking: ${String(prop)} in object`);
    return Reflect.has(target, prop);
  }
};
```

**Use Cases:**

```javascript
// 1. Validation
const validatedPerson = new Proxy({}, {
  set(target, prop, value) {
    if (prop === "age" && typeof value !== "number") {
      throw new TypeError("Age must be a number");
    }
    if (prop === "age" && (value < 0 || value > 150)) {
      throw new RangeError("Age must be 0-150");
    }
    return Reflect.set(target, prop, value);
  }
});

validatedPerson.age = 25;    // OK
// validatedPerson.age = "old"; // TypeError
// validatedPerson.age = 200;   // RangeError

// 2. Default values
const defaults = new Proxy({}, {
  get(target, prop) {
    return prop in target ? target[prop] : "default value";
  }
});

const config = new Proxy({ timeout: 5000 }, defaults);
config.timeout;  // 5000
config.retries;  // "default value"
config.port;     // "default value"

// 3. Logging / Auditing
function createAuditedProxy(obj, name) {
  return new Proxy(obj, {
    get(target, prop, receiver) {
      console.log(`[${name}] GET ${String(prop)}`);
      return Reflect.get(target, prop, receiver);
    },
    set(target, prop, value, receiver) {
      console.log(`[${name}] SET ${String(prop)} = ${JSON.stringify(value)}`);
      return Reflect.set(target, prop, value, receiver);
    }
  });
}

// 4. Reactive data (Vue.js style)
function reactive(obj, onChange) {
  return new Proxy(obj, {
    set(target, prop, value, receiver) {
      const oldValue = target[prop];
      const result = Reflect.set(target, prop, value, receiver);
      if (oldValue !== value) {
        onChange(prop, value, oldValue);
      }
      return result;
    }
  });
}

const state = reactive({ count: 0 }, (prop, newVal, oldVal) => {
  console.log(`${prop}: ${oldVal} → ${newVal}`);
});

state.count = 1;  // "count: 0 → 1"
state.count = 5;  // "count: 1 → 5"

// 5. Negative array indexing
function createNegativeIndexArray(arr) {
  return new Proxy(arr, {
    get(target, prop, receiver) {
      const index = Number(prop);
      if (!isNaN(index) && index < 0) {
        return Reflect.get(target, target.length + index, receiver);
      }
      return Reflect.get(target, prop, receiver);
    }
  });
}

const arr = createNegativeIndexArray([10, 20, 30, 40]);
arr[-1]; // 40
arr[-2]; // 30
```

### Prove It

```javascript
// Data binding with Proxy
function createStore(initialState) {
  const state = new Proxy({ ...initialState }, {
    set(target, prop, value) {
      const oldValue = target[prop];
      const result = Reflect.set(target, prop, value);
      document.querySelectorAll(`[data-bind="${prop}"]`).forEach(el => {
        el.textContent = value;
      });
      console.log(`State changed: ${prop} ${oldValue} → ${value}`);
      return result;
    }
  });
  return state;
}

// Access control with Proxy
function createSecureObj(obj, permissions) {
  return new Proxy(obj, {
    get(target, prop) {
      if (!(prop in target)) return undefined;
      const userRole = permissions.role;
      const requiredRole = permissions.requiredRole[prop] || "admin";
      if (userRole !== requiredRole) {
        throw new Error(`Access denied: ${String(prop)} requires ${requiredRole}`);
      }
      return Reflect.get(target, prop);
    }
  });
}

const admin = createSecureObj(
  { password: "secret", username: "admin" },
  { role: "admin", requiredRole: { password: "admin", username: "user" } }
);

admin.username; // "admin" (any role can access)
admin.password; // "secret" (admin can access)

// Immutable with Proxy
function immutable(obj) {
  return new Proxy(obj, {
    set() { throw new TypeError("Object is immutable"); },
    deleteProperty() { throw new TypeError("Object is immutable"); },
    defineProperty() { throw new TypeError("Object is immutable"); },
    preventExtensions() { throw new TypeError("Object is immutable"); },
    setPrototypeOf() { throw new TypeError("Object is immutable"); }
  });
}

const frozen = immutable({ x: 10 });
frozen.x;    // 10
// frozen.x = 20; // TypeError: Object is immutable
```

---

## 5.6 Resource Management (using/await using)

### Explain It

The `using` declaration (TC39 Proposal) provides automatic resource cleanup, similar to C#'s `using` or Python's `with` statement. It calls `[Symbol.dispose]()` or `[Symbol.asyncDispose]()` when the variable goes out of scope.

**Disposable Protocol:**

```javascript
// Implement Symbol.dispose for synchronous cleanup
class Connection {
  constructor(url) {
    this.url = url;
    this.connected = true;
    console.log(`Connected to ${url}`);
  }

  query(sql) {
    if (!this.connected) throw new Error("Not connected");
    return `Results for: ${sql}`;
  }

  // Called automatically when using block ends
  [Symbol.dispose]() {
    this.connected = false;
    console.log(`Disconnected from ${this.url}`);
  }
}

// Using the disposable
{
  using conn = new Connection("postgres://localhost");
  conn.query("SELECT * FROM users");
  // conn is automatically disposed when block exits
}
// Output:
// Connected to postgres://localhost
// Disconnected from postgres://localhost
```

**Async Disposable Protocol:**

```javascript
// Implement Symbol.asyncDispose for async cleanup
class AsyncFile {
  constructor(path) {
    this.path = path;
    this.fd = null;
  }

  async open() {
    // simulate file open
    this.fd = Math.floor(Math.random() * 1000);
    console.log(`Opened ${this.path} (fd: ${this.fd})`);
    return this;
  }

  async read() {
    return `Contents of ${this.path}`;
  }

  async [Symbol.asyncDispose]() {
    if (this.fd !== null) {
      console.log(`Closing ${this.path} (fd: ${this.fd})`);
      this.fd = null;
    }
  }
}

// Using async disposable
async function processFile() {
  await using file = await new AsyncFile("/tmp/data.txt").open();
  const data = await file.read();
  console.log(data);
  // file is automatically disposed when function exits
}
```

**Equivalence to Try/Finally:**

```javascript
// The `using` declaration is syntactic sugar for try/finally

// Using declaration:
{
  using resource = acquireResource();
  use(resource);
}

// Is equivalent to:
const resource = acquireResource();
try {
  use(resource);
} finally {
  resource[Symbol.dispose]();
}

// Async version:
async function example() {
  await using resource = await acquireAsyncResource();
  await use(resource);
}

// Equivalent to:
async function example() {
  const resource = await acquireAsyncResource();
  try {
    await use(resource);
  } finally {
    await resource[Symbol.asyncDispose]();
  }
}
```

**Practical Examples:**

```javascript
// Database connection pool
class DatabasePool {
  constructor(config) {
    this.config = config;
    this.connections = [];
  }

  async acquire() {
    const conn = { id: Math.random(), active: true };
    this.connections.push(conn);
    return {
      id: conn.id,
      execute: (sql) => `Executing: ${sql}`,
      [Symbol.dispose]: () => {
        conn.active = false;
        console.log(`Connection ${conn.id} released`);
      }
    };
  }
}

// Timer resource
class Timer {
  constructor(ms) {
    this.ms = ms;
    this.timer = null;
  }

  start(callback) {
    this.timer = setTimeout(callback, this.ms);
    return this;
  }

  [Symbol.dispose]() {
    if (this.timer) {
      clearTimeout(this.timer);
      console.log("Timer cleared");
    }
  }
}

// Usage
function handleRequest() {
  using timer = new Timer(5000).start(() => console.log("Timeout!"));
  // Process request...
  // Timer automatically cleared when block exits
}
```

### Prove It

```javascript
// Disposable pattern for temp files
class TempFile {
  constructor(content) {
    this.path = `/tmp/${Date.now()}.txt`;
    this.content = content;
    this.exists = true;
    console.log(`Created: ${this.path}`);
  }

  read() {
    if (!this.exists) throw new Error("File deleted");
    return this.content;
  }

  [Symbol.dispose]() {
    if (this.exists) {
      this.exists = false;
      console.log(`Deleted: ${this.path}`);
    }
  }
}

function processTemporaryData(data) {
  using tempFile = new TempFile(data);
  const result = tempFile.read().toUpperCase();
  return result;
  // tempFile automatically deleted after this line
}

const result = processTemporaryData("hello world");
console.log(result); // "HELLO WORLD"
// Output shows file created then deleted

// Multiple disposables in one block
function multiResourceExample() {
  using resource1 = new TempFile("file 1");
  using resource2 = new TempFile("file 2");

  console.log(resource1.read());
  console.log(resource2.read());
  // Both disposed in reverse order (LIFO) when block exits
}
```

---

## Interview Questions

### 1. What are the differences between ESM and CommonJS?

**ES Modules (ESM):**
- `import`/`export` syntax (static, hoisted)
- Asynchronous loading
- Each module has its own scope
- Strict mode by default
- Tree-shakable (static analysis possible)
- Browser native + Node.js (with `.mjs` or `"type": "module"`)
- `import` is resolved at parse time

**CommonJS (CJS):**
- `require()`/`module.exports` (dynamic, runtime)
- Synchronous loading
- Modules are cached after first require
- Not strict by default
- Not tree-shakable (dynamic)
- Node.js native (default in older versions)
- `require()` can be called conditionally

```javascript
// ESM
import { readFile } from 'fs/promises';
export const data = "hello";

// CommonJS
const fs = require('fs');
module.exports = { data: "hello" };

// CommonJS conditional require (not possible in ESM at top level)
if (condition) {
  const mod = require('./module');
}
```

### 2. What is an iterator?

An iterator is an object that implements the **iterator protocol**:
- Has a `next()` method
- `next()` returns `{ value: any, done: boolean }`
- When `done: true`, iteration is complete

An **iterable** implements `[Symbol.iterator]()` which returns an iterator. Built-in iterables include Array, String, Map, Set, TypedArray, and arguments.

```javascript
const arr = [1, 2, 3];
const iter = arr[Symbol.iterator]();
iter.next(); // { value: 1, done: false }
iter.next(); // { value: 2, done: false }
iter.next(); // { value: 3, done: false }
iter.next(); // { value: undefined, done: true }
```

### 3. How do generators work?

Generators are functions marked with `*` that:
1. Return an iterator object when called
2. Pause execution at each `yield` keyword
3. Produce a value via `yield`
4. Resume when `next()` is called again
5. Can receive values via `yield` expressions
6. Support delegation via `yield*`

```javascript
function* gen() {
  const a = yield 1;  // pause, produce 1, receive value on next next() call
  const b = yield 2;  // pause, produce 2
  return a + b;       // final value
}

const g = gen();
g.next();        // { value: 1, done: false }
g.next(10);      // { value: 2, done: false } — a = 10
g.next(20);      // { value: 30, done: true } — b = 20
```

### 4. When would you use Proxy?

Use Proxy for:
- **Validation** — enforce types/constraints on property assignment
- **Default values** — provide fallbacks for missing properties
- **Logging/auditing** — track access and modifications
- **Reactive data** — trigger updates when state changes (like Vue 3)
- **Access control** — restrict property access based on permissions
- **Negative indexing** — add array-like features
- **Immutable objects** — prevent modifications
- **Caching/memoization** — intercept and cache function calls

```javascript
// Quick example: validation
const user = new Proxy({}, {
  set(target, prop, value) {
    if (prop === "email" && !value.includes("@")) {
      throw new Error("Invalid email");
    }
    return Reflect.set(target, prop, value);
  }
});

user.email = "alice@example.com"; // OK
// user.email = "invalid";        // Error: Invalid email
```

### 5. What is the difference between `yield` and `yield*`?

- `yield value` — pauses the generator and produces `value`
- `yield* iterable` — delegates to another iterable/generator, yielding all its values

```javascript
function* inner() { yield 1; yield 2; }
function* outer() {
  yield "a";
  yield* inner();  // delegates — yields 1, 2
  yield "b";
}

[...outer()]; // ["a", 1, 2, "b"]
```

### 6. Explain the Disposable pattern.

The Disposable pattern provides automatic resource cleanup using `Symbol.dispose` and `Symbol.asyncDispose`. When a variable is declared with `using` (or `await using` for async), its dispose method is automatically called when it goes out of scope.

This is equivalent to try/finally but more concise and less error-prone:

```javascript
// Instead of:
const conn = new Connection();
try {
  conn.query("...");
} finally {
  conn.close();
}

// You write:
using conn = new Connection();
conn.query("...");
// auto-closed!
```

---

## Summary

| Feature | Purpose | Key Syntax |
|---------|---------|------------|
| ES Modules | Code organization & reuse | `import`/`export` |
| Iterators | Custom iteration protocol | `[Symbol.iterator]()` → `{ next() }` |
| Generators | Lazy sequences & control flow | `function*`, `yield`, `yield*` |
| Symbols | Unique identifiers | `Symbol()`, `Symbol.for()` |
| Proxy | Object interception | `new Proxy(target, handler)` |
| Reflect | Default proxy behavior | `Reflect.get/set/has/...` |
| Disposable | Auto resource cleanup | `using`, `Symbol.dispose` |

---

*Sources: MDN JavaScript modules, MDN Iterators and generators, MDN Meta programming, MDN Resource management*
