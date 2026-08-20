/**
 * Module 16 — 16.3 Matchers: toBe vs toEqual & Friends
 * Objects and arrays are compared by REFERENCE with toBe but by STRUCTURE with
 * toEqual. Test names read like documented behavior, not like code.
 *
 * (In real Jest you would import: const { describe, test, expect } = require("@jest/globals");)
 *
 * Run: node 03-aaa-and-matchers.js
 */

const { describe, test, expect } = require("./01-mini-test-runner.js");

const makeConfig = () => ({ host: "localhost", port: 3000, flags: ["dev", "debug"] });

describe("Arrange-Act-Assert", () => {
  test("returns a server config for a local environment", () => {
    // Arrange
    const port = 3000;
    // Act
    const config = makeConfig();
    // Assert
    expect(config.port).toBe(port);
    expect(config.host).toBe("localhost");
  });
});

describe("toBe vs toEqual (reference vs deep equality)", () => {
  test("toBe passes only for the SAME object reference", () => {
    const obj = makeConfig();
    expect(obj).toBe(obj); // same reference: identity
    expect(makeConfig()).not.toBe(makeConfig()); // two fresh objects: different identity
  });

  test("toEqual compares STRUCTURE, so two fresh objects match", () => {
    expect(makeConfig()).toEqual({ host: "localhost", port: 3000, flags: ["dev", "debug"] });
    expect([1, 2, 3]).toEqual([1, 2, 3]);
    expect({ nested: { deep: [true] } }).toEqual({ nested: { deep: [true] } });
  });

  test("toBe on an object is almost always a bug — you mean toEqual", () => {
    // {port: 3000} on the left is a brand-new object, so toBe fails even though
    // the shape is identical. Use toEqual to compare content.
    expect({ port: 3000 }).toEqual({ port: 3000 });
  });
});

describe("toHaveLength", () => {
  test("reports the size of an array", () => {
    expect([1, 2, 3, 4]).toHaveLength(4);
  });

  test("reports the character count of a string", () => {
    expect("abcdef").toHaveLength(6);
    expect("").toHaveLength(0);
  });
});

describe("toContain", () => {
  test("finds an element in an array", () => {
    expect(["a", "b", "c"]).toContain("b");
  });

  test("finds a substring in a string", () => {
    expect("hello testing world").toContain("testing");
  });

  test("does not falsely match a different value", () => {
    expect([1, 2, 3]).not.toContain(99);
  });
});

describe("toThrow", () => {
  test("catches any throw", () => {
    expect(() => {
      throw new Error("kaboom");
    }).toThrow();
  });

  test("matches by error message substring", () => {
    expect(() => {
      throw new RangeError("index out of bounds");
    }).toThrow("out of bounds");
  });

  test("matches by error class", () => {
    expect(() => {
      throw new TypeError("bad type");
    }).toThrow(TypeError);
  });

  test("passes when a function does NOT throw", () => {
    expect(() => "no-op").not.toThrow();
  });
});

describe("truthiness helpers", () => {
  test("toBeUndefined / toBeDefined", () => {
    let unassigned;
    expect(unassigned).toBeUndefined();
    expect("value").toBeDefined();
  });

  test("toBeGreaterThan compares numbers", () => {
    expect(101).toBeGreaterThan(100);
    expect(0).not.toBeGreaterThan(0); // strictly greater
  });
});

/*
 * Remember: toBe(5) and toEqual(5) agree on primitives (numbers, strings,
 * booleans). They diverge on objects/arrays — toBe checks the reference,
 * toEqual walks the whole structure. When in doubt, toEqual.
 */