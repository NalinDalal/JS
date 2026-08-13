/**
 * Module 07 — Interview Questions (Web APIs)
 * Delegation, event loop, storage, observer patterns
 * Cross-reference: 12-interview-questions.js (text bank)
 *
 * Paste in browser DevTools console.
 */

// ============================================================
// Q1: Event delegation
// ============================================================
// --- Q1: Event delegation ---
// Problem: 100 list items, each needs click handler
// Solution: One listener on the parent <ul>
// Code: parent.addEventListener('click', e => { ... e.target.closest('li') ... })

// ============================================================
// Q2: e.stopPropagation vs e.preventDefault vs e.stopImmediatePropagation
// ============================================================
// --- Q2: Event method differences ---
// stopPropagation()       — stops bubbling, other handlers on this element still run
// stopImmediatePropagation() — stops bubbling AND other handlers on this element
// preventDefault()        — prevents default browser action (nav, form submit)
// return false            — (onclick attr) calls both stopPropagation + preventDefault

// ============================================================
// Q3: Event loop + microtasks vs macrotasks
// ============================================================
// --- Q3: Microtask vs Macrotask order ---
// Promise.then/queueMicrotask — microtask — runs before next macrotask
// setTimeout/setInterval      — macrotask — runs after microtask queue empties
// requestAnimationFrame       — runs before next paint (not micro/macro)

// ============================================================
// Q4: localStorage vs sessionStorage vs cookies
// ============================================================
// --- Q4: Storage comparison ---
// localStorage  : 5-10MB, persists forever, same origin, synchronous
// sessionStorage: 5-10MB, per tab (deleted on close), same origin, sync
// Cookies       : 4KB, sent with every request, expires set manually
// IndexedDB     : unlimited, asynchronous, structured data (blobs, etc.)

// ============================================================
// Q5: Observer patterns
// ============================================================
// --- Q5: Observer comparison ---
// IntersectionObserver — element visible in viewport
// MutationObserver     — DOM structure changes
// ResizeObserver       — element size changes
// PerformanceObserver  — performance measurements
// ReportingObserver    — deprecated API warnings

// ============================================================
// Q6: requestAnimationFrame vs setInterval
// ============================================================
// --- Q6: rAF vs setInterval ---
console.log("requestAnimationFrame:");
// - Pauses when tab is inactive
// - Syncs with monitor refresh rate (60/120/144fps)
// - Passes high-res timestamp to callback
console.log("setInterval:");
// - Runs regardless of tab visibility (can be throttled)
// - May drift; does not account for callback duration
// - No timestamp argument

// ============================================================
// Q7: Fetch timeout + abort
// ============================================================
// --- Q7: Fetch with AbortController timeout ---
/*
function fetchWithTimeout(url, ms = 5000) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), ms);
  return fetch(url, { signal: controller.signal })
    .finally(() => clearTimeout(timeout));
}
console.log(fetchWithTimeout("/api/data", 3000));
*/
// Key: AbortController.signal + setTimeout → abort if slow
