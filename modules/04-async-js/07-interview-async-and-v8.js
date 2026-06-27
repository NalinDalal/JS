/**
 * Module 04 — Interview + V8 Architecture
 * Micro/macro, all vs allSettled, async mistakes, safeFetch, V8 optimization
 *
 * Run: node 07-interview-async-and-v8.js
 */

// ============================================================
// Q2: Microtask vs Macrotask
// ============================================================
console.log("--- Q2: Microtask vs Macrotask ---");
setTimeout(() => console.log("macrotask"), 0);
Promise.resolve().then(() => console.log("microtask"));
console.log("sync");
// Output: sync → microtask → macrotask

// ============================================================
// Q3: Promise.all vs Promise.allSettled
// ============================================================
console.log("\n--- Q3: all vs allSettled ---");
// Promise.all — short-circuits on first rejection
const pAll = Promise.all([
  Promise.resolve("good"),
  Promise.reject(new Error("bad")),
  Promise.resolve("also good"),
]);
pAll.catch((err) => console.log("Promise.all rejected:", err.message));

// Promise.allSettled — always resolves
const pAllSettled = Promise.allSettled([
  Promise.resolve("good"),
  Promise.reject(new Error("bad")),
  Promise.resolve("also good"),
]);
pAllSettled.then((results) => {
  results.forEach((r) => {
    if (r.status === "fulfilled") console.log("  settled fulfilled:", r.value);
    else console.log("  settled rejected:", r.reason.message);
  });
});

// ============================================================
// Q4: Common async/await mistakes
// ============================================================
console.log("\n--- Q4: async/await mistakes ---");

// Mistake 1: No try/catch
// ❌ const data = await fetch(url);
// ✅ use try/catch

// Mistake 2: Sequential instead of parallel
function wait(ms, label) {
  return new Promise((resolve) => setTimeout(() => resolve(label), ms));
}
async function mistakeSequential() {
  console.time("sequential");
  const a = await wait(500, "A");
  const b = await wait(500, "B");
  console.timeEnd("sequential"); // ~1000ms
}
async function correctParallel() {
  console.time("parallel");
  const [a, b] = await Promise.all([wait(500, "A"), wait(500, "B")]);
  console.timeEnd("parallel"); // ~500ms
}

mistakeSequential();
correctParallel();

// ============================================================
// Q5: async/await vs .then() equivalence
// ============================================================
console.log("\n--- Q5: .then() vs async/await ---");
function fetchUser(id) {
  return Promise.resolve({ id, name: "Alice" });
}
function fetchPosts(userId) {
  return Promise.resolve(["post1"]);
}
function renderPosts(posts) {
  console.log("Rendered:", posts);
}
function handleError(err) {
  console.error("Error:", err);
}

// .then() style
fetchUser(1)
  .then((user) => fetchPosts(user.id))
  .then((posts) => renderPosts(posts))
  .catch((err) => handleError(err));

// async/await style (equivalent)
async function loadPosts(id) {
  try {
    const user = await fetchUser(id);
    const posts = await fetchPosts(user.id);
    renderPosts(posts);
  } catch (err) {
    handleError(err);
  }
}
loadPosts(1);

// ============================================================
// Q6: safeFetch pattern
// ============================================================
console.log("\n--- Q6: safeFetch pattern ---");
async function safeFetch(url, options = {}) {
  try {
    const response = await fetch(url, options);

    if (!response.ok) {
      const errorBody = await response.text().catch(() => "");
      throw new Error(`HTTP ${response.status}: ${response.statusText} — ${errorBody}`);
    }

    return await response.json();
  } catch (err) {
    if (err.name === "AbortError") {
      console.log("Request cancelled");
    } else if (err.name === "TypeError") {
      console.error("Network error:", err.message);
    } else {
      console.error("Fetch error:", err.message);
    }
    throw err;
  }
}

// (Not actually called — requires network)
console.log("safeFetch URL checking pattern defined");

// ============================================================
// Section 4.11: V8 Engine Optimization
// ============================================================
console.log("\n--- V8 Engine: Consistent types matter ---");

// V8 optimizes for consistent types
function add(a, b) {
  return a + b;
}

// Monomorphic: always numbers
add(1, 2);
add(3, 4);
add(5, 6);
console.log("  add(1, 2) - monomorphic: V8 optimizes");

// Polymorphic: mixed types -> deopt
console.log("  add(1, 'hello') - polymorphic: deoptimization");

// Object shape consistency
const obj1 = { x: 1, y: 2 };
const obj2 = { x: 3, y: 4 };
console.log("  obj1, obj2 - same hidden class (fast)");

const obj3 = { x: 5 };
obj3.y = 6;
console.log("  obj3 - different hidden class (slower)");

// --- Expected Output ---
// --- Q2: Microtask vs Macrotask ---
// sync
// microtask
// macrotask
//
// --- Q3: all vs allSettled ---
// Promise.all rejected: bad
//   settled fulfilled: good
//   settled rejected: bad
//   settled fulfilled: also good
//
// --- Q4: async/await mistakes ---
// sequential: ~1000ms
// parallel: ~500ms
//
// --- Q5: .then() vs async/await ---
// Rendered: [ 'post1' ]
// Rendered: [ 'post1' ]
//
// --- Q6: safeFetch pattern ---
// safeFetch URL checking pattern defined
//
// --- V8 Engine: Consistent types matter ---
//   add(1, 2) - monomorphic: V8 optimizes
//   add(1, 'hello') - polymorphic: deoptimization
//   obj1, obj2 - same hidden class (fast)
//   obj3 - different hidden class (slower)
