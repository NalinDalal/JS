# Module 15: Node.js Internals — Event Loop, libuv, Streams

---

## 15.1 Node Architecture (V8 + libuv + JS Layer + Bindings)

### Explain It

Node.js is three layers stacked together. The **JS layer** is your code plus Node's standard library (`fs`, `http`, `crypto`, `streams`), written in JavaScript. The **C++ bindings** are a thin bridge (`node_api`) that expose native capabilities to JS. **libuv** is a C library that provides the cross-platform **event loop** and the **thread pool** — it handles timers, filesystem I/O, networking, and signal handling without blocking. **V8** is the JavaScript engine (from Chrome) that parses, compiles, and executes your JS on a single thread, and it also provides the memory heap and garbage collector. So your JS code is single-threaded, but the *runtime* is heavily multi-threaded: libuv's thread pool runs filesystem, DNS, crypto, and zlib work in the background, and the OS networking layer is async at the kernel level. The event loop itself lives on the main thread — every `callback`, `Promise`, and `await` you write is just a function that the loop picks up and runs when its turn comes.

### Prove It

```js
// 01-architecture.js — run: node 01-architecture.js
```

#### Gotchas / Edge Cases

- "Node is single-threaded" is true only for your JS execution — the event loop runs on one thread, but libuv spawns up to 4 (by default) extra threads, and the OS schedules kernel threads for sockets.
- V8's heap and GC run entirely on the main thread; a fast-growing heap causes GC pauses that stall the event loop.
- `console.log` goes through the C++ bindings to the OS — it's synchronous to stdout when piped, which can be a hidden bottleneck in heavy loggers.
- The JS layer and bindings change across Node versions, but libuv's job is identical on Linux, macOS, and Windows (it wraps epoll/kqueue/IOCP).

---

## 15.2 Event Loop Phases In Order

### Explain It

The event loop iterates through **phases**, in a fixed order, forever: **timers** (expired `setTimeout`/`setInterval` callbacks) → **pending callbacks** (deferred I/O callbacks like some TCP errors) → **poll** (I/O callbacks, e.g. `fs.readFile` completions; this phase also blocks waiting for new events when nothing is queued) → **check** (all `setImmediate` callbacks) → **close** (`close` events, e.g. `socket.on('close')`). After *every* phase — and after *every* callback — the loop drains the **microtask queue** (`nextTick` first, then `Promise` callbacks) before moving on. That's why a `Promise.resolve()` scheduled inside an `fs` callback runs before the next `setTimeout`. The whole loop is what makes "blocking" bad: any expensive JS running in one callback delays every later phase, so a CPU-heavy `for` loop starves timers, I/O, and rendering of new connections alike.

### Prove It

```js
// 02-event-loop-order.js — run: node 02-event-loop-order.js
```

#### Gotchas / Edge Cases

- The **poll phase blocks** — if there is no work to do, the event loop sleeps in `epoll`/`kqueue` waiting for events; it only times out to let `timers`/`check` phases run.
- `setImmediate` and `setTimeout(0)` at the top level of the module are a *race* — the list of timers is computed, then the loop starts; on most machines `setImmediate` often wins, but it's not guaranteed.
- A `setImmediate` scheduled inside a `setImmediate` runs **one full loop iteration later** — the loop won't re-enter `check` until the next cycle (this is the `setImmediate` useful-for-yielding trick).
- Microtasks can starve I/O: a `Promise` chain that re-schedules itself never lets the loop reach the poll phase.

---

## 15.3 process.nextTick vs Microtask vs Macrotask

### Explain It

Tasks fall into three buckets. **Macrotasks** are the phase callbacks (`setTimeout`, I/O, `setImmediate`) — they run once per phase visit. **Microtasks** are `Promise.then/catch` callbacks — they run after every callback and after every phase. **process.nextTick** sits at the very front of the microtask drain: after each callback, Node drains *all* `nextTick` callbacks first, then all `Promise` microtasks (in newer Node versions each separately), then returns to the loop. `nextTick` is technically not part of the event loop spec — it's a Node extension with the highest priority. Use it when you need to guarantee something runs before any further I/O is processed (e.g. rethrowing an error before freeing a resource). The danger: a `nextTick` that recursively schedules itself never lets the event loop proceed, freezing I/O, timers, and the process's ability to exit — a classic **starvation** foot-gun.

### Prove It

```js
// 02-event-loop-order.js — run: node 02-event-loop-order.js
//   watch the top-level order: synchronous code → nextTick → Promise → timers
```

#### Gotchas / Edge Cases

- `nextTick` callbacks run *before* `Promise` microtasks even when the Promise was resolved first — `Promise.resolve().then(f)` does not beat `process.nextTick(g)`.
- Calling `process.nextTick` with args passes them to the callback — same as `setImmediate(fn, ...args)`.
- `nextTick` inside `nextTick` inside `nextTick...` is the classic starvation ban in interview questions — the fix is `setImmediate`, which defers to the *next* loop iteration and lets I/O breathe.
- Promises scheduled inside a phase callback run before the next phase, and before `setImmediate` callbacks that were scheduled earlier in the same phase.

---

## 15.4 setImmediate vs setTimeout(0)

### Explain It

`setTimeout(0)` queues a callback for the **timers** phase of the *current* (or next) loop iteration; `setImmediate` queues for the **check** phase of the *current* iteration. When both are registered at the top level of a script (outside any I/O), the result is a race — the poll phase often blocks waiting for the timer's deadline, and which callback wins depends on how fast the OS timer fires, so Node docs call the order "non-deterministic." But when both are scheduled **inside an I/O callback**, `setImmediate` *always* wins: an I/O callback runs in the poll phase, so `check` (setImmediate) comes in the same iteration, while the new timer can't fire until the *next* timers phase. That makes `setImmediate` the correct tool whenever you want to defer work past the current phase but still run it as soon as possible — it's also natural for "do this after the current I/O batch."

### Prove It

```js
// 03-timers-race.js — run: node 03-timers-race.js
```

#### Gotchas / Edge Cases

- Race only exists outside I/O; inside an `fs.readFile`/`http` callback, `setImmediate` beats `setTimeout(0)` 100% of the time.
- Elapsed-time while-loop: `while (Date.now() < start + 1000) {}` inside a callback delays the *next* timers phase — `setImmediate` callbacks scheduled before the loop still run before the blocked timer callbacks.
- A `setImmediate` scheduled inside a `setImmediate` awaits the *next* iteration — but a `setTimeout(0)` scheduled in that same inner callback fires at the next timers phase, which precedes the next check phase, so the *timer* wins in that scenario.
- `setInterval` uses the timers phase too; long callback execution delays every interval tick after the first.

---

## 15.5 libuv Thread Pool

### Explain It

libuv maintains a **thread pool** of worker threads (default **4**, configurable via `UV_THREADPOOL_SIZE`, capped at 1024 in modern Node). Any libuv API that can't be done async at the kernel level falls back to this pool: `fs` operations (reads, writes, watch), `crypto.pbkdf2`, `crypto.randomBytes`, `zlib` compression, and `dns.lookup` (the sync-friendly `getaddrinfo` call; `dns.resolve` uses OS async DNS instead). The pool's work never runs your JS — it runs C/C++ code and hands results back to the event loop as callbacks. Because the pool is shared, a burst of heavy crypto can stall *filesystem reads from the same process* — everything waits for a free pool thread. Thread pool work does **not** consume your main-thread CPU, but it does add latency and contention, which is why you measure before raising `UV_THREADPOOL_SIZE`.

### Prove It

```js
// 04-thread-pool.js — run: node 04-thread-pool.js
//   5 × crypto.pbkdf2: first 4 finish together, the 5th waits for a pool thread.
```

#### Gotchas / Edge Cases

- `UV_THREADPOOL_SIZE` must be set *before* any pool work starts — you can't change it at runtime.
- The pool is shared process-wide: a flood of `zlib` or `pbkdf2` work starves concurrent `fs.readFile` calls.
- `dns.lookup` sneaks through the pool (hence its libuv call signature); `dns.resolve` + friends do not.
- Increasing pool size doesn't help if the bottleneck is your single-threaded JS CPU work — that's a `worker_threads` job (15.7).

---

## 15.6 Blocking vs Non-Blocking

### Explain It

A "blocking" call (e.g. `fs.readFileSync`, `crypto.pbkdf2Sync`, a huge inline `for` loop) occupies the **single JS thread** for its whole duration — the event loop literally cannot run timers, I/O callbacks, or serve other requests meanwhile. A "non-blocking" call (`fs.readFile` with a callback) hands the work to libuv's thread pool or the OS and returns immediately; your callback runs later when the loop gets to it. The classic server rule: **never use sync filesystem, crypto, or DNS in a request handler** — one `readFileSync` of a big config pauses every connected client. The timing demo below proves it with a stopwatch: async read finishes while a `setTimeout(0)` runs between its start and completion; sync read delays the timer by the full read time.

### Prove It

```js
// 05-blocking-vs-nonblocking.js — run: node 05-blocking-vs-nonblocking.js
```

#### Gotchas / Edge Cases

- Sync calls are legal at *startup* (load config once, before `listen()`) — that's idiomatic; inside the request path it's a bug.
- `console.log` to a *pipe* (like `| cat`) is synchronous in Node and can throttle throughput — another hidden blocker.
- Blocking also happens via user code: JSON.`stringify` of an enormous object stalls the loop just like `fs.readFileSync`.
- Even async I/O can delay a timer — the poll phase's I/O callbacks are processed before the next timers phase, so a storm of read callbacks pushes timer expiry later.

---

## 15.7 worker_threads — True JS Parallelism

### Explain It

`worker_threads` gives you **real multi-threaded JS**: each worker runs its own V8 isolate on its own thread, with its own heap, GC, and event loop — parallel CPU work that the libuv pool can never give you (the pool runs C, not JS). The main thread creates a worker with `new Worker(file, { workerData })`, and the two sides talk through `parentPort.postMessage()` in the worker and `worker.on('message')` in main; structured-clone values are copied per message. `workerData` is a fast shared start-up payload, and `SharedArrayBuffer` can be used for zero-copy numeric sharing (with `Atomics` for safety). Use workers when one request needs >100ms of pure JS CPU (image processing, heavy hashing loops, PDF reads) — spawn a pool, not a worker per request. The thread pool (15.5) and worker_threads are complementary: libuv deals with blocking *native* work; workers deal with blocking *JS* work.

### Prove It

```js
// 06-worker-threads.js — run: node 06-worker-threads.js
//   main keeps running (timers fire) while the worker grinds through a big sum.
```

#### Gotchas / Edge Cases

- Each worker costs real memory (a full V8 isolate: ~10-30MB+); 100 workers on a small box is reckless.
- `postMessage` is a copy — big payloads, or many messages per second, burn memory and clock cycles; keep messages small and rare.
- Workers don't share the main thread's state — no closures, no module cache; everything crosses the boundary explicitly.
- Errors: a thrown exception in a worker fires `worker.on('error')` and kills that worker — handle it or your job silently dies.

---

## 15.8 cluster + child_process

### Explain It

`child_process` spawns independent OS processes (`exec`, `spawn`, `fork`) — each with its own event loop, memory, and exit code, communicating via `stdio` pipes or an IPC channel; it's the escape hatch for running non-Node tools (ffmpeg, git) or isolating memory-heavy jobs. `cluster` is the standard way to use **all CPU cores** for one Node app: the **primary** process forks N **worker** processes, and by default they share the same server `port` — the OS load-balances incoming connections across workers. That gives you N event loops serving requests in parallel, which is how Node apps scale past one core. Worker processes die independently: a crash takes a fraction of traffic, not the whole service (with an auto-respawn loop in the primary). You rarely need `cluster` before you need it: it helps when you have CPU-bound request paths, or when you're deploying on a many-core box and single-thread throughput is the ceiling. Every worker is a copy of the app — so start the cluster *before* heavy startup work in the primary, and keep out of the primary anything that's not bookkeeping.

### Prove It

```js
// 07-cluster.js — run: node 07-cluster.js
//   primary forks 2 workers, each serves HTTP on its own port; auto-shuts down after ~2s.
```

#### Gotchas / Edge Cases

- `cluster.fork()` uses `child_process.fork` under the hood — the child re-runs the same file, so gate worker-only code behind `cluster.isPrimary`/`isWorker`.
- Shared-port listening only works with `http.Server`s that call `listen` in the worker; the primary must never `listen`.
- Sticky sessions don't come free: `cluster` load-balances by connection, so a socket (WebSocket/SSE) can land on a different worker per request — see Module 12 for that headache.
- `cluster` does not give you `process.exit()` semantics you can skip: one worker's `process.exit(1)` doesn't kill siblings, and the primary should respawn.
- IPC messages between primary and workers must be JSON-serializable (no Buffers of arbitrary size over the default channel for large payloads — `send` has size limits).

---

## 15.9 Streams (Readable/Writable/Transform/Duplex)

### Explain It

A **stream** is a sequential data source or sink that processes data in chunks instead of loading everything into memory. **Readable** produces data (`fs.createReadStream`, `Readable.from(array)`), **Writable** consumes it (files, `process.stdout`, HTTP responses), **Transform** is a readable+writable that changes chunks in between (gzip, uppercase filters), and **Duplex** is an independent readable+writable on one object (a socket — you can read and write simultaneously). `pipe()` (or `pipeline()`) wires them: `src.pipe(transform).pipe(dest)`, and with pipe you get **backpressure for free** — if `dest` is slow, `src` is paused automatically. Manual backpressure: `write()` returns `false` when the internal buffer (default `highWaterMark` = 16384 bytes) is full; stop writing and wait for the `'drain'` event. Readables have two modes: **flowing** (`.on('data')` or `.pipe()`, data pushed as it arrives) and **paused** (`.read()` pulls chunks manually; `.pause()`/`.resume()` switch). `.on('data')` without handling backpressure can blow up memory — pipe or pause instead when downstream is slow.

### Prove It

```js
// 08-streams.js — run: node 08-streams.js
//   Readable.from → Transform (uppercase) → Writable (stdout), then a manual backpressure demo.
```

#### Gotchas / Edge Cases

- Adding `.on('data')` switches a stream to flowing mode *at runtime* — attach it before any `read()` or pipe and stick to one style.
- `'error'` on any stream must be handled — an unhandled stream error crashes the process (especially in pipes; prefer `stream.pipeline` which propagates errors and cleans up).
- `highWaterMark` only sets the *internal buffer* threshold, not a hard cap — huge chunk sizes still allocate big chunks.
- `process.stdout` when piped (not a TTY) returns `false` from `write()` during backpressure — exactly what the demo shows.

---

## 15.10 Buffers (Buffer vs String)

### Explain It

A **Buffer** is a chunk of raw binary memory — Node's subclass of `Uint8Array`, backed by an `ArrayBuffer` allocated outside V8's heap (in the native `Buffer` pool). Strings in Node are UTF-16 internally, so converting a string to `Buffer.from(str, "utf8").length` gives you the *byte* count — the real transmission size — which differs from `str.length` for anything non-ASCII ($ = 3 bytes). Use `Buffer.alloc(size, fill)` for zero-filled safe memory and `Buffer.allocUnsafe` (faster, but may carry stale bytes — must be overwritten — a crash-level foot-gun). `slice()` and `subarray()` return **views sharing the same memory** — mutations leak into the original; **Buffer.concat** and `.copy()` physically copy. For encoding: `Buffer.from(str, "utf8" | "base64" | "hex")`, and `.toString(enc)` the other way. Versus `TypedArray`: a `Uint8Array` over `buffer.buffer` allows zero-copy interop (e.g. `crypto`, WebSocket frames, Web APIs), and `Buffer` adds Node-specific conveniences like `.equals()`, `.compare()`, `.concat()`.

### Prove It

```js
// 09-buffers.js — run: node 09-buffers.js
```

#### Gotchas / Edge Cases

- `buf.slice()` (and `subarray`) share memory — `slice` is deprecated in favor of `subarray` in newer docs; if you need a copy use `Buffer.from(buf)`.
- `buf.toString()` defaults to UTF-8; binary protocols need `"latin1"` or `"base64"`/`"hex"`, and UTF-8 decoding of invalid bytes yields `\uFFFD` replacement chars, not an error.
- `Buffer.allocUnsafe` returns memory that may contain previous data — always fill or overwrite before writing to disk/socket.
- Indexing `buf.length` is bytes, and `buf[i]` gives an unsigned byte (0-255); `buf.toString` + `String.fromCharCode` round-trips corrupt anything ≥ 0x80 unless you use latin1/utf8 correctly.

---

## 15.11 The process Object, Signals & Graceful Shutdown

### Explain It

`process` is the global handle to the running Node instance. `process.argv` is `[nodePath, scriptPath, ...args]` — parse from index 2; `process.env` is a snapshot of environment variables; `process.pid`, `process.platform`, `process.version`, `process.cwd()`, `process.memoryUsage()`, `process.uptime()` give runtime facts. **Exit codes** are the OS-visible result: `0` success, `1` uncaught exception / unhandled rejection default, `2` for some shell-level errors, `128+signal` when killed by a signal. **Signals** are OS messages: `SIGINT` (Ctrl+C), `SIGTERM` (usual kill/graceful-destroy request), `SIGHUP`, `SIGUSR1/2`; Node installs handlers with `process.on("SIGTERM", ...)`. The **graceful shutdown** pattern: stop accepting new work → `server.close()` (waits for pending connections to finish) → close DB/client pools → clear timers → `process.exit(0)`; always add a hard-timeout fallback (`setTimeout(() => process.exit(1), 10_000).unref()`), because stalled connections otherwise hang shutdown forever.

### Prove It

```js
// 10-process-events.js — run: node 10-process-events.js
//   prints argv/env/version, registers signal handlers, demonstrates graceful shutdown + error paths.
```

#### Gotchas / Edge Cases

- `server.close()` only stops *new* connections — keep-alive sockets can hold it open forever; call `server.closeIdleConnections?.()` or track sockets and destroy them.
- `SIGINT`/`SIGTERM` handlers don't fire on `process.exit(...)` — that's a programmatic exit, not a signal.
- `SIGKILL` (9) and `SIGSTOP` cannot be handled — those are the OS's last word.
- `process.env` is a snapshot at startup — changes made by other processes aren't reflected; `process.env.X = "y"` mutates the current copy only.
- Calling `process.exit()` skips flushing stdout if it's piped — use `process.exitCode = n` and return naturally to let streams flush.

---

## 15.12 CJS vs ESM in Node

### Explain It

Node historically used **CommonJS**: `require()` is synchronous, `module.exports` sets the API, and every file has free `__dirname`/`__filename` and a `require` cache. Since Node 12+, **ESM** is first-class: `import`/`export` syntax, asynchronous module loading, static analysis, tree-shaking in bundlers, top-level `await`, and `import.meta.url` instead of free `__dirname`. Which system a `.js` file uses is decided by the nearest `package.json` `"type"` field — `"type": "module"` makes every `.js` ESM, absent/`"commonjs"` keeps CJS. Explicit extensions override: `*.cjs` is always CommonJS, `*.mjs` always ESM, regardless of `"type"`. In ESM you need `"type": "module"` (plus a plain `import "node:fs"`) or the `.mjs` extension; importing CJS from ESM works (default export = `module.exports`), but importing ESM from CJS requires the dynamic `import()` inside an async context. Watch for the filename extensions in all Node core examples: error messages (ERR_REQUIRE_ESM) are usually an extension/type mismatch.

### Prove It

```js
// 11-cjs.cjs — run: node 11-cjs.cjs   (CommonJS module + main)
// 12-esm.mjs — run: node 12-esm.mjs   (ESM module + main, top-level await)
// same small module (greet + sum) implemented in both module systems
```

#### Gotchas / Edge Cases

- `import { x } from "file.js"` without a matching `"type"` throws `ERR_REQUIRE_ESM` — or worse, silently loads CJS syntax as ESM and dies on `module.exports`.
- Top-level `await` is ESM-only; CJS code must wrap in async functions (or use dynamic `import()`) — a classic interview tell.
- `__dirname` doesn't exist in ESM — derive it: `fileURLToPath(import.meta.url)` then `dirname()`.
- ESM imports are hoisted and resolved *before* any code runs in the file (statically analyzable); CJS `require` can be conditional and dynamic.
- The `exports` / `main` fields, and `"engines"`, behave differently in both systems — libraries these days ship `"exports"` with `import`/`require` conditions.

---

## 15.13 EventEmitter (on/once/emit/off)

### Explain It

`EventEmitter` is Node's pub/sub primitive — `http.Server`, `streams`, `EventSource`-style clients, `Process` all inherit from it. `emitter.on(event, fn)` subscribes (fires for every emit), `emitter.once` subscribes for exactly one emit, `emitter.emit(event, ...args)` synchronously invokes all subscribed listeners in registration order, and `emitter.off`/`removeListener` unsubscribes; `emitter.removeAllListeners([event])` clears. Event names are just strings (use `Symbol`s for private events); arguments flow from `emit` to the listeners. Errors: emitting an `"error"` event with **no listener** throws the Error object and — unless caught — crashes the process, by design; always attach an error listener when you consume events. Each emitter defaults to **`maxListeners: 10`** — more listeners emits a `MaxListenersExceededWarning` (a warning, not an error; raise it with `emitter.setMaxListeners(n)` when intentional, e.g. many sockets on one emitter). Listeners for the *same event* from deep closure captures leak memory — remember `off` in cleanup (the leak detection heuristic exists for this).

### Prove It

```js
// EventEmitter matters so much it's built into core — inline demo:
// node -e "
//   const { EventEmitter } = require('node:events');
//   const em = new EventEmitter();
//   em.on('ping', x => console.log('on:', x));
//   em.once('ping', x => console.log('once:', x));
//   em.emit('ping', 1); em.emit('ping', 2);   // once() fires only for the first
//   em.off('ping'); // cleanup
// "
```

#### Gotchas / Edge Cases

- `emit("error", err)` with zero `"error"` listeners **throws** — the throw happens in `emit` itself and can be caught, but an uncaught one terminates the process.
- `once` listeners that throw still remove themselves *before* callback registration — safe, but the error propagates synchronously.
- Listener order is FIFO per event; `prependListener` pushes to the front.
- `emitter.emit` is fully synchronous — a "sync trap" if your listening code expects async (streams and `process` events used this way become subtle correctness bugs).

---

## 15.14 Unhandled Errors (unhandledRejection/uncaughtException)

### Explain It

`process.on("uncaughtException")` fires when a **synchronous throw** escapes the stack with no catch — the process is, by default, about to die with code 1. `process.on("unhandledRejection")` fires when a **Promise rejects with no `.catch`/await** — historically a warning, now defaults to terminating like uncaughtException in modern Node. Both handlers are meant for **last-resort logging, cleanup, and an orderly `exit`** — not for "swallowing" the crash and continuing: after an uncaughtException the heap and state may be corrupted, so continuing is a lie. The robust pattern: register both, log the error and stack, send an alert, attempt `server.close()`, and `process.exit(1)` — and then treat the next occurrence (a second error during shutdown) with the safety timer from 15.11. "Handle errors at the source" remains the real answer in interviews: `.catch()` or try/catch near the operation, never a global net. Node also distinguishes `'error'` events (unhandled `'error'` on an EventEmitter/stream also crashes).

### Prove It

```js
// 10-process-events.js — run: node 10-process-events.js
//   registers + triggers unhandledRejection and uncaughtException handlers, then exits cleanly.
```

#### Gotchas / Edge Cases

- `unhandledRejection` from *inside* a worker doesn't hit the main process's handler — attach handlers in the worker file too.
- Both handlers can be called *again* while the first is still unwinding — guard with a shutdown-in-progress flag.
- Fatal: `--unhandled-rejections=none` (or `strict`)/`--trace-uncaught` CLI flags change the default; production defaults in Node 15+ treat unhandled rejections as fatal.
- An uncaughtException handler that *returns* keeps the process alive silently — reviewers read this as intent to swallow; pair it with a loud log + fixed exit timer.

---

## 15.15 Interview Questions (Say It Out Loud)

### Explain It

Say these out loud:

1. Walk me through Node's architecture — what is the JS layer, C++ bindings, libuv, and V8; and where do the "other threads" actually live?
2. Is Node single-threaded? How can it still handle 10k concurrent connections on one thread?
3. What are the event loop phases, in order, and what runs in each?
4. Where do Promise microtasks and process.nextTick run relative to the phases, and which beats which?
5. What is nextTick starvation, and why does setImmediate fix it?
6. setImmediate vs setTimeout(0): what's the race, and why does setImmediate always win inside an I/O callback?
7. What does the libuv thread pool do, how big is it by default, how do you resize it, and which APIs use it?
8. Why is fs.readFileSync never acceptable in a request handler? What exactly does it block?
9. worker_threads vs cluster vs child_process vs the libuv thread pool — when would you pick each?
10. What is backpressure in streams, how does pipe handle it automatically, and what does write() returning false mean?
11. Paused vs flowing mode — what switches a Readable into flowing mode, and why can .on('data') be dangerous?
12. Buffer vs string: why is Buffer.from("é") 2 bytes while "é".length is 1, and how do subarray vs concat differ regarding memory?
13. What's the difference between require and import in Node — resolution, caching, top-level await, and the type/extension rules?
14. What happens when you emit "error" on an EventEmitter with no listener, and what's the default maxListeners?
15. unhandledRejection vs uncaughtException — what's the lifecycle, the default behavior, and the sanctioned handler pattern?
16. What does a graceful shutdown look like (SIGTERM) — and how do you stop a keep-alive connection from blocking server.close?

### Prove It

```js
// 13-interview-node-internals.js — run: node 13-interview-node-internals.js
```

---

## Sources

- Node.js docs — The Node.js Event Loop: https://nodejs.org/en/learn/asynchronous-work/event-loop-timers-and-nexttick
- libuv — Design Overview: https://docs.libuv.org/en/v1.x/design.html
- Node.js docs — process: https://nodejs.org/api/process.html
- Node.js docs — worker_threads: https://nodejs.org/api/worker_threads.html
- Node.js docs — cluster: https://nodejs.org/api/cluster.html
- Node.js docs — stream: https://nodejs.org/api/stream.html
- Node.js docs — buffer: https://nodejs.org/api/buffer.html
- Node.js docs — ESM vs CJS: https://nodejs.org/api/esm.html
- Node.js docs — events (EventEmitter): https://nodejs.org/api/events.html