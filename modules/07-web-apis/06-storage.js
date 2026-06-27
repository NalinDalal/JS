/**
 * Module 07 — 7.6 Web Storage & Cookies
 * localStorage, sessionStorage, cookies
 *
 * Paste in browser DevTools console.
 */

console.log("--- localStorage (persists across tabs, survives browser close) ---");
localStorage.setItem("theme", "dark");
console.log("getItem:", localStorage.getItem("theme")); // "dark"
console.log("length:", localStorage.length);            // number of keys
console.log("key(0):", localStorage.key(0));            // "theme"
localStorage.removeItem("theme");                        // remove one
localStorage.clear();                                    // remove all

console.log("\n--- sessionStorage (per tab, cleared when tab closes) ---");
sessionStorage.setItem("tab-state", "draft");
console.log("session getItem:", sessionStorage.getItem("tab-state"));
sessionStorage.clear();

console.log("\n--- Storage event (cross-tab sync) ---");
// Fires on OTHER tabs when localStorage changes
window.addEventListener("storage", (e) => {
  console.log(`Key "${e.key}" changed from "${e.oldValue}" to "${e.newValue}"`);
  console.log("Storage area:", e.storageArea); // localStorage or sessionStorage
});

console.log("\n--- cookies (sent to server with every request) ---");
// Set cookie with max-age in seconds
document.cookie = "sessionId=abc123; path=/; max-age=3600"; // 1 hour
document.cookie = "theme=dark; path=/; max-age=86400";      // 1 day
console.log("All cookies:", document.cookie);
// Format: "sessionId=abc123; theme=dark"

// Cookie options: domain, path, secure, httpOnly, sameSite, expires/max-age
// document.cookie = "key=value; path=/; secure; sameSite=Strict";

// Simple cookie read helper
function getCookie(name) {
  const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}
console.log("getCookie('sessionId'):", getCookie("sessionId"));

console.log("\n--- indexedDB (for large structured data) ---");
// Available in browser — indexedDB.open("MyDB", 1);
console.log("For >5MB of data, use IndexedDB. See MDN for API.");
