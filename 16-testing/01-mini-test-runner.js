/**
 * Module 16 — 16.4 A Minimal Test Runner (Zero-Dependency)
 *
 * A tiny describe/test/expect framework so every demo in this module runs with
 * plain `node` — no Jest/Vitest/Cypress install needed. (Real Jest syntax is
 * shown inside comments in the demo files.)
 *
 * How it works under the hood:
 *   - describe(name, fn) only records a naming prefix; fn() runs immediately
 *     and every test(...) call it makes is queued with the prefix baked in.
 *   - test(name, fn) pushes { name, fn } onto a queue.
 *   - expect(actual) returns a chain of matchers; a failing matcher throws an
 *     AssertionError, which run() catches and converts into a FAIL line.
 *   - run() drains the queue, executes each test (awaiting async ones in
 *     order), prints a PASS/FAIL line per test plus a summary, and sets
 *     process.exitCode so `node file.js` / CI reports exit 0 (green) or 1 (red).
 *
 * When a demo file requires this module, an automatic run is scheduled on the
 * next tick, so a demo file is just:
 *     const { describe, test, expect } = require("./01-mini-test-runner.js");
 *     describe("add()", () => {
 *       test("adds two numbers", () => expect(add(1, 2)).toBe(3));
 *     });
 *
 * Run: node 01-mini-test-runner.js
 */

"use strict";

const GREEN = "\x1b[32m";
const RED = "\x1b[31m";
const GREY = "\x1b[90m";
const RESET = "\x1b[0m";
// Color only when stdout is an interactive TTY so piped output stays clean.
const paint = process.stdout.isTTY
  ? (code, text) => `${code}${text}${RESET}`
  : (_, text) => text;

let queue = [];
let suite = ""; // describe() prefix for the current block being declared

function describe(name, fn) {
  const previous = suite;
  suite = previous ? `${previous} > ${name}` : name;
  try {
    fn(); // runs immediately; the test() calls inside just queue up
  } finally {
    suite = previous;
  }
}

function test(name, fn) {
  queue.push({ name: suite ? `${suite} > ${name}` : name, fn });
}

// ---- helpers for messages ----
function fmt(v) {
  if (v === undefined) return "undefined";
  if (typeof v === "string") return JSON.stringify(v);
  if (typeof v === "function") return `[Function ${v.name || "anonymous"}]`;
  try {
    return JSON.stringify(v);
  } catch {
    return String(v);
  }
}

// Recursive deep equality: primitives, NaN, arrays, plain objects, Dates.
function deepEqual(a, b) {
  if (Object.is(a, b)) return true; // handles same refs, NaN, +0/-0
  if (a instanceof Date || b instanceof Date)
    return a instanceof Date && b instanceof Date && a.getTime() === b.getTime();
  if (Array.isArray(a)) {
    if (!Array.isArray(b) || a.length !== b.length) return false;
    return a.every((value, i) => deepEqual(value, b[i]));
  }
  if (a === null || b === null || typeof a !== "object" || typeof b !== "object")
    return false;
  const keysA = Object.keys(a);
  const keysB = Object.keys(b);
  if (keysA.length !== keysB.length) return false;
  return keysA.every((key) => deepEqual(a[key], b[key]));
}

function expect(actual) {
  function check(ok, msg) {
    if (!ok) {
      const err = new Error(msg);
      err.name = "AssertionError";
      throw err;
    }
  }
  function flip(negated, positive, negative) {
    return negated ? negative : positive;
  }
  function toThrow(expected, negated) {
    if (typeof actual !== "function")
      check(false, `expected a function to call, got ${fmt(actual)}`);
    let threw = false;
    let err = null;
    try {
      actual();
    } catch (e) {
      threw = true;
      err = e;
    }
    let ok = threw;
    if (threw && expected !== undefined) {
      if (typeof expected === "string") ok = String(err.message).includes(expected);
      else if (expected instanceof RegExp) ok = expected.test(String(err.message));
      else ok = err instanceof expected; // an Error subclass like RangeError
    }
    if (negated) ok = !ok;
    const detail = threw ? ` (threw ${err.name}: ${err.message})` : "";
    check(
      ok,
      `expected function ${flip(negated, "to throw", "not to throw")}` +
        `${expected !== undefined ? ` a ${expected.name || fmt(expected)}` : " any error"}${detail}`
    );
  }
  function makeChain(negated) {
    return {
      get not() {
        return makeChain(!negated);
      },
      toBe(expected) {
        const ok = Object.is(actual, expected);
        check(
          negated ? !ok : ok,
          `expected ${fmt(actual)} ${flip(negated, "to be", "not to be")} ${fmt(expected)}`
        );
      },
      toEqual(expected) {
        const ok = deepEqual(actual, expected);
        check(
          negated ? !ok : ok,
          `expected ${fmt(actual)} ${flip(negated, "to deep-equal", "not to deep-equal")} ${fmt(expected)}`
        );
      },
      toHaveLength(n) {
        const ok =
          actual != null && typeof actual.length === "number" && actual.length === n;
        check(
          negated ? !ok : ok,
          `expected ${fmt(actual)} ${flip(negated, "to have length", "not to have length")} ${n}`
        );
      },
      toContain(item) {
        const ok =
          typeof actual === "string"
            ? actual.includes(item)
            : Array.isArray(actual) && actual.includes(item);
        check(
          negated ? !ok : ok,
          `expected ${fmt(actual)} ${flip(negated, "to contain", "not to contain")} ${fmt(item)}`
        );
      },
      toThrow(expected) {
        toThrow(expected, negated);
      },
      toBeUndefined() {
        const ok = actual === undefined;
        check(
          negated ? !ok : ok,
          `expected ${fmt(actual)} ${flip(negated, "to be undefined", "not to be undefined")}`
        );
      },
      toBeDefined() {
        const ok = actual !== undefined;
        check(
          negated ? !ok : ok,
          `expected ${fmt(actual)} ${flip(negated, "to be defined", "not to be defined")}`
        );
      },
      toBeGreaterThan(n) {
        const ok = typeof actual === "number" && typeof n === "number" && actual > n;
        check(
          negated ? !ok : ok,
          `expected ${fmt(actual)} ${flip(negated, "to be >", "not to be >")} ${fmt(n)}`
        );
      },
    };
  }
  return makeChain(false);
}

async function run() {
  const batch = queue;
  queue = [];
  let passed = 0;
  let failed = 0;
  const problems = [];
  for (const t of batch) {
    try {
      const result = t.fn();
      if (result && typeof result.then === "function") await result;
      passed += 1;
      console.log(`  ${paint(GREEN, "PASS")}  ${t.name}`);
    } catch (err) {
      failed += 1;
      problems.push({ name: t.name, err });
      console.log(`  ${paint(RED, "FAIL")}  ${t.name}`);
    }
  }
  const total = passed + failed;
  const color = failed === 0 ? GREEN : RED;
  console.log("");
  console.log(
    `  ${paint(color, `Summary: ${passed}/${total} passed, ${failed} failed`)}`
  );
  if (problems.length > 0) {
    console.log(`  ${paint(RED, "Passing tests never fail silently — here is why:")}`);
    for (const p of problems) {
      console.log(`    ${paint(RED, "✘")} ${p.name}`);
      console.log(`      ${paint(GREY, p.err.message)}`);
    }
  }
  return { passed, failed };
}

// Run automatically when a demo file requires us (its tests are registered
// synchronously at the top level, before the next tick fires). Files that run
// suites manually (07, 08) drain the queue themselves, so we skip the run.
if (require.main === module) {
  // Self-test so the runner proves itself when run directly.
  test("toBe is reference equality (same object passes)", () => {
    const obj = { n: 1 };
    expect(obj).toBe(obj);
  });
  test("two separate shapes are NOT the same reference", () => {
    expect({ n: 1 }).not.toBe({ n: 1 });
  });
  test("toEqual deep-compares structure", () => {
    expect({ a: [1, 2], b: { c: "x" } }).toEqual({ a: [1, 2], b: { c: "x" } });
  });
  test("toThrow matches an Error subclass", () => {
    expect(() => {
      throw new RangeError("boom");
    }).toThrow(RangeError);
  });
  test("async tests are awaited", async () => {
    await new Promise((resolve) => setTimeout(resolve, 5));
    expect("after-timer").toBe("after-timer");
  });
  setImmediate(() => {
    run().then(({ failed }) => {
      process.exitCode = failed > 0 ? 1 : 0;
    });
  });
} else {
  process.nextTick(() => {
    if (queue.length === 0) return; // this file ran suites itself
    run().then(({ failed }) => {
      process.exitCode = failed > 0 ? 1 : 0;
    });
  });
}

module.exports = { describe, test, expect, run };