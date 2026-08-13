# Module 02: Scope & Closures

## 2.1 Lexical Scope

### Explain It

JavaScript uses **lexical (static) scope** — the scope of a variable is determined by its position in the source code, not by the call stack at runtime.

- **Scope chain**: When a variable is referenced, JS looks up the scope chain from the current scope outward until it finds the variable or reaches the global scope.
- **Global scope**: Variables declared outside any function or block. Accessible everywhere.
- **Function scope**: Variables declared inside a function are only accessible within that function.
- **Block scope**: `let` and `const` are confined to the nearest enclosing `{ }` (loops, conditionals, etc.).

```js
let global = "I'm global";

function outer() {
  let outerVar = "I'm outer";

  function inner() {
    let innerVar = "I'm inner";
    console.log(global);    // found in global scope
    console.log(outerVar);  // found in outer's scope (scope chain)
    console.log(innerVar);  // found in inner's scope
  }

  inner();
  // console.log(innerVar); // ReferenceError — not in scope
}

outer();
```

**Nested functions** form a scope chain: `inner` → `outer` → global. Each function has a link to its lexical parent's scope.

### Prove It

```js
var x = 10;

function foo() {
  var x = 20;
  function bar() {
    console.log(x); // 20 — resolves to foo's x, not global
  }
  bar();
}

foo(); // 20

// Block scope proof
let a = 1;
if (true) {
  let a = 2; // separate block-scoped variable
  console.log(a); // 2
}
console.log(a); // 1 — block-scoped let doesn't leak out
```

The output proves JS walks the scope chain from innermost to outermost, and `let`/`const` respect block boundaries.

---

## 2.2 Hoisting

### Explain It

**Hoisting** is JS's behavior of moving declarations to the top of their scope during the compilation phase (before execution).

| Declaration     | Hoisted? | Initialized?       | Behavior                              |
|-----------------|----------|---------------------|---------------------------------------|
| `var`           | Yes      | Yes (as `undefined`) | Can be used before declaration        |
| `function`      | Yes      | Yes (full function)  | Can be called before declaration      |
| `let` / `const` | Yes      | No (TDZ)            | ReferenceError if accessed before decl|
| `class`         | No       | No (TDZ)            | ReferenceError if used before decl    |

The **Temporal Dead Zone (TDZ)** is the period from the start of a block until the `let`/`const` declaration is reached. Variables are in the TDZ — they exist but cannot be accessed.

### Prove It

```js
// var hoisting
console.log(b); // undefined (declared, not yet assigned)
var b = 5;

// function hoisting — entire function is hoisted
sayHi(); // "Hi!" — works before declaration
function sayHi() {
  console.log("Hi!");
}

// let/const — TDZ
try {
  console.log(c); // ReferenceError
} catch (e) {
  console.log("TDZ caught:", e.message);
}
let c = 10;

// class — NOT hoisted (TDZ)
try {
  const obj = new MyClass(); // ReferenceError
} catch (e) {
  console.log("Class TDZ:", e.message);
}
class MyClass {}
```

**Key insight**: Hoisting moves declarations, not initializations. `var` declarations are initialized to `undefined`; `let`/`const` are left uninitialized in the TDZ.

---

## 2.3 Closures

### Explain It

A **closure** is when an inner function retains access to its outer (lexical) function's variables, even after the outer function has returned.

This works because:
1. Functions create a scope chain referencing their lexical environment.
2. That environment is kept alive as long as the inner function exists.

**Practical uses**:
- **Counter**: Encapsulate state without globals.
- **Private variables**: Hide data from outside access.
- **Factory functions**: Create objects with preset configuration.

```js
function makeCounter() {
  let count = 0; // private variable
  return {
    increment: () => ++count,
    decrement: () => --count,
    getCount: () => count
  };
}

const counter = makeCounter();
counter.increment();
counter.increment();
console.log(counter.getCount()); // 2
// count is not accessible directly — it's private via closure
```

### Prove It

```js
// Closure in a loop — classic pitfall
console.log("=== var (no block scope) ===");
for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 100);
}
// Output: 3, 3, 3 — all closures share the same `i`

console.log("=== let (block scope) ===");
for (let j = 0; j < 3; j++) {
  setTimeout(() => console.log(j), 100);
}
// Output: 0, 1, 2 — each iteration gets its own `j`

// Closure retains reference, not value
function outer() {
  let x = 10;
  return function inner() {
    console.log(x); // references outer's x, live value
  };
}

let fn = outer();
let x = 999; // global x — doesn't affect closure
fn(); // 10 — closure captures the variable, not a copy

// Memory: closure keeps outer scope alive
function createHeavy() {
  const largeArray = new Array(1000000).fill("data");
  return function () {
    return largeArray.length; // largeArray stays in memory as long as this function exists
  };
}
```

**Pitfall**: In `var` loops, all callbacks share the same variable. Use `let` or an IIFE to capture each iteration's value.

---

## 2.4 IIFE (Immediately Invoked Function Expressions)

### Explain It

An **IIFE** is a function that is defined and immediately executed. It creates a new scope, preventing variable leakage into the global namespace.

**Syntax**:
```js
(function () {
  // code runs immediately
  var private = "I can't be seen outside";
})();
```

**Arrow function IIFE** (requires parentheses):
```js
(() => {
  console.log("Arrow IIFE");
})();
```

**Use cases**:
- One-time initialization scripts
- Encapsulating logic without polluting global scope
- Creating private scope in a file or script tag

### Prove It

```js
// var in IIFE doesn't pollute global scope
(function () {
  var secret = "hidden";
  console.log(secret); // "hidden"
})();

try {
  console.log(secret); // ReferenceError — not global
} catch (e) {
  console.log("secret is not global");
}

// IIFE for async loop fix (pre-let era)
for (var i = 0; i < 3; i++) {
  (function (capturedI) {
    setTimeout(() => console.log(capturedI), 100);
  })(i);
}
// Output: 0, 1, 2
```

---

## 2.5 Module Pattern

### Explain It

The **module pattern** combines IIFEs and closures to create modules with public and private members. The **Revealing Module Pattern** is a popular variation that returns an object exposing only the public API.

**Classic Module Pattern**:
```js
var Calculator = (function () {
  var result = 0; // private

  return {
    add: function (a, b) { result = a + b; return result; },
    getResult: function () { return result; }
  };
})();
```

**Revealing Module Pattern**: All functions are defined as private variables and assigned to the returned object. This provides a consistent syntax and makes it clear which methods are public.

```js
var Calculator = (function () {
  var result = 0;

  function add(a, b) {
    result = a + b;
  }

  function getResult() {
    return result;
  }

  return {
    add: add,        // public
    getResult: getResult  // public
    // result is private — not returned
  };
})();
```

### Prove It

```js
var UserModule = (function () {
  var name = "Alice"; // private

  function setName(newName) {
    if (typeof newName === "string") {
      name = newName;
    }
  }

  function getName() {
    return name;
  }

  return { setName, getName };
})();

console.log(UserModule.getName()); // "Alice"
UserModule.setName("Bob");
console.log(UserModule.getName()); // "Bob"
// UserModule.name is undefined — private via closure
```

Before ES6 modules, this was the standard way to create encapsulated, reusable code in JavaScript.

---

## Interview Questions

### Q1: What is a closure?

**Answer**: A closure is a function that retains access to variables from its lexical (outer) scope, even after the outer function has returned. Closures are created every time a function is created.

```js
function makeGreeter(greeting) {
  return function (name) {
    return `${greeting}, ${name}!`;
  };
}
const hello = makeGreeter("Hello");
console.log(hello("Alice")); // "Hello, Alice!" — closure over `greeting`
```

---

### Q2: What is TDZ (Temporal Dead Zone)?

**Answer**: TDZ is the period between entering a scope and the actual declaration of a `let`/`const`/`class` variable. During TDZ, accessing the variable throws a `ReferenceError`. Unlike `var` (which is initialized to `undefined`), `let`/`const` remain uninitialized.

```js
{
  // TDZ starts here for x
  try {
    x; // ReferenceError
  } catch (e) {
    console.log("In TDZ");
  }
  let x = 5; // TDZ ends here
  console.log(x); // 5
}
```

---

### Q3: What happens with `var` vs `let` in a for loop with setTimeout?

**Answer**: `var` is function-scoped, so all callbacks share the same variable (which equals the loop's final value). `let` is block-scoped, so each iteration creates a new binding.

```js
for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log("var:", i), 100);
}
// var: 3, var: 3, var: 3

for (let j = 0; j < 3; j++) {
  setTimeout(() => console.log("let:", j), 100);
}
// let: 0, let: 1, let: 2
```

To fix the `var` version without `let`, wrap the callback in an IIFE to capture each value.

---

### Q4: How do you create private variables in JavaScript?

**Answer**: Use closures via the module pattern, IIFE, or classes with private fields (`#`).

```js
// Module pattern
function createAccount(balance) {
  return {
    deposit(amount) { balance += amount; },
    getBalance() { return balance; }
    // balance is private — inaccessible from outside
  };
}

// Modern: private class fields
class Account {
  #balance;
  constructor(balance) { this.#balance = balance; }
  deposit(amount) { this.#balance += amount; }
  getBalance() { return this.#balance; }
}
```

---

### Q5: Can you explain scope chain with a nested example?

**Answer**: The scope chain is the path JS follows to resolve a variable: current scope → enclosing scope → ... → global scope.

```js
const a = 1;
function outer() {
  const b = 2;
  function middle() {
    const c = 3;
    function inner() {
      console.log(a + b + c); // 6 — resolved via scope chain
    }
    inner();
  }
  middle();
}
outer();
```

`inner` → `middle` → `outer` → global. JS traverses this chain until it finds `a`, `b`, and `c`.

---

### Q6: What is an IIFE and why would you use one?

**Answer**: An IIFE is a function expression that runs immediately after being defined. Use it to:
- Avoid polluting the global scope
- Create private scope for variables
- Execute initialization code

```js
const result = (function () {
  const data = [1, 2, 3];
  return data.map(x => x * 2);
})();
// data is not accessible outside — private scope
console.log(result); // [2, 4, 6]
```

---

## Sources

- [MDN Closures](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Closures)
- [MDN Scope](https://developer.mozilla.org/en-US/docs/Glossary/Scope)
- [YDKJS: Scope & Closures, Chapter 2: Lexical Scope](https://github.com/getify/You-Dont-Know-JS/blob/2nd-ed/scope-closures/README.md)
- [YDKJS: Scope & Closures, Chapter 4: Hoisting](https://github.com/getify/You-Dont-Know-JS/blob/2nd-ed/scope-closures/ch4.md)
- [YDKJS: Scope & Closures, Chapter 5: Closures](https://github.com/getify/You-Dont-Know-JS/blob/2nd-ed/scope-closures/ch5.md)
