# JavaScript Revision Plan

**Goal:** Master 15 core JS concepts + Web APIs for interviews AND build real confidence through code. Then extend into the full backend stack: DB/ORM, TypeScript, Node internals, testing, networking protocols, caching & queues.

**Resources:**
- **Namaste JavaScript** (Akshay Saini) - Video explanations
- **YDKJS** (Kyle Simpson) - Deep reference (read selectively)
- **MDN** - Official docs & syntax
- **Ayush Notes** - Cross-check after understanding

**Weekly Rhythm (45-60 mins/day):**
- Mon-Wed: Watch Namaste JS + read YDKJS/MDN section
- Thu: Run code examples, write 4-6 sentence explanation
- Fri/Weekend: Build something using that week's concept

**The Rule:** For every concept, you need TWO things:
1. A clear explanation you can say out loud (interview)
2. Code you've written using it (confidence)

---

## Concept-to-Resource Mapping

| # | Concept | Namaste JS | YDKJS (1st Ed) | MDN |
|---|---------|------------|----------------|-----|
| 1 | var/let/const | S01 EP-08, EP-09 | Scope ch1 | Grammar |
| 2 | Lexical scope | S01 EP-07 | Scope ch2 | - |
| 3 | Closures | S01 EP-10, EP-11 | Scope ch5 | Closures |
| 4 | Hoisting | S01 EP-03 | Scope ch4 | - |
| 5 | this (4 rules) | S01 EP-05, S02 EP-06 | Objects ch1-2 | - |
| 6 | Prototype chain | - | Objects ch3, ch5 | Prototype |
| 7 | new keyword | - | Objects ch4 | - |
| 8 | == vs === | - | Types ch4 | - |
| 9 | Coercion | - | Types ch1-3 | - |
| 10 | Event loop | S01 EP-15 | - | Execution model |
| 11 | Callbacks | S01 EP-14 | - | - |
| 12 | Promises | S02 EP-01 to EP-04 | - | Promises |
| 13 | async/await | S02 EP-05 | - | async guide |
| 14 | Fetch API | - | - | Fetch |
| 15 | Modules (ESM) | - | Scope ch8 | Modules |

---

## 20-Week Schedule

### Week 1: var/let/const

**Interview prep:**
- Read YDKJS Scope ch1 (skim "What is Scope?")
- Watch S01 EP-08 (let/const, TDZ)
- Write your 4-6 sentence explanation

**Code to run (proves you understand):**
```js
// Hoisting difference
console.log(a); // undefined (var hoists declaration only)
var a = 10;

console.log(b); // ReferenceError (let/const don't hoist to initialized)
let b = 20;

// TDZ - Temporal Dead Zone
{
  console.log(x); // ReferenceError
  const x = 5;
}

// Block scope
if (true) {
  var x = 10; // function/global scope
  let y = 20; // block scope
}
console.log(x); // 10
console.log(y); // ReferenceError
```

**Build/Project: Counter App (CLI)**
```js
// counter.js - run with: node counter.js
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

let count = 0;

function showMenu() {
  console.log(`\nCurrent count: ${count}`);
  console.log('1. Increment');
  console.log('2. Decrement');
  console.log('3. Reset');
  console.log('4. Exit');
  rl.question('Choose: ', handleChoice);
}

function handleChoice(choice) {
  switch(choice) {
    case '1': count++; break;
    case '2': count--; break;
    case '3': count = 0; break;
    case '4': rl.close(); return;
  }
  showMenu();
}

showMenu();
```


---

### Week 2: Lexical Scope + Hoisting

**Interview prep:**
- Watch S01 EP-07 (Scope Chain, Lexical Environment)
- Watch S01 EP-03 (Hoisting)
- Read YDKJS Scope ch2, ch4
- Write explanations for both

**Code to run:**
```js
// Lexical scope - inner can access outer
function outer() {
  const x = 10;
  function inner() {
    console.log(x); // 10 - lexical scope
  }
  inner();
}

// Hoisting
sayHi(); // "Hi!" - works (function declaration)
function sayHi() { console.log("Hi!"); }

// Function expression vs declaration
foo(); // Works
function foo() {}

bar(); // TypeError
var bar = function() {};
```

**Build/Project: Nested Comment System- Reddit like Thread Replies**
```js
// comment.js - nested replies using lexical scope
function createComment(text) {
  const replies = [];
  
  return {
    text,
    addReply(replyText) {
      const reply = createComment(replyText); // nested scope accesses replies
      replies.push(reply);
      return reply;
    },
    getReplies() { return replies; },
    print(indent = 0) {
      console.log('  '.repeat(indent) + this.text);
      replies.forEach(r => r.print(indent + 1));
    }
  };
}

// Usage
const post = createComment('Great article!');
const reply1 = post.addReply('Thanks!');
reply1.addReply('You're welcome!');
post.print();
// Great article!
//   Thanks!
//     You're welcome!
```


---

### Week 3: Closures

**Interview prep:**
- Watch S01 EP-10 (Closures)
- Watch S01 EP-11 (setTimeout + Closures)
- Read YDKJS Scope ch5
- Write your closure explanation

**Code to run:**
```js
// Basic closure
function counter() {
  let count = 0;
  return function() { return ++count; };
}
const inc = counter();
console.log(inc()); // 1
console.log(inc()); // 2

// Classic interview: setTimeout + closure in loop
for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 100); // 3, 3, 3
}
// Fix with let
for (let i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 100); // 0, 1, 2
}
```

**Build/Project: Shopping Cart with Encapsulation**
```js
// cart.js - closure keeps cart private
function createCart() {
  let items = []; // private - can't access from outside
  
  return {
    addItem(name, price, qty = 1) {
      const existing = items.find(i => i.name === name);
      if (existing) {
        existing.qty += qty;
      } else {
        items.push({ name, price, qty });
      }
      return this;
    },
    removeItem(name) {
      items = items.filter(i => i.name !== name);
      return this;
    },
    getTotal() {
      return items.reduce((sum, i) => sum + (i.price * i.qty), 0);
    },
    getItems() {
      return [...items]; // return copy, not reference
    },
    clear() {
      items = [];
      return this;
    }
  };
}

// Usage
const cart = createCart();
cart.addItem('Laptop', 999).addItem('Mouse', 25).addItem('Laptop', 999);
console.log(cart.getItems()); // [{name: 'Laptop', price: 999, qty: 2}, {name: 'Mouse', price: 25, qty: 1}]
console.log(cart.getTotal()); // 2023
console.log(cart.items); // undefined (private!)
```

---

### Week 4: this Keyword

**Interview prep:**
- Watch S01 EP-05 (window & this)
- Watch S02 EP-06 (this keyword deep dive)
- Read YDKJS Objects ch1-2
- Write explanation with 4 rules

**Code to run (4 rules of this):**
```js
// Rule 1: Default (global context)
console.log(this); // window (browser), global (Node)

// Rule 2: Implicit binding (object method)
const obj = {
  name: "JS",
  greet() { console.log(this.name); }
};
obj.greet(); // "JS" - this = obj

// Rule 3: Explicit binding (call/apply/bind)
function greet() { console.log(this.name); }
greet.call({ name: "Explicit" }); // "Explicit"

// Rule 4: new binding
function Person(name) { this.name = name; }
const p = new Person("New");
console.log(p.name); // "New"

// Arrow functions - no own this
const arrow = {
  name: "Arrow",
  greet: () => console.log(this.name) // window!
};
```

**Build/Project: Calculator with Method Chaining**
```js
// calculator.js - 'this' binding in practice
function Calculator(value = 0) {
  this.value = value;
  this.add = (n) => { this.value += n; return this; };
  this.subtract = (n) => { this.value -= n; return this; };
  this.multiply = (n) => { this.value *= n; return this; };
  this.divide = (n) => { this.value /= n; return this; };
  this.getResult = () => this.value;
  this.reset = () => { this.value = 0; return this; };
}

// Usage - method chaining works because of 'this'
const calc = new Calculator();
const result = calc.add(10).multiply(2).subtract(5).divide(3).getResult();
console.log(result); // 5

// Also works with call/apply for borrowing
function logCalc() {
  console.log(`Calculator result: ${this.value}`);
}
logCalc.call(calc); // "Calculator result: 5"
```

---

### Week 5: Prototype Chain + new Keyword

**Interview prep:**
- Read YDKJS Objects ch3 (Objects), ch5 (Prototypes), ch4 (new keyword)
- Namaste JS doesn't cover this well - rely on YDKJS
- Write explanation of prototype chain

**Code to run:**
```js
// Prototype chain
function Animal(name) { this.name = name; }
Animal.prototype.speak = function() { return `${this.name} speaks`; };

const dog = new Animal("Rex");
console.log(dog.speak()); // "Rex speaks"
console.log(dog.__proto__ === Animal.prototype); // true

// What new does (simplified)
function myNew(Constructor, ...args) {
  const obj = Object.create(Constructor.prototype);
  Constructor.apply(obj, args);
  return obj;
}
```

**Build/Project: Custom Event System with Prototypal Inheritance**
```js
// event-system.js
function EventEmitter() {
  this.events = {};
}
EventEmitter.prototype.on = function(event, callback) {
  if (!this.events[event]) this.events[event] = [];
  this.events[event].push(callback);
  return this;
};
EventEmitter.prototype.emit = function(event, ...args) {
  if (this.events[event]) {
    this.events[event].forEach(cb => cb.apply(this, args));
  }
  return this;
};
EventEmitter.prototype.off = function(event, callback) {
  if (this.events[event]) {
    this.events[event] = this.events[event].filter(cb => cb !== callback);
  }
  return this;
};

// Inherit from EventEmitter
function Logger() {
  EventEmitter.call(this); // call parent constructor
}
Logger.prototype = Object.create(EventEmitter.prototype);
Logger.prototype.constructor = Logger;

Logger.prototype.log = function(message) {
  const timestamp = new Date().toISOString();
  this.emit('log', { message, timestamp });
  console.log(`[${timestamp}] ${message}`);
};

// Usage
const logger = new Logger();
logger.on('log', (data) => console.log('Logged:', data.message));
logger.log('Server started'); // emits 'log' event
```

---

### Week 6: Coercion + == vs ===

**Interview prep:**
- Read YDKJS Types ch1-4 (ch4 covers coercion deeply)
- Write explanation of implicit vs explicit coercion
- Know the == algorithm steps

**Code to run:**
```js
// Implicit coercion
console.log("5" + 3);   // "53" (string wins with +)
console.log("5" - 3);   // 2 (number wins with -)
console.log(true + 1);  // 2 (true -> 1)
console.log("" == false); // true

// == vs ===
console.log(0 == false);   // true
console.log(0 === false);  // false
console.log(null == undefined); // true
console.log(null === undefined); // false
```

**Build/Project: Form Validator with Type Coercion**
```js
// validator.js
const rules = {
  isEmail: (val) => {
    const coerced = String(val); // explicit coercion
    return coerced.includes('@') && coerced.includes('.');
  },
  isNumber: (val) => {
    const num = Number(val); // explicit coercion
    return !isNaN(num) && typeof num === 'number';
  },
  isEmpty: (val) => {
    // == catches null, undefined, '', 0, false
    return val == null || val === '' || val === false;
  },
  minLength: (min) => (val) => {
    return String(val).length >= min; // coerce to string
  }
};

function validate(value, ...validators) {
  const errors = [];
  for (const validator of validators) {
    if (!validator(value)) {
      errors.push(`Failed: ${validator.name || 'custom rule'}`);
    }
  }
  return { valid: errors.length === 0, errors };
}

// Usage
console.log(validate('test@email.com', rules.isEmail)); // { valid: true, errors: [] }
console.log(validate('not-email', rules.isEmail)); // { valid: false, errors: ['Failed: isEmail'] }
console.log(validate('', rules.isEmpty)); // { valid: true, errors: [] }
console.log(validate('abc', rules.minLength(5))); // { valid: false, errors: [...] }
```

---

### Week 7: Event Loop + Callbacks

**Interview prep:**
- Watch S01 EP-14 (Callback Functions)
- Watch S01 EP-15 (Async JS & Event Loop)
- Read MDN Execution Model
- Write explanation of microtask vs macrotask

**Code to run:**
```js
// Execution order
console.log("1");                    // Sync
setTimeout(() => console.log("2"), 0); // Macrotask
Promise.resolve().then(() => console.log("3")); // Microtask
console.log("4");                    // Sync

// Output: 1, 4, 3, 2
```

**Build/Project: Task Queue System**
```js
// task-queue.js - event loop in action
class TaskQueue {
  constructor() {
    this.queue = [];
    this.running = false;
  }
  
  add(task, priority = 0) {
    this.queue.push({ task, priority });
    this.queue.sort((a, b) => b.priority - a.priority);
    this.process();
  }
  
  process() {
    if (this.running || this.queue.length === 0) return;
    
    this.running = true;
    const { task } = this.queue.shift();
    
    // Simulate async work
    setTimeout(() => {
      task();
      this.running = false;
      this.process(); // process next
    }, 0);
  }
}

// Usage
const tq = new TaskQueue();
tq.add(() => console.log('Task 1'), 1);
tq.add(() => console.log('Task 2'), 2); // higher priority
tq.add(() => console.log('Task 3'), 1);
// Output: Task 2, Task 1, Task 3
```

---

### Week 8: Promises

**Interview prep:**
- Watch S02 EP-01 (Callback Hell) to EP-04 (Promise APIs)
- Read MDN Promises Guide
- Write explanation of promise states and chaining

**Code to run:**
```js
// Promise states: pending -> fulfilled OR rejected
const p = new Promise((resolve, reject) => {
  setTimeout(() => resolve("Done!"), 1000);
});

// Chaining
p.then(res => console.log(res))
  .catch(err => console.error(err))
  .finally(() => console.log("Always runs"));

// Promise.all, allSettled, race
```

**Build/Project: API Client with Retry Logic**
```js
// api-client.js
class ApiClient {
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
  }
  
  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const config = {
      headers: { 'Content-Type': 'application/json' },
      ...options
    };
    
    if (config.body && typeof config.body === 'object') {
      config.body = JSON.stringify(config.body);
    }
    
    const response = await fetch(url, config);
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || `HTTP ${response.status}`);
    }
    
    return response.json();
  }
  
  get(endpoint) {
    return this.request(endpoint, { method: 'GET' });
  }
  
  post(endpoint, data) {
    return this.request(endpoint, { method: 'POST', body: data });
  }
  
  retry(fn, attempts = 3) {
    return fn().catch(err => {
      if (attempts <= 1) throw err;
      console.log(`Retrying... (${attempts - 1} left)`);
      return this.retry(fn, attempts - 1);
    });
  }
}

// Usage
const api = new ApiClient('https://jsonplaceholder.typicode.com');
api.retry(() => api.get('/posts/1'))
  .then(post => console.log(post))
  .catch(err => console.error('Failed:', err));
```

---

### Week 9: async/await + Fetch API

**Interview prep:**
- Watch S02 EP-05 (async/await)
- Read MDN async/await guide + Fetch API
- Write explanation of async/await vs .then()

**Code to run:**
```js
// async/await is syntactic sugar over promises
async function getData() {
  try {
    const response = await fetch("https://api.github.com/users/octocat");
    const data = await response.json();
    console.log(data);
  } catch (error) {
    console.error("Error:", error);
  }
}

// Parallel vs sequential
async function parallel() {
  const [users, posts] = await Promise.all([
    fetch('/api/users').then(r => r.json()),
    fetch('/api/posts').then(r => r.json())
  ]);
  return { users, posts };
}
```

**Build/Project: Weather App (using public API)**
```js
// weather-app.js - complete async project
const API_KEY = 'YOUR_API_KEY'; // get from openweathermap.org
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

class WeatherApp {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.cache = new Map();
  }
  
  async getCurrentWeather(city) {
    const cacheKey = `current_${city}`;
    if (this.cache.has(cacheKey)) {
      // Cache hit!
      return this.cache.get(cacheKey);
    }
    
    const url = `${BASE_URL}/weather?q=${city}&appid=${this.apiKey}&units=metric`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`City not found: ${city}`);
    }
    
    const data = await response.json();
    const result = {
      city: data.name,
      temp: data.main.temp,
      description: data.weather[0].description,
      humidity: data.main.humidity
    };
    
    this.cache.set(cacheKey, result);
    return result;
  }
  
  async getForecast(city, days = 5) {
    const url = `${BASE_URL}/forecast?q=${city}&appid=${this.apiKey}&units=metric`;
    const response = await fetch(url);
    const data = await response.json();
    
    return data.list
      .filter((_, i) => i % 8 === 0) // every 24 hours
      .slice(0, days)
      .map(item => ({
        date: new Date(item.dt * 1000).toLocaleDateString(),
        temp: item.main.temp,
        description: item.weather[0].description
      }));
  }
}

// Usage
const weather = new WeatherApp(API_KEY);
(async () => {
  try {
    const current = await weather.getCurrentWeather('London');
    console.log(`Temperature: ${current.temp}°C`);
    
    const forecast = await weather.getForecast('London');
    console.log('5-day forecast:', forecast);
  } catch (err) {
    console.error(err.message);
  }
})();
```

---

### Week 10: Modules (ESM)

**Interview prep:**
- Read YDKJS Scope ch8 (Module Pattern)
- Read MDN ES Modules guide
- Write explanation of ESM vs CommonJS vs AMD

**Code to run:**
```js
// math.js - named exports
export const add = (a, b) => a + b;
export const multiply = (a, b) => a * b;

// utils.js - default export
export default class Logger {
  log(msg) { console.log(msg); }
}

// main.js - importing
import { add, multiply } from "./math.js";
import Logger from "./utils.js";
```

**Build/Project: Modular Utils Library**
```js
// utils/
// ├── index.js (barrel export)
// ├── array.js
// ├── string.js
// └── validation.js

// array.js
export const unique = (arr) => [...new Set(arr)];
export const chunk = (arr, size) => {
  const chunks = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
};
export const flatten = (arr) => arr.flat(Infinity);

// string.js
export const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);
export const slugify = (str) => str.toLowerCase().replace(/\s+/g, '-');
export const truncate = (str, len) => str.length > len ? str.slice(0, len) + '...' : str;

// validation.js
export const isEmail = (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
export const isURL = (val) => /^https?:\/\//.test(val);
export const isNumber = (val) => !isNaN(Number(val));

// index.js - barrel export
export { unique, chunk, flatten } from './array.js';
export { capitalize, slugify, truncate } from './string.js';
export { isEmail, isURL, isNumber } from './validation.js';

// main.js
import { unique, capitalize, isEmail } from './utils/index.js';

console.log(unique([1, 1, 2, 3])); // [1, 2, 3]
console.log(capitalize('hello')); // "Hello"
console.log(isEmail('test@example.com')); // true
```

---

### Week 11: DOM API

**Interview prep:**
- Read MDN DOM documentation
- Understand DOM tree, nodes, elements
- Know querySelector vs getElementById vs getElementsByClassName

**Code to run:**
```js
// Selecting elements
const title = document.querySelector('h1');
const items = document.querySelectorAll('.item');
const byId = document.getElementById('app');

// Creating elements
const div = document.createElement('div');
div.className = 'card';
div.textContent = 'Hello';
document.body.appendChild(div);

// Modifying elements
title.textContent = 'New Title';
title.setAttribute('data-id', '123');
title.classList.add('active');
title.classList.toggle('hidden');

// Event delegation
document.querySelector('ul').addEventListener('click', (e) => {
  if (e.target.tagName === 'LI') {
    console.log('Clicked:', e.target.textContent);
  }
});
```

**Build: Todo List with DOM Manipulation**
```js
// todo-dom.js
class TodoApp {
  constructor(container) {
    this.container = container;
    this.todos = [];
    this.render();
  }
  
  add(text) {
    this.todos.push({ id: Date.now(), text, done: false });
    this.render();
  }
  
  toggle(id) {
    const todo = this.todos.find(t => t.id === id);
    if (todo) todo.done = !todo.done;
    this.render();
  }
  
  remove(id) {
    this.todos = this.todos.filter(t => t.id !== id);
    this.render();
  }
  
  render() {
    this.container.innerHTML = this.todos.map(todo => `
      <div class="todo ${todo.done ? 'done' : ''}">
        <input type="checkbox" ${todo.done ? 'checked' : ''} 
          data-id="${todo.id}">
        <span>${todo.text}</span>
        <button data-action="delete" data-id="${todo.id}">×</button>
      </div>
    `).join('');
    
    // Event delegation
    this.container.addEventListener('click', (e) => {
      const id = Number(e.target.dataset.id);
      if (e.target.type === 'checkbox') this.toggle(id);
      if (e.target.dataset.action === 'delete') this.remove(id);
    });
  }
}

// Usage
const app = new TodoApp(document.getElementById('todos'));
app.add('Learn DOM');
app.add('Build project');
```

---

### Week 12: Storage + Observer APIs

**Interview prep:**
- Read MDN Web Storage API
- Read MDN Intersection Observer API
- Know localStorage vs sessionStorage vs cookies
- Understand observer pattern

**Code to run:**
```js
// LocalStorage
localStorage.setItem('user', JSON.stringify({ name: 'John' }));
const user = JSON.parse(localStorage.getItem('user'));
console.log(user.name); // "John"
localStorage.removeItem('user');
localStorage.clear();

// SessionStorage (cleared when tab closes)
sessionStorage.setItem('temp', 'data');

// Intersection Observer
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      console.log('Element visible:', entry.target);
      entry.target.classList.add('visible');
    }
  });
}, { threshold: 0.5 });

document.querySelectorAll('.lazy').forEach(el => observer.observe(el));
```

**Build: Infinite Scroll with Lazy Loading**
```js
// infinite-scroll.js
class InfiniteScroll {
  constructor(container, loadMore) {
    this.container = container;
    this.loadMore = loadMore;
    this.loading = false;
    this.page = 1;
    
    this.observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !this.loading) {
          this.fetchNext();
        }
      },
      { rootMargin: '200px' }
    );
    
    this.createSentinel();
  }
  
  createSentinel() {
    this.sentinel = document.createElement('div');
    this.sentinel.className = 'sentinel';
    this.container.appendChild(this.sentinel);
    this.observer.observe(this.sentinel);
  }
  
  async fetchNext() {
    this.loading = true;
    this.sentinel.textContent = 'Loading...';
    
    try {
      const items = await this.loadMore(this.page);
      this.page++;
      
      items.forEach(item => {
        const el = document.createElement('div');
        el.className = 'item';
        el.textContent = item.title;
        this.container.insertBefore(el, this.sentinel);
      });
      
      this.sentinel.textContent = '';
    } catch (err) {
      this.sentinel.textContent = 'Error loading more';
    }
    
    this.loading = false;
  }
}

// Usage
const scroll = new InfiniteScroll(
  document.getElementById('list'),
  async (page) => {
    const res = await fetch(`/api/items?page=${page}`);
    return res.json();
  }
);
```

---

### Weeks 13-14: Build Phase + Interview Practice

**Pick ONE project that uses ALL concepts (JS + Web APIs):**

#### Option A: Personal Finance Tracker (Recommended)
**Concepts used:** ALL

```
finance-tracker/
├── index.html           (DOM)
├── main.js              (modules, event listeners)
├── storage.js           (closures, localStorage)
├── transactions.js      (array methods, prototypes)
├── ui.js                (DOM manipulation, this)
├── api.js               (fetch, async/await, promises)
├── charts.js            (Canvas API, observers)
└── utils.js             (validation, coercion)
```

**Features to build:**
- Add/edit/delete transactions (closures, DOM)
- Filter by date/type (array methods)
- Monthly summary (reduce, coercion)
- Export to CSV (File API, async)
- Search with debounce (closures, event loop)
- LocalStorage persistence (Storage API)
- Lazy load transaction history (Intersection Observer)
- Responsive UI (DOM events, event delegation)

#### Option B: Blog with Comments
**Concepts used:** modules, closures, prototypes, async, fetch, DOM, Storage

#### Option C: Quiz Game
**Concepts used:** closures, event loop, promises, coercion, array methods, DOM, Storage

**Daily rhythm during build phase:**
- Build for 30-40 min
- Practice explaining one concept out loud (5 min)
- When stuck, Google it

**Interview practice:**
- Pick 3 random concepts daily
- Explain them out loud as if to a junior dev
- Run the code example to prove it

---

## Backend Extension (Weeks 15-20)

### Week 15: DB + ORMs (Mongoose + Prisma)

**Interview prep:**
- Know when SQL vs NoSQL: relational models (joins, strict schema, transactions) vs documents (flexible schema, denormalized, horizontal scale)
- Mongoose: Schema → Model, required/unique/index validators, `methods`/`statics`, `virtuals`, middleware hooks (pre/post `save`), `populate()` for `$ref` relations
- Prisma: `schema.prisma` (models, enums, `@relation`) → `prisma migrate` → type-safe Prisma Client; compare against Mongoose: type safety, migrations, multi-DB support
- Write explanation: "Mongoose is a document ODM for MongoDB. Prisma is a type-safe ORM for SQL (and MongoDB) generated from a schema."

**Code to run:**
```js
// mongoose.js - run with: node mongoose.js (needs local MongoDB)
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true },
  age: { type: Number, min: 0 },
  createdAt: { type: Date, default: Date.now }
});

userSchema.methods.profile = function () {
  return `${this.name} <${this.email}>`;
};

const User = mongoose.model('User', userSchema);

async function run() {
  await mongoose.connect('mongodb://127.0.0.1:27017/notes');

  const alice = new User({ name: 'Alice', email: 'alice@dev.com', age: 25 });
  await alice.save();
  console.log(alice.profile()); // "Alice <alice@dev.com>"

  const adults = await User.find({ age: { $gte: 18 } }).sort({ name: 1 });
  await User.updateOne({ email: 'alice@dev.com' }, { $set: { age: 26 } });
  await User.deleteOne({ email: 'alice@dev.com' });

  await mongoose.disconnect();
}
run();
```

```prisma
// prisma/schema.prisma - the single source of truth
model User {
  id        String   @id @default(cuid())
  name      String
  email     String   @unique
  age       Int?
  posts     Post[]
  createdAt DateTime @default(now())
}

model Post {
  id       String @id @default(cuid())
  title    String
  author   User   @relation(fields: [authorId], references: [id])
  authorId String
}
```

```js
// prisma.js - type-safe queries, no strings to mistype
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  await prisma.user.create({
    data: { name: 'Alice', email: 'alice@dev.com', age: 25 }
  });

  const users = await prisma.user.findMany({
    where: { age: { gte: 18 } },
    orderBy: { name: 'asc' },
    include: { posts: true } // like Mongoose .populate()
  });

  await prisma.user.update({
    where: { email: 'alice@dev.com' },
    data: { age: 26 }
  });

  await prisma.user.delete({ where: { email: 'alice@dev.com' } });
}
run();
```

**Build/Project: Notes API (Express + Mongoose)**
```js
// notes-api.js - npm i express mongoose
const express = require('express');
const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
  title: { type: String, required: true },
  body: String,
  tags: [String],
  createdAt: { type: Date, default: Date.now }
});

const Note = mongoose.model('Note', noteSchema);
const app = express();
app.use(express.json());

app.get('/api/notes', async (req, res) => {
  res.json(await Note.find().sort({ createdAt: -1 }));
});

app.post('/api/notes', async (req, res) => {
  res.status(201).json(await Note.create(req.body));
});

app.put('/api/notes/:id', async (req, res) => {
  res.json(await Note.findByIdAndUpdate(req.params.id, req.body, { new: true }));
});

app.delete('/api/notes/:id', async (req, res) => {
  await Note.findByIdAndDelete(req.params.id);
  res.status(204).end();
});

app.listen(3000, async () => {
  await mongoose.connect('mongodb://127.0.0.1:27017/notes');
  console.log('http://localhost:3000');
});
```

---

### Week 16: TypeScript

**Interview prep:**
- TypeScript is **erasable** - it compiles away, no runtime overhead. `strict` mode is the default since TS 5.0
- **Structural typing**: compatibility is by shape, not name (duck typing). This is the #1 difference from Java/C#
- `interface` vs `type`: interfaces extend with `extends`, types compose with unions (`|`) and intersections (`&`)
- Union & literal types, narrowing (`typeof`, `in`, discriminated unions with `kind: 'a' | 'b'`)
- Generics + utility types: `Partial`, `Pick`, `Omit`, `Record`, `ReturnType` - the interview favorites
- Write explanation of generics: "A type-level function that takes a type and returns a type"

**Code to run:**
```ts
// types.ts - run with: npx tsx types.ts
interface User {
  id: number;
  name: string;
  email?: string;              // optional
  roles: ('admin' | 'user')[]; // literal union
}

type ID = string | number;     // union type

function greet(user: User): string {
  return `Hello ${user.name}`;
}

// Generic: type-safe "first element"
function first<T>(arr: T[]): T | undefined {
  return arr[0];
}

const n = first([1, 2, 3]);   // number | undefined
const s = first(['a', 'b']);  // string | undefined

// Utility types
type PublicUser = Omit<User, 'email'>; // removes email
type PartialUser = Partial<User>;      // all fields optional
type OnlyId = Pick<User, 'id'>;        // { id: number }

// Narrowing - TS figures out the type per branch
function printId(id: ID): void {
  if (typeof id === 'string') {
    console.log(id.toUpperCase());
  } else {
    console.log(id.toFixed(2));
  }
}

// Discriminated union - 'ok' narrows the type
type Result<T> =
  | { ok: true; data: T }
  | { ok: false; error: string };

function handle<T>(r: Result<T>): T {
  if (r.ok) return r.data;
  throw new Error(r.error);
}
```

**Build/Project: Convert Week 8's API Client to TypeScript**
```ts
// api-client.ts - Week 8 project + types
interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: Record<string, string>;
  body?: unknown;
}

class ApiClient {
  constructor(private baseUrl: string) {}

  async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const config: RequestInit = {
      method: options.method ?? 'GET',
      headers: { 'Content-Type': 'application/json', ...options.headers },
      body: options.body ? JSON.stringify(options.body) : undefined
    };

    const res = await fetch(`${this.baseUrl}${endpoint}`, config);
    if (!res.ok) {
      const err = (await res.json().catch(() => ({}))) as { message?: string };
      throw new Error(err.message || `HTTP ${res.status}`);
    }
    return res.json() as Promise<T>;
  }

  get<T>(endpoint: string) { return this.request<T>(endpoint); }

  post<T>(endpoint: string, data: unknown) {
    return this.request<T>(endpoint, { method: 'POST', body: data });
  }

  async retry<T>(fn: () => Promise<T>, attempts = 3): Promise<T> {
    try {
      return await fn();
    } catch (err) {
      if (attempts <= 1) throw err;
      return this.retry(fn, attempts - 1);
    }
  }
}

// Usage - TS knows the response shape, no manual casts anywhere
const api = new ApiClient('https://jsonplaceholder.typicode.com');
const post = await api.get<{ id: number; title: string }>('/posts/1');
console.log(post.title.toUpperCase());
```

---

### Week 17: Node.js Internals

**Interview prep:**
- Node event loop **phases**: timers → pending callbacks → poll (I/O) → check (`setImmediate`) → close. `process.nextTick` + promises run between phases (microtasks)
- `setImmediate` vs `setTimeout(0)`: outside I/O it's a race; inside an I/O callback, `setImmediate` always wins
- **libuv thread pool**: 4 threads by default; `crypto`, `zlib`, `fs` heavy ops run there. `worker_threads` for JS parallelism, `cluster` to use all CPU cores
- Streams: readable/writable/transform, `pipe()` handles **backpressure** automatically
- Buffers, `process.argv`, exit codes, CJS vs ESM (`require` vs `import`, `.cjs`/`.mjs`)

**Code to run:**
```js
// event-loop-order.js
const fs = require('fs');

fs.readFile(__filename, () => console.log('1: I/O callback (poll phase)'));

setTimeout(() => console.log('2: timers phase'), 0);
setImmediate(() => console.log('3: check phase'));

process.nextTick(() => console.log('4: nextTick (before any phase)'));
Promise.resolve().then(() => console.log('5: microtask'));

// 4, 5 always run first. Inside an I/O callback, 3 (setImmediate) beats 2.
```

```js
// thread-pool.js - libuv has 4 threads by default
const crypto = require('crypto');

const start = Date.now();
for (let i = 0; i < 5; i++) {
  crypto.pbkdf2('secret', `salt${i}`, 100_000, 64, 'sha512', () => {
    console.log(`done ${i + 1} in ${Date.now() - start}ms`);
  });
}
// First 4 finish together; the 5th waits for a free thread
```

```js
// streams.js - pipe() applies backpressure automatically
const { Readable, Transform } = require('stream');

const upper = new Transform({
  transform(chunk, _enc, cb) { cb(null, chunk.toString().toUpperCase()); }
});

Readable.from(['hello ', 'world\n']).pipe(upper).pipe(process.stdout);
// HELLO WORLD
```

**Build/Project: CLI File Analyzer (streams - never loads the whole file)**
```js
// analyze.js - node analyze.js notes.txt
const fs = require('fs');

let words = 0;
let lines = 0;

const counter = new require('stream').Transform({
  transform(chunk, _enc, cb) {
    words += chunk.toString().split(/\s+/).filter(Boolean).length;
    lines += chunk.toString().split('\n').length - 1;
    cb();
  }
});

fs.createReadStream(process.argv[2])
  .pipe(counter)
  .on('finish', () => console.log({ lines, words }));
```

```js
// worker.js - heavy work off the main thread
const { workerData, parentPort } = require('worker_threads');
let sum = 0;
for (let i = 0; i < workerData; i++) sum += i;
parentPort.postMessage(sum);

// main: new Worker('./worker.js', { workerData: 1_000_000_000 })
```

---

### Week 18: Testing

**Interview prep:**
- Unit vs integration vs e2e: one function vs function+DB/network vs whole user flow
- Jest/Vitest basics: `describe`, `test`/`it`, `expect` + matchers (`toBe`, `toEqual`, `toHaveLength`, `toThrow`)
- **Mocks & spies**: replace network, `Date.now`, `Math.random`; assert that a function was called with `expect(fn).toHaveBeenCalledWith(...)`
- Arrange → Act → Assert structure
- TDD: red (failing test) → green (make it pass) → refactor
- Write explanation of when NOT to mock (over-mocking tests your mocks, not your code)

**Code to run:**
```js
// cart.test.js - run with: npx jest  (tests the Week 3 Shopping Cart)
const { createCart } = require('./cart');

describe('createCart', () => {
  test('adds items and totals them', () => {
    const cart = createCart();
    cart.addItem('Laptop', 999).addItem('Mouse', 25);
    expect(cart.getTotal()).toBe(1024);
  });

  test('merges duplicates instead of pushing twice', () => {
    const cart = createCart();
    cart.addItem('Laptop', 999).addItem('Laptop', 999);
    expect(cart.getItems()).toHaveLength(1);
    expect(cart.getItems()[0].qty).toBe(2);
  });

  test('keeps items private', () => {
    const cart = createCart();
    expect(cart.items).toBeUndefined();
    expect(() => cart.removeItem('nope')).not.toThrow();
  });

  test('clear resets everything', () => {
    const cart = createCart();
    cart.addItem('A', 1).clear();
    expect(cart.getTotal()).toBe(0);
  });
});
```

```js
// weather.test.js - mock the network, test the logic
global.fetch = jest.fn(() =>
  Promise.resolve({ ok: true, json: () => Promise.resolve({ main: { temp: 21 } }) })
);
// Now test getCurrentWeather('London') -> { temp: 21 } without any real API
```

**Build/Project:** Write a full Jest suite for the Week 8 API Client + Week 9 Weather App:
- Mock `fetch` for success, non-OK response, and network failure
- Test `retry()`: succeeds on 3rd attempt, throws after exhaustion
- Test WeatherApp cache hit (fetch called once, second call returns cached)

---

### Week 19: Networking Protocols (DNS, TCP, TLS, HTTP)

**Interview prep:**
- The full request lifecycle: **DNS lookup** → **TCP handshake** (SYN, SYN-ACK, ACK) → **TLS handshake** (ClientHello, cipher suite, cert exchange, key exchange) → **HTTP request**
- HTTP/1.1 (one request per connection, head-of-line blocking) vs HTTP/2 (multiplexing, HPACK compression, server push) vs HTTP/3 (QUIC over UDP, no head-of-line blocking, built-in TLS)
- Request/response structure, idempotent methods (GET/PUT/DELETE), status code families (1xx-5xx)
- Caching headers: `Cache-Control` (max-age, no-store), `ETag`/`If-None-Match`, `Last-Modified`
- Cookies vs headers, `Set-Cookie`, SameSite

**Code to run:**
```js
// dns.js - what happens BEFORE any HTTP request
const dns = require('dns').promises;

(async () => {
  const { address, family } = await dns.lookup('google.com');
  console.log(`IP: ${address} (IPv${family})`);
  console.log('A records:', await dns.resolve('google.com', 'A'));
})();
```

```js
// http-server.js - headers, cookies, caching
const http = require('http');

const server = http.createServer((req, res) => {
  console.log(`${req.method} ${req.url}`);

  const body = JSON.stringify({
    method: req.method,
    path: req.url,
    userAgent: req.headers['user-agent']
  });

  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 'public, max-age=60');
  res.setHeader('Set-Cookie', 'sid=abc123; HttpOnly; SameSite=Lax');
  res.writeHead(200);
  res.end(body);
});

server.listen(8080, () => console.log('http://localhost:8080'));
```

```js
// tcp.js - the transport underneath HTTP (raw echo server)
const net = require('net');

const server = net.createServer((socket) => {
  console.log('client connected (TCP handshake complete)');
  socket.on('data', (data) => socket.write(`echo: ${data}`));
});

server.listen(9000, () => console.log('raw TCP server on :9000'));
```

**Build/Project: Reverse Proxy with node:http**
```js
// proxy.js - forwards every request to a target server
const http = require('http');

const TARGET = { hostname: 'jsonplaceholder.typicode.com', port: 80 };

const server = http.createServer((clientReq, clientRes) => {
  const proxyReq = http.request(
    {
      hostname: TARGET.hostname,
      port: TARGET.port,
      path: clientReq.url,
      method: clientReq.method
    },
    (targetRes) => {
      clientRes.writeHead(targetRes.statusCode, {
        'Content-Type': targetRes.headers['content-type']
      });
      targetRes.pipe(clientRes); // stream response back
    }
  );
  clientReq.pipe(proxyReq); // stream request forward
});

server.listen(8080, () => console.log('proxy on :8080'));
// curl http://localhost:8080/posts/1 -> proxied to the real API
```

---

### Week 20: Caching + Queues

**Interview prep:**
- Caching strategies: **cache-aside** (check cache → miss → fetch from DB → write cache), write-through, write-back; "cache invalidation is one of the two hard things"
- Eviction: LRU vs LFU vs FIFO, TTL expiry; Redis: `SET key val EX 60`, `INCR` (rate limiting), `SETNX` (locking), pub/sub
- Queues: FIFO, priority, delayed jobs, **retries with exponential backoff**, dead-letter queue (DLQ)
- Producer/worker pattern; BullMQ (Redis-backed) vs in-memory queues vs full brokers (RabbitMQ, Kafka)
- When to prefer a queue over doing work inline (slow work, retries, decoupling, fan-out)

**Code to run:**
```js
// lru-cache.js - least recently used eviction
class LRUCache {
  constructor(capacity) {
    this.capacity = capacity;
    this.map = new Map(); // insertion order = recency order
  }

  get(key) {
    if (!this.map.has(key)) return -1;
    const value = this.map.get(key);
    this.map.delete(key);      // re-insert = mark most recent
    this.map.set(key, value);
    return value;
  }

  set(key, value) {
    if (this.map.has(key)) this.map.delete(key);
    this.map.set(key, value);
    if (this.map.size > this.capacity) {
      this.map.delete(this.map.keys().next().value); // evict LRU
    }
    return this;
  }
}

const cache = new LRUCache(3);
cache.set('a', 1).set('b', 2).set('c', 3);
cache.get('a');         // 'a' becomes most recent
cache.set('d', 4);      // evicts 'b' (least recently used)
console.log(cache.get('b')); // -1
```

```js
// cache-aside.js - TTL + stale check
class TTLStore {
  constructor(ttlMs) { this.ttlMs = ttlMs; this.store = new Map(); }

  get(key) {
    const hit = this.store.get(key);
    if (!hit) return undefined;
    if (Date.now() - hit.at > this.ttlMs) {
      this.store.delete(key); // expired -> treat as miss
      return undefined;
    }
    return hit.value;
  }

  set(key, value) {
    this.store.set(key, { value, at: Date.now() });
    return this;
  }
}

// The core cache-aside pattern (this is what Redis is usually doing)
async function cacheAside(store, key, fetchFn) {
  const hit = store.get(key);
  if (hit !== undefined) return hit;  // cache hit
  const fresh = await fetchFn();      // cache miss -> DB/API
  store.set(key, fresh);
  return fresh;
}
```

**Build/Project: Task Queue with retries + Rate Limiter**
```js
// job-queue.js - retries with exponential backoff + dead-letter
class JobQueue {
  constructor() { this.queue = []; this.failed = []; }

  push(job, { retries = 3, backoffMs = 1000 } = {}) {
    this.queue.push({ job, retries, backoffMs, attempts: 0 });
    return this;
  }

  async process(worker) {
    while (this.queue.length) {
      const task = this.queue.shift();
      try {
        await worker(task.job);
      } catch (err) {
        task.attempts++;
        if (task.attempts <= task.retries) {
          await new Promise(r => setTimeout(r, task.backoffMs * task.attempts));
          this.queue.push(task);      // retry, waiting longer each time
        } else {
          this.failed.push(task.job); // dead-letter queue
        }
      }
    }
    return { done: true, failed: this.failed.length };
  }
}

// rate-limiter.js - sliding window (the logic behind 429 Too Many Requests)
class RateLimiter {
  constructor(limit, windowMs) {
    this.limit = limit;
    this.windowMs = windowMs;
    this.hits = new Map(); // key -> [timestamps]
  }

  allow(key) {
    const now = Date.now();
    const timestamps = (this.hits.get(key) || [])
      .filter(t => now - t < this.windowMs);
    if (timestamps.length >= this.limit) {
      this.hits.set(key, timestamps);
      return false;
    }
    timestamps.push(now);
    this.hits.set(key, timestamps);
    return true;
  }
}
```

---

## Progress Tracker

| Week | Concept | Explanation Done | Build Done | Status |
|------|---------|------------------|------------|--------|
| 1 | var/let/const | ⬜ | Counter App | ⬜ |
| 2 | Lexical scope, Hoisting | ⬜ | Nested Comments | ⬜ |
| 3 | Closures | ⬜ | Shopping Cart | ⬜ |
| 4 | this (4 rules) | ⬜ | Calculator | ⬜ |
| 5 | Prototype chain, new | ⬜ | Event System | ⬜ |
| 6 | Coercion, == vs === | ⬜ | Form Validator | ⬜ |
| 7 | Event loop, Callbacks | ⬜ | Task Queue | ⬜ |
| 8 | Promises | ⬜ | API Client | ⬜ |
| 9 | async/await, Fetch | ⬜ | Weather App | ⬜ |
| 10 | Modules (ESM) | ⬜ | Utils Library | ⬜ |
| 11 | DOM API | ⬜ | Todo List | ⬜ |
| 12 | Storage + Observer | ⬜ | Infinite Scroll | ⬜ |
| 13-14 | **BUILD PHASE** | ⬜ | Full Project | ⬜ |
| 15 | DB + ORMs (Mongoose/Prisma) | ⬜ | Notes API | ⬜ |
| 16 | TypeScript | ⬜ | TS API Client | ⬜ |
| 17 | Node Internals | ⬜ | CLI Analyzer | ⬜ |
| 18 | Testing | ⬜ | Test Suite | ⬜ |
| 19 | Networking Protocols | ⬜ | Reverse Proxy | ⬜ |
| 20 | Caching + Queues | ⬜ | Job Queue + Rate Limiter | ⬜ |

---

## Notes

- **Namaste JS** is good for concepts 1-5, 10-13
- **YDKJS** is essential for concepts 5-9 (read chapters, not whole book)
- **MDN** fills gaps for event loop, fetch, modules, and ALL Web APIs
- **Don't skip building** - watching ≠ confidence
- **Don't skip explanations** - building ≠ interview ready
- **It's okay to Google** - professionals do it daily
- **Break things on purpose** - understand errors, don't fear them
- **Each week's build becomes part of your final project**
- **Web APIs** (Weeks 11-12) bridge core JS to real browser apps
- **Backend stack** (Weeks 15-20) takes you from "frontend JS" to "full-stack" — DB, TypeScript, Node internals, testing, networking, caching/queues. Weeks 15, 18, 20 reuse the projects you built in Weeks 3, 8, 9

---

## Interview Confidence Check

After 20 weeks, you should be able to:

**Concepts (interview):**
- [ ] Explain var/let/const differences and TDZ
- [ ] Explain lexical scope and scope chain
- [ ] Explain closures with a real example
- [ ] Explain the 4 rules of `this`
- [ ] Explain prototype chain and `new` keyword
- [ ] Explain coercion and == vs ===
- [ ] Explain event loop, microtask vs macrotask
- [ ] Explain promises (states, chaining, error handling)
- [ ] Explain async/await and when to use Promise.all
- [ ] Explain ESM modules

**Web APIs (interview + practical):**
- [ ] Manipulate DOM efficiently (querySelector, event delegation)
- [ ] Use localStorage for persistence
- [ ] Implement lazy loading with Intersection Observer
- [ ] Handle file uploads with File API
- [ ] Understand Canvas basics for drawing

**Backend stack (interview + practical):**
- [ ] Explain Mongoose vs Prisma and when to use each; run CRUD in both
- [ ] Explain TS structural typing, generics, unions, and narrowing
- [ ] Explain Node event loop phases and the libuv thread pool
- [ ] Write unit tests with mocks for your own projects
- [ ] Walk through DNS → TCP → TLS → HTTP and HTTP/1.1 vs 2 vs 3
- [ ] Explain cache-aside vs write-through and queue retry/backoff patterns

**Building (confidence):**
- [ ] Build a small app from scratch without tutorials
- [ ] Fetch data from an API and handle errors
- [ ] Debug scope-related issues in your code
- [ ] Read someone else's code and understand it
- [ ] Use closures, prototypes, and async code naturally

**If you can do both, you're ready.**
