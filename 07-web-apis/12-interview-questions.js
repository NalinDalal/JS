/**
 * Module 07 — Question Bank: likely-asked interview questions (web APIs)
 *
 * Run: node 12-interview-questions.js
 */

const qa = [
  ["querySelector vs getElementById?", "querySelector('css') — any CSS selector, returns first match; getElementById — id only, faster. Live vs static: getElementsByClassName/querySelectorAll — the CLASS ones are LIVE (auto-update), querySelectorAll is a static snapshot. NodeList vs HTMLCollection both array-like, NOT arrays."],
  ["Event bubbling vs capturing?", "Three phases: capture (document → target), target, bubble (target → document). Default listeners fire during bubble; capture with addEventListener('click', fn, true). stopPropagation() halts both; stopImmediatePropagation() also blocks same-element listeners. Event delegation = one listener on a parent reading e.target."],
  ["Why event delegation?", "One listener instead of N (performance + works for dynamically added children). Pattern: list.addEventListener('click', e => { const btn = e.target.closest('[data-action]'); ... }). Use data-attributes to route actions — no closures per child."],
  ["localStorage vs sessionStorage vs cookies?", "localStorage: persists forever, 5-10MB, same-origin, string only, synchronous, never sent to server. sessionStorage: same but per-tab, dies with the tab. Cookies: 4KB, auto-sent EVERY request (perf + CSRF), HttpOnly/SameSite/Secure flags, expiry controllable. Choose storage for client-only data, cookies for server-session needs."],
  ["requestAnimationFrame vs setTimeout for animations?", "rAF: browser-scheduled, fires BEFORE paint once per frame, pauses in background tabs (battery!), you get a timestamp — the correct tool for animations. setTimeout: fires when due regardless of frames → janky, no vsync alignment. For loops use rAF + delta-time."],
  ["IntersectionObserver — what is it good for?", "Async, callback-based visibility detection — lazy-load images, infinite scroll, entrance animations. Never runs in the background tab (notifies on entry). Thresholds/rootMargin control triggering. It's THE replacement for scroll-position hacks."],
  ["fetch vs XMLHttpRequest?", "fetch: promise-based, streaming bodies, Request/Response objects, cache modes, AbortController, available in workers. XHR: XML legacy, progress events (upload/download%), old APIs. For upload progress you may still want XHR — or fetch + streams."],
  ["async vs defer script tags?", "Both non-blocking. async: download then execute IMMEDIATELY (order not guaranteed) — independent scripts. defer: download now, execute after parsing, IN ORDER — for dependent scripts, DOM ready guaranteed. Classic: blocks parsing. Use defer by default, async for analytics."],
  ["DOMContentLoaded vs load?", "DOMContentLoaded: HTML parsed, no images/fonts yet — safe to wire up event listeners. load: EVERYTHING loaded (images, styles, iframes) — good for measuring total load or image-dependent work. Inline scripts at end of body ≈ after DCL for your code."],
  ["innerHTML vs textContent vs createElement?", "innerHTML: parses markup (XSS if you inject user data — escapes needed). textContent: plain text, no parsing, fast, safe. createElement + append: explicit, safest, most control. Never build DOM from user input with innerHTML — use textContent."],
  ["Reflow / repaint — how to avoid jank?", "Reflow = layout recalc (geometry), repaint = pixel redraw. Both are expensive. Batch: read-then-write (avoid layout thrashing — read offsetWidth once, write all changes after), use DocumentFragment or display:none while building, transform/opacity for animations (compositor-only), avoid forced sync layouts in loops."],
  ["File API / FormData?", "input[type=file] → File (Blob with name/type/size). Read: FileReader (readAsText/DataURL/ArrayBuffer) or file.text()/arrayBuffer() (modern, promise). Send: FormData.append('file', file) with fetch — browser sets multipart automatically. Drag-drop = dataTransfer.files."],
  ["Canvas vs SVG?", "Canvas: bitmap, pixel-level, imperative — charts, games, filters (crisp at any scale? NO — resizes blur unless re-rendered). SVG: vector DOM — scalable, stylable, DOM events per element, good for icons/interactive diagrams. Canvas perf for many elements; SVG for few, semantic, styleable."],
  ["MutationObserver?", "Watch DOM changes (childList, attributes, characterData) without polling — used by frameworks, autosave on contenteditable, extensions. Callbacks receive batched records; disconnect() when done. More precise than DOMContentLoaded/load for dynamic content."],
];

let n = 0;
for (const [q, a] of qa) {
  n++;
  console.log(`\n${String(n).padStart(2)}. ${q}`);
  console.log("   →", a);
}

console.log("\n--- Whiteboard drills ---");
console.log("1. Draw the 3-phase event flow for a click on a nested li.");
console.log("2. Write lazy-image loading with IntersectionObserver (5 lines).");
console.log("3. Where does layout thrashing come from? Show read/write interleave.");