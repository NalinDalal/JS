# Module 04: Asynchronous JavaScript

> Sources: MDN Using Promises, MDN Async/Await, MDN Fetch API, Namaste JS EP-01 to EP-05, EP-14, EP-15

---

## 4.1 Synchronous vs Asynchronous

### Explain It

JavaScript is **single-threaded** — it has one call stack and executes one piece of code at a time.

**Synchronous code** runs line by line. Each line must finish before the next starts.

```js
console.log("A");
console.log("B");
console.log("C");
// Output: A → B → C
```

**Asynchronous code** doesn't block execution. The engine fires the operation and moves on; a callback runs later when the operation completes.

```js
console.log("A");
setTimeout(() => console.log("B"), 0);
console.log("C");
// Output: A → C → B
```

### Why Async?

JavaScript runs in browsers and servers (Node.js). Both handle I/O — network requests, file reads, timers — which are **slow**. If JS blocked on every I/O operation, the UI or server would freeze.

The solution: the **Event Loop** model. Offload slow work to the system (Web APIs / Node APIs), and when it's done, push a callback onto the queue. The event loop picks it up when the call stack is empty.

### Prove It

```js
// Single-threaded proof: long sync block freezes everything
console.log("start");
const start = Date.now();
while (Date.now() - start < 3000) {} // block for 3s
console.log("end");
// Both lines appear 3 seconds apart — JS cannot do anything else during that block
```

```
start
<... 3 second freeze ...>
end
```

**Key takeaway:** Async is not parallelism. It's cooperative multitasking via the event loop.

---

## 4.2 Event Loop

### Explain It

The event loop is the engine that continuously checks:

1. Is the **call stack** empty?
2. If yes, pick the next task from the **microtask queue** (all of them), then the **macrotask queue** (one at a time).

#### Components

| Component | Role |
|---|---|
| **Call Stack** | LIFO — tracks what function is currently executing |
| **Web APIs / Node APIs** | Offloaded work (setTimeout, fetch, fs.readFile, DOM events) |
| **Macrotask Queue** | setTimeout, setInterval, setImmediate, I/O callbacks, requestAnimationFrame |
| **Microtask Queue** | Promise callbacks (.then/.catch/.finally), queueMicrotask(), MutationObserver |

#### Execution Order

```
1. Execute all synchronous code (call stack)
2. When call stack is empty:
   a. Drain the ENTIRE microtask queue (first in, first out)
   b. If microtasks were added during step 2a, run them too
   c. Pick ONE macrotask from the macrotask queue
   d. Go back to step 1
```

#### Visual Diagram

```
┌──────────────────────────┐
│       Call Stack          │ ← executes code (LIFO)
└────────────┬─────────────┘
             │ empty?
             ▼
┌──────────────────────────┐
│    Microtask Queue        │ ← Promises, queueMicrotask
│    (drain ALL)            │
└────────────┬─────────────┘
             │ empty?
             ▼
┌──────────────────────────┐
│    Macrotask Queue        │ ← setTimeout, I/O, DOM events
│    (pick ONE)             │
└──────────────────────────┘
             │
             └──→ back to Call Stack
```

### Prove It

```js
setTimeout(() => console.log("1: setTimeout"), 0);
Promise.resolve().then(() => console.log("2: Promise"));
queueMicrotask(() => console.log("3: microtask"));
console.log("4: sync");

// Output: 4 → 2 → 3 → 1
```

Why?
- `4: sync` — synchronous, runs immediately
- `2: Promise` — microtask, runs after sync code
- `3: microtask` — microtask, runs after Promise microtask
- `1: setTimeout` — macrotask, runs after ALL microtasks are drained

```js
// Nested microtasks are still drained
Promise.resolve().then(() => {
  console.log("micro 1");
  Promise.resolve().then(() => console.log("micro 2"));
});
console.log("sync");

// Output: sync → micro 1 → micro 2
// Microtask queue is drained completely before macrotasks
```

```js
// Macrotask interleaving
setTimeout(() => console.log("timeout 1"), 0);
setTimeout(() => console.log("timeout 2"), 0);
Promise.resolve().then(() => console.log("promise 1"));
Promise.resolve().then(() => console.log("promise 2"));

// Output: promise 1 → promise 2 → timeout 1 → timeout 2
// All microtasks first, then macrotasks one at a time
```

---

## 4.3 Callbacks

### Explain It

A **callback** is a function passed as an argument to another function, intended to run later (when an async operation completes or an event fires).

```js
function fetchData(callback) {
  setTimeout(() => {
    callback(null, { name: "Alice" });
  }, 1000);
}

fetchData((err, data) => {
  if (err) console.error(err);
  else console.log(data);
});
```

#### Callback Hell / Pyramid of Doom

When callbacks nest deeply, code becomes unreadable:

```js
getUser(id, (err, user) => {
  getOrders(user.id, (err, orders) => {
    getOrderDetails(orders[0].id, (err, details) => {
      getShippingStatus(details.trackingId, (err, status) => {
        console.log(status);
        // pyramid continues...
      });
    });
  });
});
```

Problems: hard to read, hard to handle errors, hard to compose.

#### Error-First Callbacks (Node.js convention)

```js
fs.readFile("data.json", (err, data) => {
  if (err) {
    console.error("Error reading file:", err);
    return;
  }
  console.log(data);
});
```

The convention: first argument is always `err` (null on success), second is the result.

### Prove It

```js
// Callbacks execute immediately when the async operation finishes
// This code demonstrates ordering

const fs = require("fs");

console.log("1: before readFile");
fs.readFile(__filename, "utf8", (err, data) => {
  console.log("3: inside callback");
});
console.log("2: after readFile");

// Output: 1 → 2 → 3
// The callback runs after the file I/O, not inline
```

---

## 4.4 Promises

### Explain It

A **Promise** represents the eventual completion (or failure) of an async operation.

#### Three States

| State | Meaning |
|---|---|
| **Pending** | Initial state. Neither fulfilled nor rejected. |
| **Fulfilled** | Operation completed successfully. Has a result value. |
| **Rejected** | Operation failed. Has a reason (error). |

Once settled (fulfilled or rejected), a promise **never changes state**.

#### Creating a Promise

```js
const promise = new Promise((resolve, reject) => {
  // do async work
  const success = true;
  if (success) {
    resolve("done!"); // fulfilled
  } else {
    reject(new Error("failed")); // rejected
  }
});
```

#### .then() Chaining

`.then()` returns a **new promise**, enabling chaining:

```js
fetchUser(1)
  .then(user => fetchPosts(user.id))   // returns new promise
  .then(posts => fetchComments(posts[0].id)) // returns new promise
  .then(comments => console.log(comments))
  .catch(err => console.error(err))    // catches any error in the chain
  .finally(() => console.log("cleanup"));
```

- `.then()` — runs on fulfillment; if it returns a promise, the chain waits
- `.catch()` — runs on rejection; catches any error above it in the chain
- `.finally()` — runs regardless of fulfillment or rejection (no arguments)

#### Promise.all()

Waits for **all** promises to fulfill. If **any** rejects, the whole thing rejects immediately.

```js
const results = await Promise.all([
  fetch("/api/a"),
  fetch("/api/b"),
  fetch("/api/c"),
]);
// results is [responseA, responseB, responseC]
```

#### Promise.allSettled()

Waits for **all** promises to settle (fulfilled or rejected). Never rejects. Returns an array of status objects:

```js
const results = await Promise.allSettled([
  fetch("/api/a"),
  fetch("/api/b"),
  fetch("/api/c"), // this one might fail
]);

results.forEach(result => {
  if (result.status === "fulfilled") {
    console.log("Success:", result.value);
  } else {
    console.log("Failed:", result.reason);
  }
});
```

#### Promise.race()

Returns the **first** promise to settle (fulfill or reject):

```js
const fastest = await Promise.race([
  fetch("/api/slow"),
  fetch("/api/fast"), // this one wins
]);
```

#### Promise.any()

Returns the **first** promise to **fulfill**. Ignores rejections. Only rejects if **all** promises reject:

```js
const result = await Promise.any([
  fetch("/api/primary"),
  fetch("/api/backup"), // this resolves first
]);

// If both reject:
// → AggregateError with all rejection reasons
```

#### Common Mistakes

```js
// ❌ Floating promise — not awaited, errors lost
fetchUser(id); // promise fires but nothing handles it

// ❌ Not returning in .then() — breaks the chain
promise.then(data => {
  fetchNext(data); // should be: return fetchNext(data)
});

// ❌ Swallowing errors
promise.then(
  data => doSomething(data),
  err => {} // silently eats the error
);

// ✅ Correct
promise
  .then(data => doSomething(data))
  .catch(err => console.error(err));
```

### Prove It

```js
// Promise.all — fast rejection
Promise.all([
  new Promise(resolve => setTimeout(() => resolve("a"), 200)),
  new Promise((_, reject) => setTimeout(() => reject(new Error("b")), 100)),
  new Promise(resolve => setTimeout(() => resolve("c"), 300)),
]).catch(err => console.log(err.message));
// Output: "b" (rejects as soon as any promise rejects)

// Promise.allSettled — waits for all
Promise.allSettled([
  new Promise(resolve => setTimeout(() => resolve("a"), 200)),
  new Promise((_, reject) => setTimeout(() => reject(new Error("b")), 100)),
  new Promise(resolve => setTimeout(() => resolve("c"), 300)),
]).then(results => results.forEach(r => console.log(r.status, r.value || r.reason.message)));
// Output:
// fulfilled "a"
// rejected "b"
// fulfilled "c"
// (waits ~300ms, not 100ms)

// Promise.any — ignores rejections
Promise.any([
  new Promise((_, reject) => reject(new Error("a"))),
  new Promise(resolve => setTimeout(() => resolve("b"), 100)),
]).then(val => console.log(val));
// Output: "b" (first to fulfill)

// Promise.any — all reject
Promise.any([
  new Promise((_, reject) => reject(new Error("a"))),
  new Promise((_, reject) => reject(new Error("b"))),
]).catch(err => console.log(err instanceof AggregateError, err.errors.length));
// Output: true 2
```

---

## 4.5 async/await

### Explain It

`async/await` is **syntactic sugar** over promises. It makes async code look and behave like synchronous code.

```js
// Promises
fetchUser(id)
  .then(user => fetchPosts(user.id))
  .then(posts => console.log(posts))
  .catch(err => console.error(err));

// async/await
async function getUserPosts(id) {
  try {
    const user = await fetchUser(id);
    const posts = await fetchPosts(user.id);
    console.log(posts);
  } catch (err) {
    console.error(err);
  }
}
```

#### Rules

1. `async` before a function makes it return a promise
2. `await` pauses execution **inside** the async function until the promise settles
3. `await` can only be used inside `async` functions (or at module top level)
4. `try/catch` replaces `.catch()` for error handling

#### Parallel vs Sequential

```js
// ❌ Sequential — takes 4 seconds total (2 + 2)
const a = await fetch("/api/a");  // 2s
const b = await fetch("/api/b");  // 2s
// total: 4s

// ✅ Parallel — takes 2 seconds total
const [a, b] = await Promise.all([
  fetch("/api/a"),
  fetch("/api/b"),
]);
// total: 2s
```

#### Top-Level Await (Modules)

```js
// In a module (type="module" in script tag or .mjs file)
const response = await fetch("/api/config");
const config = await response.json();
console.log(config);
```

Top-level `await` is available in ES modules. It pauses module evaluation.

#### Promise.all with async/await

```js
async function loadDashboard() {
  const [users, posts, comments] = await Promise.all([
    fetchUsers(),
    fetchPosts(),
    fetchComments(),
  ]);
  return { users, posts, comments };
}
```

### Prove It

```js
// async function always returns a promise
async function greet() {
  return "hello";
}

greet().then(val => console.log(val)); // "hello"
console.log(typeof greet()); // "object" (it's a Promise)

// await unwraps the promise
async function main() {
  const val = await Promise.resolve(42);
  console.log(val); // 42
}

// Error handling with try/catch
async function risky() {
  try {
    const data = await Promise.reject(new Error("oops"));
  } catch (err) {
    console.log("caught:", err.message); // "caught: oops"
  }
}

risky();
```

---

## 4.6 Fetch API

### Explain It

`fetch()` is the modern API for making HTTP requests. It returns a **Promise** that resolves to a `Response` object.

#### Request/Response Model

```js
const response = await fetch("https://api.example.com/data");
// response is a Response object (not the actual data yet)

const data = await response.json(); // parses JSON body
```

#### HTTP Methods

```js
// GET (default)
const res = await fetch("https://api.example.com/users");

// POST
const res = await fetch("https://api.example.com/users", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({ name: "Alice", email: "alice@example.com" }),
});

// PUT
const res = await fetch("https://api.example.com/users/1", {
  method: "PUT",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ name: "Alice Updated" }),
});

// DELETE
const res = await fetch("https://api.example.com/users/1", {
  method: "DELETE",
});
```

#### Response Methods

```js
const response = await fetch("/api/data");

const json = await response.json();     // parse as JSON
const text = await response.text();     // parse as plain text
const blob = await response.blob();     // parse as Blob (binary)
const formData = await response.formData(); // parse as FormData
```

#### Response Properties

```js
response.ok;          // true if status 200-299
response.status;      // 200, 404, 500, etc.
response.statusText;  // "OK", "Not Found", etc.
response.headers;     // Headers object (iterable)
response.url;         // final URL after redirects
response.type;        // "basic", "cors", "opaque", etc.
```

#### Error Handling

**Important:** `fetch()` only rejects on **network errors** (DNS failure, no connection, CORS). It does **not** reject on HTTP error status codes (404, 500). You must check `response.ok` manually.

```js
async function fetchData(url) {
  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (err) {
    // This catches BOTH network errors AND the thrown HTTP error
    console.error("Fetch failed:", err.message);
    throw err;
  }
}
```

#### AbortController for Cancellation

```js
const controller = new AbortController();

// Start the fetch with abort signal
fetch("/api/slow", { signal: controller.signal })
  .then(res => res.json())
  .then(data => console.log(data))
  .catch(err => {
    if (err.name === "AbortError") {
      console.log("Request was cancelled");
    } else {
      console.error("Network error:", err);
    }
  });

// Cancel after 5 seconds
setTimeout(() => controller.abort(), 5000);
```

### Prove It

```js
// fetch only rejects on network errors, not HTTP errors
try {
  const response = await fetch("https://httpbin.org/status/404");
  console.log(response.ok);     // false
  console.log(response.status); // 404
  // No error thrown — you must check response.ok
} catch (err) {
  // Only runs on network failure (no internet, DNS error, etc.)
  console.log("Network error:", err.message);
}

// AbortController cancels the fetch
const controller = new AbortController();
fetch("https://httpbin.org/delay/10", { signal: controller.signal })
  .catch(err => console.log(err.name)); // "AbortError"
controller.abort();
```

---

## Interview Questions

### Q1: What is the event loop?

**Answer:**

The event loop is the mechanism that allows JavaScript to perform non-blocking I/O despite being single-threaded. It continuously monitors:

1. The **call stack** — is it empty?
2. The **microtask queue** — any pending microtasks? (drain all)
3. The **macrotask queue** — any pending macrotasks? (run one)

When the call stack is empty, the event loop picks the highest-priority task (microtasks first, then macrotasks) and pushes it onto the call stack for execution.

**Follow-up:** In Node.js, the event loop has phases (timers → pending callbacks → idle/prepare → poll → check → close). Each phase handles different types of macrotasks.

---

### Q2: What is the difference between microtasks and macrotasks?

**Answer:**

| | Microtask | Macrotask |
|---|---|---|
| **Examples** | `Promise.then`, `queueMicrotask`, `MutationObserver` | `setTimeout`, `setInterval`, `setImmediate`, I/O, `requestAnimationFrame` |
| **When** | After current task, before next macrotask | After all microtasks are drained |
| **Queue behavior** | Drain ALL microtasks | Pick ONE macrotask |

**Execution order:** sync code → all microtasks → one macrotask → all microtasks → one macrotask → ...

```js
setTimeout(() => console.log("macrotask"), 0);
Promise.resolve().then(() => console.log("microtask"));
console.log("sync");

// Output: sync → microtask → macrotask
```

---

### Q3: What is the difference between Promise.all and Promise.allSettled?

**Answer:**

| | `Promise.all` | `Promise.allSettled` |
|---|---|---|
| **Rejects if** | Any single promise rejects | Never rejects |
| **Returns** | Array of fulfillment values | Array of `{status, value/reason}` objects |
| **Use when** | All promises must succeed | You want results of all, regardless of success/failure |

```js
// Promise.all — short-circuits on first rejection
Promise.all([p1, p2, p3]).catch(err => ...);

// Promise.allSettled — always resolves
Promise.allSettled([p1, p2, p3]).then(results => {
  results.forEach(r => {
    if (r.status === "fulfilled") { /* use r.value */ }
    else { /* handle r.reason */ }
  });
});
```

---

### Q4: What are common async/await mistakes?

**Answer:**

1. **Not wrapping in try/catch:**
   ```js
   // ❌
   const data = await fetch(url);

   // ✅
   try {
     const data = await fetch(url);
   } catch (err) { /* handle */ }
   ```

2. **Sequential awaits instead of parallel:**
   ```js
   // ❌ Takes 4s (2+2)
   const a = await fetch("/a");
   const b = await fetch("/b");

   // ✅ Takes 2s (parallel)
   const [a, b] = await Promise.all([fetch("/a"), fetch("/b")]);
   ```

3. **Forgetting await:**
   ```js
   // ❌ promise is floating, error lost
   saveToDatabase(data);

   // ✅
   await saveToDatabase(data);
   ```

4. **Using await in loops:**
   ```js
   // ❌ sequential — each waits for previous
   for (const id of ids) {
     const user = await fetchUser(id);
   }

   // ✅ parallel
   const users = await Promise.all(ids.map(id => fetchUser(id)));
   ```

---

### Q5: How does async/await differ from .then() chaining?

**Answer:**

| | `async/await` | `.then()` |
|---|---|---|
| **Readability** | Linear, like synchronous code | Nested callbacks (though flatter than callback hell) |
| **Debugging** | Stack traces show async function names | Stack traces show Promise internals |
| **Error handling** | `try/catch` (familiar pattern) | `.catch()` at end of chain |
| **Control flow** | Natural `if/else`, `for`, `while` | Requires `.then()` chains or helper functions |
| **Under the hood** | Syntactic sugar — compiler transforms to promises | Native promise API |

```js
// They are equivalent:

// .then()
fetchUser(id)
  .then(user => fetchPosts(user.id))
  .then(posts => renderPosts(posts))
  .catch(err => handleError(err));

// async/await
async function loadPosts(id) {
  try {
    const user = await fetchUser(id);
    const posts = await fetchPosts(user.id);
    renderPosts(posts);
  } catch (err) {
    handleError(err);
  }
}
```

---

### Q6: How do you properly handle fetch errors?

**Answer:**

```js
async function safeFetch(url, options = {}) {
  try {
    const response = await fetch(url, options);

    // Handle HTTP errors (fetch doesn't reject on 404/500)
    if (!response.ok) {
      const errorBody = await response.text().catch(() => "");
      throw new Error(
        `HTTP ${response.status}: ${response.statusText} — ${errorBody}`
      );
    }

    return await response.json();
  } catch (err) {
    if (err.name === "AbortError") {
      console.log("Request cancelled");
    } else if (err.name === "TypeError") {
      // Network error, DNS failure, CORS block
      console.error("Network error:", err.message);
    } else {
      console.error("Fetch error:", err.message);
    }
    throw err; // re-throw for caller to handle
  }
}
```

**Key points:**
- Always check `response.ok` — fetch only rejects on network-level failures
- Distinguish between `TypeError` (network) and other errors
- Use `AbortController` for request cancellation/timeouts
- Always use `try/catch` with `await fetch()`

---

## Quick Reference

```
Event Loop Order:
  1. Sync code (call stack)
  2. ALL microtasks (Promise, queueMicrotask)
  3. ONE macrotask (setTimeout, I/O)
  4. Repeat

Promise Methods:
  Promise.all()         — all must resolve
  Promise.allSettled()  — waits for all, never rejects
  Promise.race()        — first to settle (fulfill or reject)
  Promise.any()         — first to fulfill (ignores rejections)

async/await:
  async fn → returns Promise
  await    → pauses until promise settles
  try/catch → error handling

fetch():
  response.ok  → check for HTTP errors
  response.json() → parse body
  Only rejects on network errors
```

---

## 4.11 JS Engine & V8 Architecture

### Explain It

Every browser has a **JS engine** that compiles and executes JavaScript. Google's **V8** (Chrome, Node.js) is the most well-known. The pipeline:

1. **Parsing** — source code → AST (Abstract Syntax Tree). Syntax errors caught here.
2. **Compilation** — AST → bytecode via **Ignition** (interpreter). Fast startup.
3. **Optimization** — **TurboFan** (optimizing compiler) hot-profiles code → optimized machine code. Uses **JIT** (Just-In-Time) compilation.
4. **Garbage Collection** — **Orinoco** handles memory cleanup. Generational GC: young generation (scavenge) + old generation (mark-sweep/mark-compact).

**Hidden classes** — V8 creates hidden classes for object shapes to enable inline caching (fast property access). Objects with the same structure share a hidden class.

**Deoptimization** — if TurboFan's assumptions break (e.g., type changes), V8 bails back to Ignition. This is why consistent types perform better.

### Prove It

```js
// V8 optimizes for consistent types
function add(a, b) {
  return a + b;
}

// Monomorphic: always numbers → TurboFan optimizes
add(1, 2);
add(3, 4);
add(5, 6);

// Polymorphic: mixed types → deopt
add(1, "hello"); // string concatenation — V8 must deoptimize

// Object shape consistency
const obj1 = { x: 1, y: 2 };
const obj2 = { x: 3, y: 4 };
// Same hidden class → fast

const obj3 = { x: 5 };
obj3.y = 6; // Different hidden class (added property after creation) → slower
```

**Key takeaway:** Write consistent, predictable code. Same types, same object shapes. The engine rewards consistency with speed.

---

*Last updated: 2026*
