# Module 01: Fundamentals — Grammar, Types & Operators

**Covers:** MDN Guide chapters 1-3, YDKJS Scope ch1, YDKJS Types & Grammar ch1-4

---

## 1.1 Grammar & Declarations

### Explain It
JavaScript has **statements** (actions) and **expressions** (produce values). Declarations create bindings: `var` (function-scoped, hoisted), `let/const` (block-scoped, TDZ). `const` requires initialization and prevents reassignment (not mutation).

### Prove It
```js
// var: function-scoped, hoisted (initialized undefined)
console.log(a); // undefined
var a = 1;

// let/const: block-scoped, TDZ (ReferenceError if accessed before declaration)
{
  console.log(b); // ReferenceError
  let b = 2;
}

// const: must init, no reassignment
const c = 3;
// c = 4; // TypeError
c.prop = "ok"; // mutation allowed

// Function declarations hoist completely
foo(); // "foo"
function foo() { console.log("foo"); }

// Function expressions don't hoist
// bar(); // TypeError
const bar = function() { console.log("bar"); };
```

---

## 1.2 Types Overview (8 Types)

### Explain It
**7 Primitives** (immutable, passed by value): `undefined`, `null`, `boolean`, `number`, `bigint`, `string`, `symbol`. **1 Object** (mutable, passed by reference). `typeof null === "object"` is a legacy bug. Primitives auto-wrap when accessing properties.

### Prove It
```js
// Primitive types
typeof undefined        // "undefined"
typeof null             // "object" (bug)
typeof true             // "boolean"
typeof 42               // "number"
typeof 42n              // "bigint"
typeof "hello"          // "string"
typeof Symbol()         // "symbol"

// Object type
typeof {}               // "object"
typeof []               // "object"
typeof function(){}     // "function" (special case)

// Auto-wrapping
"hello".length          // 5 (String wrapper created temporarily)
(42).toString()         // "42" (Number wrapper)
```

---

## 1.3 Type Coercion

### Explain It
JS is **weakly typed** — implicit conversion happens. Three coercion paths for objects: **ToPrimitive** (hint: default/number/string), **ToNumber**, **ToString**. Explicit coercion (`Number()`, `String()`, `Boolean()`) is preferred for clarity.

### Prove It
```js
// Implicit coercion examples
"5" + 3        // "53" (string concat)
"5" - 3        // 2 (number)
true + 1       // 2 (true → 1)
null + 1       // 1 (null → 0)
undefined + 1  // NaN

// == loose equality (avoid!)
0 == false     // true
"" == false    // true
"5" == 5       // true
null == undefined  // true (only case!)

// === strict equality (prefer)
0 === false    // false
"5" === 5      // false

// Object.is (same-value)
Object.is(NaN, NaN)     // true
Object.is(+0, -0)       // false
Object.is(0, false)     // false

// Explicit coercion (clear intent)
Number("42")      // 42
+"42"             // 42
String(42)        // "42"
42 + ""           // "42"
Boolean(0)        // false
!!"hello"         // true
```

---

## 1.4 Special Values

### Explain It
`NaN` (only value !== itself), `Infinity/-Infinity`, `+0/-0` (equal in `===`, different in `Object.is`). `Number.isNaN()` and `Number.isFinite()` don't coerce args (unlike global `isNaN`/`isFinite`).

### Prove It
```js
NaN === NaN           // false
NaN !== NaN           // true (only value where this is true)
Number.isNaN(NaN)     // true
Number.isNaN("foo")   // false (global isNaN("foo") → true!)

1/0       // Infinity
-1/0      // -Infinity
Infinity - Infinity  // NaN

+0 === -0        // true
Object.is(+0, -0) // false
1/+0   // Infinity
1/-0   // -Infinity
```

---

## 1.5 Numbers & Math

### Explain It
IEEE 754 double-precision. Safe integers: `-(2^53-1)` to `2^53-1`. `BigInt` for larger integers (no mixing with Number). `Math` provides static methods (no constructor).

### Prove It
```js
Number.MAX_SAFE_INTEGER  // 9007199254740991
Number.MIN_SAFE_INTEGER  // -9007199254740991
Number.isSafeInteger(9007199254740991)  // true
Number.isSafeInteger(9007199254740992)  // false

// BigInt (n suffix)
const big = 9007199254740991n;
big + 1n === big + 2n  // false (precise!)
// big + 1  // TypeError: can't mix

// Math
Math.floor(3.7)    // 3
Math.ceil(3.2)     // 4
Math.round(3.5)    // 4
Math.random()      // 0-1
Math.max(1,5,3)    // 5
Math.hypot(3,4)    // 5
```

---

## 1.6 Strings & Template Literals

### Explain It
UTF-16 encoded, immutable. Template literals (backticks) support interpolation `${}`, multiline, tagged templates. Common methods: `slice`, `split`, `includes`, `startsWith`, `padStart`, `repeat`.

### Prove It
```js
const name = "JS";
const str = `Hello ${name.toUpperCase()}!`;  // "Hello JS!"

// Multiline
const html = `
  <div>
    <h1>${name}</h1>
  </div>
`;

// Useful methods
"hello".includes("ell")      // true
"hello".startsWith("he")     // true
"hello".endsWith("lo")       // true
"5".padStart(3, "0")         // "005"
"hi".repeat(3)               // "hihihi"
"a,b,c".split(",")           // ["a", "b", "c"]
"  hi  ".trim()              // "hi"
```

---

## 1.7 Operators & Precedence

### Explain It
**Arithmetic:** `+ - * / % **` (precedence: `**` > `* / %` > `+ -`). **Comparison:** `== != === !== > < >= <=` (return boolean). **Logical:** `&& || ??` (short-circuit, return operand value). **Bitwise:** `& | ^ ~ << >> >>>` (operate on 32-bit ints). **Assignment:** `= += -= *= /= %= **= &= |= ^= <<= >>= >>>= ??= ||= &&=`.

### Prove It
```js
// Short-circuit returns operand, not boolean
const a = 0 || "default";   // "default"
const b = 1 && "value";     // "value"
const c = null ?? "fallback"; // "fallback" (only null/undefined)

// Nullish coalescing vs OR
const d = "" || "fallback";     // "fallback"
const e = "" ?? "fallback";     // "" (empty string is not nullish)

// Optional chaining
const user = { profile: { name: "A" } };
user.profile?.name;        // "A"
user.settings?.theme;      // undefined (no error)

// Destructuring with defaults
const { x = 10, y = 20 } = { x: 5 };
// x=5, y=20
```

---

## 1.8 Control Flow

### Explain It
`if/else`, `switch` (strict `===` comparison), `try/catch/finally`, `throw`. `switch` cases fall through without `break`. `finally` always runs (even after return). Error objects: `Error`, `TypeError`, `ReferenceError`, `RangeError`, `SyntaxError`.

### Prove It
```js
// switch
const val = "b";
switch (val) {
  case "a": console.log("A"); break;
  case "b": console.log("B"); break;
  default: console.log("Other");
}

// try/catch/finally
try {
  throw new TypeError("bad type");
} catch (err) {
  console.log(err.name);     // "TypeError"
  console.log(err.message);  // "bad type"
} finally {
  console.log("cleanup");    // always runs
}

// Custom error
class ValidationError extends Error {
  constructor(field) {
    super(`Invalid ${field}`);
    this.name = "ValidationError";
    this.field = field;
  }
}
```

---

## Quick Reference Card

| Task | Code |
|------|------|
| Check type | `typeof x`, `Array.isArray(x)`, `x instanceof Constructor` |
| Safe number check | `Number.isFinite(x) && Number.isInteger(x)` |
| Safe integer | `Number.isSafeInteger(x)` |
| Coerce to number | `Number(x)` or `+x` |
| Coerce to string | `String(x)` or `` `${x}` `` |
| Coerce to boolean | `Boolean(x)` or `!!x` |
| Nullish default | `x ?? defaultVal` |
| Optional access | `obj?.prop?.nested` |

---

## Interview Questions

1. **Difference between `var`, `let`, `const`?** Scope, hoisting, TDZ, reassignment.
2. **What is `typeof null`?** `"object"` — legacy bug from JS 1.0.
3. **`==` vs `===` vs `Object.is`?** Coercion vs no coercion vs same-value (NaN, ±0).
4. **Why `0.1 + 0.2 !== 0.3`?** IEEE 754 floating-point precision.
5. **What is TDZ?** Temporal Dead Zone — accessing `let/const` before declaration throws ReferenceError.
6. **How to check `NaN`?** `Number.isNaN(x)` (not global `isNaN` which coerces).

---

## Sources
- MDN: [Grammar and types](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Grammar_and_types), [Numbers and strings](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Numbers_and_strings), [Expressions and operators](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Expressions_and_operators), [Control flow](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Control_flow_and_error_handling)
- YDKJS: Scope & Closures Ch1, Types & Grammar Ch1-4