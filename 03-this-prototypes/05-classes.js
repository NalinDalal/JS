/**
 * Module 03 — 3.5 Classes (ES6+)
 * Declaration, private #, static, extends/super, instanceof
 *
 * Run: node 05-classes.js
 */

// --- Class Declaration & Expression ---
console.log("--- Class Declaration ---");
class Person {
  constructor(name) {
    this.name = name;
  }
  greet() {
    return `Hi, I'm ${this.name}`;
  }
}

const alice = new Person("Alice");
console.log(alice.greet()); // "Hi, I'm Alice"

const Animal = class {
  constructor(type) {
    this.type = type;
  }
};
const dog = new Animal("dog");
console.log(dog.type); // "dog"

// --- Private fields (#) ---
console.log("\n--- Private fields ---");
class User {
  #password;

  constructor(name, password) {
    this.name = name;
    this.#password = password;
  }

  get info() {
    return `${this.name} (***)`;
  }

  set info(value) {
    this.name = value;
  }

  validate(input) {
    return input === this.#password;
  }
}

const u = new User("Eve", "secret123");
console.log(u.info); // "Eve (***)"
u.info = "Bob";
console.log(u.name); // "Bob"
console.log(u.validate("secret123")); // true
// u.#password; // SyntaxError — private

// --- Static methods ---
console.log("\n--- Static methods ---");
class MathHelper {
  static PI = 3.14159;

  static circleArea(r) {
    return this.PI * r * r;
  }
}

console.log(MathHelper.PI); // 3.14159
console.log(MathHelper.circleArea(5)); // 78.53975

// --- extends and super ---
console.log("\n--- extends and super ---");
class AnimalBase {
  constructor(name) {
    this.name = name;
  }
  speak() {
    return `${this.name} makes a sound`;
  }
}

class Dog extends AnimalBase {
  constructor(name, breed) {
    super(name); // Must call super() before using `this`
    this.breed = breed;
  }
  speak() {
    return `${this.name} barks`;
  }
}

const rex = new Dog("Rex", "Labrador");
console.log(rex.speak()); // "Rex barks"
console.log(rex instanceof Dog); // true
console.log(rex instanceof AnimalBase); // true

// --- instanceof ---
console.log("\n--- instanceof ---");
class Base {}
class Child extends Base {}

const obj = new Child();
console.log(obj instanceof Child); // true
console.log(obj instanceof Base); // true
console.log(obj instanceof Object); // true

// --- Expected Output ---
// --- Class Declaration ---
// Hi, I'm Alice
// dog
//
// --- Private fields ---
// Eve (***)
// Bob
// true
//
// --- Static methods ---
// 3.14159
// 78.53975
//
// --- extends and super ---
// Rex barks
// true
// true
//
// --- instanceof ---
// true
// true
// true
