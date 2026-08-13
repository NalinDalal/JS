# Module 07: Web APIs — DOM, Events, Storage & Observers

---

## 7.1 DOM Manipulation

The **Document Object Model (DOM)** is a tree-structured API that represents an HTML document. JavaScript interacts with the browser through the DOM to read, create, modify, and delete elements and content.

### The DOM Tree: Three Core Node Types

#### Explain It

| Node Type | Description | Example |
|-----------|-------------|---------|
| **Document** | Root node; entry point (`document`) | `document` |
| **Element** | HTML tags | `<div>`, `<p>`, `<span>` |
| **TextNode** | Actual text content inside elements | `"Hello World"` |

Every node is connected in a parent-child hierarchy. A `Document` has `Element` children, and those `Element` nodes can have `TextNode` children.

#### Gotchas / Edge Cases

- Only `Element` nodes support methods like `appendChild` and `addEventListener` — a `TextNode` is not an element.
- `element.children` returns **Element-only** children; `element.childNodes` also includes `TextNode` and comment nodes (whitespace between tags counts!).

---

### Selection Methods

#### Explain It

Selection is how you find elements in the DOM to manipulate.

#### `getElementById(id)`

#### Explain It

Returns a **single element** matching the `id` attribute. Fastest selection method because IDs are unique.

#### Prove It

```js
const header = document.getElementById('main-header');
```

#### `querySelector(selector)`

#### Explain It

Returns the **first element** matching any valid CSS selector. Extremely flexible.

#### Prove It

```js
const firstCard = document.querySelector('.card');
const submitBtn = document.querySelector('#form button[type="submit"]');
```

#### `querySelectorAll(selector)`

#### Explain It

Returns a **static NodeList** of all matching elements. Unlike `getElementsBy*`, this returns a snapshot — not live.

#### Prove It

```js
const allLinks = document.querySelectorAll('a.nav-link');

// Iterate
allLinks.forEach(link => {
  console.log(link.href);
});
```

> **Live vs Static collections:**
> - `getElementsByTagName`, `getElementsByClassName` → **Live** (auto-updates when DOM changes)
> - `querySelectorAll` → **Static** (snapshot at time of call)

#### `closest(selector)`

#### Explain It

Traverses **up** the tree from the element and returns the nearest ancestor (or the element itself) matching the selector. The workhorse of event delegation — identify what was actually clicked.

#### Prove It

```js
const innerSpan = document.querySelector('span.inner');
const section = innerSpan?.closest('section'); // nearest <section> ancestor
```

#### `matches(selector)`

#### Explain It

Checks whether a single element matches a selector — returns a boolean. Useful as a filter predicate.

#### Prove It

```js
const el = document.querySelector('div');
console.log(el.matches('.item')); // true / false
```

#### Gotchas / Edge Cases

- `querySelectorAll` returns a **NodeList** — it has `forEach` but **no** `push`, `pop`, `map` (array methods). Convert with `Array.from(...)` or spread `[...list]` when you need full array API.
- `getElementById` returns `null` when no element matches — guard before touching properties.
- `data-*` attributes become camelCase on `dataset`: `data-user-id` → `dataset.userId`; you can never set a camelCase `data-attribute` and read it via `getAttribute` reliably — use one access style per value.

---

### Element Creation and Cloning

#### `createElement(tagName)` and `createTextNode(text)`

#### Explain It

Create elements and text nodes in memory. They do not appear in the document until appended.

#### Prove It

```js
const div = document.createElement('div');
div.textContent = 'Hello DOM'; // conveniently sets a text node
document.body.appendChild(div);
```

#### `appendChild` vs `append`

#### Explain It

- `appendChild(node)` — one node at a time; **returns** the appended node.
- `append(nodes...)` — multiple nodes **and strings** in one call; returns nothing.

#### Prove It

```js
const p = document.createElement('p');
const span = document.createElement('span');
document.body.appendChild(p);            // one node, returns it
document.body.append(span, ' and text'); // multiple nodes + strings
```

#### `insertAdjacentHTML(position, html)`

#### Explain It

Inserts raw HTML relative to an element without re-creating the element itself. Positions: `"beforebegin"`, `"afterbegin"`, `"beforeend"`, `"afterend"`.

#### Prove It

```js
const list = document.querySelector('ul');
list.insertAdjacentHTML('beforeend', '<li>Inserted</li>');
```

#### `cloneNode(deep)`

#### Explain It

- `cloneNode(false)` — **Shallow clone** (element only, no children)
- `cloneNode(true)` — **Deep clone** (element + all descendants)

#### Prove It

```js
const original = document.querySelector('.card');
const copy = original.cloneNode(true);
```

> ⚠️ `cloneNode` does **not** copy event listeners or properties. You must re-attach them.

#### Gotchas / Edge Cases

- `appendChild` on an element that **already exists in the DOM** *moves* it — it does not duplicate it.
- Cloned nodes have no `id` copy by default? Actually `id` **is** copied — if you clone a node with an `id` and insert both, you now have **duplicate IDs** in the document, which breaks `getElementById`. Clear the `id` on clones.
- `innerHTML` on user input is an **XSS** vector — never interpolate unsanitized strings.

---

### DOM Manipulation Methods

#### Explain It

These methods let you insert, move, replace, or remove nodes.

#### Insert Before a Reference Node

#### Explain It

`insertBefore(newNode, referenceNode)` inserts before a specific child. Pass `referenceNode.firstChild` to prepend.

#### Prove It

```js
const list = document.querySelector('ul');
const newItem = document.createElement('li');
list.insertBefore(newItem, list.firstChild); // become the first item
```

#### Replace and Remove

#### Explain It

- `removeChild(child)` / `replaceChild(newChild, oldChild)` — the older family, called on the **parent**.
- `el.remove()` — the modern API, no parent reference needed.

#### Prove It

```js
const temp = document.getElementById('temp-node');
temp.parentNode.removeChild(temp); // older API
// temp.remove();                  // modern API — works without a parent
```

#### Gotchas / Edge Cases

- Calling `removeChild` with a child that is **not** a child of that parent throws a `DOMException` — check `parentNode` first.
- Removing thousands of nodes one-by-one causes reflow per removal — clear via `element.innerHTML = ''` or `replaceChildren()` for bulk teardown.
- `replaceChildren(...nodes)` (modern) wipes all children and inserts new ones in a single operation.

---

### Attributes

#### Explain It

The `getAttribute` / `setAttribute` pair provides generic access to any attribute — including ARIA and other non-standard attributes that don't have property shortcuts.

#### Reading and Writing Attributes

#### Prove It

```js
const card = document.getElementById('user-card');
card.getAttribute('data-id');            // "42"
card.setAttribute('aria-label', 'User card');
```

#### `dataset` (Custom Data Attributes)

#### Explain It

Custom attributes prefixed with `data-` are accessible via the `dataset` property. The attribute `data-user-id` becomes `dataset.userId` (camelCase).

```html
<div id="user-card" data-user-id="42" data-role="admin">...</div>
```

#### Prove It

```js
const card = document.getElementById('user-card');

card.dataset.userId;   // "42"
card.dataset.role;     // "admin"

// Set a custom attribute
card.dataset.status = 'active';
// Adds: data-status="active"
```

#### Gotchas / Edge Cases

- `dataset` is **camelCase-oriented**: `data-user-name` → `dataset.userName`; when writing you must use camelCase (`dataset.userName = ...`), never `data-*`-form.
- `getAttribute` returns `null` (not `undefined`) for missing attributes; `dataset` returns `undefined`.
- Boolean HTML attributes (`disabled`, `checked`) behave differently: `el.disabled = false` (property) removes it, but `setAttribute('disabled', false)` **keeps it present** (any value, even `"false"`, counts as set).

---

### Class Manipulation

#### Explain It

The `classList` property provides methods to manage CSS classes.

#### Prove It

```js
const el = document.querySelector('.btn');

el.classList.add('active');         // Add class
el.classList.remove('disabled');    // Remove class
el.classList.toggle('visible');     // Toggle: add if absent, remove if present
el.classList.contains('active');    // Check: true/false
el.classList.replace('old', 'new'); // Replace one class with another
```

#### Gotchas / Edge Cases

- `className` works on the whole string — use it only for wholesale replacement (it clobbers existing classes).
- `classList.toggle('x', force)` accepts a second boolean argument for conditional toggling — useful in render logic.
- In SVG/XML documents `className` is an `SVGAnimatedString` object, not a string — use `classList` everywhere for cross-format safety.

---

### Styles

#### Explain It

Two ways to interact with styles: set **inline** styles via the `style` property, or **read** the final rendered values via `getComputedStyle`.

#### Inline Styles (via `style` property)

#### Explain It

Direct manipulation of inline styles. Only affects the `style` attribute.

#### Prove It

```js
el.style.color = 'red';
el.style.fontSize = '24px';        // CSS property is camelCase
el.style.backgroundColor = '#000';
el.style.cssText = 'color: red; margin: 10px'; // override all inline styles at once
```

#### Reading Computed Styles

#### Explain It

`getComputedStyle()` returns the **final computed value** after all CSS rules are applied — not just the inline style.

#### Prove It

```js
const computed = window.getComputedStyle(el);
console.log(computed.color);         // "rgb(255, 0, 0)"
console.log(computed.fontSize);      // "24px"
```

#### Gotchas / Edge Cases

- CSS property names are **camelCase** in JS: `font-size` → `style.fontSize`; `background-color` → `style.backgroundColor`.
- `getComputedStyle` resolves to actual units (`px`, `rgb(...)`) — you can't read `"50%"` back as written.
- Writes to `style` are synchronous but trigger reflow when read back — batch reads away from writes (layout thrashing).

---

### Performance Considerations

#### Explain It

DOM reads and writes are expensive. Batch mutations and minimize reads to avoid **layout thrashing** and unnecessary **reflows**.

#### `DocumentFragment`

#### Explain It

A lightweight container for batching DOM operations. You build up nodes in memory, then append once — avoiding multiple reflows.

#### Prove It

```js
const fragment = document.createDocumentFragment();

for (let i = 0; i < 100; i++) {
  const li = document.createElement('li');
  li.textContent = `Item ${i}`;
  fragment.appendChild(li);
}

document.querySelector('ul').appendChild(fragment); // One reflow
```

#### `innerHTML` vs `textContent` vs `innerText`

#### Explain It

| Method | Description | Security | Performance |
|--------|-------------|----------|-------------|
| `innerHTML` | Gets/sets raw HTML markup | ⚠️ XSS risk | Slower (parses HTML) |
| `textContent` | Gets/sets plain text only | ✅ Safe | Fastest |
| `innerText` | Like `textContent`, but respects CSS visibility | ✅ Safe | Slower (layout-aware) |

> **Rule of thumb:** Use `textContent` for setting text. Never use `innerHTML` with user input unless you sanitize it first.

#### Virtual DOM Concept

#### Explain It

A **Virtual DOM** is a lightweight JavaScript representation of the real DOM. Frameworks like React use it to:
1. Build a new virtual tree on state change
2. Diff it against the previous tree
3. Apply only the minimal necessary updates to the real DOM

This avoids expensive full DOM rebuilds and is the core optimization behind modern UI frameworks. (Deep dive is framework-specific — not covered here.)

#### Gotchas / Edge Cases

- Reading `offsetWidth`, `getBoundingClientRect()` etc. **forces reflow** — reading the same value repeatedly in a loop is the classic layout-thrash pattern. Cache reads in variables, batch writes.
- `innerText` is layout-aware: it returns `""` for `display: none` elements and differs from `textContent` — matching text in rendered vs hidden nodes can surprise you.
- `DocumentFragment` children are *moved* (not copied) when appended — after `appendChild(fragment)`, the fragment is empty.

---

## 7.2 Events

Events are the backbone of interactive web applications. They signal that something has happened — a click, a keypress, a form submission, a page load.

### `addEventListener` / `removeEventListener`

#### Explain It

Attach a function that runs when the named event fires on the element. Always prefer `addEventListener` over `onclick = ...` — it supports multiple listeners, options, and clean removal.

#### Prove It

```js
const btn = document.getElementById('myButton');

function handler(event) {
  console.log('Event type:', event.type);         // "click"
  console.log('Target:', event.target);           // element clicked
  console.log('Current target:', event.currentTarget); // element with the listener
}

btn.addEventListener('click', handler);
// Later: btn.removeEventListener('click', handler);
```

#### Gotchas / Edge Cases

- `removeEventListener` requires the **same function reference** — anonymous functions can never be removed. Keep a named reference, or use `{ once: true }` / `AbortController`.
- Passing the same function twice for the same event/options is a **no-op** — the listener will run once, not twice.

### The Event Object

#### Explain It

When an event fires, the handler receives an **Event object** with useful properties.

#### Prove It

```js
btn.addEventListener('click', function(e) {
  console.log(e.type);          // "click"
  console.log(e.target);        // The element that triggered the event
  console.log(e.currentTarget); // The element the listener is attached to
  console.log(e.timeStamp);     // When the event occurred
});
```

#### `preventDefault()`

#### Explain It

Stops the browser's default behavior for that event (e.g., form submission, link navigation).

#### Prove It

```js
form.addEventListener('submit', function(e) {
  e.preventDefault(); // Don't reload the page
  // Handle form data with JS instead
});
```

#### `stopPropagation()`

#### Explain It

Prevents the event from bubbling up to parent elements.

#### Prove It

```js
innerDiv.addEventListener('click', function(e) {
  e.stopPropagation(); // outerDiv's click handler won't fire
});
```

> **`stopPropagation` vs `stopImmediatePropagation`:**
> - `stopPropagation` — stops event from reaching parent elements
> - `stopImmediatePropagation` — also stops other listeners on the **same element** from firing

#### Gotchas / Edge Cases

- `preventDefault()` does **not** stop propagation, and `stopPropagation()` does **not** stop default behavior — they are independent.
- After `stopImmediatePropagation`, later-registered listeners on the same element are skipped — ordering matters.
- `e.defaultPrevented` is the reliable way to check whether `preventDefault` was called (e.g., in delegated handlers).

### Event Phases

#### Explain It

Events travel through three phases:

```
         ┌─────────────────────────────────┐
         │         CAPTURING PHASE          │
         │   Window → Document → HTML →     │
         │   Body → Parent → ... → Target   │
         └─────────────────────────────────┘
                         │
         ┌─────────────────────────────────┐
         │          TARGET PHASE            │
         │   Event reaches the target       │
         │   element                        │
         └─────────────────────────────────┘
                         │
         ┌─────────────────────────────────┐
         │          BUBBLING PHASE          │
         │   Target → ... → Parent →        │
         │   Body → HTML → Document →       │
         │   Window                         │
         └─────────────────────────────────┘
```

**Capturing:** Event travels from the root **down** to the target.
**Target:** Event reaches the target element.
**Bubbling:** Event travels back **up** from the target to the root.

By default, listeners fire during the **bubbling** phase. To capture during the **capturing** phase, pass `true` as the third argument:

#### Prove It

```js
parent.addEventListener('click', handler, true);  // Capturing phase
parent.addEventListener('click', handler, false); // Bubbling phase (default)
```

#### Gotchas / Edge Cases

- The third argument can be an **options object**: `{ capture: true }` — identical effect, clearer intent.
- **All** bubbling events can be captured, but some events (`focus`, `blur`, `mouseenter`, `mouseleave`, `scroll` on non-document) simply **don't bubble** — `addEventListener('focus', ..., true)` is how you observe them on ancestors.

### Event Delegation

#### Explain It

Instead of attaching a listener to every child element, attach **one listener to a parent** and use `e.target` to identify which child triggered the event. This works because of event bubbling.

#### Prove It

```js
// ❌ Bad: One listener per item
document.querySelectorAll('.list-item').forEach(item => {
  item.addEventListener('click', handleClick);
});

// ✅ Good: One listener on parent
document.querySelector('.list').addEventListener('click', function(e) {
  const item = e.target.closest('.list-item'); // Find nearest matching ancestor
  if (item) {
    handleClick(item);
  }
});
```

**Why event delegation is useful:**
- **Performance:** One listener instead of hundreds
- **Dynamic content:** Works for elements added to the DOM later
- **Memory efficiency:** Less memory consumed by fewer listeners

#### Gotchas / Edge Cases

- With delegation, `e.currentTarget` is the **parent** (listener owner) and `e.target` is the **clicked child** — they differ by design.
- Ignore irrelevant clicks: without the `closest()` guard, clicks on the container itself (or unrelated children) run the handler with no item.
- Delegation only works for **bubbling events** — pointer/mouse/keyboard events bubble; `focus`/`blur` don't (use `focusin`/`focusout`).

### Common Events

#### Explain It

| Event | Fires When |
|-------|-----------|
| `click` | Element is clicked (including mouse button release) |
| `dblclick` | Double-click |
| `input` | Value of `<input>`, `<textarea>`, or `<select>` changes |
| `change` | Value committed (after blur for inputs, on selection for select) |
| `submit` | Form is submitted |
| `keydown` | Key is pressed down |
| `keyup` | Key is released |
| `load` | Page, image, or resource fully loaded |
| `DOMContentLoaded` | HTML parsed, DOM ready (images/styles may still be loading) |
| `focus` | Element gains focus |
| `blur` | Element loses focus |
| `scroll` | Container is scrolled |
| `resize` | Window is resized |
| `mouseenter` / `mouseleave` | Mouse enters/leaves element (no bubbling) |
| `mouseover` / `mouseout` | Like above, but **bubbles** |

#### `DOMContentLoaded` vs `load`

#### Explain It

- `DOMContentLoaded` — HTML parsed, DOM ready to manipulate; images/styles may still load.
- `load` — the page *and all resources* (images, stylesheets, iframes) have finished.

#### Prove It

```js
// Ready to manipulate DOM
document.addEventListener('DOMContentLoaded', init);

// Everything fully loaded
window.addEventListener('load', measureLayout);
```

#### Gotchas / Edge Cases

- `DOMContentLoaded` does **not** wait for stylesheets/images — measuring layout-dependent sizes there gives wrong numbers.
- Scripts without `defer` block `DOMContentLoaded`; `async` scripts don't (they also don't preserve order).
- External stylesheets block `DOMContentLoaded` in modern browsers (they may affect layout) — a common timing gotcha.

### Custom Events

#### Explain It

Create and dispatch your own events using the `CustomEvent` API.

#### Prove It

```js
// Create a custom event
const event = new CustomEvent('userLoggedIn', {
  detail: { username: 'alice', role: 'admin' } // Payload
});

// Listen for it
document.addEventListener('userLoggedIn', function(e) {
  console.log(`Welcome, ${e.detail.username}!`);
});

// Dispatch it
document.dispatchEvent(event);
```

This is useful for decoupling components — one part of your app can dispatch an event, and any number of other parts can listen and react without knowing about each other.

#### Gotchas / Edge Cases

- By default `CustomEvent` has `bubbles: false` — a non-bubbling custom event fired on a child will **never reach** a listener on `document`. Set `bubbles: true` when you want delegation (see `05-events-advanced.js`).
- The payload must go inside `detail` — extra constructor properties are ignored.

### Passive Event Listeners

#### Explain It

A **passive** listener tells the browser that `preventDefault()` will **not** be called. This lets the browser optimize scrolling performance by not waiting for the listener to finish before scrolling.

#### Prove It

```js
// ✅ Passive: browser can scroll immediately
document.addEventListener('touchmove', function(e) {
  // Analytics or UI updates — don't need to prevent scroll
}, { passive: true });

// ❌ Not passive: browser must wait to see if you call preventDefault()
document.addEventListener('touchmove', function(e) {
  e.preventDefault(); // Blocks scrolling
});
```

> Chrome logs a console warning if you add non-passive listeners to scroll-related events, as it hurts performance.

#### Gotchas / Edge Cases

- In a **passive** listener, `preventDefault()` is silently **ignored** (and may warn) — do not mix.
- `touchstart` and `touchmove` on `window`/`document`/`body` are **passive by default** in Chrome since 2017 — calling `preventDefault()` there does nothing; use `{ passive: false }` explicitly if you need to block scroll.

### `once` Option

#### Explain It

The `once` option automatically removes the listener after it fires **one time**.

#### Prove It

```js
button.addEventListener('click', function(e) {
  console.log('This fires only once');
  // No need to manually removeEventListener
}, { once: true });
```

### Event Cleanup with `AbortController`

#### Explain It

One `AbortController` can remove **many** listeners (across multiple elements) with a single `abort()` call — the modern way to clean up without keeping function references.

#### Prove It

```js
const controller = new AbortController();
const { signal } = controller;

el.addEventListener('mouseenter', onHover, { signal });
el.addEventListener('mouseleave', onLeave, { signal });
window.addEventListener('resize', onResize, { signal });

// Later — removes all three at once
controller.abort();
```

#### Gotchas / Edge Cases

- `abort()` removes listeners added with that signal only — listeners added without it stay.
- Calling `abort()` twice is harmless, but a second `addEventListener` with an **already-aborted** signal is ignored.

### Focus Events: `focusin` / `focusout`

#### Explain It

`focus` and `blur` do **not** bubble, so they can't be delegated. Their bubbling equivalents — `focusin` / `focusout` — can.

#### Prove It

```js
document.addEventListener('focusin', (e) => {
  console.log('Input focused:', e.target.id);
});

// Focus/blur don't bubble — use focusin/focusout for delegation
```

#### Gotchas / Edge Cases

- There is no `event.currentTarget` difference here that leaks: inside `focusin` handlers, `e.target` is the focused element.
- Form fields inside shadow DOM fire focus events with the shadow root as target — use `composedPath()` if you need the original element.

---

## 7.3 Web Storage API

The Web Storage API provides key-value storage in the browser. Two interfaces: `localStorage` and `sessionStorage`.

### `localStorage` vs `sessionStorage`

#### Explain It

| Feature | `localStorage` | `sessionStorage` |
|---------|----------------|------------------|
| **Persistence** | Indefinite (until cleared) | Duration of the tab/session |
| **Scope** | Shared across all tabs/windows of same origin | Unique per tab |
| **Survives tab close** | ✅ Yes | ❌ No |
| **Same origin isolation** | ✅ Yes | ✅ Yes |

### API Methods

#### Explain It

Both interfaces share the same synchronous key-value API: `setItem`, `getItem`, `removeItem`, `clear`, `length`, `key(n)`.

#### Prove It

```js
localStorage.setItem('theme', 'dark');
console.log(localStorage.getItem('theme')); // "dark"
console.log(localStorage.length);           // number of keys
console.log(localStorage.key(0));           // first key (insertion order not guaranteed)
localStorage.removeItem('theme');
localStorage.clear();
```

#### The `storage` Event (cross-tab sync)

#### Explain It

When a `localStorage` value changes, a `storage` event fires — **only in other tabs/windows**, not in the tab that made the change. Use it to sync UI across tabs.

#### Prove It

```js
window.addEventListener('storage', (e) => {
  console.log(`Key "${e.key}" changed from "${e.oldValue}" to "${e.newValue}"`);
  console.log('Storage area:', e.storageArea); // localStorage or sessionStorage
});
```

#### Gotchas / Edge Cases

- The event fires only on **other** tabs for `localStorage` (and **never** for `sessionStorage`).
- Setting a key to the **same value** it already holds fires **no** event.

### JSON Serialization for Objects

#### Explain It

Storage only holds **strings**. To store objects and arrays, serialize with `JSON.stringify()` and deserialize with `JSON.parse()`.

#### Prove It

```js
// Store an object
const user = { name: 'Alice', scores: [100, 95, 87] };
localStorage.setItem('user', JSON.stringify(user));

// Retrieve and parse
const stored = JSON.parse(localStorage.getItem('user'));
console.log(stored.name);   // "Alice"
console.log(stored.scores); // [100, 95, 87]
```

> ⚠️ `JSON.parse()` will throw if the stored value is not valid JSON. Wrap it in `try...catch` when reading user-stored data.

#### Gotchas / Edge Cases

- Non-string values are coerced: `localStorage.setItem('n', 5)` stores `"5"` — get back a string, not a number.
- `JSON.stringify` drops `undefined` values, `function`s, and `symbol`s silently; `NaN`/`Infinity` become `null`.

### Limitations

#### Explain It

- **~5 MB** storage per origin (varies by browser)
- **Synchronous API** — blocks the main thread on large data
- **String-only values** — objects require JSON serialization
- **No encryption** — data is stored in plain text
- **No indexing or querying** — use IndexedDB for complex data needs
- **Not available in private/incognito** in some browsers (or with limited quota)

#### Gotchas / Edge Cases

- Exceeding quota throws `QuotaExceededError` — non-blocking until it isn't: wrap `setItem` in `try...catch` (private mode + large data = thrown errors).
- Never store tokens/sensitive data: anything on the same origin (including injected scripts) can read it all.

### Storage Comparison

#### Explain It

| Feature | Cookies | localStorage | sessionStorage | IndexedDB |
|---------|---------|--------------|----------------|-----------|
| **Capacity** | ~4 KB | ~5 MB | ~5 MB | ~50% of disk |
| **Persistence** | Until expiry | Indefinite | Tab session | Indefinite |
| **Server accessible** | ✅ Sent with requests | ❌ Client only | ❌ Client only | ❌ Client only |
| **API** | String-based | Key-value | Key-value | Async, structured |
| **Performance** | Slow (network overhead) | Fast (sync) | Fast (sync) | Fastest (async) |
| **Use case** | Auth tokens, tracking | UI preferences, cached data | Temporary state | Complex data, caching |

#### Cookies in three lines

#### Prove It

```js
document.cookie = "sessionId=abc123; path=/; max-age=3600"; // set (1 hour)
console.log(document.cookie);                               // read all
// Options: domain, path, secure, httpOnly (via server), sameSite, expires/max-age
```

#### Gotchas / Edge Cases

- Cookies are sent to the server with **every request** to their domain — a 4KB memory cap plus network overhead; `httpOnly` cookies are invisible to JS (set by the server only).
- Setting `document.cookie` **appends** rather than replaces the cookie jar — to overwrite, re-set with the same name.
- `sessionStorage` is per **tab**: opening a *duplicate* tab copies it; opening a *new* tab starts empty.

---

## 7.4 Intersection Observer

The **Intersection Observer API** watches when an element enters or exits the viewport (or a specified ancestor). It replaces expensive scroll-event-based visibility detection.

### Creating an Observer

#### Explain It

Create an observer with a callback, then `observe()` any number of elements. The callback receives `entries` — one per observed element — with intersection data.

#### Prove It

```js
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      console.log('Element visible:', entry.target);
      // Load image: entry.target.src = entry.target.dataset.src;
      observer.unobserve(entry.target); // stop observing
    }
  });
}, {
  root: null,         // viewport (default)
  rootMargin: '0px',
  threshold: 0.5,     // 50% visible
});

// Observe elements
document.querySelectorAll('[data-src]').forEach(img => observer.observe(img));
```

#### Options

#### Explain It

| Option | Description | Default |
|--------|-------------|---------|
| `threshold` | Percentage of element visibility to trigger (0 to 1). Can be an array. | `0` |
| `root` | The ancestor element to intersect with | `null` (viewport) |
| `rootMargin` | Margin around the root (CSS-like values) | `"0px"` |

#### The Callback and Entry Object

#### Explain It

Each `IntersectionObserverEntry` carries the intersection state. The callback is async — it runs after paint, not on every scroll frame.

#### `IntersectionObserverEntry` Properties

#### Explain It

| Property | Description |
|----------|-------------|
| `isIntersecting` | `true` if element is visible in the root |
| `intersectionRatio` | How much of the element is visible (0 to 1) |
| `target` | The observed element |
| `rootBounds` | The root's bounding rectangle |
| `boundingClientRect` | The target's bounding rectangle |
| `intersectionRect` | The portion of the target visible in the root |

### Use Cases

#### Lazy Loading Images

#### Prove It

```js
const imageObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const img = entry.target;
      img.src = img.dataset.src;      // swap placeholder → real URL
      imageObserver.unobserve(img);   // done — stop watching
    }
  });
}, { rootMargin: '200px' }); // start loading 200px before the element enters

document.querySelectorAll('img[data-src]').forEach(img => imageObserver.observe(img));
```

#### Infinite Scroll

#### Prove It

```js
const sentinel = document.getElementById('sentinel');
const infiniteObserver = new IntersectionObserver(([entry]) => {
  if (entry.isIntersecting) {
    loadMoreItems();
  }
}, { rootMargin: '200px' }); // trigger 200px before sentinel becomes visible
infiniteObserver.observe(sentinel);
```

#### Scroll Animations & Visibility Tracking

#### Prove It

```js
const adObserver = new IntersectionObserver(([entry]) => {
  if (entry.isIntersecting) {
    console.log('Ad visible — start timer / play animation');
  } else {
    console.log('Ad hidden — stop timer');
  }
}, { threshold: [0, 1] }); // fire at both 0% and 100% visibility
adObserver.observe(document.getElementById('ad-banner'));
```

#### Stopping Observation

#### Explain It

- `observer.unobserve(el)` — stop watching one element (one-shot use cases).
- `observer.disconnect()` — stop watching **all** elements at once.

#### Prove It

```js
observer.unobserve(lazyImage); // after its src is set
// or
observer.disconnect();         // tear everything down
```

#### Gotchas / Edge Cases

- The callback fires **asynchronously**, after layout — never synchronously in the scroll handler. That's the performance win: zero work per scroll frame.
- The callback fires **immediately on `observe()`** with the current state — don't assume it only fires on change.
- `isIntersecting: false` fires with `intersectionRatio: 0`; for `threshold: [0, 1]` you get **two** callbacks per crossing (enter at 0, fully visible at 1).
- Elements with `display: none` never intersect; detached (not-in-DOM) elements produce no entries.
- For one-shot uses (lazy loading) **unobserve** or the callback keeps firing on every revisit of the threshold.

---

## 7.5 Mutation Observer

The **MutationObserver API** watches for changes to the DOM — nodes added or removed, attributes changed, or text modified. It batches changes and delivers them asynchronously in a single callback.

### Creating a Mutation Observer

#### Explain It

Observe a target with options declaring *which* kinds of changes to report. The callback receives an array of `MutationRecord` objects.

#### Prove It

```js
const target = document.getElementById('comments');
const mutationObserver = new MutationObserver((mutations) => {
  mutations.forEach(m => {
    if (m.type === 'childList') {
      console.log('Child added/removed:', m.addedNodes, m.removedNodes);
    }
    if (m.type === 'attributes') {
      console.log('Attribute changed:', m.attributeName);
    }
    if (m.type === 'characterData') {
      console.log('Text changed');
    }
  });
});

mutationObserver.observe(target, {
  childList: true,      // monitor child additions/removals
  subtree: true,        // monitor descendants too
  attributes: true,     // monitor attribute changes
  attributeFilter: ['class', 'style'], // only these attributes
  characterData: true,  // monitor text content
});
```

#### Mutation Types

#### Explain It

| `mutation.type` | Triggered By |
|-----------------|-------------|
| `childList` | Adding or removing child nodes |
| `attributes` | Changing an attribute (class, id, style, etc.) |
| `characterData` | Changing text content of a TextNode |

### Use Cases

#### Explain It

1. Detect script injection (XSS monitoring)
2. React to DOM framework updates (e.g., a widget replaces its markup)
3. Auto-resize textareas as their content grows
4. Detect element removal (e.g., cleanup hooks)

#### Prove It

```js
// Example: monitor for injected <script> tags
const securityObserver = new MutationObserver((mutations) => {
  for (const m of mutations) {
    for (const node of m.addedNodes) {
      if (node.nodeName === 'SCRIPT') {
        console.warn('Script injected!', node.src);
      }
    }
  }
});
securityObserver.observe(document.body, { childList: true, subtree: true });
```

### Disconnecting

#### Explain It

`observer.disconnect()` stops all observations. In SPAs, undisconnected observers are a real leak source — observe and disconnect with component lifecycles.

#### Prove It

```js
mutationObserver.disconnect(); // stop reporting — safe to GC the observer
```

#### Gotchas / Edge Cases

- **Async + batched**: multiple mutations between callback runs arrive in one `MutationRecord[]` — you can't reliably act on "before" DOM state from inside the callback.
- **No infinite recursion**: mutations made inside the callback are queued, not re-triggered synchronously — the old synchronous `Mutation Events` (`DOMNodeInserted` etc.) caused loops and layout thrashing; they are deprecated.
- `characterData` changes need `characterData: true` AND you must observe the **text node** itself (or `subtree: true`); to get old values, set `characterDataOldValue: true` / `attributeOldValue: true`.
- `attributeFilter` + `attributes: true` narrows to specific attributes — without the filter you get *every* attribute change.
- Observing with `subtree: true` also covers **future** descendants, so large subtrees cost more — scope it tightly.

---

## 7.6 Resize Observer

The **ResizeObserver API** reports when an element's size changes — the modern replacement for `window.resize` + measuring loops, and the right tool for responsive components, canvas sizing, and adaptive layouts.

### Creating a Resize Observer

#### Explain It

Observe elements and read their new size from `entry.contentRect`. The callback fires initially (when `observe()` is called) and on every size change.

#### Prove It

```js
const resizeObserver = new ResizeObserver((entries) => {
  for (const entry of entries) {
    const { width, height } = entry.contentRect;
    console.log(`${entry.target.id} resized: ${width}x${height}`);
  }
});

resizeObserver.observe(document.getElementById('resizable-box'));
// Also available: entry.borderBoxSize, entry.devicePixelContentBoxSize
```

### Use Cases

#### Responsive Canvas Sizing

#### Explain It

Keep a `<canvas>`'s backing store in sync with its displayed size — the classic ResizeObserver use case.

#### Prove It

```js
const canvasObserver = new ResizeObserver(([entry]) => {
  const { width, height } = entry.contentRect;
  canvas.width = width;   // backing store (device pixels)
  canvas.height = height; // everything drawn is wiped — re-render here
  render();
});
canvasObserver.observe(canvas);
```

#### Responsive Components

#### Explain It

React to container size (not just viewport) — e.g., switch a card's layout when it narrows.

#### Prove It

```js
const layoutObserver = new ResizeObserver(([entry]) => {
  const narrow = entry.contentRect.width < 400;
  entry.target.classList.toggle('compact', narrow);
});
layoutObserver.observe(document.querySelector('.card'));
```

#### Disconnecting

#### Explain It

`resizeObserver.disconnect()` stops all observations — call it on teardown to avoid stale callbacks.

#### Prove It

```js
resizeObserver.disconnect();
```

#### Gotchas / Edge Cases

- **Resize loops**: changing the observed element's size *inside* its own callback triggers the callback again → infinite loop / jank. Guard with a size threshold check before writing.
- The callback fires **once per layout frame**, coalesced — do heavy work batched (e.g., via `requestAnimationFrame`) to avoid layout thrash.
- `contentRect` is the **content box only** — borders/padding excluded; use `borderBoxSize` when you need the full border-box.
- The callback also fires for the **initial** size right after `observe()` — assume it'll run even without any resize.

---

## 7.7 Geolocation API

The **Geolocation API** (`navigator.geolocation`) provides the device's location. It requires a **secure context** (HTTPS — `http://localhost` is exempt) and explicit user permission.

### Getting Current Position

#### Explain It

`getCurrentPosition` fires once: a success callback with a `Position`, or an error callback with an error code.

#### Prove It

```js
if ('geolocation' in navigator) {
  navigator.geolocation.getCurrentPosition(
    (position) => {
      console.log('Latitude:', position.coords.latitude);
      console.log('Longitude:', position.coords.longitude);
      console.log('Accuracy:', position.coords.accuracy, 'meters');
      console.log('Timestamp:', position.timestamp);
    },
    (error) => {
      // error.code: 1=PERMISSION_DENIED, 2=POSITION_UNAVAILABLE, 3=TIMEOUT
      console.error('Geolocation error:', error.message);
    },
    {
      enableHighAccuracy: true, // GPS — drains battery
      timeout: 5000,            // ms before error 3
      maximumAge: 60000,        // allow cached positions up to 60s old
    }
  );
} else {
  console.log('Geolocation not supported');
}
```

### Watching Position

#### Explain It

Continuously track the user's position as it changes.

#### Prove It

```js
const watchId = navigator.geolocation.watchPosition(
  (position) => {
    console.log(`Moved to: ${position.coords.latitude}, ${position.coords.longitude}`);
  },
  (error) => console.error(error),
  { enableHighAccuracy: true }
);

// Stop watching
navigator.geolocation.clearWatch(watchId);
```

### Position Coordinates

#### Explain It

| Property | Description |
|----------|-------------|
| `latitude` | Latitude in decimal degrees |
| `longitude` | Longitude in decimal degrees |
| `altitude` | Height above sea level (meters, if available) |
| `accuracy` | Accuracy of latitude/longitude (meters) |
| `altitudeAccuracy` | Accuracy of altitude (meters) |
| `heading` | Direction of travel (degrees, 0 = north) |
| `speed` | Speed in meters per second |

#### Gotchas / Edge Cases

- **User gesture not required** for geolocation, but a permission **prompt** always appears first; once **denied**, the browser won't re-prompt (user must change it in browser settings) — detect denial via `error.code === 1`.
- `enableHighAccuracy: true` uses GPS — slower fixes and more battery; use it only when precision matters.
- Always **`clearWatch`** — each `watchPosition` id accumulates callbacks.
- In sandboxed iframes, geolocation is blocked by the **Permissions Policy** unless the embedder opts in (`allow="geolocation"`).
- `accuracy` matters: a fix can be kilometers off (Wi-Fi-based) — validate before acting on coordinates.

---

## 7.8 Notification API

The **Notification API** lets web applications send system-level notifications to users.

### Requesting Permission

#### Explain It

Notifications require explicit permission, requested via a promise. Must be called from a **user gesture** (click/tap handler) in Chrome and Firefox.

#### Prove It

```js
if ('Notification' in window) {
  Notification.requestPermission().then(perm => {
    if (perm === 'granted') {
      console.log('Notifications allowed');
    }
  });
}
```

### Sending a Notification

#### Explain It

Once granted, `new Notification(title, options)` shows a system notification.

#### Prove It

```js
new Notification('Hello!', {
  body: 'This is a notification',
  icon: '/icon.png',
  tag: 'unique-tag', // replaces an existing notification with the same tag
  vibrate: [200, 100, 200],
});
```

#### Notification Options

#### Explain It

| Option | Description |
|--------|-------------|
| `body` | Body text of the notification |
| `icon` | Image URL for the notification |
| `badge` | Small badge image (for mobile) |
| `vibrate` | Vibration pattern (array of ms) |
| `tag` | ID to group/replace notifications |
| `requireInteraction` | Stay visible until user interacts |
| `silent` | Suppress sound/vibration |

### Checking Permission Status

#### Explain It

`Notification.permission` reflects the current state: `"default"` (never asked), `"granted"`, or `"denied"`.

#### Prove It

```js
console.log(Notification.permission); // "default" | "granted" | "denied"

if (Notification.permission === 'granted') {
  new Notification('Already allowed');
}
```

### Handling Notification Clicks

#### Explain It

For foreground clicks, listen on `notificationclick`; for background (service worker) notifications, handle it in the worker and open the app.

#### Prove It

```js
navigator.serviceWorker?.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event.notification);
  event.notification.close();
  event.waitUntil(clients.openWindow('/'));
});
```

#### Gotchas / Edge Cases

- `requestPermission()` **must be called from a user gesture** in Chrome; calling it on page load is silently ignored.
- Once `permission` is `"denied"`, `requestPermission()` resolves with `"denied"` — no second prompt. Recover via a settings link (`notification settings` for the origin).
- `tag` replaces a **visible** notification with the same tag; different tags stack — mind the notification wall.
- `vibrate`/`icon` are ignored on desktop (Windows/Linux); `icon` URLs must be HTTPS (mixed content is blocked).
- Notification support varies: Safari requires macOS 10.14+ / iOS 16.4+, some browsers support page notifications but not worker ones.

---

## 7.9 File and Blob API

The **File and Blob APIs** handle binary data — reading user-selected files, previewing uploads, and generating client-side downloads.

### Blob — Binary Large Object

#### Explain It

A `Blob` is an immutable, raw data object. Think of it as a file-like container for binary or text data.

#### Prove It

```js
// Create a Blob from strings
const textBlob = new Blob(['Hello, world!'], { type: 'text/plain' });
console.log(textBlob.size);   // 13
console.log(textBlob.type);   // "text/plain"

// Create from typed arrays (binary data)
const uint8 = new Uint8Array([72, 101, 108, 108, 111]); // "Hello"
const binBlob = new Blob([uint8], { type: 'application/octet-stream' });

// Slice a Blob (useful for chunked uploads)
const chunk = textBlob.slice(0, 5, 'text/plain'); // "Hello"
```

### Blob as URL

#### Explain It

`URL.createObjectURL(blob)` creates a temporary URL (`blob:`) that can be used as a `src` for `<img>`, `<video>`, `<a download>`, etc.

#### Prove It

```js
const input = document.querySelector('input[type="file"]');
input.addEventListener('change', () => {
  const file = input.files[0];
  const img = document.createElement('img');
  img.src = URL.createObjectURL(file);
  document.body.appendChild(img);

  // Release memory when done
  img.onload = () => URL.revokeObjectURL(img.src);
});
```

#### Gotchas / Edge Cases

- `blob:` URLs hold the blob in **memory** until revoked — unreclaimed previews are a classic leak. Always `revokeObjectURL` when done (in `onload`, or on element removal).
- A revoked URL can't be re-used; a revoked image keeps rendering **only** if it already loaded.

### File — a Blob with metadata

#### Explain It

`File` extends `Blob` and adds `name`, `lastModified`, and `webkitRelativePath`.

#### Prove It

```js
input.addEventListener('change', (e) => {
  const file = e.target.files[0];
  console.log(file.name);         // "photo.jpg"
  console.log(file.size);         // 102400 (bytes)
  console.log(file.type);         // "image/jpeg"
  console.log(file.lastModified); // timestamp (ms)
});
```

### FileReader — Read file contents

#### Explain It

`FileReader` reads a `File` or `Blob` into memory as text, Data URL, ArrayBuffer, or binary string.

#### Prove It

```js
const reader = new FileReader();

// One reader, one method — mixing reads aborts the previous one
reader.readAsText(file); // CSV, JSON, TXT...
reader.onload = () => console.log(reader.result); // string content

// Read as Data URL (base64 — for images)
// reader.readAsDataURL(file);
// reader.onload = () => img.src = reader.result;

// Read as ArrayBuffer (binary processing)
// reader.readAsArrayBuffer(file);
// reader.onload = () => {
//   const view = new Uint8Array(reader.result);
// };

// Event handlers
reader.onprogress = (e) => console.log(`${e.loaded}/${e.total} bytes`);
reader.onerror = () => console.error(reader.error);
```

#### Gotchas / Edge Cases

- `FileReader` is **async** — `reader.result` is `null` until `onload` fires; reading it synchronously after `readAsText` is the #1 beginner bug.
- Calling a second `readAs*` method **aborts** the first read in progress.
- For modern code, `file.text()`, `file.arrayBuffer()`, and `file.stream()` are promise-based alternatives.

### Drag and Drop with File API

#### Explain It

`drop` events expose `e.dataTransfer.files` — a `FileList` of dropped files.

#### Prove It

```js
const dropZone = document.getElementById('drop-zone');

dropZone.addEventListener('dragover', (e) => e.preventDefault());
dropZone.addEventListener('drop', (e) => {
  e.preventDefault();
  const files = e.dataTransfer.files; // FileList
  Array.from(files).forEach(processFile);
});
```

### FormData with Files

#### Explain It

`FormData` serializes files for `fetch` uploads — `multipart/form-data` is set automatically.

#### Prove It

```js
const fd = new FormData();
fd.append('avatar', fileInput.files[0]);
fetch('/upload', { method: 'POST', body: fd }); // Content-Type set automatically
```

### Blob as Download

#### Explain It

Generate a client-side file download: a Blob → object URL → anchor click.

#### Prove It

```js
function downloadJSON(data, filename = 'data.json') {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

downloadJSON({ hello: 'world' });
```

### Performance & Limits

#### Explain It

- **Blob URLs** (`blob:`) are per-origin and memory-scoped — revoke with `revokeObjectURL()` to avoid leaks
- **FileReader** is async and non-blocking — use `readAsArrayBuffer` for large files over streaming
- **Streaming** alternative: `file.stream()` returns a `ReadableStream` (modern browsers)
- **Max file size** depends on browser/memory — reading a 2GB file into a single ArrayBuffer may fail
- **File type** is determined by extension/magic bytes, not by content inspection (can be spoofed)

#### Gotchas / Edge Cases

- `FileList` (from `input.files` / `dataTransfer.files`) is **not an Array** — no `.map`/`.forEach`; convert with `Array.from(files)` before iterating.
- Re-selecting the **same file** in an `<input type="file">` fires **no** `change` event — reset `input.value = ''` between selections.
- `File.type` is taken from the OS/MIME mapping, **not** content inspection — server-side validation is still mandatory.
- Drag-and-drop needs `dragover`'s `preventDefault()` or the browser navigates to the file instead of dropping.
- `input.files[0]` is the first of possibly many files — iterate with a loop for multi-file inputs.

---

## Interview Questions

### Q1: What is Event Delegation and why is it useful?

#### Explain It

**Answer:**

Event delegation is a technique where you attach a **single event listener** to a parent element instead of attaching individual listeners to multiple child elements. It leverages **event bubbling** — when an event fires on a child, it bubbles up to the parent where the listener is attached. You use `e.target` to identify which child actually triggered the event.

**Why it's useful:**
- **Performance:** One listener instead of N listeners reduces memory consumption
- **Dynamic content:** Works for elements added to the DOM **after** the listener is attached (no need to re-attach)
- **Simpler code:** Less setup and teardown, fewer memory leaks

**Example:**
#### Prove It

```js
document.querySelector('#list').addEventListener('click', (e) => {
  const item = e.target.closest('.list-item');
  if (item) handleItemClick(item);
});
```

---

### Q2: What are the limitations of localStorage?

#### Explain It

**Answer:**

- **~5 MB limit** per origin (varies by browser)
- **Synchronous API** — `setItem`/`getItem` block the main thread, which can cause jank with large data
- **String-only storage** — objects must be serialized with `JSON.stringify()` and deserialized with `JSON.parse()`
- **No encryption** — data stored in plain text, visible to any script on the same origin (XSS risk)
- **No indexing or querying** — can only get/set by key, no range queries (use IndexedDB for that)
- **Same-origin restriction** — data is isolated per protocol + domain + port
- **Not available in some private browsing modes** or with reduced quota
- **No automatic expiration** — data persists until explicitly cleared (unlike cookies)

---

### Q3: When should you use IntersectionObserver?

#### Explain It

**Answer:**

Use `IntersectionObserver` when you need to detect **when an element enters or exits the viewport** (or another scrollable container). It's the performant, modern alternative to scroll-event-based visibility detection.

**Common use cases:**
- **Lazy loading** images, videos, or components — load only when near the viewport
- **Infinite scroll** — detect when the user scrolls near the bottom to load more content
- **Scroll animations** — trigger CSS animations when elements scroll into view
- **Ad visibility tracking** — report when an ad is actually visible to the user
- **Analytics** — track which sections of a page users actually see

**Why over scroll events:**
- **No performance cost** — observer runs asynchronously, not on every scroll frame
- **Built-in threshold control** — specify exact visibility percentage to trigger
- **No manual calculation** — no need to compute element position relative to viewport

---

### Q4: What is the difference between `target` and `currentTarget` on the event object?

#### Explain It

**Answer:**

- **`e.target`** — The element that **originally triggered** the event (the deepest element in the DOM tree that was interacted with)
- **`e.currentTarget`** — The element that the event listener is **attached to** (the element receiving the event in its handler)

**Example:**
```html
<div id="parent">
  <button id="child">Click me</button>
</div>

<script>
  document.getElementById('parent').addEventListener('click', (e) => {
    console.log(e.target);          // <button id="child"> (what was clicked)
    console.log(e.currentTarget);   // <div id="parent"> (where listener is)
  });
</script>
```

When the listener is on the element itself (no delegation), `target === currentTarget`. They differ when using event delegation on a parent.

---

### Q5: What is the difference between `DOMContentLoaded` and `load` events?

#### Explain It

**Answer:**

| Event | Fires When |
|-------|-----------|
| `DOMContentLoaded` | The HTML document has been **fully parsed** — DOM is ready. Stylesheets, images, and subframes may still be loading. |
| `load` | The page and **all its resources** (images, stylesheets, scripts, iframes) have finished loading. |

**When to use which:**
- `DOMContentLoaded` — when you need to interact with DOM elements and don't need to wait for images/styles (most common)
- `load` — when you need to measure element dimensions that depend on loaded images, or access fully loaded resources

#### Prove It

```js
// Ready to manipulate DOM
document.addEventListener('DOMContentLoaded', init);

// Everything fully loaded
window.addEventListener('load', measureLayout);
```

---

### Q6: How does the Mutation Observer differ from Mutation Events?

#### Explain It

**Answer:**

| Feature | Mutation Events (deprecated) | Mutation Observer |
|---------|------------------------------|-------------------|
| **Firing** | Synchronous, fires on every change | Asynchronous, batches changes |
| **Performance** | Causes layout thrashing | Queued and delivered as a batch |
| **Nested mutations** | Can cause infinite loops | Prevents recursive observations |
| **API** | `DOMNodeInserted`, `DOMSubtreeModified`, etc. | Single `MutationObserver` with options |

Mutation Observers are the modern, performant replacement. They collect all changes and deliver them as a single callback with an array of `MutationRecord` objects.

---

### Q7: Explain the event capturing and bubbling phases.

#### Explain It

**Answer:**

When an event occurs on an element, it travels through three phases:

1. **Capturing phase (top → target):** The event travels from the `Window` down through ancestors to the target. Listeners registered with `useCapture: true` fire during this phase.

2. **Target phase:** The event reaches the target element. Listeners on the target fire here (regardless of capture flag).

3. **Bubbling phase (target → top):** The event travels back up through ancestors to `Window`. Listeners with `useCapture: false` (the default) fire during this phase.

#### Prove It

```js
// Capturing: fires during top-down phase
parent.addEventListener('click', handler, true);

// Bubbling: fires during bottom-up phase (default)
parent.addEventListener('click', handler, false);
```

Understanding this is essential for event delegation and knowing when `stopPropagation` takes effect.

---

## Sources

- [MDN Web APIs](https://developer.mozilla.org/en-US/docs/Web/API)
- [MDN DOM Guide](https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model)
- [MDN Fetch API Guide](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)
- [MDN Web Storage API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API)
- [MDN Intersection Observer API](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API)
- [MDN Mutation Observer](https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver)
- [MDN Resize Observer](https://developer.mozilla.org/en-US/docs/Web/API/ResizeObserver)
- [MDN Geolocation API](https://developer.mozilla.org/en-US/docs/Web/API/Geolocation_API)
- [MDN Notification API](https://developer.mozilla.org/en-US/docs/Web/API/Notifications_API)

---

## Question Bank

Say each answer out loud, then verify with the code file:

```
node 12-interview-questions.js
```