# JavaScript Revision Plan

**Goal:** Master 15 core JS concepts + Web APIs for interviews AND build real confidence through code.

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

## 14-Week Schedule

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
      console.log('Cache hit!');
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

---

## Interview Confidence Check

After 14 weeks, you should be able to:

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

**Building (confidence):**
- [ ] Build a small app from scratch without tutorials
- [ ] Fetch data from an API and handle errors
- [ ] Debug scope-related issues in your code
- [ ] Read someone else's code and understand it
- [ ] Use closures, prototypes, and async code naturally

**If you can do both, you're ready.**
