/**
 * Module 04 — 4.4 Promises
 * Create, chain, all/race/allSettled/any, common mistakes
 *
 * Run: node 04-promises.js
 */

// --- Creating a Promise ---
console.log("--- Creating a Promise ---");
const promise = new Promise((resolve, reject) => {
  const success = true;
  if (success) {
    resolve("done!");
  } else {
    reject(new Error("failed"));
  }
});
promise.then((val) => console.log("Resolved:", val));

// --- .then() Chaining ---
console.log("\n--- Promise chaining ---");
function fetchUser(id) {
  return Promise.resolve({ id, name: "Alice" });
}
function fetchPosts(userId) {
  return Promise.resolve(["post1", "post2"]);
}
function fetchComments(postId) {
  return Promise.resolve(["comment1", "comment2"]);
}

fetchUser(1)
  .then((user) => fetchPosts(user.id))
  .then((posts) => fetchComments(posts[0]))
  .then((comments) => console.log("Comments:", comments))
  .catch((err) => console.error(err))
  .finally(() => console.log("Chain cleanup"));

// --- Promise.all ---
console.log("\n--- Promise.all ---");
Promise.all([
  new Promise((resolve) => setTimeout(() => resolve("a"), 200)),
  new Promise((resolve) => setTimeout(() => resolve("b"), 100)),
  new Promise((resolve) => setTimeout(() => resolve("c"), 300)),
]).then((results) => console.log("All:", results));

// Promise.all — fast rejection
Promise.all([
  new Promise((resolve) => setTimeout(() => resolve("a"), 200)),
  new Promise((_, reject) => setTimeout(() => reject(new Error("b")), 100)),
  new Promise((resolve) => setTimeout(() => resolve("c"), 300)),
]).catch((err) => console.log("All rejection:", err.message));
// Output: "b" (rejects as soon as any promise rejects)

// --- Promise.allSettled ---
console.log("\n--- Promise.allSettled ---");
Promise.allSettled([
  new Promise((resolve) => setTimeout(() => resolve("a"), 200)),
  new Promise((_, reject) => setTimeout(() => reject(new Error("b")), 100)),
  new Promise((resolve) => setTimeout(() => resolve("c"), 300)),
]).then((results) =>
  results.forEach((r) => console.log("Settled:", r.status, r.value || r.reason.message))
);

// --- Promise.race ---
console.log("\n--- Promise.race ---");
Promise.race([
  new Promise((_, reject) => setTimeout(() => reject(new Error("slow")), 200)),
  new Promise((resolve) => setTimeout(() => resolve("fast"), 50)),
]).then((val) => console.log("Race winner:", val));

// --- Promise.any ---
console.log("\n--- Promise.any ---");
Promise.any([
  new Promise((_, reject) => reject(new Error("a"))),
  new Promise((resolve) => setTimeout(() => resolve("b"), 100)),
]).then((val) => console.log("Any:", val));

// Promise.any — all reject
Promise.any([
  new Promise((_, reject) => reject(new Error("a"))),
  new Promise((_, reject) => reject(new Error("b"))),
]).catch((err) => console.log("Any all rejected:", err instanceof AggregateError, err.errors.length));

// --- Common Mistakes ---
console.log("\n--- Common mistakes (commented) ---");
// ❌ Floating promise — not awaited, errors lost
// fetchUser(id); // promise fires but nothing handles it

// ❌ Not returning in .then() — breaks the chain
// promise.then(data => {
//   fetchNext(data); // should be: return fetchNext(data)
// });

// ❌ Swallowing errors
// promise.then(
//   data => doSomething(data),
//   err => {} // silently eats the error
// );

// ✅ Correct
// promise
//   .then(data => doSomething(data))
//   .catch(err => console.error(err));

console.log("(All examples above are commented — patterns shown, not executed)");

// --- Expected Output ---
// --- Creating a Promise ---
// Resolved: done!
//
// --- Promise chaining ---
// Comments: [ 'comment1', 'comment2' ]
// Chain cleanup
//
// --- Promise.all ---
// All: [ 'a', 'b', 'c' ]
// All rejection: b
//
// --- Promise.allSettled ---
// Settled: fulfilled a
// Settled: rejected b
// Settled: fulfilled c
//
// --- Promise.race ---
// Race winner: fast
//
// --- Promise.any ---
// Any: b
// Any all rejected: true 2
