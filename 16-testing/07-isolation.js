/**
 * Module 16 — 16.8 Test Isolation
 * Shared mutable state leaks between tests and makes suites flaky. We show the
 * bug first (a counter shared across tests fails on the second run), then the
 * fix: fresh state per test, the same idea as beforeEach() in Jest/Mocha.
 *
 * Run: node 07-isolation.js
 */

const runner = require("./01-mini-test-runner.js");
const { expect } = runner;

function createCounter() {
  let value = 0;
  return {
    increment() {
      value += 1;
      return value;
    },
    read() {
      return value;
    },
  };
}

(async () => {
  // ---- Example 1: the flaky bug — shared mutable state, no reset ----
  console.log("\n  ===== EXAMPLE 1: shared state, NO reset (flaky) =====");
  const shared = createCounter();
  runner.describe("Counter shared across tests (no reset)", () => {
    runner.test("first test sees the counter land on 1", () => {
      expect(shared.increment()).toBe(1);
    });
    runner.test("second test ALSO expects to start from 1", () => {
      // The counter is already at 1 from the previous test — leaks between tests.
      expect(shared.increment()).toBe(1); // FAILS: it returns 2
    });
  });
  await runner.run();

  // ---- Example 2: the fix — fresh state per test ----
  console.log("\n  ===== EXAMPLE 2: fresh state per test (isolated) =====");
  runner.describe("Counter with per-test reset (like beforeEach)", () => {
    runner.test("a fresh counter lands on 1", () => {
      const c = createCounter();
      expect(c.increment()).toBe(1);
    });
    runner.test("another fresh counter ALSO lands on 1", () => {
      const c = createCounter();
      expect(c.increment()).toBe(1);
    });
  });
  await runner.run();

  // ---- Lesson ----
  console.log("");
  console.log("  LESSON: the first suite failed because `shared` kept its value");
  console.log("  between tests. beforeEach() (or creating fresh instances) resets");
  console.log("  state so every test runs against the same starting conditions.");
  console.log("  Flaky tests are worse than no tests: they teach you to ignore red.");
  process.exitCode = 0; // the FAILURE above was the lesson; exit cleanly
})();