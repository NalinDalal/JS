/**
 * Module 16 — 16.6 Testing Async Code
 * Async tests are awaited by the runner. We keep timers tiny (5–25ms) so the
 * suite still finishes in a blink. We also show the classic "done callback"
 * style and promise-based retry logic.
 *
 * (Real Jest: for fake timers you would use jest.useFakeTimers() + jest.advanceTimersByTime().)
 *
 * Run: node 05-async-tests.js
 */

const { describe, test, expect } = require("./01-mini-test-runner.js");

// A tiny wait helper backed by real setTimeout — small values keep tests fast.
function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function getUser(id) {
  await wait(5); // simulated database latency
  if (id < 0) throw new Error("invalid id");
  return { id, name: `User ${id}` };
}

// Retry a flaky async operation N times, waiting delayMs between attempts.
function retry(fn, { attempts = 3, delayMs = 5 } = {}) {
  return (async () => {
    let lastErr;
    for (let i = 0; i < attempts; i++) {
      try {
        return await fn();
      } catch (err) {
        lastErr = err;
        if (i < attempts - 1 && delayMs > 0) await wait(delayMs);
      }
    }
    throw lastErr;
  })();
}

// Builds an async function that fails the first `failCount` times, then yields
// `value`. Tracks its own call count so we can assert attempts.
function flaky(failCount, value, error = new Error("transient failure")) {
  let calls = 0;
  const fn = async () => {
    calls += 1;
    if (calls <= failCount) throw error;
    return value;
  };
  fn.calls = () => calls;
  return fn;
}

describe("wait()", () => {
  test("actually waits — the tick advances past the requested delay", async () => {
    const start = Date.now();
    await wait(25);
    expect(Date.now() - start).toBeGreaterThan(10);
  });
});

describe("getUser() (async/promise-based)", () => {
  test("resolves with the user for a valid id", async () => {
    const user = await getUser(42);
    expect(user).toEqual({ id: 42, name: "User 42" });
  });

  test("rejects for a negative id", async () => {
    let threw = false;
    try {
      await getUser(-1);
    } catch (err) {
      threw = true;
      expect(err.message).toBe("invalid id");
    }
    expect(threw).toBe(true);
  });
});

describe("retry()", () => {
  test("succeeds on the 3rd attempt after two transient failures", async () => {
    const fn = flaky(2, "data");
    const value = await retry(fn, { attempts: 3, delayMs: 5 });
    expect(value).toBe("data");
    expect(fn.calls()).toBe(3); // exactly 2 failures + 1 success
  });

  test("succeeds on the first attempt when nothing goes wrong", async () => {
    const fn = flaky(0, "instant");
    const value = await retry(fn, { attempts: 3, delayMs: 5 });
    expect(value).toBe("instant");
    expect(fn.calls()).toBe(1);
  });

  test("throws the last error after exhausting all attempts", async () => {
    const fn = flaky(99, "never");
    let threw = false;
    try {
      await retry(fn, { attempts: 3, delayMs: 5 });
    } catch (err) {
      threw = true;
      expect(err.message).toBe("transient failure");
    }
    expect(threw).toBe(true);
    expect(fn.calls()).toBe(3); // burned all attempts
  });
});

describe("the classic 'done callback' style", () => {
  // Older test frameworks signal completion via a callback instead of a promise.
  function readKey(callback) {
    setTimeout(() => callback("abc123"), 5);
  }

  test("wraps the callback in a promise so async/await works", async () => {
    // (Mocha: readKey(done) then done is invoked — same idea.)
    const key = await new Promise((resolve) => readKey(resolve));
    expect(key).toBe("abc123");
  });
});

/*
 * Race gotchas to remember:
 *   - NEVER sleep-fake time with HUGE delays: a 5s setTimeout in one test
 *     becomes a 70s suite. Keep delays in the milliseconds.
 *   - Always await the promise INSIDE the test — a forgotten await can make an
 *     async test "pass" before the real assertion runs (false green).
 *   - Fake timers must be restored, or later tests run against a frozen clock.
 */