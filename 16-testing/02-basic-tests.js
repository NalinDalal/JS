/**
 * Module 16 — 16.1 Why Test & 16.2 Test Anatomy
 * The first real suite: pure functions, tested with the tiny runner.
 * Every test names WHAT it verifies ("adds positive numbers") — the name is a
 * sentence about behavior, not a restatement of the code.
 *
 * Run: node 02-basic-tests.js
 */

const { describe, test, expect } = require("./01-mini-test-runner.js");

// ---- functions under test (pure: same inputs, same outputs, no side effects) ----
function add(a, b) {
  return a + b;
}

function toUpperCase(s) {
  return s.toUpperCase();
}

function reverse(s) {
  return [...s].reverse().join("");
}

// Fibonacci: fib(0)=0, fib(1)=1, fib(2)=1, fib(3)=2, ... fib(10)=55
function fib(n) {
  if (n < 2) return n;
  let a = 0;
  let b = 1;
  for (let i = 2; i <= n; i++) {
    [a, b] = [b, a + b];
  }
  return b;
}

// ---- Arrange - Act - Assert ----
describe("add()", () => {
  test("adds two positive numbers", () => {
    // Arrange
    const a = 2;
    const b = 3;
    // Act
    const result = add(a, b);
    // Assert
    expect(result).toBe(5);
  });

  test("adds zero and keeps the other operand", () => {
    expect(add(7, 0)).toBe(7);
  });

  test("sums negative numbers", () => {
    expect(add(-4, -6)).toBe(-10);
  });

  test("commutes — order of arguments does not matter", () => {
    expect(add(1, 9)).toBe(add(9, 1));
  });
});

describe("toUpperCase()", () => {
  test("converts a mixed-case word to all caps", () => {
    expect(toUpperCase("Hello World")).toBe("HELLO WORLD");
  });

  test("leaves an already-uppercase string unchanged", () => {
    expect(toUpperCase("ABC")).toBe("ABC");
  });

  test("handles the empty string", () => {
    expect(toUpperCase("")).toBe("");
  });
});

describe("reverse()", () => {
  test("reverses a normal word", () => {
    expect(reverse("stressed")).toBe("desserts");
  });

  test("a palindrome reads the same backwards", () => {
    expect(reverse("racecar")).toBe("racecar");
  });

  test("reverses an emoji safely (code points, not UTF-16 halves)", () => {
    expect(reverse("a😀b")).toBe("b😀a");
  });
});

describe("fib()", () => {
  test("returns the base cases 0 and 1", () => {
    expect(fib(0)).toBe(0);
    expect(fib(1)).toBe(1);
  });

  test("computes fib(10) = 55", () => {
    expect(fib(10)).toBe(55);
  });

  test("is monotonic — later terms are never smaller", () => {
    expect(fib(8)).toBeGreaterThan(fib(5));
  });
});

/*
 * Why these are UNIT tests: each test feeds one pure function, sets up
 * nothing external, and asserts one behavior. No network, no database, no
 * timers — so they run in milliseconds and fail with a precise message.
 */