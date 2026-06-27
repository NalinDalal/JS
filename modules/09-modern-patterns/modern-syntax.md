# Module 09: Modern JavaScript Patterns & Syntax

## 9.1 Destructuring

### Explain It

Destructuring is a syntax that lets you extract values from arrays or properties from objects into distinct variables — all in a single, concise statement.

**Array Destructuring**

```js
// Syntax: [a, b, ...rest] = arr
const [first, second, third] = ['apple', 'banana', 'cherry'];
console.log(first);  // "apple"
console.log(second); // "banana"
console.log(third);  // "cherry"
```

You can skip elements, use defaults, and collect the rest:

```js
const [a, , c] = [1, 2, 3];          // skip index 1
const [x = 10, y = 20] = [5];        // x=5, y=20 (no value for y)
const [head, ...tail] = [1, 2, 3, 4]; // head=1, tail=[2,3,4]
```

**Object Destructuring**

```js
// Syntax: { key: alias = default } = obj
const { name: personName, age, city = 'Unknown' } = {
  name: 'Alice',
  age: 30
};
console.log(personName); // "Alice"
console.log(age);        // 30
console.log(city);       // "Unknown"
```

**Nested Destructuring**

```js
const user = {
  id: 1,
  profile: {
    name: 'Bob',
    address: { city: 'NYC', zip: '10001' }
  }
};

const { profile: { name, address: { city, zip } } } = user;
console.log(name); // "Bob"
console.log(city); // "NYC"
```

**Function Parameter Destructuring**

```js
function greet({ name, age = 0 } = {}) {
  return `${name} is ${age}`;
}

greet({ name: 'Charlie', age: 25 }); // "Charlie is 25"
greet(); // "undefined is 0"
```

**Swapping Variables**

```js
let a = 1, b = 2;
[a, b] = [b, a];
console.log(a, b); // 2, 1
```

### Prove It

```js
// Array destructuring with skip and default
const [, second, , fourth = 'missing'] = [10, 20, 30];
console.log(second); // 20
console.log(fourth); // "missing"

// Object destructuring renames
const { foo: bar } = { foo: 'hello' };
console.log(bar); // "hello"
// console.log(foo); // ReferenceError: foo is not defined

// Nested destructuring with defaults
const data = { a: { b: { c: 42 } } };
const { a: { b: { c: val = 0 } } } = data;
console.log(val); // 42

// Default value when destructuring undefined property
const { x: y = 99 } = {};
console.log(y); // 99

// Destructuring with rename AND default
const { first: firstName = 'John', last: lastName = 'Doe' } = { first: 'Jane' };
console.log(firstName); // "Jane"
console.log(lastName);  // "Doe"
```

---

## 9.2 Spread & Rest Operators

### Explain It

Both use the `...` syntax but serve opposite purposes: **spread** expands, **rest** collects.

**Spread (...) — Expanding**

Arrays:
```js
const arr1 = [1, 2, 3];
const arr2 = [4, 5, 6];
const merged = [...arr1, ...arr2]; // [1,2,3,4,5,6]
```

Objects:
```js
const defaults = { color: 'red', size: 'medium' };
const custom = { ...defaults, color: 'blue' };
// { color: 'blue', size: 'medium' }
```

Function calls:
```js
const nums = [3, 1, 4, 1, 5];
const max = Math.max(...nums); // 5
```

**Rest (...) — Collecting**

```js
function sum(...numbers) {
  return numbers.reduce((total, n) => total + n, 0);
}
sum(1, 2, 3, 4); // 10

// In destructuring
const [first, ...others] = [1, 2, 3]; // first=1, others=[2,3]
const { id, ...rest } = { id: 1, name: 'x', val: 9 };
// id=1, rest={ name: 'x', val: 9 }
```

**Shallow vs Deep Copy**

```js
// Spread is SHALLOW — nested objects still reference the same memory
const original = { a: 1, b: { c: 2 } };
const copy = { ...original };
copy.b.c = 99;
console.log(original.b.c); // 99 — nested object is shared!

// For deep copy: structuredClone() or structured clone libraries
const deep = structuredClone(original);
```

### Prove It

```js
// Spread overwrites left-to-right
const result = { ...{ a: 1 }, ...{ a: 2, b: 3 } };
console.log(result); // { a: 2, b: 3 }

// Spread with string (iterable)
const chars = [...'hello'];
console.log(chars); // ['h','e','l','l','o']

// Rest collects into array
function destructureRest(a, b, ...remaining) {
  return { a, b, remaining };
}
destructureRest(1, 2, 3, 4, 5);
// { a: 1, b: 2, remaining: [3, 4, 5] }

// Spread with Math
const prices = [10, 25, 5, 40];
console.log(Math.max(...prices)); // 40

// Shallow copy proof
const nested = { items: [1, 2] };
const shallow = { ...nested };
shallow.items.push(3);
console.log(nested.items); // [1, 2, 3] — same reference!
```

---

## 9.3 Optional Chaining (?.)

### Explain It

Optional chaining (`?.`) short-circuits and returns `undefined` when accessing a property on `null` or `undefined`, instead of throwing an error.

**Property Access**

```js
const user = { profile: { name: 'Alice' } };
console.log(user?.profile?.name);   // "Alice"
console.log(user?.settings?.theme); // undefined (no error)
```

**Method Call**

```js
const obj = { greet: () => 'hi' };
console.log(obj.greet?.());  // "hi"
console.log(obj.other?.());  // undefined (no error)
```

**Array Access**

```js
const arr = [1, 2, 3];
console.log(arr?.[5]);   // undefined
console.log(arr?.length); // 3
```

**Short-Circuit Evaluation**

```js
// Stops evaluating at the first null/undefined
const result = user?.profile?.settings?.theme;
// If user is null/undefined, returns undefined immediately
// Never attempts to access profile, settings, or theme
```

**vs && chaining**

```js
// && fails on falsy values (0, "", false)
const value = 0;
console.log(value && value.x); // 0 (not undefined)
console.log(value?.x);         // undefined (correctly handles null/undefined)

// ?. only short-circuits on null/undefined, not on 0, "", false
```

### Prove It

```js
// Optional chaining with null
const maybeNull = null;
console.log(maybeNull?.anything); // undefined

// Optional chaining with method call on null
const nullObj = null;
console.log(nullObj?.method()); // undefined

// Optional chaining with computed property
const dynamic = { a: { b: { c: 42 } } };
const key = 'b';
console.log(dynamic?.a?.[key]?.c); // 42

// && vs ?. difference with falsy values
const falsy = 0;
console.log(falsy && falsy.toString()); // 0
console.log(falsy?.toString());         // "0" (?. is null/undefined only)

// Optional chaining with assignment (can't use ?. on left side)
// obj?.prop = 1; // SyntaxError
```

---

## 9.4 Nullish Coalescing (??)

### Explain It

Nullish coalescing (`??`) is a logical operator that returns the right-hand operand only when the left-hand operand is `null` or `undefined`.

**?? vs ||**

```js
// || returns right side for ANY falsy value (0, "", false, null, undefined, NaN)
// ?? returns right side ONLY for null or undefined

const count = 0;
console.log(count || 10);  // 10 (0 is falsy)
console.log(count ?? 10);  // 0  (0 is not null/undefined)

const name = '';
console.log(name || 'default');  // "default" ('' is falsy)
console.log(name ?? 'default');  // "" ('' is not null/undefined)

const flag = false;
console.log(flag || true);  // true (false is falsy)
console.log(flag ?? true);  // false (false is not null/undefined)
```

**Use Cases for Default Values**

```js
// Config with 0 and "" as valid values
const config = { port: 0, host: '' };
const port = config.port ?? 3000;  // 0 (correct)
const host = config.host ?? 'localhost'; // "" (correct)

// With || it would override valid values:
const portWrong = config.port || 3000; // 3000 (wrong!)
```

**??= Nullish Coalescing Assignment**

```js
let a = null;
a ??= 10; // a is null, so a = 10
console.log(a); // 10

let b = 0;
b ??= 10; // b is 0 (not null/undefined), so no assignment
console.log(b); // 0
```

**Cannot Mix ?? with && or || Without Parens**

```js
// This is a SyntaxError:
// const x = a || b ?? c;

// Must use parentheses:
const x = (a || b) ?? c;
const y = a || (b ?? c);
```

### Prove It

```js
// ?? preserves 0
console.log(0 ?? 'fallback');    // 0
console.log(0 || 'fallback');    // "fallback"

// ?? preserves ""
console.log('' ?? 'fallback');   // ""
console.log('' || 'fallback');   // "fallback"

// ?? preserves false
console.log(false ?? 'fallback'); // false
console.log(false || 'fallback'); // "fallback"

// Both ?? and || return right side for null/undefined
console.log(null ?? 'fallback');  // "fallback"
console.log(null || 'fallback');  // "fallback"
console.log(undefined ?? 'fallback'); // "fallback"
console.log(undefined || 'fallback'); // "fallback"

// ??= only assigns on null/undefined
let val = null;
val ??= 'assigned';
console.log(val); // "assigned"

val = 'existing';
val ??= 'new';
console.log(val); // "existing"
```

---

## 9.5 Template Literals

### Explain It

Template literals use backticks (`` ` ``) instead of quotes, enabling embedded expressions and multiline strings.

**Interpolation**

```js
const name = 'Alice';
const age = 30;
const msg = `Hello, ${name}! You are ${age} years old.`;
// "Hello, Alice! You are 30 years old."

// Any expression works inside ${}
console.log(`2 + 2 = ${2 + 2}`); // "2 + 2 = 4"
console.log(`Today is ${new Date().toLocaleDateString()}`);
```

**Multiline Strings**

```js
// No need for \n or string concatenation
const poem = `
  Roses are red,
  Violets are blue,
  Template literals
  are easy to use.
`;
```

**Tagged Templates**

```js
function highlight(strings, ...values) {
  return strings.reduce((result, str, i) => {
    const value = values[i] !== undefined
      ? `<strong>${values[i]}</strong>`
      : '';
    return result + str + value;
  }, '');
}

const name = 'Bob';
const result = highlight`Hello ${name}, welcome!`;
// "Hello <strong>Bob</strong>, welcome!"
```

**Use Cases**

SQL injection prevention:
```js
// DANGEROUS — never do this
const userId = "1; DROP TABLE users";
const query = `SELECT * FROM users WHERE id = '${userId}'`;

// SAFE — parameterized query pattern
function sql(strings, ...values) {
  // In real code, use a prepared statement here
  return { template: strings.join('?'), params: values };
}
const safe = sql`SELECT * FROM users WHERE id = ${userId}`;
```

HTML templating:
```js
function createUserCard({ name, email }) {
  return `
    <div class="card">
      <h2>${name}</h2>
      <p>${email}</p>
    </div>
  `;
}
```

i18n (internationalization):
```js
const i18n = (strings, ...values) => {
  const translations = { 'Hello': 'Hola', 'welcome': 'bienvenido' };
  return strings.reduce((result, str, i) => {
    const translated = translations[str.trim()] || str;
    return result + translated + (values[i] || '');
  }, '');
};
```

### Prove It

```js
// Interpolation evaluates expressions
const x = 10;
console.log(`Value: ${x * 2 + 5}`); // "Value: 25"

// Tagged template receives raw strings and values
function tag(strings, ...values) {
  console.log('strings:', strings);
  console.log('values:', values);
}
tag`Hello ${'world'}!`;
// strings: ["Hello ", "!"]
// values: ["world"]

// Multiline preserves whitespace
const multi = `line1
line2`;
console.log(multi.split('\n')); // ["line1", "line2"]

// Nested template literals
const items = ['a', 'b', 'c'];
const list = `<ul>${items.map(i => `<li>${i}</li>`).join('')}</ul>`;
console.log(list); // "<ul><li>a</li><li>b</li><li>c</li></ul>"

// Raw strings via tag function
function raw(strings) {
  return strings.raw[0];
}
console.log(raw`Hello\nWorld`); // "Hello\nWorld" (not "Hello\nWorld" with newline)
```

---

## 9.6 Regular Expressions (Essentials)

### Explain It

Regular expressions are patterns used to match character combinations in strings.

**Creating**

```js
const re1 = /pattern/flags;   // literal notation
const re2 = new RegExp('pattern', 'flags'); // constructor
```

**Common Patterns**

| Pattern | Meaning |
|---------|---------|
| `^` | Start of string |
| `$` | End of string |
| `.` | Any character (except newline) |
| `\d` | Digit [0-9] |
| `\w` | Word character [a-zA-Z0-9_] |
| `\s` | Whitespace |
| `*` | 0 or more |
| `+` | 1 or more |
| `?` | 0 or 1 |
| `{n}` | Exactly n |
| `{n,m}` | Between n and m |

**Character Classes**

```js
/[abc]/     // a, b, or c
/[^abc]/    // NOT a, b, or c
/[a-z]/     // any lowercase letter
/[A-Z]/     // any uppercase letter
/[0-9]/     // same as \d
```

**Groups**

```js
// Capture group
const match = 'hello-world'.match(/(\w+)-(\w+)/);
console.log(match[1]); // "hello"
console.log(match[2]); // "world"

// Non-capture group
'hello-world'.match(/(?:hello)-(world)/);

// Named capture group
const named = '2024-01-15'.match(/(?<year>\d{4})-(?<month>\d{2})-(?<day>\d{2})/);
console.log(named.groups.year);  // "2024"
console.log(named.groups.month); // "01"
```

**Quantifiers: Lazy vs Greedy**

```js
// Greedy (default) — matches as much as possible
'<div>hello</div>'.match(/<div>.*<\/div>/); // "<div>hello</div>"

// Lazy — matches as little as possible
'<div>hello</div>'.match(/<div>.*?<\/div>/); // "<div>hello</div>"
```

**Methods**

```js
// test() — returns boolean
/^\d+$/.test('12345'); // true

// match() — returns match info
'hello world'.match(/\w+/g); // ["hello", "world"]

// matchAll() — returns iterator with groups
[...'hello-world'.matchAll(/(\w+)/g)].forEach(m => console.log(m[0]));

// replace()
'hello world'.replace(/\b\w/g, c => c.toUpperCase()); // "Hello World"

// split()
'one,two,three'.split(/,/); // ["one", "two", "three"]
```

**Flags**

| Flag | Purpose |
|------|---------|
| `g` | Global (all matches) |
| `i` | Case-insensitive |
| `m` | Multiline (^/$ match line boundaries) |
| `s` | Dotall (. matches \n) |
| `u` | Unicode support |

**Practical Patterns**

```js
// Email validation (simplified)
/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/

// Phone number (US format)
/^\(?(\d{3})\)?[-.\s]?(\d{3})[-.\s]?(\d{4})$/

// Password strength: 8+ chars, upper, lower, digit, special
/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
```

### Prove It

```js
// test() for validation
console.log(/^\d{3}-\d{4}$/.test('555-1234')); // true
console.log(/^\d{3}-\d{4}$/.test('555-123'));  // false

// match() with global flag
const text = 'cat bat hat';
console.log(text.match(/\b\w+at\b/g)); // ["cat", "bat", "hat"]

// replace with function
const result = 'hello world'.replace(/\w+/g, word => word.toUpperCase());
console.log(result); // "HELLO WORLD"

// Named groups
const date = '2024-03-15';
const parts = date.match(/(?<y>\d{4})-(?<m>\d{2})-(?<d>\d{2})/);
console.log(`${parts.groups.m}/${parts.groups.d}/${parts.groups.y}`);
// "03/15/2024"

// Lazy quantifier
const html = '<b>bold</b> and <i>italic</i>';
const tags = html.match(/<.*?>/g);
console.log(tags); // ["<b>", "</b>", "<i>", "</i>"]

// split with regex
'a1b2c3'.split(/\d/); // ["a", "b", "c", ""]
```

---

## 9.7 Date & Time

### Explain It

JavaScript's `Date` object handles dates and times.

**Creating Dates**

```js
const now = new Date();              // current date/time
const specific = new Date(2024, 0, 15); // Jan 15, 2024 (month is 0-indexed)
const fromString = new Date('2024-01-15T10:30:00');
const fromTimestamp = new Date(1705312200000); // milliseconds since epoch
const timestamp = Date.now();        // current timestamp
```

**Key Methods**

```js
const d = new Date(2024, 5, 15, 14, 30, 0); // June 15, 2024 2:30 PM

d.getFullYear();  // 2024
d.getMonth();     // 5 (0-indexed!)
d.getDate();      // 15 (day of month)
d.getDay();       // 6 (day of week, 0=Sunday)
d.getHours();     // 14
d.getMinutes();   // 30
d.getSeconds();   // 0
d.getTime();      // milliseconds since epoch
d.toISOString();  // "2024-06-15T14:30:00.000Z"
```

**Timezone Handling**

```js
const d = new Date();

// UTC methods
d.getUTCHours();
d.getUTCFullYear();

// Formatting with timezone
d.toLocaleString('en-US', { timeZone: 'America/New_York' });
d.toLocaleString('en-US', { timeZone: 'Asia/Tokyo' });
```

**Intl.DateTimeFormat**

```js
const formatter = new Intl.DateTimeFormat('en-US', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  timeZoneName: 'short'
});
console.log(formatter.format(new Date()));
// "June 15, 2024 at 02:30 PM EDT"

// Different locales
const deFormatter = new Intl.DateTimeFormat('de-DE', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit'
});
console.log(deFormatter.format(new Date())); // "15.06.2024"
```

**Temporal API (New Standard)**

```js
// Temporal is the modern replacement for Date (Stage 3 proposal)
// Provides immutable, timezone-aware date/time objects

// When available in your runtime:
// const date = Temporal.PlainDate.from('2024-06-15');
// const time = Temporal.PlainTime.from('14:30:00');
// const dateTime = Temporal.PlainDateTime.from('2024-06-15T14:30:00');
// const zoned = Temporal.ZonedDateTime.from('2024-06-15T14:30:00[America/New_York]');

// For now, use date-fns or dayjs libraries as alternatives
```

### Prove It

```js
// Month is 0-indexed
const jan = new Date(2024, 0);
console.log(jan.getMonth()); // 0 (January)
console.log(jan.toLocaleString('en-US', { month: 'long' })); // "January"

// Date comparison
const earlier = new Date('2024-01-01');
const later = new Date('2024-12-31');
console.log(earlier < later); // true

// Calculate difference in days
function daysBetween(d1, d2) {
  const msPerDay = 24 * 60 * 60 * 1000;
  return Math.round(Math.abs(d2 - d1) / msPerDay);
}
console.log(daysBetween(new Date('2024-01-01'), new Date('2024-03-01'))); // 60

// Formatting
const d = new Date(2024, 5, 15);
console.log(d.toISOString()); // "2024-06-15T00:00:00.000Z"
console.log(d.toLocaleDateString('en-US')); // "6/15/2024"
console.log(d.toLocaleDateString('en-GB')); // "15/6/2024"

// Timestamp arithmetic
const start = Date.now();
// ... some operation
const end = Date.now();
console.log(`Elapsed: ${end - start}ms`);
```

---

## 9.8 Functional Patterns

### Explain It

Functional programming patterns treat functions as first-class citizens — passing them as arguments, returning them, and composing them.

**Higher-Order Functions**

A higher-order function takes a function as an argument or returns a function.

```js
// Array methods are higher-order functions
const nums = [1, 2, 3, 4, 5];

const doubled = nums.map(n => n * 2);          // [2,4,6,8,10]
const evens = nums.filter(n => n % 2 === 0);   // [2,4]
const sum = nums.reduce((acc, n) => acc + n, 0); // 15

// Custom higher-order function
function repeat(n, fn) {
  for (let i = 0; i < n; i++) fn(i);
}
repeat(3, i => console.log(`Iteration ${i}`));
```

**Currying**

Currying transforms a function that takes multiple arguments into a series of functions that each take one argument.

```js
// Manual currying
function multiply(a) {
  return function(b) {
    return a * b;
  };
}
const double = multiply(2);
console.log(double(5)); // 10
console.log(double(3)); // 6

// Currying utility
function curry(fn) {
  return function curried(...args) {
    if (args.length >= fn.length) {
      return fn.apply(this, args);
    }
    return function(...args2) {
      return curried.apply(this, args.concat(args2));
    };
  };
}

const add = curry((a, b, c) => a + b + c);
console.log(add(1)(2)(3));    // 6
console.log(add(1, 2)(3));    // 6
console.log(add(1)(2, 3));    // 6
```

**Partial Application**

```js
function partial(fn, ...presetArgs) {
  return function(...laterArgs) {
    return fn(...presetArgs, ...laterArgs);
  };
}

function log(level, message, timestamp) {
  console.log(`[${level}] ${message} @ ${timestamp}`);
}
const errorLog = partial(log, 'ERROR');
errorLog('Disk full', new Date().toISOString());
```

**Composition**

```js
// compose: right-to-left
const compose = (...fns) => (x) => fns.reduceRight((acc, fn) => fn(acc), x);

// pipe: left-to-right
const pipe = (...fns) => (x) => fns.reduce((acc, fn) => fn(acc), x);

const process = pipe(
  x => x.trim(),
  x => x.toLowerCase(),
  x => x.replace(/\s+/g, '_')
);
console.log(process('  Hello World  ')); // "hello_world"

const transform = compose(
  x => x * 2,
  x => x + 10,
  x => x / 2
);
console.log(transform(4)); // (4/2 + 10) * 2 = 28
```

**Memoization**

```js
function memoize(fn) {
  const cache = new Map();
  return function(...args) {
    const key = JSON.stringify(args);
    if (cache.has(key)) return cache.get(key);
    const result = fn.apply(this, args);
    cache.set(key, result);
    return result;
  };
}

const fibonacci = memoize(function(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
});
console.log(fibonacci(100)); // Fast, even for large n
```

**Closure-Based Encapsulation**

```js
function createCounter(initial = 0) {
  let count = initial;
  return {
    increment: () => ++count,
    decrement: () => --count,
    getCount: () => count,
    reset: () => { count = initial; }
  };
}

const counter = createCounter(10);
counter.increment(); // 11
counter.increment(); // 12
counter.getCount();  // 12
counter.reset();     // 10
```

### Prove It

```js
// Higher-order function: filter by custom predicate
function filterBy(arr, predicate) {
  return arr.filter(predicate);
}
const longWords = filterBy(['hi', 'hello', 'hey'], w => w.length > 3);
console.log(longWords); // ["hello"]

// Currying in practice
const gt = curry((threshold, value) => value > threshold);
const over10 = gt(10);
console.log([5, 12, 8, 20].filter(over10)); // [12, 20]

// Composition pipeline
const trim = s => s.trim();
const lower = s => s.toLowerCase();
const split = s => s.split(' ');
const join = s => s.join('_');

const slugify = pipe(trim, lower, split, join);
console.log(slugify('  Hello World  ')); // "hello_world"

// Memoization performance
let callCount = 0;
const slow = memoize(x => { callCount++; return x * 2; });
slow(5); slow(5); slow(5);
console.log(callCount); // 1 (cached after first call)

// Closure for private state
function createBankAccount(balance = 0) {
  let _balance = balance;
  return {
    deposit: (amount) => { _balance += amount; return _balance; },
    withdraw: (amount) => {
      if (amount > _balance) throw new Error('Insufficient funds');
      _balance -= amount;
      return _balance;
    },
    getBalance: () => _balance
  };
}
const account = createBankAccount(100);
account.deposit(50);     // 150
account.withdraw(30);    // 120
account.getBalance();    // 120
```

---

## Interview Questions

### 1. What is the difference between `??` and `||`?

**Answer:** `||` returns the right-hand side for any falsy value (`0`, `""`, `false`, `null`, `undefined`, `NaN`). `??` returns the right-hand side ONLY for `null` or `undefined`.

```js
const port = 0;
console.log(port || 3000); // 3000 (wrong — 0 is falsy)
console.log(port ?? 3000); // 0 (correct — 0 is not null/undefined)
```

**When to use which:** Use `??` when `0`, `""`, or `false` are valid values you want to preserve. Use `||` when you want to treat all falsy values as "empty."

---

### 2. How do you deep clone an object?

**Answer:**

```js
// Method 1: structuredClone() (modern, recommended)
const deep = structuredClone(original);

// Method 2: JSON parse/stringify (loses functions, Dates, undefined)
const deep = JSON.parse(JSON.stringify(original));

// Method 3: For libraries — lodash _.cloneDeep(original)
```

**Key point:** Spread (`{...obj}`) and `Object.assign()` only create **shallow copies**. Nested objects still reference the same memory.

```js
const original = { a: { b: 1 } };
const shallow = { ...original };
shallow.a.b = 99;
console.log(original.a.b); // 99 — shared reference!
```

---

### 3. What are higher-order functions?

**Answer:** A higher-order function either:
1. **Takes a function as an argument** (e.g., `map`, `filter`, `reduce`, `setTimeout`)
2. **Returns a function** (e.g., currying, memoization, factory functions)

```js
// Takes function as argument
[1, 2, 3].map(x => x * 2);

// Returns a function
function multiplier(factor) {
  return (n) => n * factor;
}
const double = multiplier(2);
```

They enable abstraction, reuse, and functional composition patterns.

---

### 4. Explain destructuring with defaults

**Answer:** When destructuring, you can provide default values that are used when the property is `undefined`.

```js
const { name, age = 0, city = 'Unknown' } = { name: 'Alice' };
// name = "Alice", age = 0, city = "Unknown"

const [a = 1, b = 2, c = 3] = [10];
// a = 10, b = 2, c = 3
```

**Key distinction:** Defaults apply when the value is `undefined`, NOT when it's `null`.

```js
const { x = 10 } = { x: null };
console.log(x); // null (not 10 — null is not undefined)
```

---

### 5. When would you use tagged templates?

**Answer:** Tagged templates are used when you need to process a template literal in a custom way. Common use cases:

1. **SQL/NoSQL injection prevention** — escaping user input
2. **HTML sanitization** — preventing XSS attacks
3. **i18n (internationalization)** — translating strings
4. **Syntax highlighting** — processing code strings
5. **CSS-in-JS** — styled-components uses tagged templates
6. **Raw strings** — accessing unprocessed escape sequences

```js
function safeHTML(strings, ...values) {
  return strings.reduce((result, str, i) => {
    const value = values[i] !== undefined
      ? values[i].replace(/[<>&"']/g, c => ({
          '<': '&lt;', '>': '&gt;', '&': '&amp;',
          '"': '&quot;', "'": '&#39;'
        }[c]))
      : '';
    return result + str + value;
  }, '');
}
const userInput = '<script>alert("xss")</script>';
safeHTML`<div>${userInput}</div>`;
// Safe: div contains escaped HTML, not executable script
```

---

### 6. What is the difference between `let`, `const`, and `var`?

**Answer:**

| Feature | `var` | `let` | `const` |
|---------|-------|-------|---------|
| Scope | Function | Block | Block |
| Hoisting | Yes (initialized as `undefined`) | Yes (TDZ) | Yes (TDZ) |
| Reassignment | Yes | Yes | No |
| Redeclaration | Yes | No | No |

```js
// TDZ (Temporal Dead Zone)
console.log(x); // ReferenceError (let/const)
var x = 1;

// Block scoping
if (true) {
  var a = 1;  // leaks out
  let b = 2;  // stays in block
  const c = 3; // stays in block
}
console.log(a); // 1
console.log(b); // ReferenceError
```

---

### 7. Explain optional chaining and when it's useful

**Answer:** `?.` short-circuits and returns `undefined` when accessing a property on `null`/`undefined`, preventing runtime errors.

**Useful for:**
- API responses with uncertain structure
- Deeply nested object access
- Method calls that may not exist
- Array access with uncertain length

```js
// Without optional chaining
const street = user && user.address && user.address.street;

// With optional chaining
const street = user?.address?.street;

// Method call
const result = obj.method?.();

// Array access
const first = arr?.[0];
```

**Key:** `?.` only checks for `null`/`undefined`, unlike `&&` which also treats `0`, `""`, `false` as falsy.

---

### 8. How does memoization work and when is it useful?

**Answer:** Memoization caches the results of expensive function calls and returns the cached result for the same inputs.

```js
function memoize(fn) {
  const cache = new Map();
  return (...args) => {
    const key = JSON.stringify(args);
    return cache.has(key) ? cache.get(key) : cache.set(key, fn(...args)).get(key);
  };
}
```

**Useful for:**
- Recursive algorithms (fibonacci, factorial)
- Expensive computations (parsing, sorting)
- Functions called repeatedly with same arguments
- React component rendering optimization (useMemo, React.memo)

**Tradeoff:** Uses memory for cache. Not useful if inputs rarely repeat.

---

### 9. What is the difference between `map`, `filter`, and `reduce`?

**Answer:**

- **`map`** — Transforms each element, returns new array of same length
- **`filter`** — Selects elements matching a condition, returns subset
- **`reduce`** — Accumulates elements into a single value

```js
const nums = [1, 2, 3, 4, 5];

// map: transform
nums.map(x => x * 2); // [2, 4, 6, 8, 10]

// filter: select
nums.filter(x => x > 3); // [4, 5]

// reduce: accumulate
nums.reduce((acc, x) => acc + x, 0); // 15
```

**Reduce can implement map and filter:**
```js
nums.reduce((acc, x) => [...acc, x * 2], []);           // map
nums.reduce((acc, x) => x > 3 ? [...acc, x] : acc, []); // filter
```

---

### 10. How do you handle timezone issues in JavaScript?

**Answer:**

```js
// 1. Store dates in UTC
const now = new Date().toISOString(); // "2024-06-15T14:30:00.000Z"

// 2. Display in local timezone
date.toLocaleString('en-US', { timeZone: 'America/New_York' });

// 3. Use Intl.DateTimeFormat for consistent formatting
new Intl.DateTimeFormat('en-US', {
  timeZone: 'Asia/Tokyo',
  dateStyle: 'full',
  timeStyle: 'long'
}).format(date);

// 4. Use libraries (date-fns, dayjs, luxon) for complex operations

// 5. Future: Temporal API provides timezone-aware objects
// const zoned = Temporal.ZonedDateTime.from('2024-06-15T14:30:00[America/New_York]');
```

**Best practice:** Store timestamps as UTC ISO strings or epoch milliseconds. Convert to local time only for display.

---

## 9.10 Debounce & Throttle

### Explain It

Both control how often a function fires, but solve different problems.

**Debounce** — delays execution until the user **stops** triggering. If you keep calling, the timer resets. Use for: search input, form validation, resize end.

**Throttle** — ensures execution fires at **most once** every N milliseconds, no matter how many times triggered. Use for: scroll handlers, mouse move, rate limiting.

### Prove It

```js
// DEBOUNCE: wait for idle period
function debounce(fn, delay) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

// THROTTLE: fire at most once per interval
function throttle(fn, interval) {
  let lastTime = 0;
  return function (...args) {
    const now = Date.now();
    if (now - lastTime >= interval) {
      lastTime = now;
      fn.apply(this, args);
    }
  };
}

// --- Usage ---

// Search input: wait 300ms after user stops typing
const searchInput = document.getElementById("search");
searchInput.addEventListener(
  "input",
  debounce((e) => {
    console.log("Searching:", e.target.value);
    // fetch(`/api/search?q=${e.target.value}`)
  }, 300)
);

// Scroll: fire at most once every 200ms
window.addEventListener(
  "scroll",
  throttle(() => {
    console.log("Scroll position:", window.scrollY);
  }, 200)
);

// Window resize: only after user stops resizing
window.addEventListener(
  "resize",
  debounce(() => {
    console.log("Final size:", window.innerWidth, window.innerHeight);
  }, 250)
);
```

**Debounce vs Throttle — visual:**

```
Trigger:  _ _ _ _ _ _ _ _ _ _ (rapid fire)

Debounce: _________________ ^ (fires once, after pause)
Throttle: ^   ^   ^   ^   ^  (fires every N ms)
```

---

## Sources

- MDN Destructuring assignment: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment
- MDN Optional chaining: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Optional_chaining
- MDN Nullish coalescing: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Nullish_coalescing
- MDN Regular expressions: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions
- MDN Date: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date
