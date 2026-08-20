/**
 * Module 16 — 16.13 Interview Questions (Testing)
 * Say the answer out loud BEFORE reading it. Run for a quick daily drill.
 *
 * Run: node 11-interview-testing.js
 */

const qa = [
  [
    "What are unit, integration, and end-to-end (E2E) tests?",
    "Unit tests exercise one function or module in isolation — fast, no I/O. Integration tests exercise several units together, often with a real or mocked boundary like a database or API. E2E tests drive the whole running app through a real browser or client, covering complete user flows. The trade-off: unit tests are cheapest and fastest, E2E are slowest but give the most confidence that the product actually works.",
  ],
  [
    "What is the testing pyramid and why does its shape matter?",
    "The pyramid puts MANY cheap fast unit tests at the bottom, FEWER integration tests in the middle, and a HANDFUL of slow E2E tests on top. Its shape matters because cost and speed scale with height: a suite of thousands of E2E tests would be slow, expensive, and flaky, while unit tests alone miss wiring bugs between modules. You want broad deterministic coverage at the base so the slow top layer only verifies the critical journeys.",
  ],
  [
    "Walk me through Arrange, Act, Assert. Why structure tests this way?",
    "Arrange sets up inputs and state, Act performs the single thing under test, and Assert checks the expected outcome. Structuring every test this way makes each one read like a mini-spec: the reader immediately sees the setup, the stimulus, and the promise. It also catches tests that do too much — if Act contains five calls, the test is checking five behaviors and should be split.",
  ],
  [
    "What makes a good test name?",
    "A good test name is a sentence about BEHAVIOR, not a restatement of code: 'merges duplicates instead of pushing twice' tells you the contract that is being enforced. It reads 'should...' when prefixed, avoids vague words like 'works' or 'test', and names the scenario plus the expected outcome. When a test fails, the name alone should tell the next engineer which behavior broke.",
  ],
  [
    "What is the difference between toBe and toEqual?",
    "toBe uses reference equality (Object.is): two separate objects are NEVER toBe-equal even if their contents match. toEqual does recursive deep equality on structure. On primitives like numbers and strings they agree. Using toBe on objects/arrays is the classic bug — the assertion fails even though the data is correct, or passes on a coincidental shared reference.",
  ],
  [
    "Name four matchers you use daily and what they guard against.",
    "toBe for primitives, toEqual for objects/arrays, toHaveLength for sizes, and toThrow for error contracts (with an Error class or message). toContain checks membership in arrays or substrings, toBeUndefined/toBeDefined verify presence, and toBeGreaterThan pins numeric bounds. Together they let you assert shape, size, membership, and failure behavior — not just equality.",
  ],
  [
    "What is a mock? What is a spy?",
    "A mock replaces a real dependency (fetch, Date.now, Math.random, a database) with a controllable fake so the code under test is deterministic. A spy wraps or records calls to a function so you can assert call counts and arguments — how MANY times and with WHAT inputs. A fake fetch that records its calls is both: it returns scripted responses (mock) and exposes calls.length (spy).",
  ],
  [
    "When should you NOT mock?",
    "Do not mock pure functions — feed them real inputs and assert real outputs; mocking them tests your mocks, not your code. Do not mock your own business logic or the thing you are trying to verify. Over-mocking is dangerous because the suite can go fully green while the real dependency is broken. Mock only the BOUNDARY — network, clock, randomness, I/O — and keep mocks at the edges of the system.",
  ],
  [
    "How do you test asynchronous code?",
    "Return the promise or await it inside the test so the framework waits for the real completion. For callback-style APIs, wrap the callback in a Promise or use a done callback. To test timing logic, use fake timers (jest.useFakeTimers()) so tests skip real delays instead of sleeping. The cardinal sin is forgetting the await: the test returns early, the promise rejects later, and you get a false green.",
  ],
  [
    "Why do tests need isolation? What causes flaky tests?",
    "Isolation means every test starts from the same clean state — no leftovers from the previous test. Shared mutable state (a module-level counter, a database row other tests touched, a file that grew) makes tests order-dependent: run alone they pass, run together they randomly fail — that is flakiness. Reset state per test with beforeEach or fresh instances, and never depend on test execution order.",
  ],
  [
    "What is coverage and what does it miss?",
    "Line coverage says which lines ran; branch coverage says which if/else paths were taken. Coverage is a lower bound on honesty: 100% coverage is possible while every meaningful assertion is trivial — a test that calls code and asserts nothing still counts. Aim for 80%+ on critical modules, but remember coverage measures execution, not correctness: it misses integration wiring, performance, and what the code SHOULD do.",
  ],
  [
    "Explain TDD: red, green, refactor.",
    "RED: write a test for behavior that does not exist yet and watch it fail — this proves the test can actually detect the missing behavior. GREEN: write the smallest implementation that makes it pass. REFACTOR: improve the code with the suite as a safety net. The discipline forces you to design the API from the caller's perspective and builds a regression net for every feature.",
  ],
  [
    "How do you test a function that depends on fetch?",
    "Replace fetch with a mock whose sequence of responses is scripted: a success response, a non-OK 500, a 404, and a thrown network error. Assert the code handles each path — including that 404 is NOT retried and that exhaustion throws the real error. Also assert on the mock's call count to prove retry logic fired the expected number of times, e.g. 3 calls for 2 failures and a success.",
  ],
  [
    "Your suite passes locally but fails in CI. What do you check first?",
    "Environment differences: Node version, locale, timezone, and Date.now/Math.random values. Then ordering and isolation: shared state, leftover files, ports already in use, un-restored mocks or timers. Then timing: real sleeps and race conditions are slower in CI. Finally, flakiness from non-deterministic data. Reproduce in a clean container, run the suite multiple times, and hunt for anything that changes between runs.",
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

try {
  process.stdin.setRawMode(true);
} catch {
  // non-TTY stdin (pipes) — raw mode unsupported, interactive drill still works
}
process.stdin.resume();
process.stdin.on("data", () => next());
process.stdin.on("end", () => {
  if (i < qa.length) console.log("\n(EOF — for the full drill press Enter once per question)");
  process.exit(0);
});
console.log("Say each answer out loud, then press Enter to check.");
next();