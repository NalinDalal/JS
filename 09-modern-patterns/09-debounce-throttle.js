/**
 * Module 09 — 9.9 Debounce & Throttle
 * Debounce: wait for pause; Throttle: limit rate
 *
 * Run: node 09-debounce-throttle.js
 */

// --- Debounce (delay until pause) ---
// Debounce: callback fires only after `delay` ms of inactivity
function debounce(fn, delay) {
  let timerId = null;
  return (...args) => {
    clearTimeout(timerId);
    timerId = setTimeout(() => fn(...args), delay);
  };
}

// Usage: input.addEventListener("input", debounce(searchAPI, 300));

// Immediate version (fire on leading edge)
function debounceImmediate(fn, delay) {
  let timerId = null;
  let lastCall = 0;
  return (...args) => {
    const now = Date.now();
    const callNow = now - lastCall >= delay;
    lastCall = now;
    clearTimeout(timerId);
    if (callNow) {
      fn(...args);
    }
    timerId = setTimeout(() => fn(...args), delay);
  };
}

console.log("Debounce strategies:");
// Leading edge  — fires immediately, then waits
// Trailing edge — waits for pause, then fires
// Leading+trailing — fires immediately, and after pause

// --- Throttle (max 1 call per interval) ---
function throttle(fn, interval) {
  let lastTime = 0;
  let timerId = null;
  return (...args) => {
    const now = Date.now();
    const remaining = interval - (now - lastTime);
    if (remaining <= 0) {
      // Fire immediately
      if (timerId) {
        clearTimeout(timerId);
        timerId = null;
      }
      lastTime = now;
      fn(...args);
    } else if (!timerId) {
      // Schedule for end of interval (trailing edge)
      timerId = setTimeout(() => {
        lastTime = Date.now();
        timerId = null;
        fn(...args);
      }, remaining);
    }
  };
}

// Usage: window.addEventListener("scroll", throttle(handleScroll, 100));

// --- Difference ---
// Debounce:  Fires after user stops typing (search, autocomplete)
// Throttle:  Fires at most once per interval (scroll, resize)
// rAF:       requestAnimationFrame — fires before each paint (animations)
