/**
 * Module 04 — Question Bank: likely-asked interview questions (async & event loop)
 *
 * Run: node 08-interview-questions.js
 */

const qa = [
  ["Explain the event loop.", "JS is single-threaded: one call stack. Async tasks go to Web APIs (timers, fetch, DOM) which push callbacks to task queues. The loop: run stack, then drain microtask queue, then take ONE macrotask, repeat. Microtasks (promise.then, queueMicrotask) always run before the next macrotask."],
  ["Microtask vs macrotask priority — give the classic order.", "console.log('1'); setTimeout(()=>console.log('2'),0); Promise.resolve().then(()=>console.log('3')); console.log('4') → 1,4,3,2. All sync first; microtask queue drains before ANY macrotask (even 0ms timers)."],
  ["Why is setTimeout(fn, 0) NOT truly 0ms?", "It's a minimum delay: fn goes to the macrotask queue and runs at least one full loop after current code AND microtasks drain. Also clamped to ~4ms+ after nesting and 1s+ in background tabs."],
  ["Promise states?", "pending → fulfilled (resolve) or rejected (reject). Once settled, immutable — then/catch callbacks are always async (microtask), even for already-settled promises. Multiple .then() on one promise = independent observers."],
  ["Promise.all vs allSettled vs race vs any?", "all: fail-fast on first rejection (rejects with that error). allSettled: never rejects, gives [{status, value|reason}]. race: first SETTLED (resolve OR reject) wins. any: first RESOLVED wins; rejects with AggregateError if all fail."],
  ["Callback hell → promise → async/await?", "Callbacks: nested, error-prone inversion of control. Promises: flat chains, single error path, composable (all/race). async/await: syntactic sugar — sequential reads, try/catch already familiar. await in a loop runs sequentially; use Promise.all for parallel."],
  ["What does await actually do?", "Pauses the async function, returns a pending promise to the caller, and continues on a microtask when the awaited promise settles. The rest of the function becomes the .then() of the awaited value. Async functions ALWAYS return a promise."],
  ["Parallel vs sequential fetching?", "Sequential: const a = await f(); const b = await f2(); — NRT latency stacked. Parallel: const [a, b] = await Promise.all([f(), f2()]); — max(ta, tb). Only await together at the end."],
  ["How do you handle errors in async/await?", "try/catch around awaits (catches both sync throws and rejections); await rejection without catch = unhandled rejection. finally for cleanup. Pattern: let res = await api().catch(err => fallback). Prefer try/catch/finally for clarity."],
  ["What is an unhandled promise rejection?", "A promise that rejects with no .catch and no await handling by the time the microtask queue drains — Node emits unhandledRejection (crashes modern Node by default), browser logs. Track: process.on('unhandledRejection')."],
  ["What blocks the event loop?", "Long synchronous work in callbacks (heavy loops, JSON.parse of huge payloads, sync fs, .sort on huge arrays) freezes the whole app — one tab, one thread. Break it: chunk with setTimeout/queueMicrotask, or use workers (worker_threads)."],
  ["Microtask starvation?", "If you always queue microtasks (e.g. infinite recursive Promise.then without yielding to the event loop), macrotasks (rendering, I/O) never run — the page freezes. Yield with setTimeout occasionally for CPU-heavy work."],
  ["Fetch lifecycle + abort?", "fetch returns a promise; response.ok checks HTTP status; body consumed via .json()/.text() (also single-use streams). AbortController: signal passed to fetch; abort() rejects with DOMException named AbortError. Timeouts = AbortController + setTimeout."],
  ["How does V8 execute JS?", "Parse → AST → Ignition (interpreter, bytecode) → TurboFan (JIT-compiles hot functions to machine code) + inline caches. Heap vs stack: numbers/strings/objects in heap; stack = call frames. GC: generational (young scavenger, old mark-compact), stop-the-world pauses (mitigated by incremental GC)."],
];

let n = 0;
for (const [q, a] of qa) {
  n++;
  console.log(`\n${String(n).padStart(2)}. ${q}`);
  console.log("   →", a);
}

// --- Whiteboard drills ---
// 1. Draw the loop: stack / Web APIs / microtask queue / macrotask queue.
// 2. Order of: sync → Promise.then → setTimeout(0) → requestAnimationFrame → next tick.
// 3. Write a timeout-wrapped fetch using AbortController.
