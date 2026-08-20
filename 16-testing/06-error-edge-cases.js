/**
 * Module 16 — 16.7 Testing Errors & Edge Cases
 * The tests that find the real bugs: empty input, null, NaN, division by zero,
 * invalid JSON, boundary values. If a function promises to throw, we assert it
 * throws the RIGHT error class with the RIGHT message.
 *
 * Run: node 06-error-edge-cases.js
 */

const { describe, test, expect } = require("./01-mini-test-runner.js");

// ---- functions under test ----
function divide(a, b) {
  if (b === 0) throw new RangeError("division by zero");
  return a / b;
}

function parseJson(input) {
  if (typeof input !== "string")
    throw new TypeError("input must be a string");
  return JSON.parse(input); // throws SyntaxError on malformed JSON
}

function clamp(n, min, max) {
  if (n < min) return min;
  if (n > max) return max;
  return n; // boundary values INCLUSIVE: clamp(max,min,max) === max
}

describe("divide()", () => {
  test("divides two numbers normally", () => {
    expect(divide(10, 2)).toBe(5);
    expect(divide(7, 2)).toBe(3.5);
  });

  test("throwing on division by zero", () => {
    expect(() => divide(1, 0)).toThrow(RangeError);
    expect(() => divide(1, 0)).toThrow("division by zero"); // message too
  });

  test("0 / 5 is 0, not an error", () => {
    expect(divide(0, 5)).toBe(0);
  });

  test("division by NaN yields NaN (NaN is not an error)", () => {
    expect(divide(1, NaN)).toBe(NaN); // Object.is treats NaN as equal to NaN
  });

  test("negative divisors work like any other number", () => {
    expect(divide(9, -3)).toBe(-3);
  });
});

describe("parseJson()", () => {
  test("parses valid JSON into a JS value", () => {
    expect(parseJson('{"a":1,"b":[true,null]}')).toEqual({ a: 1, b: [true, null] });
  });

  test("parses bare primitives, not just objects", () => {
    expect(parseJson("42")).toBe(42);
    expect(parseJson('"hi"')).toBe("hi");
  });

  test("throws SyntaxError for malformed JSON", () => {
    expect(() => parseJson("{ not json")).toThrow(SyntaxError);
    expect(() => parseJson("<html>")).toThrow(SyntaxError);
  });

  test("throws SyntaxError for the empty string", () => {
    // "" has nothing to parse — an empty input is INVALID JSON.
    expect(() => parseJson("")).toThrow(SyntaxError);
  });

  test("throws TypeError for non-string input like null or numbers", () => {
    expect(() => parseJson(null)).toThrow(TypeError);
    expect(() => parseJson(123)).toThrow(TypeError);
    expect(() => parseJson(undefined)).toThrow(TypeError);
  });

  test("whitespace-only input is still invalid JSON", () => {
    expect(() => parseJson("   ")).toThrow(SyntaxError);
  });
});

describe("clamp() boundary values", () => {
  test("values inside the range pass through untouched", () => {
    expect(clamp(5, 0, 10)).toBe(5);
  });

  test("values below the minimum are pinned to the minimum", () => {
    expect(clamp(-1, 0, 10)).toBe(0);
  });

  test("values above the maximum are pinned to the maximum", () => {
    expect(clamp(99, 0, 10)).toBe(10);
  });

  test("the boundaries themselves are INCLUSIVE (off-by-one trap)", () => {
    expect(clamp(0, 0, 10)).toBe(0); // exactly min — must NOT clamp up
    expect(clamp(10, 0, 10)).toBe(10); // exactly max — must NOT clamp down
  });

  test("max greater than min is the contract", () => {
    // Degenerate range (min=10, max=0): 5 < min, so it pins to min — predictably.
    expect(clamp(5, 10, 0)).toBe(10);
  });
});

/*
 * Why edge cases matter: most bugs live at the boundaries — empty strings,
 * nullish input, exact min/max, NaN, and "one off" values. A suite that only
 * tests the happy path gives false confidence; the interesting assertions say
 * what happens when the input is ugly.
 */