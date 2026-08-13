/**
 * Module 07 — 7.7 IntersectionObserver
 * Lazy loading, infinite scroll, scroll animations
 *
 * Paste in browser DevTools console.
 */

console.log("--- IntersectionObserver ---");

/*
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      console.log("Element visible:", entry.target);
      // Load image: entry.target.src = entry.target.dataset.src;
      observer.unobserve(entry.target); // stop observing
    }
  });
}, {
  root: null,         // viewport (default)
  rootMargin: "0px",
  threshold: 0.5,     // 50% visible
});

// Observe elements
document.querySelectorAll("[data-src]").forEach(img => observer.observe(img));
*/

console.log("--- Infinite scroll pattern ---");
/*
const sentinel = document.getElementById("sentinel");
const infiniteObserver = new IntersectionObserver(([entry]) => {
  if (entry.isIntersecting) {
    loadMoreItems();
  }
}, { rootMargin: "200px" }); // trigger 200px before sentinel visible
infiniteObserver.observe(sentinel);
*/

console.log("\n--- Visible timer / analytics ---");
/*
const adObserver = new IntersectionObserver(([entry]) => {
  if (entry.isIntersecting) {
    console.log("Ad visible — start timer");
  } else {
    console.log("Ad hidden — stop timer");
  }
}, { threshold: [0, 1] }); // both 0% and 100% visibility
adObserver.observe(document.getElementById("ad-banner"));
*/

console.log("\nBrowser support: IntersectionObserver is supported in all modern browsers (IE11 polyfill available).");
