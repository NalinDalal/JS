/**
 * Module 07 — Interview Questions (Web APIs)
 * Delegation, event loop, storage, observer patterns
 *
 * Paste in browser DevTools console.
 */

// ============================================================
// Q1: Event delegation
// ============================================================
console.log("--- Q1: Event delegation ---");
console.log("Problem: 100 list items, each needs click handler");
console.log("Solution: One listener on the parent <ul>");
console.log("Code: parent.addEventListener('click', e => { ... e.target.closest('li') ... })");

// ============================================================
// Q2: e.stopPropagation vs e.preventDefault vs e.stopImmediatePropagation
// ============================================================
console.log("\n--- Q2: Event method differences ---");
console.log("stopPropagation()       — stops bubbling, other handlers on this element still run");
console.log("stopImmediatePropagation() — stops bubbling AND other handlers on this element");
console.log("preventDefault()        — prevents default browser action (nav, form submit)");
console.log("return false            — (onclick attr) calls both stopPropagation + preventDefault");

// ============================================================
// Q3: Event loop + microtasks vs macrotasks
// ============================================================
console.log("\n--- Q3: Microtask vs Macrotask order ---");
console.log("Promise.then/queueMicrotask — microtask — runs before next macrotask");
console.log("setTimeout/setInterval      — macrotask — runs after microtask queue empties");
console.log("requestAnimationFrame       — runs before next paint (not micro/macro)");

// ============================================================
// Q4: localStorage vs sessionStorage vs cookies
// ============================================================
console.log("\n--- Q4: Storage comparison ---");
console.log("localStorage  : 5-10MB, persists forever, same origin, synchronous");
console.log("sessionStorage: 5-10MB, per tab (deleted on close), same origin, sync");
console.log("Cookies       : 4KB, sent with every request, expires set manually");
console.log("IndexedDB     : unlimited, asynchronous, structured data (blobs, etc.)");

// ============================================================
// Q5: Observer patterns
// ============================================================
console.log("\n--- Q5: Observer comparison ---");
console.log("IntersectionObserver — element visible in viewport");
console.log("MutationObserver     — DOM structure changes");
console.log("ResizeObserver       — element size changes");
console.log("PerformanceObserver  — performance measurements");
console.log("ReportingObserver    — deprecated API warnings");

// ============================================================
// Q6: requestAnimationFrame vs setInterval
// ============================================================
console.log("\n--- Q6: rAF vs setInterval ---");
console.log("requestAnimationFrame:");
console.log("  - Pauses when tab is inactive");
console.log("  - Syncs with monitor refresh rate (60/120/144fps)");
console.log("  - Passes high-res timestamp to callback");
console.log("setInterval:");
console.log("  - Runs regardless of tab visibility (can be throttled)");
console.log("  - May drift; does not account for callback duration");
console.log("  - No timestamp argument");

// ============================================================
// Q7: Fetch timeout + abort
// ============================================================
console.log("\n--- Q7: Fetch with AbortController timeout ---");
/*
function fetchWithTimeout(url, ms = 5000) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), ms);
  return fetch(url, { signal: controller.signal })
    .finally(() => clearTimeout(timeout));
}
console.log(fetchWithTimeout("/api/data", 3000));
*/
console.log("Key: AbortController.signal + setTimeout → abort if slow");
