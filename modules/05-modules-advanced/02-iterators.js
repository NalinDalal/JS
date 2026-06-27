/**
 * Module 05 — 5.2 Iterators
 * Iterator/iterable protocol, for...of, spread, built-in iterables
 *
 * Run: node 02-iterators.js
 */

// --- Iterator Protocol: manual next() ---
console.log("--- Iterator Protocol ---");
const myIterator = {
  current: 0,
  last: 5,
  next() {
    if (this.current <= this.last) {
      return { value: this.current++, done: false };
    }
    return { value: undefined, done: true };
  }
};

console.log(myIterator.next()); // { value: 0, done: false }
console.log(myIterator.next()); // { value: 1, done: false }
console.log(myIterator.next()); // { value: 2, done: false }

// --- Iterable Protocol: [Symbol.iterator] ---
console.log("\n--- Iterable Protocol (range) ---");
const range = {
  start: 1,
  end: 5,
  [Symbol.iterator]() {
    let current = this.start;
    const last = this.end;
    return {
      next() {
        if (current <= last) {
          return { value: current++, done: false };
        }
        return { value: undefined, done: true };
      }
    };
  }
};

// for...of consumes the iterable
for (const num of range) {
  console.log("for...of:", num); // 1, 2, 3, 4, 5
}

// Spread works
console.log("Spread:", [...range]); // [1, 2, 3, 4, 5]

// --- Built-in Iterables ---
console.log("\n--- Built-in Iterables ---");

// Array
const arr = [10, 20, 30];
const arrIter = arr[Symbol.iterator]();
console.log("Array:", arrIter.next().value); // 10

// String
const str = "hi";
const strIter = str[Symbol.iterator]();
console.log("String:", strIter.next().value); // "h"

// Map
const map = new Map([["a", 1], ["b", 2]]);
const mapIter = map[Symbol.iterator]();
console.log("Map:", mapIter.next().value); // ["a", 1]

// Set
const set = new Set([1, 2, 3]);
const setIter = set[Symbol.iterator]();
console.log("Set:", setIter.next().value); // 1

// --- for...of manual equivalent ---
console.log("\n--- Manual iteration equivalent ---");
const iter = range[Symbol.iterator]();
let result = iter.next();
while (!result.done) {
  console.log("manual:", result.value);
  result = iter.next();
}

// --- Spread uses iterators ---
console.log("\n--- Spread and Array.from ---");
const fromObj = { ...range }; // spread object keys (NOT iterator)
const fromIter = Array.from(range); // uses iterator
console.log("Array.from(range):", fromIter); // [1, 2, 3, 4, 5]

// Destructuring uses iterators
const [first, second] = range;
console.log("Destructure:", first, second); // 1, 2

// --- Custom Fibonacci iterable (lazy, infinite) ---
console.log("\n--- Fibonacci iterable ---");
const fibonacci = {
  [Symbol.iterator]() {
    let a = 0, b = 1;
    return {
      next() {
        const value = a;
        [a, b] = [b, a + b];
        return { value, done: false }; // infinite!
      }
    };
  }
};

// Take first 10 Fibonacci numbers
let count = 0;
for (const num of fibonacci) {
  console.log("fib:", num);
  if (++count === 10) break; // 0, 1, 1, 2, 3, 5, 8, 13, 21, 34
}

// --- Finite range for spread ---
console.log("\n--- Finite range (spreadable) ---");
const finiteRange = {
  [Symbol.iterator]() {
    let current = 0;
    return {
      next() {
        return current < 3
          ? { value: current++, done: false }
          : { value: undefined, done: true };
      }
    };
  }
};
console.log([...finiteRange]); // [0, 1, 2]

// Destructuring from infinite fibonacci (take first 3)
const [a, b, c] = fibonacci; // restarted — generator is fresh
console.log("Destructure fib:", a, b, c); // 0, 1, 1
