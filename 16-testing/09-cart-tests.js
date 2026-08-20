/**
 * Module 16 — 16.11 Testing Real Code: the Shopping Cart (Week 3)
 * The full suite for the Shopping Cart project from plan.md (Week 3 / Week 18
 * build project). The cart is self-contained in this file so the suite runs
 * anywhere with plain node. Real Jest would import { createCart } from "./cart";
 *
 * Run: node 09-cart-tests.js
 */

const { describe, test, expect } = require("./01-mini-test-runner.js");

// ---- the Week 3 Shopping Cart (closure keeps items private) ----
function createCart() {
  let items = []; // private — unreachable from outside the closure

  return {
    addItem(name, price, qty = 1) {
      const existing = items.find((i) => i.name === name);
      if (existing) {
        existing.qty += qty;
      } else {
        items.push({ name, price, qty });
      }
      return this; // chainable: cart.addItem(..).addItem(..)
    },
    removeItem(name) {
      items = items.filter((i) => i.name !== name);
      return this;
    },
    getTotal() {
      return items.reduce((sum, i) => sum + i.price * i.qty, 0);
    },
    getItems() {
      return [...items]; // return a copy, never the internal array
    },
    clear() {
      items = [];
      return this;
    },
  };
}

describe("createCart — adds / totals (plan.md Week 3 example)", () => {
  test("adds items and totals them", () => {
    const cart = createCart();
    cart.addItem("Laptop", 999).addItem("Mouse", 25);
    expect(cart.getTotal()).toBe(1024); // 999 + 25 (both qty 1)
  });

  test("supports quantities and prices other than 1", () => {
    const cart = createCart();
    cart.addItem("Apple", 2, 3);
    expect(cart.getItems()[0].qty).toBe(3);
    expect(cart.getTotal()).toBe(6);
  });

  test("totals the plan.md example: 2x Laptop + 1x Mouse = 2023", () => {
    const cart = createCart();
    cart.addItem("Laptop", 999).addItem("Mouse", 25).addItem("Laptop", 999);
    expect(cart.getTotal()).toBe(2023);
  });
});

describe("createCart — merging duplicates", () => {
  test("merges duplicates instead of pushing twice", () => {
    const cart = createCart();
    cart.addItem("Laptop", 999).addItem("Laptop", 999);
    expect(cart.getItems()).toHaveLength(1);
    expect(cart.getItems()[0].qty).toBe(2);
  });

  test("repeating addItem on a duplicate increases the quantity", () => {
    const cart = createCart();
    cart.addItem("A", 1).addItem("A", 1, 4);
    expect(cart.getItems()[0].qty).toBe(5);
  });
});

describe("createCart — privacy & defensive copies", () => {
  test("keeps items private — cart.items is undefined", () => {
    const cart = createCart();
    expect(cart.items).toBeUndefined(); // closure, not a property
    expect(cart.getItems()).toHaveLength(0);
  });

  test("getItems() returns a copy: mutating it cannot corrupt the cart", () => {
    const cart = createCart();
    cart.addItem("A", 1);
    cart.getItems().push({ name: "HACK", price: 0, qty: 1 }); // caller-side mutation
    expect(cart.getItems()).toHaveLength(1);
    expect(cart.getTotal()).toBe(1);
  });
});

describe("createCart — remove & clear", () => {
  test("removeItem drops only the named item", () => {
    const cart = createCart();
    cart.addItem("A", 1).addItem("B", 2).removeItem("A");
    expect(cart.getItems()).toHaveLength(1);
    expect(cart.getItems()[0].name).toBe("B");
    expect(cart.getTotal()).toBe(2);
  });

  test("removing a missing item does not throw", () => {
    const cart = createCart();
    expect(() => cart.removeItem("nope")).not.toThrow();
  });

  test("clear resets everything", () => {
    const cart = createCart();
    cart.addItem("A", 1).clear();
    expect(cart.getItems()).toHaveLength(0);
    expect(cart.getTotal()).toBe(0);
  });

  test("the cart is reusable after clear", () => {
    const cart = createCart();
    cart.addItem("A", 1).clear().addItem("B", 3);
    expect(cart.getTotal()).toBe(3);
  });
});

/*
 * This is a UNIT suite: the cart touches nothing outside itself, so every test
 * is deterministic, millisecond-fast, and needs no setup beyond a fresh cart.
 * That is exactly the confidence a test pyramid wants at the bottom layer.
 */