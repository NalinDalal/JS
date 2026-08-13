# Correctness Issues — Audit Log

Every `*.js` file under the module folders was run with plain Node (`node <file>`) in
its target environment. Anything that crashed there was fixed and re-verified
(`node --check` + a clean run). As of this log, **no Node-runnable file crashes**.
Known crashers found and fixed:

---

## Fixed

### 1. 09-modern-patterns/04-nullish-coalescing.js — ReferenceError (crash)

- **Symptom:** `ReferenceError: c is not defined` — the demo referenced a fallback variable that was never declared.
- **Cause:** `const c = "fallback";` was missing before the `(a ?? b) || c` comparison line.
- **Fix:** added the missing declaration.
- **Verified:** `node --check` passes; `node 04-nullish-coalescing.js` runs to completion, all output lines `OK`.
- **Fixed in commit:** `bf46069`

### 2. 09-modern-patterns/10-delete-nodelist-self.js — ReferenceError (crash)

- **Symptom:** `ReferenceError: self is not defined` when run with plain Node.
- **Cause:** `self` is a browser-global; the file also called DOM APIs (`document.querySelectorAll`) directly at top level, which don't exist in Node.
- **Fix:** the DOM-dependent block (NodeList, delete operator demos) now runs only behind a `typeof document !== "undefined"` guard, so the Node runnable portion executes; the `self` lookup falls back through `window ? self : globalThis`.
- **Verified:** `node --check` passes; Node run executes the portable part cleanly (browser-only part guarded).
- **Fixed in commit:** `bf46069`

---

## Notes / Non-issues

- **Servers (not audited by running):** `10-auth-security/06-http-auth-middleware.js`, `10-auth-security/09-websocket-auth.js`, `11-webrtc/02-signaling-server.js` start long-running HTTP/WS servers by design — verified with `node --check` only; run them manually to smoke-test endpoints.
- **DevTools-paste demos (expected to fail under plain Node):** `07-web-apis/01-*`–`06-*` (DOM selection/manipulation/events/storage) are browser demos by design — their header comments say "Paste in browser DevTools console to run." They crash under Node on purpose (`document`/`localStorage` don't exist there); not defects. Browser-gated files (`09-modern-patterns/10-delete-nodelist-self.js`, `09-modern-patterns/11-dom-patterns-projects.js`) are Node-safe via `typeof document` guards.
- **11-webrtc/05-media.js** needs camera/mic permission; its pure-logic parts are Node-safe.

---

*Regenerate with:* `for f in $(find . -name '*.js' | grep -v node_modules); do node "$f" >/dev/null 2>&1 || echo "CRASH: $f"; done` — then ignore the known browser-only files (07-web-apis 01–06).