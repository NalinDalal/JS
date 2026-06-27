/**
 * Module 09 — 9.8 Functional Patterns
 * Currying, partial application, memoization, pipe/compose
 *
 * Run: node 08-functional-patterns.js
 */

console.log("--- Currying (n-ary -> unary chain) ---");
const add = (a) => (b) => a + b;
const add5 = add(5);
console.log("add5(3):", add5(3)); // 8
console.log("add(1)(2):", add(1)(2)); // 3

// Curried with 3 args
const curry3 = (fn) => (a) => (b) => (c) => fn(a, b, c);
const sum = (a, b, c) => a + b + c;
const curriedSum = curry3(sum);
console.log("curriedSum(1)(2)(3):", curriedSum(1)(2)(3)); // 6

console.log("\n--- Partial application (bind vs custom) ---");
function multiply(a, b) { return a * b; }
const double = multiply.bind(null, 2);
console.log("double(5):", double(5)); // 10

// Custom partial
function partial(fn, ...fixedArgs) {
  return (...remainingArgs) => fn(...fixedArgs, ...remainingArgs);
}
const triple = partial(multiply, 3);
console.log("triple(4):", triple(4)); // 12

console.log("\n--- Memoization ---");
function memoize(fn) {
  const cache = new Map();
  return (...args) => {
    const key = JSON.stringify(args);
    if (cache.has(key)) {
      console.log("cache hit:", key);
      return cache.get(key);
    }
    const result = fn(...args);
    cache.set(key, result);
    return result;
  };
}

function slowFib(n) {
  if (n <= 1) return n;
  return slowFib(n - 1) + slowFib(n - 2);
}
const fib = memoize((n) => {
  if (n <= 1) return n;
  return fib(n - 1) + fib(n - 2);
});

console.log("fib(40):", fib(40)); // 102334155 (fast with memoization)

console.log("\n--- Pipe (left to right) ---");
const pipe = (...fns) => (x) => fns.reduce((acc, fn) => fn(acc), x);

const doubleNum = (x) => x * 2;
const increment = (x) => x + 1;
const toStringNum = (x) => `${x}`;

const process = pipe(doubleNum, increment, toStringNum);
console.log("pipe(double, inc, toString)(5):", process(5)); // "11"

console.log("\n--- Compose (right to left) ---");
const compose = (...fns) => (x) => fns.reduceRight((acc, fn) => fn(acc), x);

const process2 = compose(toStringNum, increment, doubleNum);
console.log("compose(toString, inc, double)(5):", process2(5)); // "11"
