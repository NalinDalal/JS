/**
 * Module 05 — 5.3 Generators
 * yield, yield*, two-way communication, use cases
 *
 * Run: node 03-generators.js
 */

// --- Basic Generator Syntax ---
console.log("--- Basic Generator ---");
function* countTo(n) {
  for (let i = 1; i <= n; i++) {
    yield i;
  }
}

const counter = countTo(3);
console.log(counter.next()); // { value: 1, done: false }
console.log(counter.next()); // { value: 2, done: false }
console.log(counter.next()); // { value: 3, done: false }
console.log(counter.next()); // { value: undefined, done: true }

// for...of
console.log("\nfor...of:");
for (const val of countTo(5)) {
  console.log(val); // 1, 2, 3, 4, 5
}

// --- yield vs return ---
console.log("\n--- yield vs return ---");
function* demo() {
  yield 1;
  yield 2;
  return 3; // final value, sets done: true
  yield 4; // NEVER reached
}

const gen = demo();
console.log(gen.next()); // { value: 1, done: false }
console.log(gen.next()); // { value: 2, done: false }
console.log(gen.next()); // { value: 3, done: true }
console.log(gen.next()); // { value: undefined, done: true }

// --- yield* Delegation ---
console.log("\n--- yield* Delegation ---");
function* inner() {
  yield "a";
  yield "b";
}

function* outer() {
  yield 1;
  yield* inner(); // delegates to inner generator
  yield 2;
}

console.log([...outer()]); // [1, "a", "b", 2]

// yield* with arrays
function* concat(...iterables) {
  for (const iter of iterables) {
    yield* iter;
  }
}

console.log([...concat([1, 2], [3, 4], [5])]); // [1, 2, 3, 4, 5]

// --- Generator as Iterator in class ---
console.log("\n--- Generator as Iterator (Range class) ---");
class Range {
  constructor(start, end) {
    this.start = start;
    this.end = end;
  }

  *[Symbol.iterator]() {
    for (let i = this.start; i <= this.end; i++) {
      yield i;
    }
  }
}

const range = new Range(1, 5);
console.log([...range]); // [1, 2, 3, 4, 5]
for (const n of range) console.log("range:", n);

// --- Two-Way Communication ---
console.log("\n--- Two-Way Communication ---");
function* conversation() {
  const name = yield "What is your name?";
  const age = yield `Hello ${name}, how old are you?`;
  return `${name} is ${age} years old`;
}

const conv = conversation();
console.log(conv.next());          // { value: "What is your name?", done: false }
console.log(conv.next("Alice"));   // { value: "Hello Alice, how old are you?", done: false }
console.log(conv.next(30));        // { value: "Alice is 30 years old", done: true }

// --- Use Cases ---
console.log("\n--- Use Cases ---");

// Lazy Fibonacci
function* fibGen() {
  let a = 0, b = 1;
  while (true) {
    yield a;
    [a, b] = [b, a + b];
  }
}

function* take(n, iterable) {
  let count = 0;
  for (const item of iterable) {
    if (count++ >= n) return;
    yield item;
  }
}

const first10 = [...take(10, fibGen())];
console.log("Fibonacci first 10:", first10); // [0, 1, 1, 2, 3, 5, 8, 13, 21, 34]

// Tree traversal
class TreeNode {
  constructor(value, left, right) {
    this.value = value;
    this.left = left;
    this.right = right;
  }
}

function* inOrder(node) {
  if (node) {
    yield* inOrder(node.left);
    yield node.value;
    yield* inOrder(node.right);
  }
}

const tree = new TreeNode(4,
  new TreeNode(2, new TreeNode(1), new TreeNode(3)),
  new TreeNode(6, new TreeNode(5), new TreeNode(7))
);

console.log("In-order tree:", [...inOrder(tree)]); // [1, 2, 3, 4, 5, 6, 7]

// State machine
function* trafficLight() {
  while (true) {
    yield "RED";
    yield "YELLOW";
    yield "GREEN";
  }
}

const lights = trafficLight();
console.log("Light:", lights.next().value); // "RED"
console.log("Light:", lights.next().value); // "YELLOW"
console.log("Light:", lights.next().value); // "GREEN"

// Producer/Consumer two-way
function* producer() {
  let value = 0;
  while (true) {
    const consumerSignal = yield value++;
    if (consumerSignal === "stop") return "Done producing";
  }
}

const prod = producer();
console.log("prod:", prod.next());       // { value: 0, done: false }
console.log("prod:", prod.next());       // { value: 1, done: false }
console.log("prod:", prod.next("stop")); // { value: "Done producing", done: true }
