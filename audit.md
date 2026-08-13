# Audit Report — Notes-as-console.log Refactor

**Date:** 2026-08-13 · **Scope:** all 11 modules (01-fundamentals → 11-webrtc), 76 runnable files, 13 browser-only files, 13 `.md` notes files.

**Method:** per-file scan of (1) `.md` coverage of each concept, (2) header/block comments, (3) `console.log()` usage — length and purpose (demo output vs. narration).

---

## Category (a) — Proper static "Explain It" prose already exists (README-linked `.md` + demo code)

Concept explanations live in each module's `.md` with `##` section + `### Explain It` / `### Prove It`. The `.js` files are demos: header comment naming the section, short `//` labels, `console.log` only for *output of the demo*. **No action needed** (format variance noted below).

| Module | Notes file | Sections | Demo files (OK) |
|---|---|---|---|
| 01-fundamentals | `grammar-types-operators.md` | 1.1–1.7 | `01-declarations.js` … `05-operators-control-flow.js` |
| 02-scope-closures | `scope-closures.md` | 2.1–2.5 | `01-scope-and-hoisting.js` … `04-module-pattern.js` |
| 03-this-prototypes | `this-prototypes-classes.md` | 3.1–3.5 | `01-this-rules.js` … `05-classes.js` |
| 04-async-js | `async-js.md` | 4.1–4.6, 4.11 | `01-sync-vs-async.js` … `06-fetch-api.js` |
| 05-modules-advanced | `advanced.md` | 5.1–5.6 | `01-esm.js` … `06-disposable.js` |
| 06-collections | `collections.md` | 6.1–6.6 | `01-arrays.js` … `05-typed-arrays-json.js` |
| 07-web-apis | `web-apis.md` | 7.1–7.9 | `01-dom-selection.js` … `11-file-blob.js` (browser-only) |
| 08-error-handling | `errors.md` | 8.1–8.6 | `01-error-types.js` … `04-debugging-patterns.js` |
| 09-modern-patterns | `modern-syntax.md` + `js-lectures-extras.md` | 9.1–9.10, E1–E9 | `01-destructuring.js` … `11-dom-patterns-projects.js` |

**Format variance inside (a):**
- `07-web-apis/web-apis.md` has prose but **no literal `Explain It` / `Prove It` markers** (uses `####` method headers + prose + code blocks) — needs light standardization.
- `09-modern-patterns/js-lectures-extras.md` sections E1–E9 use `Explain It`/`Prove It` but not all demo files link back (e.g. `10-delete-nodelist-self.js`).
- **Zero modules have a `Gotchas / Edge Cases` section** — the standardization pass must add it everywhere (from existing handled edge cases, e.g. `0.1+0.2`, TDZ, `??` vs `||`, sparse arrays, timing-safe compare, ICE restart…).

## Category (b) — Explanation exists only as `console.log` runtime output

Notes are printed at runtime instead of being readable statically. Two flavors:

### b1. Modules 10 & 11 — long prose strings printed by `console.log`
These modules have `.md` notes, but the `.js` files **duplicate the explanation as runtime prints** (comparison tables, "key facts", "summary" blocks). Must be converted to `//` comments (or removed where the `.md` fully covers it), keeping only demo output.

| File | Long prose logs | What's narrated at runtime |
|---|---|---|
| `10-auth-security/01-auth-concepts.js` | 1 | session vs token comparison table |
| `10-auth-security/02-jwt-structure.js` | 1 | "JWT is signed, not encrypted" key facts |
| `10-auth-security/03-jwt-signing.js` | 4 | HS256 vs RS256 summary + comparison table |
| `10-auth-security/05-session-auth.js` | 1 | "cookie is just an opaque reference" key point |
| `10-auth-security/07-password-hashing.js` | 4 | hashing rules, salt rationale, timing-safe explainer |
| `10-auth-security/08-oauth-pkce.js` | 3 | "why PKCE" + flow summary |
| `10-auth-security/09-websocket-auth.js` | 5 | auth-options recap (handshake/frames OK — those are demo logs) |
| `10-auth-security/10-token-storage.js` | 3 | storage trade-off table + recommended stack |
| `10-auth-security/11-web-attacks.js` | 11 | XSS/CSRF/CORS explanations + headers table printed at runtime |
| `11-webrtc/01-webrtc-concepts.js` | 4 | WebRTC-vs-WS decision table + architecture map |
| `11-webrtc/02-signaling-server.js` | 2 | recap prose in demo driver |
| `11-webrtc/03-rtc-lifecycle.js` | 3 | state-transition summary printed at end |
| `11-webrtc/04-sdp-explained.js` | 6 | SDP/candidate explainer paragraphs |
| `11-webrtc/06-datachannel-simulation.js` | 4 | reliable-vs-unreliable summary table |
| `11-webrtc/07-webrtc-security.js` | 13 | full threat-model + DTLS prose printed at runtime |

*(`10-auth-security/06-http-auth-middleware.js` and `11-webrtc/09-…` — mostly demo/server code, only small recap logs; handled with the rest.)*

### b2. Interview drill files — Q&A printed at runtime
These are *drills by design*, but the Q&A text is only visible when run. A static text bank (`NN-interview-questions.js`) already exists for every module, so the drill files are acceptable **but should cross-reference** the bank in their header. Heaviest: `07-web-apis/10-interview-web-apis.js` (36 logs), `09-modern-patterns/12-interview-modern.js`, `08-error-handling/05-interview-errors.js`.

## Category (c) — No explanation anywhere (static or runtime)

**None found.** Every `.js` file has at least a header comment naming the concept + run command, and every concept maps to an `.md` section. Closest to (c):
- `09-modern-patterns/04-nullish-coalescing.js` and `10-delete-nodelist-self.js` — *explanation exists* but the demos **crash** (see below), making their notes effectively unverifiable.

---

## Correctness baseline (task 4 — full run of every file)

- **76 files run clean** under Node v26.
- **2 files ERROR at runtime** → flag for manual review in `correctness-issues.md`:
  - `09-modern-patterns/04-nullish-coalescing.js:40` — `ReferenceError: c is not defined` (precedence demo uses undeclared `a`, `b`, `c`; file dies mid-demo).
  - `09-modern-patterns/10-delete-nodelist-self.js:52` — `ReferenceError: document is not defined` (browser-only code, but header says `Run: node …`).
- **2 files are servers** (intentionally keep running): `10-auth-security/06-http-auth-middleware.js`, `11-webrtc/02-signaling-server.js` (verified working in earlier sessions).
- **13 files are browser-only** ("Paste in DevTools" — 07-web-apis × 11, 09/11, 11/05) — cannot be node-verified by design; flagged as such, not as failures.

---

## README index (task 5 — current state)

README structure tree + Quick Navigation table already point at every module's `.md` file name, but **as plain backticked text, not markdown links** — needs `[`links`](01-fundamentals/grammar-types-operators.md)` conversion so every module links directly to its notes file.

---

## Proposed execution order (one commit per module)

1. `09-modern-patterns` — fix 2 crashing demos (flag-first) + Gotchas
2. `10-auth-security` — strip prose logs → comments, add Gotchas
3. `11-webrtc` — same
4. `07-web-apis` — add Explain It/Prove It markers + Gotchas
5. `01`–`06`, `08` — add Gotchas sections only
6. README — direct `.md` links
7. `correctness-issues.md` — the 2 flagged errors + 13 browser-only notes
