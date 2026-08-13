/**
 * Module 08 — Question Bank: likely-asked interview questions (error handling)
 *
 * Run: node 06-interview-questions.js
 */

const qa = [
  ["How does try/catch/finally work?", "try: run code; catch(e): runs ONLY on throw (e = error object, block-scoped). finally: ALWAYS runs — even after return, throw, or break (it overrides a plain return's value if it returns itself). Code after the try block runs only if nothing threw."],
  ["Can you catch a SyntaxError at runtime?", "No — syntax errors are parse-time, thrown before ANY code in the file runs, so try/catch around them never executes. You'd have to eval()/import() separately to catch a parse error. ReferenceError for undeclared identifiers is RUNTIME — catchable."],
  ["Error types — which do you remember?", "TypeError (wrong operation: calling non-function, null.foo), ReferenceError (undeclared), RangeError (out of range: new Array(-1), recursion overflow), URIError (bad encodeURIComponent arg), EvalError (legacy). All instanceof Error with name/message/stack."],
  ["Custom errors — how do you create them?", "class ApiError extends Error { constructor(message, status) { super(message); this.name = 'ApiError'; this.status = status; } } — then throw new ApiError('not found', 404). Check with instanceof (works across class hierarchy). Preserve cause: { cause } in super options."],
  ["Error propagation — why do errors climb?", "throw unwinds the stack until a matching catch (or the top → uncaught). Inner catch decides: handle OR rethrow. If a function can't do anything useful, DON'T swallow — let it propagate or wrap: throw new Error('fetch failed', { cause: e })."],
  ["Async error handling differences?", "Promise rejection: caught by .catch() or await+try/catch. A rejected promise with NO handler → unhandledRejection (Node crashes by default in modern versions). Errors INSIDE setTimeout/event listeners: not caught by outer try/catch (different task!) — attach the try/catch inside the callback."],
  ["What's an uncaught exception vs unhandled rejection?", "Exception: sync throw with no catch — process crashes, event loop dies. Rejection: promise rejected with no .catch — Node fires 'unhandledRejection' (default: exit), browser logs. Register: process.on('unhandledRejection', fn) and process.on('uncaughtException', fn) as last-resort logging."],
  ["finally + return gotcha?", "If finally returns a value, it WINS — a return in try is discarded. Also throwing in finally overrides the original error. Rule: never return/throw from finally unless intentional."],
  ["Stack traces — how do you read them?", "Each frame: function + file:line:col. Reading bottom-up shows the call path. Trace is captured at THROW time (Error.stack), showing where it was thrown, not where the problem started. Async: traces follow the await chain (V8 async stack traces)."],
  ["Debugging workflow?", "console.log levels (log/warn/error/table/group/time), breakpoints with conditionals, watch expressions, source maps for bundled code, DevTools call stack panel, Node: --inspect + Chrome DevTools, debugger statement, performance/React DevTools for frontend."],
  ["console.table / console.time — why?", "table: array of objects → readable grid (API responses). time/timeEnd: measure duration, timeLog increments. count: how many times a fn ran. dir vs log: interactive vs plain. trace: log current stack."],
  ["Optional catch binding and modern error features?", "try {} catch {} — omit the binding if unused (ES2019). Error cause (ES2022): new Error('msg', { cause: original }) — preserves the root cause chain instead of message-lossy wrapping."],
  ["What errors do JSON.parse / fetch throw?", "JSON.parse: SyntaxError (with position) on invalid JSON — always wrap in try/catch. fetch: rejects only on NETWORK failure — 404/500 RESOLVE; check response.ok and throw your own ApiError with status. TypeErrors from .json() on empty bodies too."],
  ["Rate-limited/retry pattern?", "Retry with backoff + jitter for transient errors (network, 429, 5xx): attempt → catch → wait (delay * attempt + random) → retry (max N). Use AbortController for timeouts. Never retry 4xx (client errors are deterministic)."],
];

let n = 0;
for (const [q, a] of qa) {
  n++;
  console.log(`\n${String(n).padStart(2)}. ${q}`);
  console.log("   →", a);
}

// --- Whiteboard drills ---
// 1. What prints? try { return 1 } finally { return 2 } → 2.
// 2. Where does a promise rejection go if .then() has no catch?
// 3. Write ApiError + a fetch wrapper that maps status codes to typed errors.
