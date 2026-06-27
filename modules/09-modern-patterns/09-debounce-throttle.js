/**
 * Module 09 — 9.9 Debounce & Throttle
 * Debounce: wait for pause; Throttle: limit rate
 *
 * Run: node 09-debounce-throttle.js
 */

console.log("--- Debounce (delay until pause) ---");
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
console.log("  Leading edge  — fires immediately, then waits");
console.log("  Trailing edge — waits for pause, then fires");
console.log("  Leading+trailing — fires immediately, and after pause");

console.log("\n--- Throttle (max 1 call per interval) ---");
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

console.log("\n--- Difference ---");
console.log("Debounce:  Fires after user stops typing (search, autocomplete)");
console.log("Throttle:  Fires at most once per interval (scroll, resize)");
console.log("rAF:       requestAnimationFrame — fires before each paint (animations)");
