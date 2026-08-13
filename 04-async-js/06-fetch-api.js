/**
 * Module 04 — 4.6 Fetch API
 * Request/response, HTTP methods, error handling, AbortController
 *
 * Run: node 06-fetch-api.js
 *
 * NOTE: Requires network access. Some examples use httpbin.org.
 * Comment out fetch calls if offline.
 */

console.log("--- Fetch API examples ---");
console.log("(These require network access — commented by default for safety)");

// Basic fetch
async function basicFetch() {
  const response = await fetch("https://httpbin.org/get");
  const data = await response.json();
  console.log("GET response:", data);
}

// HTTP Methods
async function httpMethods() {
  // GET (default)
  const getRes = await fetch("https://httpbin.org/get");
  console.log("GET status:", getRes.status);

  // POST
  const postRes = await fetch("https://httpbin.org/post", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: "Alice" }),
  });
  const postData = await postRes.json();
  console.log("POST data sent:", postData.json);
}

// Error handling
async function errorHandling() {
  try {
    const response = await fetch("https://httpbin.org/status/404");

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (err) {
    console.log("Fetch error:", err.message);
  }
}

// AbortController
async function withAbort() {
  const controller = new AbortController();

  // Cancel after 1 second
  setTimeout(() => controller.abort(), 1000);

  try {
    const response = await fetch("https://httpbin.org/delay/5", {
      signal: controller.signal,
    });
    const data = await response.json();
    console.log("Data:", data);
  } catch (err) {
    if (err.name === "AbortError") {
      console.log("Request was cancelled (AbortError)");
    } else {
      console.error("Network error:", err);
    }
  }
}

// --- Response properties demo ---
async function responseProps() {
  const response = await fetch("https://httpbin.org/get");
  console.log("Response properties:");
  console.log("  ok:", response.ok);
  console.log("  status:", response.status);
  console.log("  statusText:", response.statusText);
  console.log("  url:", response.url);
}

// Run the error handling and response props (they're fast)
console.log("\n--- Error handling (404 doesn't reject fetch) ---");
// errorHandling();

console.log("\n--- Response properties ---");
// responseProps();

console.log("\n--- AbortController example ---");
// withAbort();

console.log("(Uncomment function calls above to test with network)");

// Summary of key patterns:
console.log("\n--- Key patterns ---");
console.log(`
// Pattern 1: Basic fetch + error check
async function safeFetch(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(\`HTTP \${res.status}\`);
  return res.json();
}

// Pattern 2: Timeout with AbortController
const controller = new AbortController();
setTimeout(() => controller.abort(), 5000);
const res = await fetch(url, { signal: controller.signal });
`);
