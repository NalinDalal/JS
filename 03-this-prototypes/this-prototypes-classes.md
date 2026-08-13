# Module 03: This Keyword, Prototypes & Classes

---

## 3.1 The `this` Keyword (4 Rules)

### Explain It

The `this` keyword refers to the execution context an object. Its value depends on *how* a function is called (not where it's defined).

### The 4 Rules

#### Rule 1: Default Binding
- In global scope, `this` refers to the global object (`window` in browsers, `global` in Node.js)
- In strict mode (`'use strict'`), `this` is `undefined`

```js
function nonStrict() {
  console.log(this); // window (global object)
}

function strict() {
  'use strict';
  console.log(this); // undefined
}
```

#### Rule 2: Implicit Binding
- When a function is called as a method of an object, `this` is bound to that object

```js
const user = {
  name: 'Alice',
  greet() {
    console.log(this.name); // 'Alice' — `this` is `user`
  }
};

user.greet();

// Lost binding (common pitfall)
const greetFn = user.greet;
greetFn(); // this = window/undefined (implicit binding lost)
```

#### Rule 3: Explicit Binding
- `call`, `apply`, and `bind` force a specific `this` value

```js
function greet(greeting) {
  console.log(`${greeting}, ${this.name}`);
}

const person = { name: 'Bob' };

greet.call(person, 'Hello');   // 'Hello, Bob'
greet.apply(person, ['Hi']);   // 'Hi, Bob'
const bound = greet.bind(person);
bound('Hey');                  // 'Hey, Bob'
```

#### Rule 4: `new` Binding
- When a function is invoked with `new`, `this` is bound to the newly created object

```js
function Person(name) {
  this.name = name;
}

const alice = new Person('Alice');
console.log(alice.name); // 'Alice'
```

### Arrow Functions: Lexical `this`

- Arrow functions **do not have their own `this`**
- They inherit `this` from the enclosing lexical scope (where they are defined, not called)

```js
const team = {
  name: 'Dev',
  members: ['Alice', 'Bob'],
  listMembers() {
    this.members.forEach((m) => {
      console.log(`${m} is in ${this.name}`);
      // `this` here = team (lexical, not forEach's callback)
    });
  }
};
team.listMembers();
// Alice is in Dev
// Bob is in Dev
```

### Prove It

```js
const obj = {
  name: 'Test',
  regular() { console.log(this.name); },
  arrow: () => { console.log(this.name); }
};

obj.regular();  // 'Test' (implicit binding)
obj.arrow();    // undefined (arrow = lexical, `this` is global, no `name` property)

// Explicit override
obj.regular.call({ name: 'Override' }); // 'Override'
obj.arrow.call({ name: 'Override' });   // undefined (call/apply/bind don't affect arrow fn this)
```

### Priority Order
```
new binding > explicit binding > implicit binding > default binding
```

---

## 3.2 call, apply, bind

### Explain It

All three are methods on `Function.prototype` that allow you to control what `this` refers to.

| Method | Invokes Immediately? | Arguments Format |
|--------|---------------------|------------------|
| `call` | Yes | Comma-separated list |
| `apply` | Yes | Array (or array-like) |
| `bind` | No (returns new function) | Comma-separated list |

### Prove It

```js
function multiply(a, b) {
  return a * b;
}

// call — pass args individually
multiply.call(null, 3, 4); // 12

// apply — pass args as array
multiply.apply(null, [3, 4]); // 12

// bind — returns new function, args partially applied
const double = multiply.bind(null, 2);
double(5); // 10
```

### Practical Use Cases

```js
// 1. Borrowing array methods
const arrayLike = { 0: 'a', 1: 'b', length: 2 };
const arr = Array.prototype.slice.call(arrayLike);
// ['a', 'b']

// 2. Partial application with bind
function log(level, msg) {
  console.log(`[${level}] ${msg}`);
}
const errorLog = log.bind(null, 'ERROR');
errorLog('Something broke'); // [ERROR] Something broke

// 3. Constructor borrowing (old pattern)
function Dog(name) {
  this.name = name;
}
function Puppy(name) {
  Dog.call(this, name); // borrow Dog constructor
  this.isPuppy = true;
}
```

---

## 3.3 Prototype Chain

### Explain It

Every JavaScript object has an internal link `[[Prototype]]` pointing to another object (or `null`). This creates a **prototype chain**.

```
object → constructor.prototype → Object.prototype → null
```

- Property lookup traverses up the chain until found or `null` is reached
- `__proto__` is a getter/setter for `[[Prototype]]` (non-standard but widely supported)
- `Object.getPrototypeOf(obj)` is the correct/safe way to access it

```js
const animal = { eats: true };
const rabbit = Object.create(animal);
rabbit.jumps = true;

rabbit.eats; // true (inherited from animal)
rabbit.jumps; // true (own property)

Object.getPrototypeOf(rabbit) === animal; // true
```

### Property Lookup

```js
const grandparent = { family: 'Smith' };
const parent = Object.create(grandparent);
parent.job = 'Engineer';
const child = Object.create(parent);
child.age = 25;

child.age;     // 25 (own)
child.job;     // 'Engineer' (parent)
child.family;  // 'Smith' (grandparent)
child.unknown; // undefined (not found, chain ends at null)
```

### Object.create()

```js
// Create object with specific prototype
const base = {
  greet() {
    return `Hi, I'm ${this.name}`;
  }
};

const user = Object.create(base);
user.name = 'Charlie';
user.greet(); // "Hi, I'm Charlie"

// Create truly empty object (no prototype)
const bare = Object.create(null);
bare.toString; // undefined (no inherited methods)
```

### Prove It

```js
function Person(name) {
  this.name = name;
}
Person.prototype.greet = function() {
  return `Hi, I'm ${this.name}`;
};

const alice = new Person('Alice');

// Prototype chain
Object.getPrototypeOf(alice) === Person.prototype; // true
Object.getPrototypeOf(Person.prototype) === Object.prototype; // true
Object.getPrototypeOf(Object.prototype) === null; // true

// HasOwnProperty vs in operator
alice.hasOwnProperty('name'); // true (own)
alice.hasOwnProperty('greet'); // false (inherited)
'greet' in alice; // true (own or inherited)
```

---

## 3.4 The `new` Keyword

### Explain It

When `new Constructor(args)` is called, four things happen internally:

1. **Create** a new empty object `{}`
2. **Set** its `[[Prototype]]` to `Constructor.prototype`
3. **Call** the constructor with `this` bound to the new object
4. **Return** the new object (unless constructor explicitly returns a different object)

```js
function User(name) {
  this.name = name;
}
User.prototype.sayHi = function() {
  return `Hi, I'm ${this.name}`;
};

const bob = new User('Bob');
bob.sayHi(); // "Hi, I'm Bob"
```

### Prove It

```js
// Manual implementation of `new`
function myNew(Constructor, ...args) {
  const obj = Object.create(Constructor.prototype); // Step 1 + 2
  const result = Constructor.apply(obj, args);      // Step 3
  return result instanceof Object ? result : obj;   // Step 4
}

const carol = myNew(User, 'Carol');
carol.sayHi(); // "Hi, I'm Carol"
carol instanceof User; // true
```

### Constructor Returning an Object

```js
function Weird() {
  this.a = 1;
  return { b: 2 }; // returns this object instead
}

const w = new Weird();
w; // { b: 2 } (not { a: 1 })
w.a; // undefined

// Constructor returning a primitive is ignored
function AlsoWeird() {
  this.a = 1;
  return 42; // primitive — ignored
}

const aw = new AlsoWeird();
aw; // { a: 1 }
```

---

## 3.5 Classes (ES6+)

### Explain It

Classes are syntactic sugar over prototype-based inheritance. Under the hood, they still use prototypes.

### Class Declaration & Expression

```js
// Declaration
class Person {
  constructor(name) {
    this.name = name;
  }
  greet() {
    return `Hi, I'm ${this.name}`;
  }
}

// Expression
const Animal = class {
  constructor(type) {
    this.type = type;
  }
};
```

### Constructor, Methods & Getters/Setters

```js
class User {
  #password; // Private field

  constructor(name, password) {
    this.name = name;
    this.#password = password;
  }

  get info() {
    return `${this.name} (***hidden***)`;
  }

  set info(value) {
    this.name = value;
  }

  validate(input) {
    return input === this.#password;
  }
}

const u = new User('Eve', 'secret123');
u.info;       // 'Eve (***hidden***)'
u.info = 'Bob';
u.name;       // 'Bob'
u.validate('secret123'); // true
// u.#password; // SyntaxError — private
```

### Static Methods & Properties

```js
class MathHelper {
  static PI = 3.14159;

  static circleArea(r) {
    return this.PI * r * r;
  }
}

MathHelper.PI;            // 3.14159
MathHelper.circleArea(5); // 78.53975

// Cannot call static on instance
// new MathHelper().circleArea(5); // TypeError
```

### extends and super

```js
class Animal {
  constructor(name) {
    this.name = name;
  }
  speak() {
    return `${this.name} makes a sound`;
  }
}

class Dog extends Animal {
  constructor(name, breed) {
    super(name); // Must call super() before using `this`
    this.breed = breed;
  }
  speak() {
    return `${this.name} barks`;
  }
}

const rex = new Dog('Rex', 'Labrador');
rex.speak(); // 'Rex barks'
rex instanceof Dog;  // true
rex instanceof Animal; // true
```

### Static Initialization Blocks

```js
class Config {
  static db;
  static {
    // Runs once when class is evaluated
    console.log('Initializing...');
    Config.db = connectToDatabase();
  }
}
```

### instanceof

```js
class Base {}
class Child extends Base {}

const obj = new Child();
obj instanceof Child;  // true
obj instanceof Base;   // true
obj instanceof Object; // true

// Works across iframes (different global scope) — uses Symbol.hasInstance
```

### Class vs Function Constructor

| Feature | Function Constructor | ES6 Class |
|---------|---------------------|-----------|
| Hoisting | Yes (but not recommended) | No (TDZ) |
| `new` required | Yes (otherwise `this` leaks to global) | Yes (throws error without `new`) |
| Prototype methods | Added via `.prototype` | Defined in class body |
| `super` | Manual `Parent.call(this)` | `super()` built-in |
| Private fields | Not supported | `#field` syntax |
| `instanceof` | Yes | Yes |
| `extends` | Manual `Object.create()` | Built-in keyword |

---

## Interview Questions

### Q1: What are the 4 rules of `this`? Give examples.

**Answer:**

1. **Default**: In global scope, `this` is `window`/`global` (or `undefined` in strict mode).
2. **Implicit**: When called as object method, `this` = the object.
3. **Explicit**: `call/apply/bind` force a specific `this`.
4. **`new`**: In a constructor, `this` = the new object.

```js
function show() { console.log(this); }
show();                        // Rule 1: global/undefined
const obj = { show }; obj.show(); // Rule 2: obj
show.call({ a: 1 });           // Rule 3: { a: 1 }
new show();                    // Rule 4: new object
```

### Q2: What does `new` do internally?

**Answer:**
1. Creates empty object `{}`
2. Sets `[[Prototype]]` to `Constructor.prototype`
3. Calls constructor with `this` bound to the new object
4. Returns the object (unless constructor returns a non-primitive)

### Q3: What's the difference between `__proto__` and `prototype`?

**Answer:**
- `__proto__`: Getter/setter on every object — points to its parent in the prototype chain (`[[Prototype]]`)
- `prototype`: A property only on functions — becomes the `__proto__` of objects created with `new`

```js
function Foo() {}
const bar = new Foo();

bar.__proto__ === Foo.prototype; // true
Foo.prototype.__proto__ === Object.prototype; // true
```

### Q4: How does `bind` work? What can it do?

**Answer:**
`bind` returns a new function with `this` permanently set to the provided value. It supports partial application (pre-filled arguments).

```js
function greet(greeting) {
  return `${greeting}, ${this.name}`;
}
const alice = greet.bind({ name: 'Alice' }, 'Hello');
alice(); // 'Hello, Alice'
```

### Q5: Class vs Function Constructor — what are the differences?

**Answer:**
- Classes require `new` (throws error otherwise); functions don't (silent failure)
- Classes are not hoisted (TDZ); functions are
- Classes have built-in `super`, `extends`, static, and `#private` fields
- Under the hood, classes are still prototypes (syntactic sugar)

### Q6: Why do arrow functions not have their own `this`?

**Answer:**
Arrow functions use **lexical `this`** — they capture `this` from the enclosing scope at definition time. This is useful for callbacks where you want the surrounding context's `this` (e.g., in event handlers, `forEach`, etc.) without needing `.bind(this)`.

---

*Sources: MDN Working with objects, MDN Using classes, You Don't Know JS: Objects & Classes (ch1-5)*
