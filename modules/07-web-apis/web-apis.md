# Module 07: Web APIs — DOM, Events, Storage & Observers

---

## 7.1 DOM Manipulation

The **Document Object Model (DOM)** is a tree-structured API that represents an HTML document. JavaScript interacts with the browser through the DOM to read, create, modify, and delete elements and content.

### The DOM Tree: Three Core Node Types

| Node Type | Description | Example |
|-----------|-------------|---------|
| **Document** | Root node; entry point (`document`) | `document` |
| **Element** | HTML tags | `<div>`, `<p>`, `<span>` |
| **TextNode** | Actual text content inside elements | `"Hello World"` |

Every node is connected in a parent-child hierarchy. A `Document` has `Element` children, and those `Element` nodes can have `TextNode` children.

---

### Selection Methods

Selection is how you find elements in the DOM to manipulate.

#### `getElementById(id)`

Returns a **single element** matching the `id` attribute. Fastest selection method because IDs are unique.

```js
const header = document.getElementById('main-header');
```

#### `querySelector(selector)`

Returns the **first element** matching any valid CSS selector. Extremely flexible.

```js
const firstCard = document.querySelector('.card');
const submitBtn = document.querySelector('#form button[type="submit"]');
```

#### `querySelectorAll(selector)`

Returns a **static NodeList** of all matching elements. Unlike `getElementsBy*`, this returns a snapshot — not live.

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

---

### Element Creation and Cloning

#### `createElement(tagName)` and `createTextNode(text)`

```js
const div = document.createElement('div');
div.classList.add('card');

const text = document.createTextNode('Hello World');
div.appendChild(text);
```

#### `cloneNode(deep)`

- `cloneNode(false)` — **Shallow clone** (element only, no children)
- `cloneNode(true)` — **Deep clone** (element + all descendants)

```js
const original = document.querySelector('.card');
const copy = original.cloneNode(true);
```

> ⚠️ `cloneNode` does **not** copy event listeners or properties. You must re-attach them.

---

### DOM Manipulation Methods

These methods let you insert, move, replace, or remove nodes.

#### Appending and Prepending

```js
const parent = document.querySelector('.list');
const newItem = document.createElement('li');
newItem.textContent = 'Item 4';

parent.appendChild(newItem);    // Add to end of children
parent.prepend(newItem);         // Add to start of children
```

#### Insert Before a Reference Node

```js
const list = document.querySelector('.list');
const reference = list.children[1];  // Second child

const newItem = document.createElement('li');
newItem.textContent = 'Inserted Item';

list.insertBefore(newItem, reference); // Insert before second child
```

#### Replace and Remove

```js
// Replace a child with new node
const oldChild = list.children[0];
const newChild = document.createElement('li');
newChild.textContent = 'Replacement';
list.replaceChild(newChild, oldChild);

// Remove a child
list.removeChild(newChild);

// Modern removal
newChild.remove();  // Direct removal from any node
```

---

### Attributes

#### Reading and Writing Attributes

```js
const img = document.querySelector('img');

img.getAttribute('src');          // Read
img.setAttribute('src', 'new.jpg'); // Write
img.removeAttribute('alt');       // Delete

// Check if attribute exists
img.hasAttribute('loading');      // true or false
```

#### `dataset` (Custom Data Attributes)

Custom attributes prefixed with `data-` are accessible via the `dataset` property. The attribute `data-user-id` becomes `dataset.userId` (camelCase).

```html
<div id="user-card" data-user-id="42" data-role="admin">...</div>
```

```js
const card = document.getElementById('user-card');

card.dataset.userId;   // "42"
card.dataset.role;     // "admin"

// Set a custom attribute
card.dataset.status = 'active';
// Adds: data-status="active"
```

---

### Class Manipulation

The `classList` property provides methods to manage CSS classes.

```js
const el = document.querySelector('.btn');

el.classList.add('active');         // Add class
el.classList.remove('disabled');    // Remove class
el.classList.toggle('visible');     // Toggle: add if absent, remove if present
el.classList.contains('active');    // Check: true/false
el.classList.replace('old', 'new'); // Replace one class with another
```

---

### Styles

#### Inline Styles (via `style` property)

Direct manipulation of inline styles. Only affects the `style` attribute.

```js
el.style.color = 'red';
el.style.fontSize = '24px';        // CSS property is camelCase
el.style.backgroundColor = '#000';
```

#### Reading Computed Styles

`getComputedStyle()` returns the **final computed value** after all CSS rules are applied — not just the inline style.

```js
const computed = window.getComputedStyle(el);
console.log(computed.color);         // "rgb(255, 0, 0)"
console.log(computed.fontSize);      // "24px"
```

---

### Performance Considerations

#### `DocumentFragment`

A lightweight container for batching DOM operations. You build up nodes in memory, then append once — avoiding multiple reflows.

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

| Method | Description | Security | Performance |
|--------|-------------|----------|-------------|
| `innerHTML` | Gets/sets raw HTML markup | ⚠️ XSS risk | Slower (parses HTML) |
| `textContent` | Gets/sets plain text only | ✅ Safe | Fastest |
| `innerText` | Like `textContent`, but respects CSS visibility | ✅ Safe | Slower (layout-aware) |

> **Rule of thumb:** Use `textContent` for setting text. Never use `innerHTML` with user input unless you sanitize it first.

#### Virtual DOM Concept

A **Virtual DOM** is a lightweight JavaScript representation of the real DOM. Frameworks like React use it to:
1. Build a new virtual tree on state change
2. Diff it against the previous tree
3. Apply only the minimal necessary updates to the real DOM

This avoids expensive full DOM rebuilds and is the core optimization behind modern UI frameworks. (Deep dive is framework-specific — not covered here.)

---

## 7.2 Events

Events are the backbone of interactive web applications. They signal that something has happened — a click, a keypress, a form submission, a page load.

---

### `addEventListener` / `removeEventListener`

```js
function handleClick(e) {
  console.log('Button clicked!');
}

const btn = document.querySelector('#submit');

btn.addEventListener('click', handleClick);  // Attach
btn.removeEventListener('click', handleClick); // Detach (must pass same function reference)
```

> ⚠️ You **cannot** remove anonymous functions or inline arrow functions because you don't have a reference to pass to `removeEventListener`.

```js
// ❌ This won't work for removal
btn.addEventListener('click', () => console.log('hi'));
// No way to reference the anonymous function to remove it

// ✅ This works
function handler() { console.log('hi'); }
btn.addEventListener('click', handler);
btn.removeEventListener('click', handler);
```

---

### The Event Object

When an event fires, the handler receives an **Event object** with useful properties.

```js
btn.addEventListener('click', function(e) {
  console.log(e.type);          // "click"
  console.log(e.target);        // The element that triggered the event
  console.log(e.currentTarget); // The element the listener is attached to
  console.log(e.timeStamp);     // When the event occurred
});
```

#### `preventDefault()`

Stops the browser's default behavior for that event (e.g., form submission, link navigation).

```js
form.addEventListener('submit', function(e) {
  e.preventDefault(); // Don't reload the page
  // Handle form data with JS instead
});
```

#### `stopPropagation()`

Prevents the event from bubbling up to parent elements.

```js
innerDiv.addEventListener('click', function(e) {
  e.stopPropagation(); // outerDiv's click handler won't fire
});
```

> **`stopPropagation` vs `stopImmediatePropagation`:**
> - `stopPropagation` — stops event from reaching parent elements
> - `stopImmediatePropagation` — also stops other listeners on the **same element** from firing

---

### Event Phases

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

```js
parent.addEventListener('click', handler, true);  // Capturing phase
parent.addEventListener('click', handler, false); // Bubbling phase (default)
```

---

### Event Delegation

Instead of attaching a listener to every child element, attach **one listener to a parent** and use `e.target` to identify which child triggered the event. This works because of event bubbling.

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

---

### Common Events

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

```js
// Fires when HTML is fully parsed — no need to wait for images, CSS, etc.
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM is ready');
});

// Fires when ALL resources (images, stylesheets, iframes) are loaded
window.addEventListener('load', () => {
  console.log('Page fully loaded');
});
```

> **Best practice:** Put scripts at the end of `<body>` or use `defer` to avoid needing `DOMContentLoaded`.

---

### Custom Events

Create and dispatch your own events using the `CustomEvent` API.

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

---

### Passive Event Listeners

A **passive** listener tells the browser that `preventDefault()` will **not** be called. This lets the browser optimize scrolling performance by not waiting for the listener to finish before scrolling.

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

---

### `once` Option

The `once` option automatically removes the listener after it fires **one time**.

```js
button.addEventListener('click', function(e) {
  console.log('This fires only once');
  // No need to manually removeEventListener
}, { once: true });
```

---

## 7.3 Web Storage API

The Web Storage API provides key-value storage in the browser. Two interfaces: `localStorage` and `sessionStorage`.

---

### `localStorage` vs `sessionStorage`

| Feature | `localStorage` | `sessionStorage` |
|---------|----------------|------------------|
| **Persistence** | Indefinite (until cleared) | Duration of the tab/session |
| **Scope** | Shared across all tabs/windows of same origin | Unique per tab |
| **Survives tab close** | ✅ Yes | ❌ No |
| **Same origin isolation** | ✅ Yes | ✅ Yes |

---

### API Methods

```js
// Store data
localStorage.setItem('username', 'alice');
localStorage.setItem('preferences', JSON.stringify({ theme: 'dark', lang: 'en' }));

// Retrieve data
const username = localStorage.getItem('username');    // "alice"
const prefs = JSON.parse(localStorage.getItem('preferences')); // { theme: 'dark', lang: 'en' }

// Remove a specific key
localStorage.removeItem('username');

// Remove all data
localStorage.clear();

// Get the key at a specific index
localStorage.key(0); // First key name

// Number of items
localStorage.length; // 1
```

---

### JSON Serialization for Objects

Storage only holds **strings**. To store objects and arrays, serialize with `JSON.stringify()` and deserialize with `JSON.parse()`.

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

---

### Limitations

- **~5 MB** storage per origin (varies by browser)
- **Synchronous API** — blocks the main thread on large data
- **String-only values** — objects require JSON serialization
- **No encryption** — data is stored in plain text
- **No indexing or querying** — use IndexedDB for complex data needs
- **Not available in private/incognito** in some browsers (or with limited quota)

---

### Storage Comparison

| Feature | Cookies | localStorage | sessionStorage | IndexedDB |
|---------|---------|--------------|----------------|-----------|
| **Capacity** | ~4 KB | ~5 MB | ~5 MB | ~50% of disk |
| **Persistence** | Until expiry | Indefinite | Tab session | Indefinite |
| **Server accessible** | ✅ Sent with requests | ❌ Client only | ❌ Client only | ❌ Client only |
| **API** | String-based | Key-value | Key-value | Async, structured |
| **Performance** | Slow (network overhead) | Fast (sync) | Fast (sync) | Fastest (async) |
| **Use case** | Auth tokens, tracking | UI preferences, cached data | Temporary state | Complex data, caching |

---

## 7.4 Intersection Observer

The **Intersection Observer API** watches when an element enters or exits the viewport (or a specified ancestor). It replaces expensive scroll-event-based visibility detection.

---

### Creating an Observer

```js
const observer = new IntersectionObserver(callback, {
  threshold: 0.5,       // Trigger when 50% visible
  root: null,           // null = viewport
  rootMargin: '0px'     // Margin around root
});
```

#### Options

| Option | Description | Default |
|--------|-------------|---------|
| `threshold` | Percentage of element visibility to trigger (0 to 1). Can be an array. | `0` |
| `root` | The ancestor element to intersect with | `null` (viewport) |
| `rootMargin` | Margin around the root (CSS-like values) | `"0px"` |

---

### The Callback and Entry Object

```js
function callback(entries, observer) {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      console.log('Element is visible', entry.target);
      entry.target.classList.add('visible');
    } else {
      console.log('Element is hidden');
      entry.target.classList.remove('visible');
    }
  });
}
```

#### `IntersectionObserverEntry` Properties

| Property | Description |
|----------|-------------|
| `isIntersecting` | `true` if element is visible in the root |
| `intersectionRatio` | How much of the element is visible (0 to 1) |
| `target` | The observed element |
| `rootBounds` | The root's bounding rectangle |
| `boundingClientRect` | The target's bounding rectangle |
| `intersectionRect` | The portion of the target visible in the root |

---

### Use Cases

#### Lazy Loading Images

```js
const images = document.querySelectorAll('img[data-src]');
const imageObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const img = entry.target;
      img.src = img.dataset.src;   // Load the actual image
      img.removeAttribute('data-src');
      imageObserver.unobserve(img); // Stop observing once loaded
    }
  });
}, { rootMargin: '200px' }); // Start loading 200px before visible

images.forEach(img => imageObserver.observe(img));
```

#### Infinite Scroll

```js
const sentinel = document.querySelector('#sentinel');

const scrollObserver = new IntersectionObserver((entries) => {
  if (entries[0].isIntersecting) {
    loadMorePosts(); // Fetch and append next page of content
  }
}, { rootMargin: '400px' }); // Trigger 400px before reaching bottom

scrollObserver.observe(sentinel);
```

#### Scroll Animations

```js
const animateElements = document.querySelectorAll('.animate-on-scroll');

const animObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('fade-in');
      animObserver.unobserve(entry.target); // Animate once
    }
  });
}, { threshold: 0.2 });

animateElements.forEach(el => animObserver.observe(el));
```

---

### Stopping Observation

```js
observer.unobserve(element);  // Stop observing a specific element
observer.disconnect();        // Stop observing ALL elements
```

---

## 7.5 Mutation Observer

The **Mutation Observer API** watches for changes to the DOM tree — child additions/removals, attribute changes, and text content changes. Replaces the deprecated Mutation Events.

---

### Creating a Mutation Observer

```js
const observer = new MutationObserver((mutations) => {
  mutations.forEach(mutation => {
    console.log(mutation.type);            // "childList", "attributes", or "characterData"
    console.log(mutation.addedNodes);      // NodeList of added nodes
    console.log(mutation.removedNodes);    // NodeList of removed nodes
    console.log(mutation.attributeName);   // Name of changed attribute
  });
});

// Start observing
observer.observe(targetNode, {
  childList: true,      // Watch for added/removed children
  attributes: true,     // Watch for attribute changes
  subtree: true,        // Watch the entire subtree, not just direct children
  characterData: true   // Watch for text content changes
});
```

---

### Mutation Types

| `mutation.type` | Triggered By |
|-----------------|-------------|
| `childList` | Adding or removing child nodes |
| `attributes` | Changing an attribute (class, id, style, etc.) |
| `characterData` | Changing text content of a TextNode |

---

### Use Cases

#### Reactive UI Updates

```js
const listContainer = document.querySelector('#dynamic-list');

const listObserver = new MutationObserver((mutations) => {
  mutations.forEach(mutation => {
    if (mutation.addedNodes.length) {
      console.log(`${mutation.addedNodes.length} item(s) added`);
      updateItemCount();
    }
    if (mutation.removedNodes.length) {
      console.log(`${mutation.removedNodes.length} item(s) removed`);
      updateItemCount();
    }
  });
});

listObserver.observe(listContainer, { childList: true, subtree: true });
```

#### Monitoring Third-Party Widget Changes

```js
const adContainer = document.querySelector('#ad-slot');
const adObserver = new MutationObserver(() => {
  console.log('Ad content changed — re-measure layout');
});
adObserver.observe(adContainer, { childList: true, subtree: true, characterData: true });
```

---

### Disconnecting

```js
observer.disconnect(); // Stop watching
```

---

## 7.6 Resize Observer

The **Resize Observer API** watches for changes to an element's dimensions. Useful for responsive components that need to react to size changes.

---

### Creating a Resize Observer

```js
const observer = new ResizeObserver((entries) => {
  for (const entry of entries) {
    const { width, height } = entry.contentRect;
    console.log(`Size: ${width}x${height}`);
  }
});

const element = document.querySelector('.resizable-box');
observer.observe(element);
```

---

### Use Cases

#### Responsive Canvas Sizing

```js
const canvas = document.querySelector('#myCanvas');
const ctx = canvas.getContext('2d');

const resizeObserver = new ResizeObserver((entries) => {
  for (const entry of entries) {
    canvas.width = entry.contentRect.width;
    canvas.height = entry.contentRect.height;
    draw(); // Redraw at new size
  }
});

resizeObserver.observe(canvas.parentElement);
```

#### Responsive Components

```js
const sidebar = document.querySelector('.sidebar');
const mainContent = document.querySelector('.main-content');

const sidebarObserver = new ResizeObserver((entries) => {
  const sidebarWidth = entries[0].contentRect.width;
  mainContent.style.marginLeft = `${sidebarWidth}px`;
});

sidebarObserver.observe(sidebar);
```

---

### Disconnecting

```js
observer.disconnect(); // Stop observing all elements
```

---

## 7.7 Geolocation API

The **Geolocation API** provides the user's geographic position. Requires user permission.

---

### Getting Current Position

```js
navigator.geolocation.getCurrentPosition(
  (position) => {
    console.log(position.coords.latitude);   // Latitude in degrees
    console.log(position.coords.longitude);  // Longitude in degrees
    console.log(position.coords.accuracy);   // Accuracy in meters
    console.log(position.timestamp);         // Time of position fix
  },
  (error) => {
    switch (error.code) {
      case error.PERMISSION_DENIED:
        console.log('User denied geolocation');
        break;
      case error.POSITION_UNAVAILABLE:
        console.log('Position unavailable');
        break;
      case error.TIMEOUT:
        console.log('Request timed out');
        break;
    }
  },
  {
    enableHighAccuracy: true,  // Use GPS if available (slower, more battery)
    timeout: 10000,            // Max time to wait (ms)
    maximumAge: 0              // Don't use cached positions
  }
);
```

---

### Watching Position

Continuously track the user's position as it changes.

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

---

### Position Coordinates

| Property | Description |
|----------|-------------|
| `latitude` | Latitude in decimal degrees |
| `longitude` | Longitude in decimal degrees |
| `altitude` | Height above sea level (meters, if available) |
| `accuracy` | Accuracy of latitude/longitude (meters) |
| `altitudeAccuracy` | Accuracy of altitude (meters) |
| `heading` | Direction of travel (degrees, 0 = north) |
| `speed` | Speed in meters per second |

---

## 7.8 Notification API

The **Notification API** lets web applications send system-level notifications to users.

---

### Requesting Permission

```js
// Must be called from a user gesture (click, etc.)
Notification.requestPermission().then(permission => {
  console.log(permission); // "granted", "denied", or "default"
});
```

---

### Sending a Notification

```js
if (Notification.permission === 'granted') {
  const notification = new Notification('Hello!', {
    body: 'This is a notification from your web app.',
    icon: '/icon.png',
    badge: '/badge.png',
    vibrate: [200, 100, 200],  // Vibration pattern (ms)
    tag: 'welcome',             // Replaces previous notification with same tag
    requireInteraction: false   // Auto-close vs stay until clicked
  });

  notification.onclick = () => {
    console.log('Notification clicked');
    window.focus();
  };

  notification.onclose = () => {
    console.log('Notification closed');
  };
}
```

---

### Notification Options

| Option | Description |
|--------|-------------|
| `body` | Body text of the notification |
| `icon` | Image URL for the notification |
| `badge` | Small badge image (for mobile) |
| `vibrate` | Vibration pattern (array of ms) |
| `tag` | ID to group/replace notifications |
| `requireInteraction` | Stay visible until user interacts |
| `silent` | Suppress sound/vibration |

---

### Checking Permission Status

```js
// Synchronous check
console.log(Notification.permission); // "granted", "denied", or "default"

// Notification.maxActions — max actions the platform supports
console.log(Notification.maxActions); // Varies by platform
```

---

## 7.9 File & Blob API

The **File API** lets JavaScript read local files (via `<input type="file">` or drag-and-drop) and the **Blob API** represents raw binary data. Together they enable client-side file handling — previewing images, parsing CSVs, uploading with progress, and more.

### Blob — Binary Large Object

A `Blob` is an immutable, raw data object. Think of it as a file-like container for binary or text data.

```js
// Create a Blob from strings
const textBlob = new Blob(["Hello, world!"], { type: "text/plain" });
console.log(textBlob.size);   // 13
console.log(textBlob.type);  // "text/plain"

// Create from typed arrays (binary data)
const uint8 = new Uint8Array([72, 101, 108, 108, 111]); // "Hello"
const binBlob = new Blob([uint8], { type: "application/octet-stream" });

// Slice a Blob (useful for chunked uploads)
const chunk = textBlob.slice(0, 5, "text/plain"); // "Hello"
```

### Blob as URL

`URL.createObjectURL(blob)` creates a temporary URL (`blob:`) that can be used as a `src` for `<img>`, `<video>`, `<a download>`, etc.

```js
// Preview an uploaded image
const input = document.querySelector('input[type="file"]');
input.addEventListener("change", () => {
  const file = input.files[0];
  const img = document.createElement("img");
  img.src = URL.createObjectURL(file);
  document.body.appendChild(img);

  // Release memory when done
  img.onload = () => URL.revokeObjectURL(img.src);
});
```

### File — a Blob with metadata

`File` extends `Blob` and adds `name`, `lastModified`, and `webkitRelativePath`.

```js
// From an <input type="file"> element
input.addEventListener("change", (e) => {
  const file = e.target.files[0];
  console.log(file.name);         // "photo.jpg"
  console.log(file.size);         // 102400 (bytes)
  console.log(file.type);         // "image/jpeg"
  console.log(file.lastModified); // timestamp (ms)
});
```

### FileReader — Read file contents

`FileReader` reads a `File` or `Blob` into memory as text, Data URL, ArrayBuffer, or binary string.

```js
const reader = new FileReader();

// Read as text (CSV, JSON, etc.)
reader.readAsText(file);
reader.onload = () => console.log(reader.result); // string content

// Read as Data URL (base64 — for images)
reader.readAsDataURL(file);
reader.onload = () => img.src = reader.result;

// Read as ArrayBuffer (binary processing)
reader.readAsArrayBuffer(file);
reader.onload = () => {
  const buffer = reader.result; // ArrayBuffer
  const view = new Uint8Array(buffer);
};

// Event handlers
reader.onprogress = (e) => console.log(`${e.loaded}/${e.total} bytes`);
reader.onerror = () => console.error(reader.error);
```

### Drag and Drop with File API

```js
dropZone.addEventListener("dragover", (e) => e.preventDefault());
dropZone.addEventListener("drop", (e) => {
  e.preventDefault();
  const files = e.dataTransfer.files; // FileList
  Array.from(files).forEach(processFile);
});
```

### FormData with Files

```js
const formData = new FormData();
formData.append("avatar", fileInput.files[0]);

fetch("/upload", {
  method: "POST",
  body: formData, // Content-Type: multipart/form-data (auto-set)
});
```

### Blob as Download

```js
const data = JSON.stringify({ hello: "world" }, null, 2);
const blob = new Blob([data], { type: "application/json" });
const url = URL.createObjectURL(blob);

const a = document.createElement("a");
a.href = url;
a.download = "data.json";
a.click();
URL.revokeObjectURL(url);
```

### Performance & Limits

- **Blob URLs** (`blob:`) are per-origin and memory-scoped — revoke with `revokeObjectURL()` to avoid leaks
- **FileReader** is async and non-blocking — use `readAsArrayBuffer` for large files over streaming
- **Streaming** alternative: `file.stream()` returns a `ReadableStream` (modern browsers)
- **Max file size** depends on browser/memory — reading a 2GB file into a single ArrayBuffer may fail
- **File type** is determined by extension/magic bytes, not by content inspection (can be spoofed)

---

## Interview Questions

### Q1: What is Event Delegation and why is it useful?

**Answer:**

Event delegation is a technique where you attach a **single event listener** to a parent element instead of attaching individual listeners to multiple child elements. It leverages **event bubbling** — when an event fires on a child, it bubbles up to the parent where the listener is attached. You use `e.target` to identify which child actually triggered the event.

**Why it's useful:**
- **Performance:** One listener instead of N listeners reduces memory consumption
- **Dynamic content:** Works for elements added to the DOM **after** the listener is attached (no need to re-attach)
- **Simpler code:** Less setup and teardown, fewer memory leaks

**Example:**
```js
document.querySelector('#list').addEventListener('click', (e) => {
  const item = e.target.closest('.list-item');
  if (item) handleItemClick(item);
});
```

---

### Q2: What are the limitations of localStorage?

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

**Answer:**

| Event | Fires When |
|-------|-----------|
| `DOMContentLoaded` | The HTML document has been **fully parsed** — DOM is ready. Stylesheets, images, and subframes may still be loading. |
| `load` | The page and **all its resources** (images, stylesheets, scripts, iframes) have finished loading. |

**When to use which:**
- `DOMContentLoaded` — when you need to interact with DOM elements and don't need to wait for images/styles (most common)
- `load` — when you need to measure element dimensions that depend on loaded images, or access fully loaded resources

```js
// Ready to manipulate DOM
document.addEventListener('DOMContentLoaded', init);

// Everything fully loaded
window.addEventListener('load', measureLayout);
```

---

### Q6: How does the Mutation Observer differ from Mutation Events?

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

**Answer:**

When an event occurs on an element, it travels through three phases:

1. **Capturing phase (top → target):** The event travels from the `Window` down through ancestors to the target. Listeners registered with `useCapture: true` fire during this phase.

2. **Target phase:** The event reaches the target element. Listeners on the target fire here (regardless of capture flag).

3. **Bubbling phase (target → top):** The event travels back up through ancestors to `Window`. Listeners with `useCapture: false` (the default) fire during this phase.

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
