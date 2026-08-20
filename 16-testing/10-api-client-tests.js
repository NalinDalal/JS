/**
 * Module 16 — 16.12 Testing Network Code
 * A generic ApiClient with retry, tested against mocked fetch responses:
 * success, retry-able failures, permanent 404 (never retried), and total
 * exhaustion. No real network is touched — the boundary (fetch) is mocked.
 *
 * Run: node 10-api-client-tests.js
 */

const { describe, test, expect } = require("./01-mini-test-runner.js");

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

// ---- the ApiClient under test (self-contained) ----
class ApiClient {
  constructor({ fetchFn, retries = 3, delayMs = 0 } = {}) {
    this.fetchFn = fetchFn || ((url) => global.fetch(url));
    this.retries = retries; // retries AFTER the first attempt
    this.delayMs = delayMs;
  }

  async get(url) {
    let lastErr;
    for (let attempt = 0; attempt <= this.retries; attempt++) {
      try {
        const res = await this.fetchFn(url);
        if (res.ok) return res;
        if (res.status === 404) throw new ApiError("not found", 404); // permanent
        lastErr = new ApiError(`HTTP ${res.status}`, res.status);
      } catch (err) {
        if (err instanceof ApiError && err.status === 404) throw err; // never retry 404
        lastErr = err; // network error or non-OK — retry-able
      }
      if (attempt < this.retries) await wait(this.delayMs);
    }
    throw lastErr; // exhausted every attempt
  }
}

// ---- mock fetch: replays a scripted sequence of responses ----
function mockFetch(sequence) {
  const calls = [];
  const fn = async (url) => {
    calls.push(url);
    const next = sequence.shift();
    if (next instanceof Error) throw next; // network error
    return next; // { ok, status, json: ... }
  };
  fn.calls = calls; // spy: assert call count & URLs
  return fn;
}

const resp = (ok, status = ok ? 200 : 500) => ({
  ok,
  status,
  json: async () => ({ data: "payload" }),
});
const networkError = () => new Error("network down");

describe("ApiClient.get — happy path", () => {
  test("returns the response when the first attempt succeeds", async () => {
    const fetchFn = mockFetch([resp(true)]);
    const client = new ApiClient({ fetchFn });
    const res = await client.get("/users");
    expect(res.ok).toBe(true);
    expect(fetchFn.calls).toHaveLength(1); // one call, zero retries
  });
});

describe("ApiClient.get — retry logic", () => {
  test("retries non-OK responses and succeeds on the 3rd attempt", async () => {
    const fetchFn = mockFetch([resp(false, 500), resp(false, 502), resp(true)]);
    const client = new ApiClient({ fetchFn, retries: 3 });
    const res = await client.get("/users");
    expect(res.ok).toBe(true);
    expect(fetchFn.calls).toHaveLength(3); // 2 failures + 1 success
  });

  test("retries across network errors and then succeeds", async () => {
    const fetchFn = mockFetch([networkError(), networkError(), resp(true)]);
    const client = new ApiClient({ fetchFn, retries: 3 });
    const res = await client.get("/users");
    expect(res.ok).toBe(true);
    expect(fetchFn.calls).toHaveLength(3);
  });

  test("stops after the first network error when retries are disabled", async () => {
    const fetchFn = mockFetch([networkError()]);
    const client = new ApiClient({ fetchFn, retries: 0 });
    let threw = false;
    try {
      await client.get("/users");
    } catch (err) {
      threw = true;
      expect(err.message).toBe("network down");
    }
    expect(threw).toBe(true);
    expect(fetchFn.calls).toHaveLength(1);
  });
});

describe("ApiClient.get — exhaustion & permanent errors", () => {
  test("throws after exhausting all retries on an always-failing server", async () => {
    const fetchFn = mockFetch([resp(false, 500), resp(false, 500), resp(false, 500)]);
    const client = new ApiClient({ fetchFn, retries: 2, delayMs: 5 });
    let threw = false;
    try {
      await client.get("/users");
    } catch (err) {
      threw = true;
      expect(err.name).toBe("ApiError");
      expect(err.status).toBe(500);
    }
    expect(threw).toBe(true);
    expect(fetchFn.calls).toHaveLength(3); // retries(2) + initial attempt(1)
  });

  test("404 is permanent — thrown immediately, NEVER retried", async () => {
    const fetchFn = mockFetch([resp(false, 404)]);
    const client = new ApiClient({ fetchFn, retries: 3 });
    let threw = false;
    try {
      await client.get("/missing");
    } catch (err) {
      threw = true;
      expect(err.name).toBe("ApiError");
      expect(err.status).toBe(404);
    }
    expect(threw).toBe(true);
    expect(fetchFn.calls).toHaveLength(1); // no pointless retries on 404
  });
});

/*
 * Integration-style lessons:
 *   - The client IS tested; the network is NOT. Mocking fetch keeps tests fast,
 *     deterministic, and safe to run offline.
 *   - Assert on what matters: call COUNT (did it retry the right number of
 *     times?) and the failure PATH (did the error escape with the right code?).
 *   - Don't mock your own logic: the retry loop above is real code executed
 *     against a fake fetch — that is the boundary, not the behavior.
 */