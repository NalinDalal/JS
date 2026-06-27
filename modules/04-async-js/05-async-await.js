/**
 * Module 04 — 4.5 async/await
 * Syntax, parallel vs sequential, top-level await
 *
 * Run: node 05-async-await.js
 */

console.log("--- async always returns a promise ---");
async function greet() {
  return "hello";
}

greet().then((val) => console.log("greet:", val)); // "hello"
console.log("typeof greet():", typeof greet()); // "object" (it's a Promise)

// --- await unwraps the promise ---
console.log("\n--- await unwraps ---");
async function main() {
  const val = await Promise.resolve(42);
  console.log("awaited value:", val); // 42
}
main();

// --- Error handling with try/catch ---
console.log("\n--- Error handling ---");
async function risky() {
  try {
    const data = await Promise.reject(new Error("oops"));
  } catch (err) {
    console.log("caught:", err.message); // "caught: oops"
  }
}
risky();

// --- Parallel vs Sequential ---
console.log("\n--- Sequential vs Parallel ---");
function wait(ms, label) {
  return new Promise((resolve) => {
    console.log(`  ${label}: starting`);
    setTimeout(() => {
      console.log(`  ${label}: done after ${ms}ms`);
      resolve(label);
    }, ms);
  });
}

async function sequential() {
  console.log("Sequential (4s total):");
  const a = await wait(2000, "A");
  const b = await wait(2000, "B");
  console.log("  Result:", a, b);
}

async function parallel() {
  console.log("Parallel (2s total):");
  const [a, b] = await Promise.all([wait(2000, "A"), wait(2000, "B")]);
  console.log("  Result:", a, b);
}

// Run to demonstrate
// sequential();
// parallel();

// Commented to avoid long wait — uncomment to test
console.log("(Uncomment sequential() and parallel() to test — each takes ~2s)");

// --- Promise.all with async/await ---
console.log("\n--- Parallel dashboard load ---");
async function loadDashboard() {
  const [users, posts, comments] = await Promise.all([
    Promise.resolve("users data"),
    Promise.resolve("posts data"),
    Promise.resolve("comments data"),
  ]);
  return { users, posts, comments };
}

loadDashboard().then((d) => console.log("Dashboard:", d));

// --- Expected Output ---
// --- async always returns a promise ---
// typeof greet(): object
// greet: hello
//
// --- await unwraps ---
// awaited value: 42
//
// --- Error handling ---
// caught: oops
//
// --- Sequential vs Parallel ---
// (Uncomment sequential() and parallel() to test)
//
// --- Parallel dashboard load ---
// Dashboard: { users: 'users data', posts: 'posts data', comments: 'comments data' }
