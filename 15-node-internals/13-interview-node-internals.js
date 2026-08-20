/**
 * Module 15 — Interview Questions (Node Internals)
 * Say the answer out loud BEFORE reading it. Run for a quick daily drill.
 *
 * Run: node 13-interview-node-internals.js
 */

const qa = [
  [
    "Walk me through Node's architecture — what are the layers, and where are the 'other threads'?",
    "Three layers: your JS + the standard library (js layer) on top, C++ bindings (node_api) in the middle, and libuv + V8 underneath. V8 runs your JS on one main thread; libuv provides the event loop (main thread) plus a thread pool (default 4 threads) that runs native work like fs, dns.lookup, pbkdf2, and zlib. The OS kernel adds more asynchrony for sockets. Your code is single-threaded; the runtime is not.",
  ],
  [
    "Is Node.js single-threaded? How does it handle 10k concurrent connections?",
    "Your JS executes on one thread, but I/O is delegated: filesystem/DNS/crypto go to libuv's thread pool, sockets to the OS kernel (epoll/kqueue async). The event loop just tracks 'done' events and runs callbacks when ready. So 10k idle connections cost almost nothing — they're kernel descriptors, not threads.",
  ],
  [
    "What are the event loop phases, in order, and what runs in each?",
    "timers (setTimeout/setInterval) -> pending callbacks (deferred I/O) -> poll (I/O callbacks, the phase that blocks waiting for events) -> check (setImmediate) -> close (close handlers). After every phase and every callback, the microtask queue is drained. Then the loop repeats.",
  ],
  [
    "Where do microtasks and process.nextTick run, and which beats which?",
    "After every single callback and after every phase, nextTick queue drains first, then Promise microtasks, then control returns to the loop. nextTick is not part of the spec — it's a Node extension with the highest priority. Promise.resolve().then always loses to process.nextTick scheduled in the same callback.",
  ],
  [
    "What is nextTick starvation, and why does setImmediate fix it?",
    "process.nextTick callbacks run before the loop ever continues, so a nextTick that recursively schedules itself never lets timers/I/O/connections run — the loop freezes. setImmediate defers to the check phase of the NEXT iteration and lets the loop breathe, which is why 'schedule asap after I/O' should be setImmediate.",
  ],
  [
    "setImmediate vs setTimeout(0): what's the race, and why does setImmediate always win inside an I/O callback?",
    "setTimeout(0) targets the next timers phase; setImmediate targets the current iteration's check phase. At top level it's a race (both pending when the loop starts). Inside an I/O callback (poll phase), check comes in the SAME iteration while the timer can only fire in the NEXT timers phase — setImmediate wins 100% of the time.",
  ],
  [
    "What is the libuv thread pool, how big is it, and which APIs use it?",
    "A pool of worker threads (default 4) that run native work libuv can't do in the kernel: fs operations, crypto.pbkdf2, crypto.randomBytes, zlib, dns.lookup. Set UV_THREADPOOL_SIZE before the first pool call to change it (max 1024). The pool is process-wide and shared — heavy crypto starves concurrent file reads.",
  ],
  [
    "Why is fs.readFileSync never acceptable in a request handler? What exactly does it block?",
    "It occupies the single JS thread for its whole duration, so the event loop cannot process any other callback — every connected client's timers, socket reads, and other requests freeze. Async fs.readFile hands the work to the thread pool and returns immediately. Sync calls are only OK at startup, once, before listen().",
  ],
  [
    "worker_threads vs cluster vs child_process vs the libuv thread pool — when do you pick each?",
    "Libuv pool: native blocking work (fs, hashing) — you never manage it, just accept its 4-thread limit. worker_threads: parallel JS CPU work (heavy computation) — separate V8 isolates with workerData/parentPort messaging. child_process: run external programs (ffmpeg, git) or isolate crash-prone code. cluster: fork N copies of the whole app to use every core for HTTP traffic.",
  ],
  [
    "What is backpressure in streams, and what does write() returning false mean?",
    "When a Writable's internal buffer (highWaterMark, default 16KB) is full, write() returns false — 'stop sending, I can't keep up'. The proper response is to wait for the 'drain' event before writing more. pipe() (or pipeline()) does this automatically, pausing the source. Ignoring false cases leads to unbounded memory growth.",
  ],
  [
    "Paused vs flowing mode — what switches a Readable into flowing, and why can .on('data') be dangerous?",
    "Paused: you pull with read(). Flowing: data is pushed — switch on by adding a 'data' listener or calling pipe()/resume(). .on('data') without backpressure handling (pause/resume on the consumer's speed) can let data arrive faster than you process it and exhaust memory. Use pipe or manual pause/drain discipline for slow consumers.",
  ],
  [
    "Buffer vs string — why is Buffer.from('é').length 2 while 'é'.length is 1, and what about subarray vs concat?",
    "Strings count UTF-16 code units; Buffers count raw BYTES (UTF-8: é = 2 bytes, a = 1, emoji = 4). Transmission size is the byte count. subarray()/slice() return views sharing the parent's memory (mutations leak through — slice is deprecated in favor of subarray); Buffer.concat/copy/Buffer.from(buf) create real copies. Buffer is a Uint8Array subclass; you can wrap the same ArrayBuffer with a TypedArray zero-copy.",
  ],
  [
    "What's the difference between require and import in Node — resolution, caching, top-level await, and the rules?",
    "require() is CommonJS: synchronous, per-module cache, module.exports, always has __dirname/__filename. import is ESM: static/hoisted, analyzable, supports top-level await, and uses import.meta.url instead of __dirname. Which system a .js file uses is decided by package.json 'type' (module/commonjs); .mjs is always ESM and .cjs always CJS. CJS can only import ESM via dynamic import().",
  ],
  [
    "What happens when you emit('error') on an EventEmitter with no listener, and what's maxListeners?",
    "If an 'error' event is emitted and no 'error' listener exists, the emitter THROWS the Error object — uncaught, it crashes the process. That's why you always attach an error listener when consuming event-based APIs (streams, http). Default maxListeners is 10 per event; more emits a MaxListenersExceededWarning (a warning, not a crash) — raise it deliberately with setMaxListeners, and always off() listeners you no longer need.",
  ],
  [
    "unhandledRejection vs uncaughtException — lifecycle, defaults, and the sanctioned handler pattern?",
    "uncaughtException fires when a synchronous throw escapes with no catch (process defaults to exiting, code 1). unhandledRejection fires when a Promise rejects with no .catch()/await (fatal by default in modern Node). Both handlers are last resorts: log + alert + attempt server.close() + process.exit(1). NEVER swallow and continue — heap/state may be corrupted. Fix errors at the source with .catch().",
  ],
  [
    "What does a graceful shutdown look like, and how do you stop keep-alive connections from blocking server.close()?",
    "On SIGTERM/SIGINT: stop accepting new work, call server.close() to drain in-flight requests, close DB pools and timers, then process.exit(0). Problem: keep-alive sockets keep close() waiting forever — call server.closeIdleConnections() (Node 18.2+) or track sockets and destroy them, plus a hard timeout (e.g. 10s) as a fallback. Never process.exit(0) without draining if you care about losing in-flight writes.",
  ],
];

let i = 0;
function next() {
  if (i >= qa.length) {
    console.log("\nDone! Loop back to the top for another round.");
    process.exit(0);
  }
  const [q, a] = qa[i++];
  console.log(`\nQ${i}: ${q}`);
  console.log("   (press Enter to see the answer, or Ctrl+C to quit)");
}

console.log("Say each answer out loud, then press Enter to check.");

if (process.stdin.isTTY) {
  // Interactive terminal: raw mode reads a single keystroke per Enter.
  process.stdin.setRawMode(true);
  process.stdin.resume();
  process.stdin.on("data", () => next());
} else {
  // Piped input (e.g. `echo | node 13-...`): no raw mode on a pipe, so read
  // lines instead and exit on EOF so the demo never hangs.
  const readline = require("node:readline");
  const rl = readline.createInterface({ input: process.stdin });
  rl.on("line", () => next());
  rl.on("close", () => process.exit(0));
}
next();