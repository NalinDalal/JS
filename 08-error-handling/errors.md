# Module 08: Error Handling & Debugging

---

## 8.1 Error Types

### Explain It

JavaScript has several built-in error types that represent different categories of runtime problems. All errors inherit from the base `Error` class.

| Error Type | When It Occurs |
|------------|----------------|
| `Error` | General/base error, used for custom errors |
| `TypeError` | Wrong type of operation (e.g., calling non-function, accessing property on `null`) |
| `ReferenceError` | Accessing a variable that doesn't exist |
| `RangeError` | A value is outside an allowed range (e.g., `new Array(-1)`) |
| `SyntaxError` | Code that violates JavaScript syntax rules (parsing phase) |
| `URIError` | Invalid arguments to `encodeURI()` or `decodeURI()` |
| `EvalError` | Problem with `eval()` (rare, exists for backward compat) |
| `InternalError` | Too much recursion / stack overflow (non-standard, Firefox only) |

### Prove It

```js
// TypeError
try {
  const fn = "hello";
  fn(); // calling a string as a function
} catch (e) {
  console.log(e instanceof TypeError); // true
  console.log(e.message); // "fn is not a function"
}

// ReferenceError
try {
  console.log(x); // x is not declared
} catch (e) {
  console.log(e instanceof ReferenceError); // true
}

// RangeError
try {
  const arr = new Array(-5);
} catch (e) {
  console.log(e instanceof RangeError); // true
  console.log(e.message); // "Invalid array length"
}

// SyntaxError — this would fail at parse time, NOT at runtime
// eval('var x = ;'); // SyntaxError: Unexpected token ';'

// URIError
try {
  decodeURIComponent("%");
} catch (e) {
  console.log(e instanceof URIError); // true
}

// All errors are instances of Error
console.log(new TypeError() instanceof Error); // true
```

**Key insight:** `SyntaxError` is caught during parsing, so it never enters `try/catch` at runtime. All others are runtime errors.

### Gotchas / Edge Cases

- `SyntaxError` never reaches `try/catch` — the code fails at *parse* time, before any statement runs. The module's Prove It notes this with `eval` — even `eval("var x = ;")` throws the SyntaxError on the `eval` *call itself*, so it *is* catchable (wrapped in try/catch), but syntax errors in the surrounding script are not.
- `instanceof` is not a guaranteed filter across **realms**: an error thrown in an iframe (or from a caught node worker) has a different `Error.prototype`, so `e instanceof TypeError` returns `false`. `e.name` comparison is the portable fallback.
- `.stack` is **non-standard** — V8's format (`at fn (file:line:col)`) differs from Firefox/Node workers; never parse stack strings in logic.
- `InternalError` is Firefox-only (the module's table says so) — `RangeError` is what other engines throw for stack overflow.
- Engine messages differ across versions/shapes (`Cannot read properties of null (reading 'foo')` in the Prove It is V8's wording) — dispatch on `name`/`instanceof`, never on parsed `message` strings.

---

## 8.2 try/catch/finally

### Explain It

The `try/catch/finally` block is JavaScript's structured error handling mechanism. Code that might throw goes in `try`, error handling in `catch`, and cleanup in `finally`.

**Syntax:**
```js
try {
  // risky code
} catch (error) {
  // handle error (error is optional in ES2019+)
} finally {
  // always runs — even if catch throws or return executes
}
```

**Rules:**
- `try` + either `catch` or `finally` (or both) — never `try` alone
- `finally` runs BEFORE any `return` in `try`/`catch` completes
- `catch` binding is optional since ES2019 (you can write just `catch {}`)
- Errors have properties: `name`, `message`, `stack`, and `cause` (ES2022)

### Prove It

```js
// 1. Basic usage
try {
  null.foo; // TypeError
} catch (e) {
  console.log(e.name);    // "TypeError"
  console.log(e.message); // "Cannot read properties of null (reading 'foo')"
  console.log(e.stack);   // stack trace string
}

// 2. Optional catch binding (ES2019)
try {
  JSON.parse("invalid json");
} catch {
  // Caught without naming the error
}

// 3. Finally ALWAYS runs
function testFinally() {
  try {
    return "from try";
  } finally {
    // finally runs before return!
  }
}
testFinally(); // logs "finally runs before return!" then returns "from try"

// 4. Finally overrides return if it also returns (dangerous!)
function confusing() {
  try {
    return "try";
  } finally {
    return "finally wins"; // overrides try's return
  }
}
console.log(confusing()); // "finally wins"

// 5. Nested try/catch
try {
  try {
    JSON.parse("{invalid}");
  } catch (inner) {
    console.log("Inner catch:", inner.message);
    throw new Error("re-wrapped"); // re-throw to outer
  }
} catch (outer) {
  console.log("Outer catch:", outer.message); // "re-wrapped"
}

// 6. Error propagation (re-throwing)
function fetchData(url) {
  try {
    const data = JSON.parse(url); // pretend this is the risky part
    return data;
  } catch (e) {
    console.log("Logging error for debugging:", e.message);
    throw e; // re-throw so caller can also handle it
  }
}

try {
  fetchData("not json");
} catch (e) {
  console.log("Caller handles:", e.message);
}
```

**Key insight:** `finally` runs even if you `return`, `throw`, or call `break`/`continue` from `try` or `catch`. This makes it ideal for cleanup (closing files, releasing resources).

### Gotchas / Edge Cases

- **A `return` (or thrown error) in `finally` overrides the `try`/`catch` result** — the module's `confusing()` example is exactly this; a cleanup function that returns unconditionally silently destroys the original outcome. Cleanup code should avoid `return` entirely.
- `try/catch` only catches **synchronous** errors — an error thrown inside a `setTimeout` callback, a Promise, or an event handler escapes to the global handler (see 8.6); `await` inside `try` is the only way to catch async failures this way.
- Swallowing without evidence is the most common bug: `catch {}` with no log/rethrow hides failures. Log or re-throw; the module's `fetchData` shows the correct rethrow pattern.
- **Wrapping + rethrowing loses nothing only with `cause`** (ES2022): a plain `throw new Error("context")` inside `catch` destroys the original error chain unless you pass `{ cause: original }` and read `e.cause` later (freeze mentioned in 8.3's example).
- The `catch` binding is scoped to the handler — but older transpiled output (and pre-ES2019 engines) reused the outer scope name; don't shadow the same identifier outside the block portably.
- `finally` runs before the enclosing `return` *completes*, but code after the `try/catch/finally` block still runs after `finally` — cleanup then post-check ordering surprises.

---

## 8.3 Custom Errors

### Explain It

Custom errors let you create domain-specific error types with additional properties like error codes, HTTP status codes, or validation details. Extend the built-in `Error` class and call `super()`.

**When to create custom errors:**
- You need to distinguish error types in `catch` blocks with `instanceof`
- You want to attach metadata (code, status, field names)
- You're building a library or API with specific error semantics
- You want a meaningful error hierarchy

### Prove It

```js
// 1. Basic custom error
class ValidationError extends Error {
  constructor(message, field) {
    super(message);
    this.name = "ValidationError";
    this.field = field;
  }
}

function validateAge(age) {
  if (age < 0 || age > 150) {
    throw new ValidationError("Age must be 0-150", "age");
  }
  return true;
}

try {
  validateAge(-5);
} catch (e) {
  if (e instanceof ValidationError) {
    console.log(`Field "${e.field}": ${e.message}`);
    // Field "age": Age must be 0-150
  }
}

// 2. API error with status code
class ApiError extends Error {
  constructor(statusCode, message, details = null) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.details = details;
  }
}

// 3. Error hierarchy
class AppError extends Error {
  constructor(message, code) {
    super(message);
    this.name = "AppError";
    this.code = code;
  }
}

class NotFoundError extends AppError {
  constructor(resource) {
    super(`${resource} not found`, "NOT_FOUND");
    this.name = "NotFoundError";
    this.resource = resource;
  }
}

class ForbiddenError extends AppError {
  constructor(resource) {
    super(`Access denied to ${resource}`, "FORBIDDEN");
    this.name = "ForbiddenError";
  }
}

// Usage — catch by hierarchy
try {
  throw new NotFoundError("User");
} catch (e) {
  if (e instanceof NotFoundError) {
    console.log(e.code);       // "NOT_FOUND"
    console.log(e.resource);   // "User"
    console.log(e instanceof AppError); // true — can catch broader type
  }
}

// 4. Preserving stack trace (ES2022 cause property)
class DatabaseError extends Error {
  constructor(message, cause) {
    super(message, { cause }); // ES2022 cause
    this.name = "DatabaseError";
  }
}

try {
  try {
    JSON.parse("oops");
  } catch (original) {
    throw new DatabaseError("Connection failed", original);
  }
} catch (e) {
  console.log(e.message);      // "Connection failed"
  console.log(e.cause.message);// "Unexpected token o in JSON at position 0"
}
```

**Key insight:** Always set `this.name` in custom errors so stack traces and logging show meaningful names. The `cause` option (ES2022) preserves the original error chain.

### Gotchas / Edge Cases

- **Forgetting `super(message)` breaks the error** — fields assigned before `super()` throw `ReferenceError` ("Must call super constructor"). Set properties *after* `super(message)`.
- `instanceof` with ES5-transpiled class hierarchies (Babel/TS with `target: es5`) is unreliable — the prototype chain is emulated; this is the classic reason `e.name` checks survive in older codebases (see 8.1's cross-realm note — same symptom).
- **Check order in catch chains**: `if (e instanceof AppError)` *before* `if (e instanceof NotFoundError)` would match everything first and the specific handler never fires. Test most specific classes first.
- `this.name` must be set manually — traits: `class Foo extends Error` leaves `name === "Error"` unless assigned (the module's examples do set it; forgetting gives unhelpful logs).
- Custom errors lose `.cause` propagation automatically: `super(message, { cause })` requires ES2022 — on older runtimes, pass cause as a second arg and stash it yourself.
- Throwing a custom error from a mocked/test boundary — `assert.throws(fn, ValidationError)` — checks constructor identity; a *transpiled* prototype mismatch makes these assertions fail misleadingly.

---

## 8.4 throw Statement

### Explain It

The `throw` statement stops execution and creates an error. You can throw any value, but best practice is to always throw `Error` instances (or subclasses) so you get stack traces and consistent error handling.

### Prove It

```js
// 1. Best practice: throw Error instances
function divide(a, b) {
  if (typeof a !== "number" || typeof b !== "number") {
    throw new TypeError("Arguments must be numbers");
  }
  if (b === 0) {
    throw new RangeError("Cannot divide by zero");
  }
  return a / b;
}

try {
  divide(10, 0);
} catch (e) {
  console.log(e instanceof RangeError); // true
}

// 2. Throwing strings (NOT recommended — no stack trace)
function bad() {
  throw "something went wrong"; // works but terrible
}

// 3. Throwing objects (NOT recommended — no stack trace)
function alsoBad() {
  throw { code: 404, message: "Not found" }; // works but terrible
}

// 4. Re-throwing preserves the original error
function process() {
  try {
    riskyOperation();
  } catch (e) {
    // wrap with context
    throw new Error("process failed", { cause: e });
  }
}

// 5. Conditional throws (guard pattern)
function setPrice(price) {
  if (price < 0) throw new RangeError("Price cannot be negative");
  if (typeof price !== "number") throw new TypeError("Price must be a number");
  // only reaches here if valid
  return price * 1.1; // apply tax
}
```

**Key insight:** `throw` is an expression, so you can use it in arrow functions: `const fn = () => { throw new Error("nope") }`. But prefer statements for clarity.

### Gotchas / Edge Cases

- The module's "NOT recommended" examples cover the core rule: a thrown **string or object** produces `catch (e)` where `e` has no `.stack`, no `.name`, no `.message` semantics — `e.message` is `undefined`, and loggers/global handlers (8.6) assume those fields exist. Always throw `Error` instances.
- Throwing from `finally` (like returning) replaces whatever the `try`/`catch` was about to throw — `try { foo() } finally { throw e }` discards the original error.
- `throw` inside an `async` function or a `.then` callback becomes a **rejection**, not a synchronous exception — `try/catch` *around* the call `await fn()` is required to see it (the module's `getUser` shows this pattern).
- Re-throwing the same object (`throw e`) **preserves the original stack** — good. Wrapping (`throw new Error("ctx", { cause: e })`) shows both contexts — but only in ES2022+.
- Throwing **non-Error primitives** isn't just style — `catch (e)` still runs, but any `e instanceof Error` check downstream silently fails (destructure/assertion bugs).
- Guard throws at the top confuse "expected failure vs bug" classification when used for control flow — use the result pattern (8.6) for *expected* failures.

---

## 8.5 Debugging Techniques

### Explain It

Debugging is finding and fixing bugs. JavaScript provides multiple built-in tools — from console output to breakpoints to stack trace analysis.

| Technique | When to Use |
|-----------|-------------|
| `console.log` | Quick value inspection |
| `console.table` | Inspect arrays/objects in tabular form |
| `console.time` | Measure performance |
| `console.group` | Organize related logs |
| `console.trace` | Print stack trace without throwing |
| `debugger` | Pause execution (like a breakpoint) |
| Source maps | Debug minified/compiled code |

### Prove It

```js
// 1. Console methods
console.log("basic log");
// warning — yellow triangle
// error — red text

console.table([
  { name: "Alice", age: 30 },
  { name: "Bob", age: 25 }
]);

console.time("loop");
for (let i = 0; i < 1000000; i++) {}
console.timeEnd("loop"); // "loop: 2.345ms"

console.group("User");
console.log("Name: Alice");
console.log("Age: 30");
console.groupEnd();

console.trace("Where am I?"); // prints call stack

// 2. debugger statement
function buggy(x) {
  debugger; // execution pauses here when DevTools are open
  return x * 2;
}

// 3. Reading stack traces
function a() { b(); }
function b() { c(); }
function c() { throw new Error("trace demo"); }

try {
  a();
} catch (e) {
  console.log(e.stack);
  // Error: trace demo
  //     at c (<anonymous>:1:21)
  //     at b (<anonymous>:1:19)
  //     at a (<anonymous>:1:19)
  //     at <anonymous>:1:5
}

// 4. Node.js debugging
// Run with: node --inspect yourfile.js
// Then open chrome://inspect in Chrome to attach debugger
```

**Key insight:** `console.trace()` is invaluable for debugging — it shows you the call chain leading to a point without needing to throw an error.

### Gotchas / Edge Cases

- `console.log` shipped to production: leftover logs leak data and affect perf (each log forces JSON-ish serialization of arguments). Strip them in builds or use a level-aware logger.
- `debugger;` only pauses when DevTools (or `node --inspect`) is attached — otherwise it's a no-op statement. In CI it's invisible but harmless; some linters flag it.
- **`console.time`/`timeEnd` labels must match exactly** — a typo prints `Warning: No such label 'foo'` and silently ends nothing; timings come out `NaN`-free but misleading.
- `console.table` on large arrays/objects is *much* slower than a loop of `.log` — fine for a few rows, avoid in hot paths.
- Stack traces in minified/compiled code are useless **without source maps** — build tooling must emit them; otherwise `at c (<anonymous>:1:21)` (as in the module's example) matches nothing you wrote.
- `console.trace` (from the module's table) and `debugger` are dev-only shorthands — the *maintained* debugging surface is `--inspect` + breakpoints; console output alone won't show mutable state per line.

---

## 8.6 Error Handling Patterns

### Explain It

Production code needs structured error handling strategies beyond basic `try/catch`. Common patterns include guard clauses, result objects, global handlers, and async error propagation.

| Pattern | Use Case |
|---------|----------|
| Guard clauses / early returns | Validate inputs before processing |
| Result pattern | Avoid exceptions for expected failures |
| Global error handlers | Catch uncaught errors across the app |
| Promise `.catch` / `async/await` try-catch | Handle asynchronous errors |

### Prove It

```js
// 1. Guard clauses / early returns
function processUser(user) {
  // guards — fail fast
  if (!user) return null;
  if (typeof user.name !== "string") return null;
  if (user.age < 0) return null;

  // main logic only runs if all guards pass
  return { name: user.name.toUpperCase(), age: user.age };
}

// 2. Result pattern (return { data, error } instead of throwing)
function divide(a, b) {
  if (b === 0) return { data: null, error: "Division by zero" };
  return { data: a / b, error: null };
}

const result = divide(10, 0);
if (result.error) {
  console.log("Handle error:", result.error);
} else {
  console.log("Result:", result.data);
}

// 3. Global error handlers (browser)
window.onerror = function (message, source, lineno, colno, error) {
  console.log("Global error:", { message, source, lineno, colno, error });
};

window.addEventListener("unhandledrejection", (event) => {
  console.log("Unhandled promise rejection:", event.reason);
  event.preventDefault(); // prevents default console error
});

// 4. Global error handlers (Node.js)
process.on("uncaughtException", (error) => {
  console.error("Uncaught exception:", error);
  // usually should exit after logging
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled rejection:", reason);
});

// 5. Promise error handling
// BAD — swallowed error
fetchData().then(data => console.log(data));

// GOOD — always handle rejection
fetchData()
  .then(data => console.log(data))
  .catch(err => console.error("fetchData failed:", err));

// 6. Async/await error handling
async function getUser(id) {
  try {
    const response = await fetch(`/api/users/${id}`);
    if (!response.ok) {
      throw new ApiError(response.status, `HTTP ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (e) {
    console.error("getUser failed:", e);
    throw e; // re-throw or return fallback
  }
}

// 7. Middleware-style error handling (Express pattern)
// app.use((err, req, res, next) => {
//   res.status(err.statusCode || 500).json({ error: err.message });
// });
```

**Key insight:** The result pattern (`{ data, error }`) avoids the performance cost of exceptions for expected failures (like validation). Use exceptions for truly exceptional situations, not control flow.

### Gotchas / Edge Cases

- **Global handlers are last resorts, not design**: `uncaughtException` (Node) leaves the process in an unspecified state — official guidance is to *log and exit*; the module's own comment says "usually should exit after logging." `window.onerror` doesn't cover rejections — that's what `unhandledrejection` is for (both shown in Prove It item 3/4).
- One `unhandledrejection` handler means **one missed `.catch` anywhere silently "works"** — a swallowed rejection looks fine; the handler hides, doesn't fix, the root cause.
- Guard clauses are order-sensitive: `if (typeof user.name !== "string")` before `if (!user)` would crash on `null` instead of failing fast — validate presence *before* shape (module's `processUser` has the right order: `!user` first).
- The result pattern's contract is easy to violate: return `{ data, error }` but code paths that *also* throw defeat the purpose — be consistent within a function boundary.
- Async: `fetch` failures and **timeouts** aren't native — a hanging request never rejects; add explicit timeout wiring (AbortSignal) or the "catch-all" handler won't fire either.
- Middleware error handlers (item 7) break silently when the handler forgets `next(err)` — Express skips it forward; a swallowed error mid-chain is a top debugging mystery.

---

## Interview Questions

### Q1: What's the difference between TypeError and ReferenceError?

**Answer:**

| | TypeError | ReferenceError |
|---|-----------|----------------|
| **Cause** | Wrong type of operation on a value that exists | Accessing a variable that doesn't exist at all |
| **Example** | `null.foo`, `fn()` where `fn` is a string | `console.log(undeclaredVar)` |
| **When caught** | Runtime | Runtime |
| **Key distinction** | The variable exists but isn't the right type | The variable was never declared |

```js
// TypeError — variable exists, wrong operation
let x = "hello";
x.foo(); // TypeError: x.foo is not a function

// ReferenceError — variable doesn't exist at all
console.log(y); // ReferenceError: y is not defined
```

### Q2: When would you create a custom error?

**Answer:**

Create custom errors when:
1. You need to distinguish error types in `catch` blocks using `instanceof`
2. You want to attach domain-specific metadata (HTTP status, error codes, field names)
3. You're building an API/library with clear error semantics
4. You want a meaningful error hierarchy (e.g., `NotFoundError` extends `AppError`)

```js
class InsufficientFundsError extends Error {
  constructor(balance, amount) {
    super(`Cannot withdraw ${amount}, balance is ${balance}`);
    this.balance = balance;
    this.amount = amount;
    this.name = "InsufficientFundsError";
  }
}
```

This lets callers do `catch (e) { if (e instanceof InsufficientFundsError) { ... } }` for specific handling.

### Q3: How do you handle async errors?

**Answer:**

Two main approaches:

```js
// 1. Async/await with try/catch (preferred for readability)
async function fetchData() {
  try {
    const res = await fetch("/api/data");
    const data = await res.json();
    return data;
  } catch (e) {
    console.error("Failed:", e);
    return null; // or re-throw
  }
}

// 2. Promise chain with .catch
fetch("/api/data")
  .then(res => res.json())
  .catch(e => console.error("Failed:", e));

// 3. Global handler for uncaught async errors
window.addEventListener("unhandledrejection", (e) => {
  console.error("Unhandled:", e.reason);
});
```

**Key rule:** Never leave promises without a `.catch` or a surrounding `try/catch` (with `await`).

### Q4: What is a guard clause?

**Answer:**

A guard clause validates inputs or conditions at the top of a function and returns early (or throws) if invalid. It avoids deep nesting and keeps the main logic clean.

```js
// WITHOUT guards — nested and hard to read
function processOrder(order) {
  if (order !== null) {
    if (order.items !== undefined) {
      if (order.items.length > 0) {
        // actual logic buried deep
        return order.items.reduce((sum, i) => sum + i.price, 0);
      }
    }
  }
  return 0;
}

// WITH guards — flat and clear
function processOrder(order) {
  if (!order) return 0;
  if (!order.items) return 0;
  if (order.items.length === 0) return 0;

  // main logic at top level
  return order.items.reduce((sum, i) => sum + i.price, 0);
}
```

Guards are also known as "early returns" or "precondition checks."

---

## Sources

- [MDN: Control flow and error handling](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Control_flow_and_error_handling)
- [MDN: Error reference](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error)
- [MDN: try...catch](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/try...catch)
- [MDN: throw statement](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/throw)

---

## Question Bank

Say each answer out loud, then verify with the code file:

```
node 06-interview-questions.js
```
