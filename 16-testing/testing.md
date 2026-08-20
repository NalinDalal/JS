# Module 16: Testing — Unit, Integration & E2E

---

## 16.1 Why Test + The Testing Pyramid

### Explain It

Tests are a safety net: they lock in behavior so you can refactor, upgrade, and extend code without silently breaking something you fixed three weeks ago. They also act as executable documentation — a passing suite describes what the code promises, and a failing suite tells you *which* promise broke. The **testing pyramid** organizes them by cost and confidence: many cheap **unit tests** at the bottom (one function, no I/O), fewer **integration tests** in the middle (several units wired together, real or mocked boundaries like a DB or fetch), and a handful of slow **end-to-end tests** on top (a real browser driving complete user flows). Unit tests run in milliseconds and pinpoint failures precisely; integration tests catch wiring bugs; E2E tests prove the product actually works, at the price of speed, setup, and flakiness. The shape matters: a pyramid keeps the suite fast and deterministic, while an inverted pyramid (mostly E2E) turns every deploy into a slow lottery.

### Prove It

```js
// 09-cart-tests.js — run: node 09-cart-tests.js   (a unit suite: one module, no I/O)
// 10-api-client-tests.js — run: node 10-api-client-tests.js  (integration-style: logic + mocked boundary)
```

#### Gotchas / Edge Cases

- A "unit" is not a file — it's one behavior. Five tests inside one `test()` is five units jammed together; a failure there tells you nothing about *which* promise broke.
- E2E tests are the most likely to be flaky (timing, network, browser state) — keep only the critical journeys there.
- "It works on my machine" is the symptom of a suite with no integration layer: the units were fine, the wiring was never tested.
- The cheapest test is the one you do not rewrite when the requirements change — prefer asserting public behavior over internal implementation details.
- Zero tests plus confident code is a bug farm; the confidence is real only if the suite actually *fails* when the code is broken (see 16.10).

---

## 16.2 Test Anatomy: Arrange → Act → Assert

### Explain It

Every test has a skeleton: **Arrange** sets up inputs and preconditions, **Act** performs exactly the thing under test, and **Assert** checks the outcome. Keeping the three phases visually separate — inside one `test()` — makes every test read like a mini-spec: setup, stimulus, promise. If Act contains five calls, the test is doing too much and should be split into five tests. Test **naming** is half the value: a name is a sentence about behavior ("merges duplicates instead of pushing twice"), never a restatement of code ("test1" or "addTest"). Good names read like `should …` sentences and include the scenario plus the expected outcome, so when something fails the name alone tells the next engineer what contract broke.

### Prove It

```js
// 02-basic-tests.js — run: node 02-basic-tests.js   (naming + AAA in every test)
// 03-aaa-and-matchers.js — run: node 03-aaa-and-matchers.js
```

#### Gotchas / Edge Cases

- Assertions without Act are dead code — always make the behavior under test the *only* moving part.
- `expect(a).toBe(b); expect(c).toBe(d);` in one test mixes units; when the second fails the first already passed, hiding half the bug.
- A good test name survives the implementation changing, because it describes behavior, not code lines.
- Don't put logic (loops, conditionals, recomputation) in the Assert phase — assert against literal expectations, not "what the code probably computed".
- Test names like "works" or "check" pass review but fail archaeology: nobody can tell why the test exists.

---

## 16.3 Matchers: toBe vs toEqual

### Explain It

Matchers answer "did the actual value meet the expectation?" in human terms. `toBe` uses reference equality (`Object.is`) — two separately-created objects are **never** `toBe`-equal, even when their contents are identical. `toEqual` walks the whole structure recursively, so `{ port: 3000 }` deep-equals `{ port: 3000 }`. On primitives (numbers, strings, booleans) the two matchers agree, which is why beginners use `toBe` for everything and get bitten exactly once by objects. The other workhorses: `toHaveLength` for sizes, `toContain` for array membership or substring matching, `toThrow` for error contracts (optionally narrowed to an Error class or a message fragment), `toBeUndefined`/`toBeDefined` for presence, and `toBeGreaterThan` for numeric bounds. `toBe` on an object is almost always a bug — the identity check you usually want is `toEqual`.

### Prove It

```js
// 03-aaa-and-matchers.js — run: node 03-aaa-and-matchers.js   (every matcher demoed)
```

#### Gotchas / Edge Cases

- `toBe(NaN)` passes in our runner (and Jest) because `Object.is(NaN, NaN)` is true — don't "fix" NaN checks with `toBe(Number.NaN)` hacks; the matcher already handles it.
- `toEqual` ignores `undefined`-valued properties differently across frameworks — keep fixtures plain; functions and `undefined` inside objects are the classic deep-equality traps.
- Nested structures: `toEqual` is recursive, but circular references blow up naive comparers — keep test fixtures acyclic.
- `toThrow` without an argument passes for *any* error; always narrow to a class and/or message so wrong errors surface as failures.
- `.not` inverts a single assertion, not a block — `expect(x).not.toBe(1); expect(x).not.toBe(2);` still passes for `3`, which is probably not what you meant to assert.

---

## 16.4 A Minimal Test Runner

### Explain It

Under the hood, a test runner is embarrassingly simple: `describe(name, fn)` just records a naming prefix and calls `fn()` immediately; every `test(name, fn)` called inside is pushed onto a queue with the prefix baked into its full name. `expect(actual)` returns a chain of matcher functions that *throw* an error when the check fails. A `run()` pass drains the queue, executes each test function inside a try/catch, prints `PASS`/`FAIL` per test, prints a summary, and sets an exit code so CI can tell green from red — async tests are detected by checking whether the returned value is a promise and awaiting it. That is the entire framework. Jest adds decades of ergonomics (reporters, isolation, fake timers, snapshots), but the core contract of this module's own runner is the same three pieces: collect, execute, report. This module's `01-mini-test-runner.js` implements exactly that in ~200 lines of dependency-free Node, so every demo runs with plain `node`.

### Prove It

```js
// 01-mini-test-runner.js — run: node 01-mini-test-runner.js   (self-tests the runner)
```

#### Gotchas / Edge Cases

- A test that throws outside the try/catch region (e.g., in a `beforeEach` you build yourself) must fail the *suite*, not crash the process — wrap setup with the same try/catch as the test body.
- Forgetting the `await` in an async test makes the runner report green before the promise settles — a false green is worse than a false red.
- A runner that exits before in-flight timers finish is a race: either await everything or let the event loop drain before `process.exit(1)`.
- The runner reports one FAIL per test, so keep tests small — a suite of 20-line tests produces useless failure traces.
- In real Jest, `it` and `test` are aliases and `describe` nests; this mini runner keeps a flat queue with dot-prefixed names to stay minimal.

---

## 16.5 Mocks & Spies

### Explain It

A **mock** replaces a dependency with a controllable fake — the classic targets are `fetch`, `Date.now`, and `Math.random`, because all three are nondeterministic or I/O-bound and would make tests flaky or slow. A **spy** records calls so you can assert *how many* times a function ran and *with what* arguments — the fake-fetch pattern in this module records every `{ url, options }` into a `calls` array for exactly that. To freeze time you monkey-patch `Date.now = () => fixedValue` and — critically — restore the original in a `finally`, or the whole process runs on a fake clock forever. Same for `Math.random`: pin it to `0.5` and a dice roll becomes deterministic (`0.5*6+1 = 4`). The rule for **when not to mock**: never mock pure functions or your own logic — feed them real inputs and assert real outputs. Over-mocked suites pass while the real dependency is broken; mocks belong at the *boundary* of the system (network, clock, randomness, I/O), not inside it.

### Prove It

```js
// 04-mocks-spies.js — run: node 04-mocks-spies.js   (fake fetch, fake Date.now, rigged Math.random)
```

#### Gotchas / Edge Cases

- Restore mocks in `finally`, never *after* the test — an assertion failure skips the restore and leaks the fake into every following test.
- A spy that records *only* call count misses the bug: assert arguments and order too (e.g., `calls[0].url`).
- Mocking `Math.random` with `() => 0` then `() => 0.999…` covers the extremes; `0.5` alone misses floor boundaries.
- Don't mock both sides of an interaction — if you fake `fetch` *and* fake the code that calls it, the test verifies nothing real.
- Passing a real implementation into a mock (partial mocks) is a maintenance smell: keep fakes dumb so their behavior is trivially obvious.

---

## 16.6 Testing Async Code

### Explain It

Async tests must tell the runner when they are finished: modern frameworks infer it from the returned promise, so you `await` the promise *inside* the test body and the framework waits for the real completion. The classic "done callback" — `it("…", (done) => { …; done(); })` — exists because Mocha-era tests could not return promises; the escape hatch is worth knowing when you meet legacy suites. For timing logic, fake timers replace real `setTimeout` so a "wait 5 seconds then retry" test runs instantly — real delays in tests turn a 40-test suite into a bedtime story. This module keeps real timers but with values in the 5–25ms range so tests still run in a blink. The universal sins: forgetting `await` (false green) and `setTimeout(fn, 1000)` used as a race-alleviator inside tests (both slow and flaky). Await, assert, and let the framework decide when the test is over.

### Prove It

```js
// 05-async-tests.js — run: node 05-async-tests.js   (await, done-style wrapper, promise retry)
```

#### Gotchas / Edge Cases

- An awaited promise that *rejects* fails the test with the original error only if the rejection is caught or expected — unhandled rejections can crash the whole run.
- `await` must be inside the test function, not just once at the end of a `.then()` chain you forgot to return.
- Fake timers leak: a suite that enables them and forgets to restore silently freezes later tests' clocks.
- setTimeout races ("wait 100ms then check") are the #1 flaky-test generator — if you need a delay to make the test pass, you are testing your test, not the code.
- Timer cleanup: a test that leaves an interval running keeps the process alive indefinitely — clear timers in the test or the runner never finishes.

---

## 16.7 Testing Errors & Edge Cases

### Explain It

The tests that find real bugs live at the boundaries: empty strings, `null`, `NaN`, zero, and off-by-one limits — not the happy path. A function like `divide` has a contract that *includes* throwing: `divide(1, 0)` must throw `RangeError`, and the test should assert the class *and* the message, so a future "fix" that throws `TypeError` fails loudly. `parseJson` shows the three-way split: valid JSON parses, malformed JSON throws `SyntaxError`, and the *wrong type* of input (`null`, numbers) violates the precondition and throws `TypeError` — three distinct contracts, three distinct assertions. Boundary values deserve explicit tests because `clamp(10, 0, 10)` is the classic off-by-one trap: inclusive limits mean "exactly min" and "exactly max" must pass through unchanged. Empty input is a contract too: `parseJson("")` throwing `SyntaxError` is *correct behavior* — a test codifies that decision so nobody "helpfully" returns `null` later.

### Prove It

```js
// 06-error-edge-cases.js — run: node 06-error-edge-cases.js   (divide, parseJson, clamp)
```

#### Gotchas / Edge Cases

- `NaN` is not an error case for arithmetic — `divide(1, NaN)` correctly returns `NaN`; assert it explicitly so nobody "fixes" it into a throw.
- Assert the *class* of the thrown error (`toThrow(RangeError)`), not just "did it throw" — any throw passes the lazy version.
- `JSON.parse(undefined) != JSON.parse("undefined")`: the string `"undefined"` is invalid JSON too, and both must be covered.
- Boundary inclusivity is two tests, not one: exact-min and exact-max behave differently from just-outside values.
- Degenerate inputs (a clamp where `max < min`) still need a defined behavior — even if that behavior is documented "garbage in, garbage out".

---

## 16.8 Test Isolation

### Explain It

Test isolation is the rule that every test starts from the same clean slate: no file left over, no counter left incremented, no user that a previous test created. Without it, suites become **order-dependent** — run alone each test passes, run together they fail randomly, and the failures move when you reorder the file. That nondeterminism is *flakiness*, and flaky tests are worse than no tests because they train the team to ignore red. The fix is what Jest calls `beforeEach`: reset shared state — or, even better, stop sharing: create a fresh instance *inside* each test. This module's counter demo shows both sides with the same code: a shared counter fails its second test ("expected 1 but the counter was already at 2"); fresh-per-test counters pass every run. The invariant to internalize: a test must be able to run alone, first, or last — and produce the same result.

### Prove It

```js
// 07-isolation.js — run: node 07-isolation.js   (flaky shared state vs per-test reset, side by side)
```

#### Gotchas / Edge Cases

- Global-ish state inside a module (a `let` cache, a counter, a logger buffer) is the most common leak; reset it per test rather than hoping tests don't touch it in sequence.
- `beforeEach` that sets up objects a test *mutates* only helps if each test gets its own instance — shared-but-reset state still leaks via references.
- Order dependence can be disguised: alphabetizing names makes the suite pass until someone adds "test0" — so never assert order, depend on order, or skip isolation.
- Mocks and timers are state too: restore them (16.5/16.6) or they leak forward like any shared variable.
- Parallel test runners (Jest `--maxWorkers`) multiply the leak surface — isolation is mandatory, not optional, the moment tests run concurrently.

---

## 16.9 Coverage

### Explain It

Coverage measures how much of the code the suite *executed*: **line coverage** counts executed lines, **branch coverage** counts which `if`/`else` paths were taken. It is a progress meter, not an honor roll — 100% line coverage is achievable while every assertion is trivial, because "called the function and asserted nothing" still counts as covered. Industry convention lands at 80–90% on critical modules, but the smart targets are the *dangerous* branches: error handling, retry exhaustion, and boundary conditions. Real coverage tools (`c8`, Istanbul, Jest's `--coverage`) instrument the source automatically; the manual counter below shows the idea — a probe count on each line and a flip count on each branch. The biggest miss: coverage says nothing about *integration* — three modules at 100% each can still be wired together wrong, and performance and timing bugs are invisible to any coverage number.

### Prove It

```js
// 06-error-edge-cases.js — run: node 06-error-edge-cases.js
// (the smoke-test suite for the snippet below; real coverage would instrument it)

// Manual coverage probe — the idea behind c8/Istanbul:
const probe = { lines: { 2: 0, 3: 0, 4: 0 }, branches: { "n<min": [0, 0], "n>max": [0, 0] } };
function clampWithProbe(n, min, max) {
  probe.lines[2]++;               // line 2 executed
  if (n < min) { probe.branches["n<min"][0]++; probe.lines[3]++; return min; }
  probe.branches["n<min"][1]++;
  if (n > max) { probe.branches["n>max"][0]++; probe.lines[4]++; return max; }
  probe.branches["n>max"][1]++;
  return n;
}
clampWithProbe(5, 0, 10); clampWithProbe(-1, 0, 10); // both branches taken, lines hit
console.log("branch coverage:", (Object.values(probe.branches).filter(b => b[0] && b[1]).length / 2) * 100 + "%");
```

#### Gotchas / Edge Cases

- Coverage measures *execution*, not *correctness*: a test that calls code and never asserts is 100% "covered" and 0% useful.
- Branch coverage is the one worth chasing — the untested `else` is where production bugs live.
- The green-zone red flag: a 95% coverage spike right before a deadline usually means the tests were written to chase lines, not to verify behavior.
- Coverage can't see integration wires, timing, or UX — three 100%-covered modules can still break when composed.
- Don't soften the bar: "we only ship with 60%" turns into "we ship with anything" by the second quarter.

---

## 16.10 TDD: Red → Green → Refactor

### Explain It

TDD inverts the instinct to write code first: **RED** — write a test for behavior that doesn't exist yet and run it, proving the test can actually *detect* the missing feature; **GREEN** — write the smallest implementation that makes it pass; **REFACTOR** — improve the code while the suite holds the door. The red step is the load-bearing one: a test that can't fail can't verify anything. The discipline has three compounding payoffs: you design the API from the *caller's* perspective before the implementation exists, every feature ships with a regression net, and the red-green rhythm forces you to implement only what the tests ask for (no speculative complexity). This module replays the whole loop live: the first run of the `fizzbuzz` suite fails against a stub, the second run is green after a minimal implementation, and a third run re-verifies a refactored version — same tests, all green.

### Prove It

```js
// 08-tdd-example.js — run: node 08-tdd-example.js   (RED failure, GREEN pass, REFACTOR pass, narrated)
```

#### Gotchas / Edge Cases

- RED must be *observed*, not assumed — if you never saw the test fail, you can't be sure it fails for the right reason (it might pass with the feature absent: a test bug).
- Skipping the red step silently converts TDD into "write tests for whatever I already built" — which conveniently passes, and proves nothing.
- Don't skip refactor: the point is the safety net, and green-on-first-try is progress; green *after* refactoring is the skill.
- Writing the implementation before the test makes the test fit the code instead of the requirement — the test then protects an accident you invented.
- Small steps: a red state spanning 500 lines of changes is undebuggable; the loop should be minutes, not weeks.

---

## 16.11 Testing Real Code: the Shopping Cart (Week 3)

### Explain It

This is the full suite for the Week 3 Shopping Cart, runnable here with the mini runner (real file: `plan.md` Week 18 build project). The suite covers every public contract of `createCart`: adding and totaling (including the canonical example — 2× Laptop + Mouse = 2023), **merging** duplicates instead of pushing a second row, honoring explicit and default quantities, **privacy** (`cart.items` is `undefined` — the closure leak test), **copy semantics** (`getItems()` returns a copy, so caller-side mutation cannot corrupt the cart), `removeItem` (only the named item, and missing names must not throw), and `clear` (empty items, zero total, and the cart stays usable afterward). Notice what the suite *demonstrates* beyond the tests: every assertion targets public behavior through the documented API — the private `items` array is never touched directly, which is exactly the black-box discipline unit tests should have.

### Prove It

```js
// 09-cart-tests.js — run: node 09-cart-tests.js   (the full Shopping Cart suite, self-contained)
```

#### Gotchas / Edge Cases

- Encapsulation leaks through copies: if `getItems()` returned the internal array, a caller's `push` would poison the total — the copy test catches exactly that.
- Chained calls return `this` — a suite that never chains misses broken fluency (`addItem(...).addItem(...)`) and would only notice later.
- "Missing item must not throw" is a *decision*: codifying it means nobody "improves" `removeItem` into a thrower and breaks callers.
- Test the merged object's shape, not just the total — two merges can produce the same sum with wrong quantities.
- Fresh cart per test is this module's isolation lesson (16.8) in miniature: the suite needs zero `beforeEach` because it never shares state.

---

## 16.12 Testing Network Code

### Explain It

Network code is tested by mocking the *boundary* — `fetch` — with a scripted sequence of responses, so the client under test runs deterministic and offline. The `ApiClient` here retries non-OK responses and network errors up to `retries` times, and the mock replays a story: `[500, 502, 200]` proves retry succeeds on the 3rd attempt (assert the mock's call count is 3); `[Error("network down") ×2, 200]` proves network errors are retried too; `[500 ×3]` with `retries: 2` proves exhaustion throws the last error (calls = 3 = retries + 1); and `[404]` proves permanent errors are *never* retried (calls = 1). Two design decisions carry the whole suite: the mock records every call into a `calls` array (spy + mock in one), and the retry loop is real application code executed against a fake `fetch` — the test verifies our logic, not the network's.

### Prove It

```js
// 10-api-client-tests.js — run: node 10-api-client-tests.js   (success / retry / exhaustion / 404)
```

#### Gotchas / Edge Cases

- Retry off-by-ones are the classic bug: `retries: 3` means up to **4** total attempts (initial + 3 retries) — assert the exact call count, including the exhaustion case.
- 404-less permanent errors (400, 403) each need their *own* decision — assume nothing; codify whether they retry.
- A network error and a non-OK response follow different code paths in most clients — test both, not just the "server said no" variety.
- Assert the error that *escapes*: exhaustion must throw the real `ApiError` (or last network error), not a swallowed success.
- Real `fetch` will happily hit a live server when `fetchFn` falls through to the default — in tests, always inject the mock so a forgotten wiring defaults to crash-loud, not hit-the-network.

---

## 16.13 Interview Questions (Say It Out Loud)

### Explain It

Say these out loud: What are unit, integration, and E2E tests, and the trade-offs? What is the testing pyramid and why does its shape matter? Walk me through Arrange, Act, Assert. What makes a good test name? What is the difference between toBe and toEqual, and why is toBe wrong for objects? Name the matchers you use daily. What is a mock, what is a spy, and how do you assert call counts and arguments? When should you NOT mock? How do you test async code, and what goes wrong with timers? Why do tests need isolation, and what causes flaky tests? What is line vs branch coverage, what % to aim for, and what does coverage miss? Explain TDD red → green → refactor and why the red step matters. How do you test a function that depends on fetch, including retry and 404? Your suite passes locally but fails in CI — how do you debug it?

### Prove It

```js
// 11-interview-testing.js — run: node 11-interview-testing.js
```

---

## Sources

- Jest docs — matchers & test structure: https://jestjs.io/docs/using-matchers
- Vitest (Jest-compatible, Vite-native): https://vitest.dev
- The Test Pyramid (Martin Fowler): https://martinfowler.com/articles/practical-test-pyramid.html
- c8 / V8 coverage instrumentation: https://github.com/bcoe/c8
- Node's built-in `node:test` runner (2023+, zero-dependency testing from the platform): https://nodejs.org/api/test.html