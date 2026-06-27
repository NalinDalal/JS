# JS_LECTURES Extras — Topics from Ayush Notes

**Covers:** delete keyword, NodeList vs HTMLCollection, self keyword, practical DOM patterns

---

## E1. The `delete` Keyword

### Explain It
`delete` removes a property from an object. It does NOT remove variables. Returns `true` on success. Cannot delete: `var` declared variables, function declarations, built-in prototype properties, `let`/`const` bindings.

### Prove It
```js
const obj = { a: 1, b: 2, c: 3 };
delete obj.a;
console.log(obj);        // { b: 2, c: 3 }
console.log("a" in obj); // false

// Cannot delete variables
var x = 10;
delete x; // false (in strict mode: SyntaxError)
console.log(x); // 10

// Cannot delete let/const
let y = 20;
// delete y; // SyntaxError

// Cannot delete functions
function greet() {}
delete greet; // false

// Cannot delete prototype properties
delete Object.prototype; // false

// Non-configurable properties
const frozen = Object.freeze({ a: 1 });
delete frozen.a; // false (strict mode: TypeError)
console.log(frozen.a); // 1

// Returns true/false
const result = delete obj.b;
console.log(result); // true

// Works with bracket notation
delete obj["c"];
console.log(obj); // {}
```

---

## E2. NodeList vs HTMLCollection

### Explain It
Both are array-like collections of DOM elements, but differ in methods and behavior:

| Feature | NodeList | HTMLCollection |
|---------|----------|----------------|
| Returned by | `querySelectorAll()` | `getElementsBy*()` |
| Static/Live | **Static** (snapshot) | **Live** (updates with DOM) |
| Has `forEach()` | **Yes** | No |
| Has `entries()`, `keys()`, `values()` | **Yes** | No |
| Indexed by name | No | **Yes** (`collection.namedItem()`) |

**Key difference:** NodeList from `querySelectorAll` is a **static** snapshot — DOM changes after calling it don't affect the list. HTMLCollection from `getElementsByClassName` is **live** — it automatically updates.

### Prove It
```js
// NodeList (static) - from querySelectorAll
const allDivs = document.querySelectorAll("div");
console.log(allDivs.length); // e.g., 5

document.body.innerHTML += "<div>New</div>";
console.log(allDivs.length); // Still 5 (static!)

// HTMLCollection (live) - from getElementsByClassName
const liveDivs = document.getElementsByTagName("div");
console.log(liveDivs.length); // e.g., 5

document.body.innerHTML += "<div>New</div>";
console.log(liveDivs.length); // 6 (live!)

// NodeList has forEach
allDivs.forEach(div => console.log(div));

// HTMLCollection does NOT have forEach
// liveDivs.forEach(div => console.log(div)); // TypeError

// Convert HTMLCollection to array
const arr = Array.from(liveDivs);
const arr2 = [...liveDivs];

// Convert NodeList to array (already has forEach, but for other methods)
const arr3 = Array.from(allDivs);
```

---

## E3. The `self` Keyword

### Explain It
`self` is a reference to the current global object:
- In **browser**: `self === window`
- In **Web Worker**: `self === WorkerGlobalScope`
- In **Node.js**: `self` is not defined (use `globalThis`)

`globalThis` is the modern, cross-platform way to access the global object (works everywhere).

### Prove It
```js
// In browser
console.log(self);          // Window
console.log(self === window); // true

// In Web Worker
console.log(self);          // WorkerGlobalScope
console.log(self === self.self); // true (self-referencing)

// Modern: use globalThis
console.log(globalThis);    // Window (browser), global (Node), WorkerGlobalScope (worker)

// self is also used in Web Worker messaging
// worker.js:
// self.onmessage = (e) => { self.postMessage("response"); };
```

---

## E4. `document.write()` vs `innerHTML` vs `textContent`

### Explain It
| Method | Use Case | Risk |
|--------|----------|------|
| `document.write()` | Quick testing only | Clears entire page if called after load |
| `innerHTML` | Insert HTML strings | **XSS risk** if using user input |
| `textContent` | Insert plain text | Safe, no HTML parsing |
| `innerText` | Like textContent but respects CSS | Slower, layout-dependent |

### Prove It
```js
// textContent (safe)
element.textContent = "<b>Safe</b>"; // Shows literal "<b>Safe</b>"

// innerHTML (dangerous with user input)
element.innerHTML = "<b>Bold</b>"; // Renders bold text
element.innerHTML = userInput; // XSS RISK!

// Safe innerHTML usage
element.innerHTML = DOMPurify.sanitize(userInput); // Use a library

// document.write - only for demos
document.write("Hello"); // Before page load: works
// After page load: overwrites entire document!
```

---

## E5. Practical Patterns from JS_LECTURES

### Event Delegation Pattern
```js
// Instead of adding listeners to each item, add to parent
const list = document.querySelector("ul");

list.addEventListener("click", (e) => {
  if (e.target.tagName === "LI") {
    console.log("Clicked:", e.target.textContent);
  }
  if (e.target.dataset.action === "delete") {
    const id = Number(e.target.dataset.id);
    deleteItem(id);
  }
});
```

### Form Validation Pattern
```js
const form = document.querySelector("form");
const emailInput = form.querySelector('input[type="email"]');

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  
  if (!validateEmail(emailInput.value)) {
    emailInput.classList.add("error");
    return;
  }
  
  emailInput.classList.remove("error");
  // Submit form
});
```

### Calculator (Method Chaining with `this`)
```js
function Calculator(value = 0) {
  this.value = value;
  this.add = (n) => { this.value += n; return this; };
  this.subtract = (n) => { this.value -= n; return this; };
  this.multiply = (n) => { this.value *= n; return this; };
  this.divide = (n) => { this.value /= n; return this; };
  this.getResult = () => this.value;
  this.reset = () => { this.value = 0; return this; };
}

const result = new Calculator()
  .add(10)
  .multiply(2)
  .subtract(5)
  .divide(3)
  .getResult();
console.log(result); // 5
```

---

## E6. Draggable API (HTML5 Drag and Drop)

### Explain It
The Drag and Drop API lets you make elements draggable. Key events: `dragstart`, `drag`, `dragenter`, `dragleave`, `dragover`, `drop`, `dragend`. Set `draggable="true"` on the element. Use `dataTransfer` to pass data between drag source and drop target.

### Prove It
```html
<div class="source" draggable="true" id="drag1">Drag me</div>
<div class="target" id="drop1">Drop here</div>
```
```js
const source = document.getElementById("drag1");
const target = document.getElementById("drop1");

source.addEventListener("dragstart", (e) => {
  e.dataTransfer.setData("text/plain", e.target.id);
  e.target.classList.add("dragging");
});

source.addEventListener("dragend", (e) => {
  e.target.classList.remove("dragging");
});

target.addEventListener("dragover", (e) => {
  e.preventDefault(); // Required to allow drop
  target.classList.add("drag-over");
});

target.addEventListener("dragleave", (e) => {
  target.classList.remove("drag-over");
});

target.addEventListener("drop", (e) => {
  e.preventDefault();
  const id = e.dataTransfer.getData("text/plain");
  const draggedEl = document.getElementById(id);
  target.appendChild(draggedEl);
  target.classList.remove("drag-over");
});
```

---

## E7. FormData API

### Explain It
FormData provides a way to construct key/value pairs for form submission. Can create from a `<form>` element or build programmatically. Works seamlessly with `fetch()` for multipart/form-data uploads.

### Prove It
```js
// From a form element
const form = document.querySelector("form");
const formData = new FormData(form);
console.log(formData.get("username")); // value of input[name="username"]

// Programmatically
const fd = new FormData();
fd.append("name", "John");
fd.append("age", "25");
fd.append("avatar", fileInput.files[0]); // File object

// With fetch
fetch("/api/upload", {
  method: "POST",
  body: fd, // Content-Type set automatically to multipart/form-data
})
  .then((res) => res.json())
  .then((data) => console.log(data));

// Iterating over entries
for (const [key, value] of fd.entries()) {
  console.log(`${key}: ${value}`);
}

// Converting to object
const obj = Object.fromEntries(fd.entries());
console.log(obj); // { name: "John", age: "25" }
```

---

## E8. Calendar Project (from Guided/)

### Explain It
A calendar widget demonstrates Date object manipulation, DOM creation, event handling, and state management — all core JS concepts in one project.

### Prove It
```js
class Calendar {
  constructor(container) {
    this.container = container;
    this.currentDate = new Date();
    this.render();
  }

  render() {
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const monthName = this.currentDate.toLocaleString("default", { month: "long" });

    let html = `
      <div class="calendar-header">
        <button id="prev-month">&lt;</button>
        <span>${monthName} ${year}</span>
        <button id="next-month">&gt;</button>
      </div>
      <div class="calendar-grid">
        <div class="day-name">Sun</div>
        <div class="day-name">Mon</div>
        <div class="day-name">Tue</div>
        <div class="day-name">Wed</div>
        <div class="day-name">Thu</div>
        <div class="day-name">Fri</div>
        <div class="day-name">Sat</div>
    `;

    // Empty cells before first day
    for (let i = 0; i < firstDay; i++) {
      html += `<div class="day empty"></div>`;
    }

    // Day cells
    const today = new Date();
    for (let day = 1; day <= daysInMonth; day++) {
      const isToday =
        day === today.getDate() &&
        month === today.getMonth() &&
        year === today.getFullYear();
      html += `<div class="day ${isToday ? "today" : ""}" data-day="${day}">${day}</div>`;
    }

    html += `</div>`;
    this.container.innerHTML = html;

    // Event delegation for navigation
    this.container.querySelector("#prev-month").addEventListener("click", () => {
      this.currentDate.setMonth(this.currentDate.getMonth() - 1);
      this.render();
    });

    this.container.querySelector("#next-month").addEventListener("click", () => {
      this.currentDate.setMonth(this.currentDate.getMonth() + 1);
      this.render();
    });

    // Click on day
    this.container.querySelectorAll(".day:not(.empty)").forEach((el) => {
      el.addEventListener("click", () => {
        console.log(`Selected: ${year}-${month + 1}-${el.dataset.day}`);
      });
    });
  }
}

// Usage
const cal = new Calendar(document.getElementById("calendar"));
```

---

## E9. LeaderBoard Project

### Explain It
A leaderboard demonstrates array sorting, DOM rendering, event handling, and state management. Core pattern: maintain an array of scores, sort on demand, re-render the list.

### Prove It
```js
class LeaderBoard {
  constructor(container) {
    this.container = container;
    this.players = [];
    this.render();
  }

  addPlayer(name, score) {
    this.players.push({ name, score });
    this.render();
  }

  sortDescending() {
    this.players.sort((a, b) => b.score - a.score);
    this.render();
  }

  render() {
    const sorted = [...this.players].sort((a, b) => b.score - a.score);
    this.container.innerHTML = `
      <h2>Leaderboard</h2>
      <button id="sort-btn">Sort by Score</button>
      <ol>
        ${sorted
          .map(
            (p, i) =>
              `<li class="${i === 0 ? "gold" : i === 1 ? "silver" : ""}">
                ${p.name} — ${p.score} pts
              </li>`
          )
          .join("")}
      </ol>
      <p>Total players: ${this.players.length}</p>
    `;

    this.container.querySelector("#sort-btn").addEventListener("click", () => {
      this.sortDescending();
    });
  }
}

// Usage
const board = new LeaderBoard(document.getElementById("board"));
board.addPlayer("Alice", 150);
board.addPlayer("Bob", 200);
board.addPlayer("Charlie", 120);
// Sorted: Bob 200, Alice 150, Charlie 120
```

---

## Sources
- JS_LECTURES repo: Delete Keyword, NodeList vs HTML collection, self, Guided, Web-apis folders
- MDN: [delete operator](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/delete)
- MDN: [NodeList](https://developer.mozilla.org/en-US/docs/Web/API/NodeList)
- MDN: [HTMLCollection](https://developer.mozilla.org/en-US/docs/Web/API/HTMLCollection)
- MDN: [globalThis](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/globalThis)
- MDN: [Drag and Drop API](https://developer.mozilla.org/en-US/docs/Web/API/HTML_Drag_and_Drop_API)
- MDN: [FormData](https://developer.mozilla.org/en-US/docs/Web/API/FormData)
- MDN: [Date](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date)
