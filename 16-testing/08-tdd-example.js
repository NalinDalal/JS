/**
 * Module 16 — 16.10 TDD: Red → Green → Refactor
 * Write the failing test first. Run it: it MUST fail (red, because the feature
 * does not exist yet). Then implement the smallest thing that makes it pass
 * (green). Then refactor with the tests still green. We replay all three steps
 * live in one process using the tiny runner's manual run().
 *
 * Run: node 08-tdd-example.js
 */

const runner = require("./01-mini-test-runner.js");
const { expect } = runner;

// STEP 0 — the feature does NOT exist yet. This is why the first run is RED.
function fizzbuzz(n) {
  throw new Error("fizzbuzz is not implemented");
}

function registerTests() {
  runner.describe("fizzbuzz()", () => {
    runner.test("returns 'Fizz' for multiples of 3", () => {
      expect(fizzbuzz(3)).toBe("Fizz");
    });
    runner.test("returns 'Buzz' for multiples of 5", () => {
      expect(fizzbuzz(5)).toBe("Buzz");
    });
    runner.test("returns 'FizzBuzz' for multiples of both 3 and 5", () => {
      expect(fizzbuzz(15)).toBe("FizzBuzz");
    });
    runner.test("returns the number as a string for anything else", () => {
      expect(fizzbuzz(7)).toBe("7");
    });
  });
}

(async () => {
  // ---- STEP 1 — RED ----
  console.log("\n  STEP 1 (RED): tests written BEFORE the feature exists");
  registerTests();
  await runner.run();
  console.log("  Expected: tests fail — the feature is missing. This is TDD working.");

  // ---- STEP 2 — GREEN ----
  console.log("\n  STEP 2 (GREEN): write the smallest implementation");
  fizzbuzz = (n) => {
    if (n % 15 === 0) return "FizzBuzz";
    if (n % 3 === 0) return "Fizz";
    if (n % 5 === 0) return "Buzz";
    return String(n);
  };
  registerTests();
  await runner.run();
  console.log("  Expected: all green. The behavior is now locked in by the tests.");

  // ---- STEP 3 — REFACTOR ----
  console.log("\n  STEP 3 (REFACTOR): same behavior, cleaner expression — tests stay green");
  fizzbuzz = (n) => ((n % 3 ? "" : "Fizz") + (n % 5 ? "" : "Buzz")) || String(n);
  registerTests();
  await runner.run();
  console.log("  Expected: still all green. Refactoring under test protection.");

  console.log("");
  console.log("  The cycle: RED (test demands behavior) -> GREEN (make it pass)");
  console.log("  -> REFACTOR (improve the code). Run the suite after every step.");
  process.exitCode = 0; // the RED run above was the lesson; the suite ends green
})();