/**
 * Module 07 — 7.8 MutationObserver + ResizeObserver
 * Watch DOM changes, element resize
 *
 * Paste in browser DevTools console.
 */

// --- MutationObserver (watch DOM changes) ---

/*
const target = document.getElementById("comments");
const mutationObserver = new MutationObserver((mutations) => {
  mutations.forEach(m => {
    if (m.type === "childList") {
      console.log("Child added/removed:", m.addedNodes, m.removedNodes);
    }
    if (m.type === "attributes") {
      console.log("Attribute changed:", m.attributeName);
    }
    if (m.type === "characterData") {
      console.log("Text changed");
    }
  });
});

mutationObserver.observe(target, {
  childList: true,      // monitor child additions/removals
  subtree: true,        // monitor descendants too
  attributes: true,     // monitor attribute changes
  attributeFilter: ["class", "style"], // only these attributes
  characterData: true,  // monitor text content
});

// Later: mutationObserver.disconnect();
*/

// --- MutationObserver use cases ---
// 1. Detect script injection (XSS monitoring)
// 2. React to DOM framework updates
// 3. Auto-resize textareas
// 4. Detect element removal

// --- ResizeObserver ---
/*
const resizeObserver = new ResizeObserver((entries) => {
  for (const entry of entries) {
    const { width, height } = entry.contentRect;
    console.log(`${entry.target.id} resized: ${width}x${height}`);
  }
});

resizeObserver.observe(document.getElementById("resizable-box"));

// Also observe border-box: entry.borderBoxSize, device-pixel: entry.devicePixelContentBoxSize
*/

// --- Comparison ---
// MutationObserver : DOM structure changes
// ResizeObserver   : Element size changes
// IntersectionObs  : Element visibility in viewport
