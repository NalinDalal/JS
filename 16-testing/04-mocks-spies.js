/**
 * Module 16 — 16.5 Mocks & Spies
 * A mock replaces a dependency (fetch) with a controllable fake. A spy records
 * calls so we can assert on call counts and arguments. We also freeze the
 * clock (Date.now) and the dice (Math.random) so logic becomes deterministic.
 *
 * (In real Jest: jest.fn(), jest.spyOn(Date, "now"), expect(fn).toHaveBeenCalledWith(...).)
 *
 * Run: node 04-mocks-spies.js
 */

const { describe, test, expect } = require("./01-mini-test-runner.js");

// ---- a hand-rolled fake fetch: it RECORDS every call (acts as spy + mock) ----
function createFakeFetch(responder) {
  const calls = [];
  async function fakeFetch(url, options) {
    calls.push({ url, options });
    // responder may be a plain response object or a function producing one
    return typeof responder === "function" ? responder(url, options) : responder;
  }
  fakeFetch.calls = calls; // assert on this
  fakeFetch.callCount = () => calls.length;
  return fakeFetch;
}

// ---- code under test: fetches weather from a (fake) API ----
async function fetchTemp(city, fetchFn) {
  const res = await fetchFn(`https://api.weather.example/${city}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  return { city, temp: data.main.temp };
}

const okResponse = (payload) => ({
  ok: true,
  status: 200,
  json: async () => payload,
});
const badResponse = (status) => ({
  ok: false,
  status,
  json: async () => ({}),
});

describe("fetchTemp with a mocked fetch", () => {
  test("returns the parsed temperature for a successful response", async () => {
    const fetchFn = createFakeFetch(okResponse({ main: { temp: 21 } }));
    const result = await fetchTemp("London", fetchFn);
    expect(result).toEqual({ city: "London", temp: 21 });
  });

  test("asserts on call count and the exact URL", async () => {
    const fetchFn = createFakeFetch(okResponse({ main: { temp: 21 } }));
    await fetchTemp("London", fetchFn);
    expect(fetchFn.callCount()).toBe(1);
    expect(fetchFn.calls[0].url).toBe("https://api.weather.example/London");
  });

  test("throws when the server returns a non-OK status", async () => {
    const fetchFn = createFakeFetch(badResponse(500));
    let threw = false;
    try {
      await fetchTemp("London", fetchFn);
    } catch (err) {
      threw = true;
      expect(err.message).toBe("HTTP 500"); // (real Jest: expect(...).rejects.toThrow)
    }
    expect(threw).toBe(true);
  });
});

// ---- freezing Date.now so time-based logic is deterministic ----
function buildTag() {
  return `build-${Date.now()}-v1`;
}

describe("Date.now spy (fake clock)", () => {
  test("buildTag embeds whatever the clock reports", () => {
    const realNow = Date.now;
    Date.now = () => 1_700_000_000_000; // freeze the clock
    try {
      expect(buildTag()).toBe("build-1700000000000-v1");
    } finally {
      Date.now = realNow; // ALWAYS restore — a leaked fake breaks the whole process
    }
  });
});

// ---- freezing Math.random for a fair die ----
function rollDie() {
  return Math.floor(Math.random() * 6) + 1;
}

describe("Math.random spy (rigged dice)", () => {
  test("rollDie maps 0.5 to a 4 (verify the math: 0.5*6=3, +1=4)", () => {
    const realRandom = Math.random;
    Math.random = () => 0.5;
    try {
      expect(rollDie()).toBe(4);
      expect(rollDie()).toBe(4); // deterministic: same fake, same roll
    } finally {
      Math.random = realRandom;
    }
  });
});

/*
 * When NOT to mock:
 *   - Pure functions: add(), reverse(), fib() take inputs and return outputs —
 *     feed them real values, no mock needed. Mocking them would test the mock.
 *   - Over-mocking means your suite passes while the real dependency is broken.
 *     Mock the BOUNDARY (fetch, clock, randomness), not your own logic.
 *   - If a test mocks more than it exercises, it is verifying architecture
 *     opinions, not behavior. Keep mocks at the edges of the system.
 */