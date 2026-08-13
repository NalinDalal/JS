# JavaScript Master Notes — Final Stop Solution

**One repository. All core JS. Interview-ready explanations + runnable code.**

---

## Module Structure

```
js-master-notes/
├── README.md                    # This file - entry point
├── plan.md                      # 14-week revision schedule
├── 01-fundamentals/         # grammar-types-operators.md
├── 02-scope-closures/       # scope-closures.md
├── 03-this-prototypes/      # this-prototypes-classes.md
├── 04-async-js/             # async-js.md
├── 05-modules-advanced/     # advanced.md
├── 06-collections/          # collections.md
├── 07-web-apis/             # web-apis.md
├── 08-error-handling/       # errors.md
├── 09-modern-patterns/      # modern-syntax.md + js-lectures-extras.md
└── 10-auth-security/        # auth-security.md (JWT, sessions, OAuth, WS, attacks)
```

---

## Quick Navigation

| Module | Concepts Covered | Key Files | Est. Time |
|--------|------------------|-----------|-----------|
| **01-fundamentals** | var/let/const, types, coercion, operators, control flow | `grammar-types-operators.md` (281 lines) | Week 1-2 |
| **02-scope-closures** | Lexical scope, hoisting, TDZ, closures, IIFE, module pattern | `scope-closures.md` (437 lines) | Week 2-3 |
| **03-this-prototypes** | this (4 rules), prototype chain, `new`, classes, inheritance | `this-prototypes-classes.md` (537 lines) | Week 4-5 |
| **04-async-js** | Event loop, micro/macrotasks, promises, async/await, fetch, V8 engine | `async-js.md` (885 lines) | Week 7-9 |
| **05-modules-advanced** | ESM, dynamic import, iterators, generators, proxies, symbols | `advanced.md` (1283 lines) | Week 10 |
| **06-collections** | Arrays, Maps, Sets, WeakMap/Set, TypedArrays, ArrayBuffer | `collections.md` (832 lines) | Ongoing |
| **07-web-apis** | DOM, Events, Storage, IntersectionObserver, File API, Canvas | `web-apis.md` (1125 lines) | Week 11-12 |
| **08-error-handling** | try/catch/finally, Error types, stack traces, debugging | `errors.md` (613 lines) | Ongoing |
| **09-modern-patterns** | Destructuring, optional chaining, nullish coalescing, spread, regex, dates, debounce/throttle | `modern-syntax.md` (1262 lines) + `js-lectures-extras.md` (448 lines) | Ongoing |
| **10-auth-security** | JWT (structure/signing/verification), sessions, refresh rotation, password hashing, OAuth2+PKCE, WebSocket auth, XSS/CSRF/CORS, token storage | `auth-security.md` + 12 code files (zero deps, Node built-ins) | Ongoing |

---

## How to Use This

### For Interview Prep (Explain Out Loud)
1. Open a module's `*.md` file
2. Read the **"Explain It"** section for each concept
3. Say it out loud — 4-6 sentences, your words
4. Run the **"Prove It"** code snippet
5. Move to next concept

### For Building Confidence (Code)
1. Check `builds/` for that week's project
2. Build it from scratch (no copy-paste)
3. Break it. Fix it. Understand why.
4. Add your own twist

### Weekly Rhythm (45-60 min/day)
| Day | Activity |
|-----|----------|
| Mon-Wed | Read module notes + MDN/YDKJS refs. Draft explanations. |
| Thu | Run code snippets. Finalize explanations. |
| Fri/Sat | Build the weekly project. Read last 3 explanations out loud. |


---

## Module Detail Index

### 01-fundamentals
- `grammar-types-operators.md` — var/let/const, 8 types, type coercion, `==` vs `===` vs `Object.is`, all operators, control flow, strings, numbers, Math

### 02-scope-closures
- `scope-closures.md` — Lexical scope, scope chain, hoisting, TDZ, block scope, shadowing, closures (definition + patterns), setTimeout + closures, IIFE, module pattern

### 03-this-prototypes
- `this-prototypes-classes.md` — this (4 rules + arrow functions), prototype chain, `Object.create`, `new`, classes, extends, super, static, private `#`, inheritance

### 04-async-js
- `async-js.md` — Execution context, call stack, sync vs async, event loop, micro/macrotask queues, promises (states, chaining, all/race/allSettled/any), async/await, fetch, error handling, JS engine & V8 architecture

### 05-modules-advanced
- `advanced.md` — ESM (export/import, dynamic import), iterators, generators, Symbols, well-known symbols, Proxy, Reflect, WeakRef, FinalizationRegistry

### 06-collections
- `collections.md` — Array methods (map/filter/reduce/flat), mutating vs non-mutating, sparse arrays, Maps, Sets, WeakMap, WeakSet, TypedArrays, JSON

### 07-web-apis
- `web-apis.md` — DOM selection/creation/manipulation, event delegation, Event phases, localStorage, sessionStorage, IntersectionObserver, MutationObserver, ResizeObserver, Fetch API, File/Blob, FormData, Canvas basics

### 08-error-handling
- `errors.md` — try/catch/finally, Error types (TypeError, ReferenceError, RangeError, URIError, SyntaxError, EvalError), custom errors, error propagation, debugging, stack traces, console methods

### 09-modern-patterns
- `modern-syntax.md` — Destructuring, spread/rest, template literals, default params, arrow functions, for...of, optional chaining, nullish coalescing, regex, Date/Time, functional patterns, debounce & throttle
- `js-lectures-extras.md` — delete keyword, NodeList vs HTMLCollection, self keyword, Draggable API, FormData API, Calendar project, LeaderBoard project, practical DOM patterns

### 10-auth-security
- `auth-security.md` — Auth vs authorization, session vs token, JWT structure (header/payload/signature), HS256 vs RS256, verification + claims, refresh rotation, password hashing/salting/timing-safe compare, OAuth 2.0 + PKCE, WebSocket auth, token storage strategy, XSS/CSRF/CORS/CSP
- `01-auth-concepts.js` — AuthN vs AuthZ, session vs JWT comparison
- `02-jwt-structure.js` — JWT built from scratch, tamper test
- `03-jwt-signing.js` — HS256 vs RS256 with Node crypto
- `04-jwt-verification.js` — 3-step verification gauntlet (signature → alg → claims)
- `05-session-auth.js` — stateful sessions, revocation, expiry
- `06-http-auth-middleware.js` — runnable HTTP server: register/login/me/refresh-with-rotation/logout
- `07-password-hashing.js` — scrypt + salt + timing-safe compare
- `08-oauth-pkce.js` — authorization code flow, verifier/challenge, replay protection
- `09-websocket-auth.js` — zero-dep WS server: handshake token auth, masked frames, ping/pong, mid-session expiry (4001)
- `10-token-storage.js` — storage trade-offs + 401→refresh→replay interceptor
- `11-web-attacks.js` — XSS, CSRF, SameSite, CORS, security headers
- `12-interview-questions.js` — 18 Q&A to say out loud

