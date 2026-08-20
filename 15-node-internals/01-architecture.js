/**
 * Module 15 — 15.1 Node Architecture (V8 + libuv + JS layer + bindings)
 * Prints a labeled ASCII diagram of Node's runtime and explains what runs where.
 *
 * Run: node 01-architecture.js
 */

// Every line below is documentation-as-output: nothing to execute, just facts.
const diagram = `
┌───────────────────────────────────────────────────────────────────┐
│  1. YOUR JS CODE (JS layer)                                       │
│     const fs = require("node:fs");                                │
│     console.log("hi"); fetch("/api"); fs.readFile("x", cb)       │
│     Runs on the single main thread inside V8.                     │
├───────────────────────────────────────────────────────────────────┤
│  2. C++ BINDINGS (node_api)                                       │
│     fs, http, crypto, buffer, streams ...                         │
│     Thin native bridge: exposes libuv/V8 C++ APIs to JS.          │
├───────────────────────────────────────────────────────────────────┤
│  3. LIBUV (C library)                                             │
│     • EVENT LOOP (main thread): timers → poll → check phases      │
│     • THREAD POOL: 4 threads by default (UV_THREADPOOL_SIZE)      │
│       fs ops, dns.lookup, crypto.pbkdf2, zlib → native work here  │
│     • OS async I/O: epoll (Linux) / kqueue (macOS) / IOCP (Win)   │
├───────────────────────────────────────────────────────────────────┤
│  4. V8 (JavaScript engine)                                        │
│     Parses + JIT-compiles + runs your JS on 1 thread,             │
│     owns the heap, GC, and microtask queue.                       │
└───────────────────────────────────────────────────────────────────┘
`;

console.log(diagram);

console.log("What runs where:");
console.log("  • Your JS      -> thread 1 (main), inside V8. 100% of your code.");
console.log("  • libuv pool   -> threads 2-5+, native work only (file reads, hashing, gzip).");
console.log("  • OS kernel    -> network sockets, async via epoll/kqueue/IOCP.");
console.log("  • Workers      -> optional extra V8 isolates w/ their own loop (worker_threads).");
console.log("");

const facts = [
  "Single-threaded = your JS callbacks, one at a time, on one thread.",
  "Multi-threaded  = libuv thread pool + OS kernel threads + optional worker_threads.",
  "The event loop is a C loop inside libuv; V8 never sees it.",
  "A 'blocking' call (readFileSync) hijacks thread 1, freezing the loop.",
  "A 'non-blocking' call (readFile) returns instantly; libuv finishes it later.",
];

console.log("Five facts to repeat before sleep:");
facts.forEach((f, i) => console.log(`  ${i + 1}. ${f}`));