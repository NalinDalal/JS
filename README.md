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
├── 10-auth-security/        # auth-security.md (JWT, sessions, OAuth, WS, attacks)
├── 11-webrtc/               # webrtc.md (P2P media/data, signaling, STUN/TURN)
├── 12-websockets/           # websockets.md (protocol, rooms, heartbeat, auth, scaling)
├── 13-db-orms/              # db-orms.md (Mongoose + Prisma, schema, populate, migrations)
├── 14-typescript/           # typescript.md (types, generics, narrowing, utility types)
├── 15-node-internals/       # node-internals.md (event loop, libuv, streams, workers)
├── 16-testing/              # testing.md (unit/integration, mocks, TDD, mini test runner)
├── 17-networking-protocols/ # networking-protocols.md (DNS, TCP, UDP, TLS, HTTP/1.1-2-3)
└── 18-caching-queues/       # caching-queues.md (LRU, cache-aside, retries, rate limiting)
```

Every module ships TWO interview artifacts: a code-style `*-interview-*.js` (runnable) and a text question bank `*-questions.js` (say it out loud).

---

## Quick Navigation

| Module | Concepts Covered | Key Files | Est. Time |
|--------|------------------|-----------|-----------|
| **01-fundamentals** | var/let/const, types, coercion, operators, control flow | [grammar-types-operators.md](01-fundamentals/grammar-types-operators.md) (354 lines) | Week 1-2 |
| **02-scope-closures** | Lexical scope, hoisting, TDZ, closures, IIFE, module pattern | [scope-closures.md](02-scope-closures/scope-closures.md) (486 lines) | Week 2-3 |
| **03-this-prototypes** | this (4 rules), prototype chain, `new`, classes, inheritance | [this-prototypes-classes.md](03-this-prototypes/this-prototypes-classes.md) (590 lines) | Week 4-5 |
| **04-async-js** | Event loop, micro/macrotasks, promises, async/await, fetch, V8 engine | [async-js.md](04-async-js/async-js.md) (952 lines) | Week 7-9 |
| **05-modules-advanced** | ESM, dynamic import, iterators, generators, proxies, symbols | [advanced.md](05-modules-advanced/advanced.md) (1342 lines) | Week 10 |
| **06-collections** | Arrays, Maps, Sets, WeakMap/Set, TypedArrays, ArrayBuffer | [collections.md](06-collections/collections.md) (898 lines) | Ongoing |
| **07-web-apis** | DOM, Events, Storage, IntersectionObserver, File API, Canvas | [web-apis.md](07-web-apis/web-apis.md) (1704 lines) | Week 11-12 |
| **08-error-handling** | try/catch/finally, Error types, stack traces, debugging | [errors.md](08-error-handling/errors.md) (676 lines) | Ongoing |
| **09-modern-patterns** | Destructuring, optional chaining, nullish coalescing, spread, regex, dates, debounce/throttle | [modern-syntax.md](09-modern-patterns/modern-syntax.md) (1272 lines) + [js-lectures-extras.md](09-modern-patterns/js-lectures-extras.md) (448 lines) | Ongoing |
| **10-auth-security** | JWT (structure/signing/verification), sessions, refresh rotation, password hashing, OAuth2+PKCE, WebSocket auth, XSS/CSRF/CORS, token storage | [auth-security.md](10-auth-security/auth-security.md) + 12 code files (zero deps, Node built-ins) | Ongoing |
| **11-webrtc** | P2P media/data, signaling, SDP/ICE, STUN/TURN, DataChannels, DTLS-SRTP security | [webrtc.md](11-webrtc/webrtc.md) + 8 code files (zero deps, Node built-ins) | Ongoing |
| **12-websockets** | WebSocket protocol, rooms, broadcasting, heartbeat, auth patterns, reconnection, scaling | [websockets.md](12-websockets/websockets.md) (16 sections) + 9 code files (zero deps + ws library) | Ongoing |
| **13-db-orms** | SQL vs NoSQL, Mongoose (schema, CRUD, hooks, virtuals, populate), Prisma (schema, migrations, relations), indexes, transactions | [db-orms.md](13-db-orms/db-orms.md) (14 sections) + 8 files (zero-dep ODM + mongoose/prisma code) | Week 15 |
| **14-typescript** | Erasable syntax, inference, unions, structural typing, narrowing, generics, utility types, tsconfig | [typescript.md](14-typescript/typescript.md) (15 sections) + 9 files (.ts run with tsx) | Week 16 |
| **15-node-internals** | Node architecture, event loop phases, nextTick/microtasks, libuv thread pool, worker_threads, cluster, streams, buffers | [node-internals.md](15-node-internals/node-internals.md) (15 sections) + 13 files (zero deps) | Week 17 |
| **16-testing** | Unit/integration/e2e, AAA, matchers, mocks & spies, async tests, isolation, coverage, TDD, cart + API client suites | [testing.md](16-testing/testing.md) (13 sections) + 11 files (zero-dep mini test runner) | Week 18 |
| **17-networking-protocols** | OSI layers, DNS, TCP handshake, UDP, TLS, HTTP methods/headers/caching, HTTP/1.1 vs 2 vs 3, proxies | [networking-protocols.md](17-networking-protocols/networking-protocols.md) (12 sections) + 9 files (zero deps, real network demos) | Week 19 |
| **18-caching-queues** | Cache-aside, write-through/back, TTL, LRU/LFU eviction, Redis patterns, queues, retries + backoff, DLQ, rate limiting | [caching-queues.md](18-caching-queues/caching-queues.md) (14 sections) + 9 files (zero deps) | Week 20 |

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
- [grammar-types-operators.md](01-fundamentals/grammar-types-operators.md) — var/let/const, 8 types, type coercion, `==` vs `===` vs `Object.is`, all operators, control flow, strings, numbers, Math
- [06-interview-questions.js](01-fundamentals/06-interview-questions.js) — 16 Q&A + whiteboard drills (text bank)

### 02-scope-closures
- [scope-closures.md](02-scope-closures/scope-closures.md) — Lexical scope, scope chain, hoisting, TDZ, block scope, shadowing, closures (definition + patterns), setTimeout + closures, IIFE, module pattern
- [06-interview-questions.js](02-scope-closures/06-interview-questions.js) — 14 Q&A + whiteboard drills (text bank)

### 03-this-prototypes
- [this-prototypes-classes.md](03-this-prototypes/this-prototypes-classes.md) — this (4 rules + arrow functions), prototype chain, `Object.create`, `new`, classes, extends, super, static, private `#`, inheritance
- [07-interview-questions.js](03-this-prototypes/07-interview-questions.js) — 14 Q&A + whiteboard drills (text bank)

### 04-async-js
- [async-js.md](04-async-js/async-js.md) — Execution context, call stack, sync vs async, event loop, micro/macrotask queues, promises (states, chaining, all/race/allSettled/any), async/await, fetch, error handling, JS engine & V8 architecture
- [08-interview-questions.js](04-async-js/08-interview-questions.js) — 14 Q&A + whiteboard drills (text bank)

### 05-modules-advanced
- [advanced.md](05-modules-advanced/advanced.md) — ESM (export/import, dynamic import), iterators, generators, Symbols, well-known symbols, Proxy, Reflect, WeakRef, FinalizationRegistry
- [08-interview-questions.js](05-modules-advanced/08-interview-questions.js) — 14 Q&A + whiteboard drills (text bank)

### 06-collections
- [collections.md](06-collections/collections.md) — Array methods (map/filter/reduce/flat), mutating vs non-mutating, sparse arrays, Maps, Sets, WeakMap, WeakSet, TypedArrays, JSON
- [07-interview-questions.js](06-collections/07-interview-questions.js) — 14 Q&A + whiteboard drills (text bank)

### 07-web-apis
- [web-apis.md](07-web-apis/web-apis.md) — DOM selection/creation/manipulation, event delegation, Event phases, localStorage, sessionStorage, IntersectionObserver, MutationObserver, ResizeObserver, Fetch API, File/Blob, FormData, Canvas basics
- [12-interview-questions.js](07-web-apis/12-interview-questions.js) — 14 Q&A + whiteboard drills (text bank)

### 08-error-handling
- [errors.md](08-error-handling/errors.md) — try/catch/finally, Error types (TypeError, ReferenceError, RangeError, URIError, SyntaxError, EvalError), custom errors, error propagation, debugging, stack traces, console methods
- [06-interview-questions.js](08-error-handling/06-interview-questions.js) — 14 Q&A + whiteboard drills (text bank)

### 09-modern-patterns
- [modern-syntax.md](09-modern-patterns/modern-syntax.md) — Destructuring, spread/rest, template literals, default params, arrow functions, for...of, optional chaining, nullish coalescing, regex, Date/Time, functional patterns, debounce & throttle
- [js-lectures-extras.md](09-modern-patterns/js-lectures-extras.md) — delete keyword, NodeList vs HTMLCollection, self keyword, Draggable API, FormData API, Calendar project, LeaderBoard project, practical DOM patterns
- [13-interview-questions.js](09-modern-patterns/13-interview-questions.js) — 14 Q&A + whiteboard drills (text bank)

### 10-auth-security
- [auth-security.md](10-auth-security/auth-security.md) — Auth vs authorization, session vs token, JWT structure (header/payload/signature), HS256 vs RS256, verification + claims, refresh rotation, password hashing/salting/timing-safe compare, OAuth 2.0 + PKCE, WebSocket auth, token storage strategy, XSS/CSRF/CORS/CSP
- [01-auth-concepts.js](10-auth-security/01-auth-concepts.js) — AuthN vs AuthZ, session vs JWT comparison
- [02-jwt-structure.js](10-auth-security/02-jwt-structure.js) — JWT built from scratch, tamper test
- [03-jwt-signing.js](10-auth-security/03-jwt-signing.js) — HS256 vs RS256 with Node crypto
- [04-jwt-verification.js](10-auth-security/04-jwt-verification.js) — 3-step verification gauntlet (signature → alg → claims)
- [05-session-auth.js](10-auth-security/05-session-auth.js) — stateful sessions, revocation, expiry
- [06-http-auth-middleware.js](10-auth-security/06-http-auth-middleware.js) — runnable HTTP server: register/login/me/refresh-with-rotation/logout
- [07-password-hashing.js](10-auth-security/07-password-hashing.js) — scrypt + salt + timing-safe compare
- [08-oauth-pkce.js](10-auth-security/08-oauth-pkce.js) — authorization code flow, verifier/challenge, replay protection
- [09-websocket-auth.js](10-auth-security/09-websocket-auth.js) — zero-dep WS server: handshake token auth, masked frames, ping/pong, mid-session expiry (4001)
- [10-token-storage.js](10-auth-security/10-token-storage.js) — storage trade-offs + 401→refresh→replay interceptor
- [11-web-attacks.js](10-auth-security/11-web-attacks.js) — XSS, CSRF, SameSite, CORS, security headers
- [12-interview-questions.js](10-auth-security/12-interview-questions.js) — 18 Q&A to say out loud

### 11-webrtc
- [webrtc.md](11-webrtc/webrtc.md) — WebRTC vs WebSocket, RTCPeerConnection, SDP, ICE, STUN/TURN, DataChannels, DTLS-SRTP security, connection lifecycle, troubleshooting
- [01-webrtc-concepts.js](11-webrtc/01-webrtc-concepts.js) — WebRTC vs WS decision table + architecture map
- [02-signaling-server.js](11-webrtc/02-signaling-server.js) — from-scratch WS signaling server: auth + rooms + SDP/ICE relay
- [03-rtc-lifecycle.js](11-webrtc/03-rtc-lifecycle.js) — full state machine: offer/answer, ICE trickle, ICE restart, perfect negotiation
- [04-sdp-explained.js](11-webrtc/04-sdp-explained.js) — parses a real Chrome SDP offer line by line + ICE candidates
- [05-media.js](11-webrtc/05-media.js) — getUserMedia, constraints, tracks (browser code)
- [06-datachannel-simulation.js](11-webrtc/06-datachannel-simulation.js) — reliable vs unreliable, ordered vs unordered, backpressure
- [07-webrtc-security.js](11-webrtc/07-webrtc-security.js) — DTLS-SRTP key derivation, threat model, why signaling can't read media
- [08-interview-webrtc.js](11-webrtc/08-interview-webrtc.js) — 14 Q&A to say out loud

### 12-websockets
- [websockets.md](12-websockets/websockets.md) — WebSocket protocol overview, zero-dependency server, rooms/broadcasting, heartbeat/keepalive, auth patterns (query/cookie/subprotocol), client reconnection, scaling (sticky sessions, pub/sub), WebSocket vs SSE vs long-polling
- [01-websocket-protocol.js](12-websockets/01-websocket-protocol.js) — minimal echo server: HTTP upgrade, frame parsing, masked client frames
- [02-rooms-broadcasting.js](12-websockets/02-rooms-broadcasting.js) — room management, broadcast, join/leave/message protocol
- [03-heartbeat.js](12-websockets/03-heartbeat.js) — ping/pong keepalive, dead connection detection and timeout
- [04-auth.js](12-websockets/04-auth.js) — handshake-time auth: query token, cookie, subprotocol, mid-session expiry
- [05-client.js](12-websockets/05-client.js) — reconnecting client with exponential backoff + jitter, message queue
- [06-scaling.js](12-websockets/06-scaling.js) — sticky sessions, pub/sub broker simulation, multi-process fan-out
- [07-interview-websockets.js](12-websockets/07-interview-websockets.js) — 14 Q&A to say out loud
- [08-browser-client.js](12-websockets/08-browser-client.js) — browser WebSocket API: readyState, text/binary, Blob/ArrayBuffer, event handling
- [09-ws-library.js](12-websockets/09-ws-library.js) — production `ws` npm package quick-start (server + client + TLS + cleanup)

### 13-db-orms
- [db-orms.md](13-db-orms/db-orms.md) — SQL vs NoSQL, what an ORM/ODM is, Mongoose (Schema → Model, CRUD + operators, middleware hooks, methods/statics/virtuals, populate), Prisma (schema.prisma, migrations, Client CRUD, relations), Mongoose vs Prisma, indexes & N+1, transactions
- [01-mini-odm.js](13-db-orms/01-mini-odm.js) — zero-dep hand-rolled ODM: what an ODM does under the hood
- [02-mongoose-schema.js](13-db-orms/02-mongoose-schema.js) — validators, pre('save') hook, methods/statics/virtuals (needs `npm i mongoose`)
- [03-mongoose-crud.js](13-db-orms/03-mongoose-crud.js) — CRUD + `$gte/$in/$regex`, sort/limit, `$set/$inc/$push`
- [04-mongoose-populate.js](13-db-orms/04-mongoose-populate.js) — User/Post refs, populate, deep + virtual populate, N+1 warning
- [05-prisma-schema.prisma](13-db-orms/05-prisma-schema.prisma) — models, enums, 1:N + explicit M:N relations, `@@index`
- [06-prisma-client.js](13-db-orms/06-prisma-client.js) — typed CRUD, AND/OR where, include/select, P2002, `$transaction`
- [07-query-comparison.js](13-db-orms/07-query-comparison.js) — same query in Mongoose vs Prisma side-by-side + N+1 math
- [09-schema-visualisation.js](13-db-orms/09-schema-visualisation.js) — ASCII visualisation: SQL tables/FKs/JOIN vs NoSQL nested/embedded documents + ORM mapping
- [08-interview-db-orms.js](13-db-orms/08-interview-db-orms.js) — 14 Q&A to say out loud

### 14-typescript
- [typescript.md](14-typescript/typescript.md) — what TS is (erasable syntax), annotations vs inference + strict, core types, unions/literals, interface vs type, structural typing, narrowing, generics, utility types, any/unknown/never, function overloads, classes, tsconfig, TS in Express + Prisma
- [01-what-ts-compiles-to.js](14-typescript/01-what-ts-compiles-to.js) — zero-dep: .ts source vs compiled JS side-by-side
- [02-basics.ts](14-typescript/02-basics.ts) — annotations, inference, tuples, optional, null vs undefined (`npx tsx`)
- [03-unions-narrowing.ts](14-typescript/03-unions-narrowing.ts) — all narrowing techniques + discriminated unions
- [04-interfaces-vs-types.ts](14-typescript/04-interfaces-vs-types.ts) — extends, unions, intersection, structural typing
- [05-generics.ts](14-typescript/05-generics.ts) — generic functions/interfaces, `extends` constraints, defaults
- [06-utility-types.ts](14-typescript/06-utility-types.ts) — Partial/Pick/Omit/Record/ReturnType/Parameters/Exclude
- [07-advanced-types.ts](14-typescript/07-advanced-types.ts) — any vs unknown vs never, overloads, abstract classes
- [08-api-client.ts](14-typescript/08-api-client.ts) — Week 16 build: generic typed ApiClient with retry (offline mock)
- [09-interview-typescript.js](14-typescript/09-interview-typescript.js) — 14 Q&A to say out loud

### 15-node-internals
- [node-internals.md](15-node-internals/node-internals.md) — Node architecture (V8 + libuv), event loop phases, nextTick vs microtask vs macrotask, setImmediate vs setTimeout, thread pool, blocking vs non-blocking, worker_threads, cluster, streams + backpressure, buffers, process object, CJS vs ESM, EventEmitter, unhandled errors
- [01-architecture.js](15-node-internals/01-architecture.js) — ASCII diagram: what runs where
- [02-event-loop-order.js](15-node-internals/02-event-loop-order.js) — the classic ordering demo
- [03-timers-race.js](15-node-internals/03-timers-race.js) — setImmediate vs setTimeout(0) inside/outside I/O
- [04-thread-pool.js](15-node-internals/04-thread-pool.js) — 5× pbkdf2: 4 finish together, 5th waits
- [05-blocking-vs-nonblocking.js](15-node-internals/05-blocking-vs-nonblocking.js) — sync fs stalls the loop, async doesn't
- [06-worker-threads.js](15-node-internals/06-worker-threads.js) — CPU work off the main thread
- [07-cluster.js](15-node-internals/07-cluster.js) — multi-core HTTP servers with per-worker counting
- [08-streams.js](15-node-internals/08-streams.js) — pipeline, transforms, backpressure/drain
- [09-buffers.js](15-node-internals/09-buffers.js) — Buffer.from/alloc, encodings, concat
- [10-process-events.js](15-node-internals/10-process-events.js) — argv/env/exit codes, signals, graceful shutdown
- [11-cjs.cjs](15-node-internals/11-cjs.cjs) + [12-esm.mjs](15-node-internals/12-esm.mjs) — same module in both systems
- [13-interview-node-internals.js](15-node-internals/13-interview-node-internals.js) — 14 Q&A to say out loud

### 16-testing
- [testing.md](16-testing/testing.md) — why test + pyramid, AAA, matchers, minimal runner, mocks & spies, async tests, error/edge cases, isolation, coverage, TDD, cart suite, mocking network code
- [01-mini-test-runner.js](16-testing/01-mini-test-runner.js) — zero-dep describe/test/expect framework (the repo's "Jest")
- [02-basic-tests.js](16-testing/02-basic-tests.js) — AAA + good test names (13/13 pass)
- [03-aaa-and-matchers.js](16-testing/03-aaa-and-matchers.js) — toBe vs toEqual, all matchers (15/15)
- [04-mocks-spies.js](16-testing/04-mocks-spies.js) — fake fetch, monkey-patched Date.now/Math.random (5/5)
- [05-async-tests.js](16-testing/05-async-tests.js) — promise retry, done-wrapper (7/7)
- [06-error-edge-cases.js](16-testing/06-error-edge-cases.js) — divide-by-zero, invalid JSON, boundaries (16/16)
- [07-isolation.js](16-testing/07-isolation.js) — flaky shared state vs per-test reset (narrated)
- [08-tdd-example.js](16-testing/08-tdd-example.js) — red → green → refactor walkthrough
- [09-cart-tests.js](16-testing/09-cart-tests.js) — Week 3 shopping cart suite (11/11)
- [10-api-client-tests.js](16-testing/10-api-client-tests.js) — retry/exhaustion/404 with mock fetch (6/6)
- [11-interview-testing.js](16-testing/11-interview-testing.js) — 14 Q&A to say out loud

### 17-networking-protocols
- [networking-protocols.md](17-networking-protocols/networking-protocols.md) — OSI/TCP-IP layers, DNS (hierarchy, records, TTL), TCP (3-way handshake, head-of-line blocking), UDP vs TCP, TLS (handshake, certs, forward secrecy), HTTP structure/status codes, caching headers, HTTP/1.1 vs 2 vs 3, HTTPS, keep-alive & pooling, proxies & load balancers
- [01-dns.js](17-networking-protocols/01-dns.js) — lookup + A/AAAA/CNAME/MX records
- [02-tcp-echo.js](17-networking-protocols/02-tcp-echo.js) — raw TCP echo: the handshake made visible
- [03-udp.js](17-networking-protocols/03-udp.js) — dgram ping/pong + latency
- [04-http-server.js](17-networking-protocols/04-http-server.js) — status codes, ETag/304, cookies, CORS
- [05-tls-handshake.js](17-networking-protocols/05-tls-handshake.js) — real TLS1.3 handshake: cipher, ALPN, cert chain
- [06-http2.js](17-networking-protocols/06-http2.js) — multiplexing: N requests, one socket
- [07-http-caching.js](17-networking-protocols/07-http-caching.js) — Cache-Control/ETag/304 simulation
- [08-proxy.js](17-networking-protocols/08-proxy.js) — Week 19 build: reverse proxy to a real API
- [09-interview-networking.js](17-networking-protocols/09-interview-networking.js) — 14 Q&A to say out loud

### 18-caching-queues
- [caching-queues.md](18-caching-queues/caching-queues.md) — why cache, cache-aside (incl. thundering herd), write-through/back/around, TTL & invalidation, eviction policies, Redis patterns, queues (FIFO/priority/delayed), worker pools, retries + exponential backoff + jitter, dead-letter queues, delivery semantics, rate limiting
- [01-lru-cache.js](18-caching-queues/01-lru-cache.js) — Map-based LRU with eviction log
- [02-cache-aside.js](18-caching-queues/02-cache-aside.js) — TTL store + single-flight (5 concurrent → 1 DB hit)
- [03-cache-policies.js](18-caching-queues/03-cache-policies.js) — write-through/back/around scenario log + crash-loss sim
- [04-job-queue.js](18-caching-queues/04-job-queue.js) — retries, exponential backoff, dead-letter queue
- [05-priority-queue.js](18-caching-queues/05-priority-queue.js) — FIFO vs priority
- [06-delayed-jobs.js](18-caching-queues/06-delayed-jobs.js) — time-sorted scheduler
- [07-rate-limiter.js](18-caching-queues/07-rate-limiter.js) — fixed window, sliding window, token bucket
- [08-simulated-redis.js](18-caching-queues/08-simulated-redis.js) — SET/GET/EXPIRE, INCR, SETNX lock, pub/sub
- [09-interview-caching-queues.js](18-caching-queues/09-interview-caching-queues.js) — 14 Q&A to say out loud

