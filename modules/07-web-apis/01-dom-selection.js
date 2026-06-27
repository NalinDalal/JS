/**
 * Module 07 — 7.1 DOM Selection Methods
 * getElementById, querySelector, querySelectorAll, getElementsBy*, closest
 *
 * Paste in browser DevTools console to run.
 */

console.log("--- getElementById ---");
// Returns a single Element or null
const header = document.getElementById("header");
console.log("header:", header);

console.log("\n--- querySelector (first match) ---");
const firstLink = document.querySelector("a");
const navItem = document.querySelector(".nav-item");
const formField = document.querySelector('[data-id="main"]');
console.log("first link:", firstLink?.href);

console.log("\n--- querySelectorAll (NodeList) ---");
const allLinks = document.querySelectorAll("a");
console.log("Number of links:", allLinks.length); // static NodeList
allLinks.forEach(link => console.log(link.href));

console.log("\n--- getElementsByClassName (HTMLCollection, LIVE) ---");
const items = document.getElementsByClassName("item");
console.log("live collection length:", items.length);

console.log("\n--- getElementsByTagName (HTMLCollection, LIVE) ---");
const divs = document.getElementsByTagName("div");
console.log("div count:", divs.length);

console.log("\n--- closest (traverse UP) ---");
const innerSpan = document.querySelector("span.inner");
const parentSection = innerSpan?.closest("section");
console.log("closest section:", parentSection);

// === Difference: NodeList (static) vs HTMLCollection (live) ===
console.log("\n--- Live vs Static ---");
const liveCollection = document.getElementsByClassName("item");
const staticList = document.querySelectorAll(".item");
console.log("Before: live:", liveCollection.length, "static:", staticList.length);

const newDiv = document.createElement("div");
newDiv.className = "item";
document.body.appendChild(newDiv);
console.log("After:  live:", liveCollection.length, "static:", staticList.length);
// liveCollection now matches DOM; staticList is unchanged

console.log("\n--- matches (check element matches selector) ---");
const el = document.querySelector("div");
console.log("div.matches('.item'):", el?.matches(".item"));
