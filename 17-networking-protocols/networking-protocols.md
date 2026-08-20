# Module 17: Networking Protocols — DNS, TCP, UDP, TLS, HTTP

---

## 17.1 The Stack: OSI/TCP-IP Layers

### Explain It

A **protocol** is simply a shared rulebook — both sides agree on byte layout, ordering, and meaning. Networks are built in layers, each wrapping the one above (**encapsulation**). The TCP/IP model has four: **link** (Ethernet/Wi-Fi), **internet** (IP), **transport** (TCP or UDP), and **application** (HTTP, DNS). Each layer adds its own header and treats the layer above as opaque payload: HTTP adds a request line + headers, TCP adds a segment header with ports and seq/ack numbers, IP adds a packet header with source/destination addresses. The OSI model splits application/transport into seven layers, but the four-layer model is what actually runs on the internet. **TLS sits between transport and application** — it wraps TCP and is wrapped by HTTP, which is why `https:` is literally "HTTP over TLS over TCP." The elegant part of layering: HTTP never needs to know whether it's riding over Wi-Fi, 5G, or fiber.

### Prove It

```js
// 02-tcp-echo.js — run: node 02-tcp-echo.js
// (every layer above is exercised before you even see 'client connected':
// node:net = transport layer, sockets = transport + internet + link layers)
```

#### Gotchas / Edge Cases

- Encapsulation means each layer gets **wrapped, not rewritten** — a TCP segment carries the whole HTTP message untouched inside its payload.
- The OSI 7-layer model (physical, data link, network, transport, session, presentation, application) is a *reference*, not what ships in products — interviews like the terms "L4" and "L7" though.
- Load balancers are categorized by layer: **L4** balances on IP/port only, **L7** sees inside the HTTP message (path, cookies, headers).
- TCP ports (0–65535) only have meaning at the *transport* layer — IP addresses live one layer down, the URL's path lives one layer up.
- 127.0.0.1 (loopback) **never leaves the machine** — it skips the link layer entirely, which is why local demos are instant and offline-immune.

---

## 17.2 DNS: The Phonebook

### Explain It

DNS (Domain Name System) turns human names into IP addresses: `github.com` → `140.82.112.4`. Resolution walks a **hierarchy**: your request hits a **resolver** (usually your ISP or 8.8.8.8), which walks **root servers**, then **TLD servers** (`com`, `org`), then the domain's **authoritative nameserver** — the source of truth for that domain's records. Records have types: **A** (IPv4), **AAAA** (IPv6), **CNAME** (alias, e.g. `www.` → apex — the apex itself can't be a CNAME), **MX** (mail servers, with priority), **TXT** (SPF/DKIM email auth, domain verification). Lookup order in a browser: **cache** → OS cache → `/etc/hosts` → resolver → DNS servers. Every answer carries a **TTL** (time-to-live) — how long any cache may reuse it before re-querying. This all happens *before* a single byte of TCP is sent.

### Prove It

```js
// 01-dns.js — run: node 01-dns.js
```

#### Gotchas / Edge Cases

- `dns.lookup()` uses the OS resolver (`getaddrinfo`) and respects **/etc/hosts**; `dns.resolve()` talks to DNS servers directly and **skips the hosts file** — a classic source of "works locally, fails in prod" bugs.
- The apex (bare `example.com`) **cannot be a CNAME** — only names below it (`www.`, `api.`) can.
- Records with no answer throw `ENODATA` (e.g. querying AAAA for an IPv4-only host) — wrap optional record types in try/catch.
- TTL is a **cache hint, not a guarantee** — browsers and ISPs may exceed it, and DNS *negative* caching can cache failures too.
- `localhost` is usually resolved by `/etc/hosts`, not DNS — on some systems it's only in `::1` (IPv6), so IPv4-only tooling fails.

---

## 17.3 TCP: The Reliable Transport

### Explain It

TCP is a **connection-oriented, reliable byte stream**. A connection starts with the **3-way handshake**: client sends **SYN** (with its initial sequence number), server replies **SYN-ACK** (its own sequence number + acknowledges the client's), client sends **ACK**. Sequence numbers let both sides detect loss, duplication, and reordering; every segment is acknowledged, and anything unacknowledged is **retransmitted**. This is why TCP guarantees delivery and ordering regardless of the network underneath. Closing is a **FIN/ACK** exchange (four segments — close is half-closed, each direction closes independently). Because TCP guarantees order, a connection is a **single in-order pipe** — which causes **head-of-line blocking**: one slow/lost segment stalls everything behind it. For HTTP/1.1, that meant one request per connection; browsers opened ~6 parallel connections to work around it.

### Prove It

```js
// 02-tcp-echo.js — run: node 02-tcp-echo.js
```

#### Gotchas / Edge Cases

- `'connect'` fires on **both sides** only after the handshake — you never see the SYN packets; Node abstracts the whole handshake.
- `client.end()` sends FIN (half-close); the server's `'end'`/`'close'` events fire on the reply. A true FIN/ACK close is 4 segments each way.
- Connection is **stateful**: sockets have buffers, sequence counters, and congestion state — that's why load balancers need *sticky routing* for WebSockets.
- Head-of-line blocking is why HTTP/1.1 multiplexing-at-the-connection-level was impossible, and the exact pain HTTP/2 and HTTP/3 were built to kill.
- Hanging your demo is the classic failure — always add a safety `setTimeout` that force-exits the process.

---

## 17.4 UDP vs TCP

### Explain It

UDP (User Datagram Protocol) is **connectionless**: no handshake, no session, no sequence numbers, no retransmission. You build a **datagram** and throw it at an address; if it's lost, it's lost. Node's `dgram` module reflects this perfectly — `client.send()` doesn't connect, it just fire-and-forgets. UDP wins where **freshness beats reliability**: DNS (one question, one answer — retransmit at the application layer if needed), live video/voice (a late packet is garbage anyway), online games (old state is worse than no state), and **QUIC**, the foundation of HTTP/3 — TCP lives in the OS kernel and can't be upgraded as fast as the web needs, so QUIC was built on UDP with TLS built in, giving independent streams, 0-RTT, and no head-of-line blocking. The rule of thumb: if losing a packet is worse than being 100ms late, use TCP; if being late is worse than losing, use UDP.

### Prove It

```js
// 03-udp.js — run: node 03-udp.js
```

#### Gotchas / Edge Cases

- UDP is **unreliable in both directions**: no ACK means you'll never know a datagram arrived — build application-level confirmations if you need them (that's what QUIC does on top of raw UDP).
- Datagrams are **not ordered** and **not fragmented** at the app layer — a message bigger than the MTU gets split by IP and reassembled by the *receiver's IP stack*, and may still arrive out of order.
- The same `dgram` socket can receive from **many senders** with no connection — the `rinfo` carries `address` + `port` so you know who sent it.
- There's no congestion control by default — UDP floods are how DNS/amplification DDoS attacks work (spoofed source → flooded victim).
- `dgram` sockets and DNS both work offline on loopback — great for demos, but don't confuse "no error" with "delivered."

---

## 17.5 TLS: The Encryption Layer

### Explain It

TLS wraps a TCP connection in encryption and trust. The **handshake**: client sends **ClientHello** (supported TLS versions, cipher suites, an SNI hostname, a random nonce); server replies **ServerHello** (chosen suite), its **certificate** (and chain), and a **key exchange** — modern suites use **ECDHE**, ephemeral Diffie-Hellman, which produces a fresh per-session key. The client validates the certificate chain up to a **trusted CA**, computes the shared session key, and both sides send **Finished** — after which all data is encrypted with AEAD ciphers (AES-GCM / ChaCha20). **SNI** (Server Name Indication) tells the server *which* certificate to present, enabling many HTTPS sites on one IP. **Forward secrecy** (from ECDHE) means even if the server's long-term key leaks, previously-recorded sessions stay private. **TLS 1.3** removed the legacy suites (RSA key exchange, SHA-1), made forward secrecy mandatory, and cut the handshake to one round trip (0-RTT with resumption).

### Prove It

```js
// 05-tls-handshake.js — run: node 05-tls-handshake.js
```

#### Gotchas / Edge Cases

- Always send `servername` (SNI) — without it, multi-certificate hosts (almost everyone) may present a default/wrong cert or reject the connection.
- Cert validation errors (`CERT_HAS_EXPIRED`, `UNABLE_TO_VERIFY_LEAF_SIGNATURE`) mean **failure by design** — never blindly set `rejectUnauthorized: false` in production.
- Node can't use TLS 1.0/1.1 anymore; `getProtocol()` returns `TLSv1.3` — a college interview answer worth knowing the "why" of.
- `getPeerCertificate(true)` returns chain details; the leaf's `valid_from`/`valid_to` are strictly enforced by clients, not servers.
- ALPN is negotiated *inside* the TLS handshake — that's how the browser knows it can speak HTTP/2 (`h2`) over the same encrypted socket.

---

## 17.6 HTTP Request/Response

### Explain It

HTTP is a **stateless, text-based request/response protocol** that runs over a stream (TCP or QUIC). A request has a **request line** (`GET /path HTTP/1.1`), **headers** (Host, User-Agent, Accept…), an optional body. The response has a **status line** (`HTTP/1.1 200 OK`), headers, and a body. **Methods**: `GET` (read), `POST` (create), `PUT` (replace), `PATCH` (partial update), `DELETE` (remove), `HEAD` (GET without body), `OPTIONS` (preflight/CORS). **Idempotency** is the key interview concept: repeating an idempotent method (GET/PUT/DELETE/HEAD/OPTIONS) leaves the same state — so retries are safe. **POST is not idempotent** (each POST creates a new resource) — that's why browsers warn before resubmitting forms. **Status families**: `1xx` informational (101 Switching Protocols), `2xx` success (200, 201 Created, 204, 206), `3xx` redirect (301/302, 304 Not Modified), `4xx` client error (400, 401, 403, 404, 405, 429), `5xx` server error (500, 502, 503, 504).

### Prove It

```js
// 04-http-server.js — run: node 04-http-server.js
// (exercises 200 / 201 / 304 / 404 / 405 / 500 in one run)
```

#### Gotchas / Edge Cases

- A `405` must include an **`Allow`** header listing what methods the resource accepts.
- `304 Not Modified` has **no body** — it's an instruction to reuse the cache, not a response to render.
- Node's HTTP parser fires `'data'` events in chunks — gather the whole body with `req.on('data'/'end')` before `JSON.parse`.
- The **`Host` header** (or `:authority` in HTTP/2) is what lets many domains share one IP — it's how virtual hosting works.
- `POST` followed by a page refresh resubmits the form (danger); after a successful POST, return `201` and redirect (`303 See Other`) — the Post/Redirect/Get pattern.

---

## 17.7 HTTP Headers: Caching, Cookies, CORS, Content

### Explain It

Headers carry the semantics that make HTTP useful.

- **Caching**: `Cache-Control: max-age=60` says "safe to reuse for 60s without asking"; `no-store` says never cache; `no-cache` says cache but always revalidate. **`ETag`** is an opaque validator (usually a hash); the client sends it back as **`If-None-Match`**, and if it matches the current resource the server replies **`304 Not Modified`** with no body. `Last-Modified`/`If-Modified-Since` is the weaker, timestamp-based alternative (by-type same ETags except cheating). `Cache-Control` sets freshness; `ETag` handles revalidation.
- **Cookies**: `Set-Cookie: sid=abc; HttpOnly; SameSite=Lax`. `HttpOnly` keeps the cookie out of `document.cookie` (XSS can't steal it); `SameSite=Lax` sends it on top-level navigations but not cross-site subrequests — the CSRF defense; `Secure` (which we add in prod) restricts it to HTTPS.
- **CORS**: the browser enforces `Access-Control-Allow-Origin` (who may read the response), plus `-Methods`, `-Headers`, and preflight `OPTIONS`. Servers must set these or cross-origin JS silently fails.
- **Content negotiation**: `Content-Type` describes the body (`application/json`, `text/html`) — most API bugs start here.
- Performance: `Content-Encoding: gzip/br` and `Content-Length`/`chunked` round out the essentials.

### Prove It

```js
// 04-http-server.js — run: node 04-http-server.js
// 07-http-caching.js — run: node 07-http-caching.js (the 304 round-trip, offline)
```

#### Gotchas / Edge Cases

- `Set-Cookie` can be sent **multiple times** in one response — it's the only header that's an array (`res.getHeader('set-cookie')`).
- `SameSite=None` **requires `Secure`** — browsers reject `SameSite=None` without HTTPS, a classic "cookie just doesn't arrive" mystery.
- `HttpOnly` cookies are invisible to JS but still sent automatically — perfect for auth, useless for client-side reads.
- ETag/`If-None-Match` is strong (`W/` prefix = weak); don't weaken your cache keys by including nondeterministic data (timestamps) in the body.
- CORS is a **browser** policy. It does nothing for `curl` or server-to-server calls — CORS headers are not auth.

---

## 17.8 HTTP/1.1 vs HTTP/2 vs HTTP/3

### Explain It

- **HTTP/1.1** (1997): one request per connection, then `keep-alive` lets you reuse it sequentially. Text-based, simple, but **head-of-line blocking**: one slow response stalls everything queued behind it on that socket. Browsers mitigate with ~6 parallel connections.
- **HTTP/2** (2015): **binary framing** + **multiplexing** — many concurrent **streams** over one connection, each an independent request/response. **HPACK** compresses headers (header-heavy APIs get dramatically smaller). **Server push** lets the server send resources before asked (later deprioritized by browser implementers), and **prioritization** orders streams. Fixes HTTP/1.1's app-level HOL — but TCP-level HOL remains: **one lost packet stalls all streams** on that connection.
- **HTTP/3** (2022): **QUIC** over **UDP** — each stream is independent, so a loss on one stream doesn't block others. Built-in **TLS 1.3**, **0-RTT** (resume with a cached token), connection IDs survive IP changes (mobile handoffs), and no kernel dependency — QUIC is user-space, updatable in months instead of decades.

### Prove It

```js
// 06-http2.js — run: node 06-http2.js
// (3 concurrent streams over ONE session.socket — multiplexing in action)
```

#### Gotchas / Edge Cases

- HTTP/2 requires TLS + **ALPN `h2`** — that's how the client and server negotiate it inside the TLS handshake.
- Your server must be HTTP/2-capable to benefit — Node's `http2` module is; a naive `net` proxy strips it.
- **Server push was largely abandoned** in practice (browser implementers disabled it) — don't design around it.
- 0-RTT trades a little replay risk for speed — it's not forward-secret against an attacker replaying the first flight.
- Old proxies may **mangle HTTP/2** — that's why CDNs terminate it and re-originate HTTP/1.1 internally.

---

## 17.9 HTTPS: TLS + HTTP

### Explain It

HTTPS is literally HTTP carried over TLS — there is no separate "HTTPS protocol," just `TLS(HTTP)`. It gives you three things: **confidentiality** (nobody on the wire reads your data), **integrity** (nobody modifies it), and **authentication** (the certificate proves you're talking to the real server, not an impostor). A browser connects, validates the certificate chain against trusted CAs, and refuses to proceed on: expired certs, wrong hostname (CN/SAN mismatch), self-signed certs, or an untrusted CA. Two practical concepts: **mixed content** — `https://` page loading `http://` subresources (scripts/images) — browsers block script contexts outright; and **HSTS** (`Strict-Transport-Security: max-age=…`) — the server tells the browser "future requests to this domain must be HTTPS," which kills protocol-downgrade and string-of-https stripping attacks. Certificate errors are **fail-closed by design**: browsers intentionally make it *annoying* to bypass, because one you click "proceed anyway" the whole trust model is void.

### Prove It

```js
// 05-tls-handshake.js — run: node 05-tls-handshake.js
```

#### Gotchas / Edge Cases

- Local dev with certs: use a **self-signed** cert + `rejectUnauthorized: false` in *test code only* — never in prod.
- Certificates are validated against the **hostname you connected to** via SNI — a valid cert for `example.com` fails if you connect to `api.example.com` with that cert.
- **Mixed content**: browsers block `http://` scripts on HTTPS pages, but images are downgraded-with-warning — audit both.
- HSTS should be sent **only over HTTPS** (browsers ignore it over HTTP) and Mind preload lists — a bad HSTS header can lock users out.
- `curl -k`, `--insecure`, and `rejectUnauthorized: false` are all "trust me, bro" switches — great for debugging, a security incident in prod.

---

## 17.10 Connections: Keep-Alive & Connection Pooling

### Explain It

Creating a connection is expensive: TCP handshake (1 RTT) + TLS handshake (up to 2 RTTs) per request. **Keep-alive** (HTTP/1.1 default) reuses one socket for many requests; HTTP/2 goes further and multiplexes many requests *concurrently* over one. **Connection pooling** is the client-side discipline: a pool of reusable sockets sized to demand, with idle timeouts, instead of burning a fresh handshake per request. Browsers cap at ~6 pooled connections per origin (HTTP/1.1) or fewer, multiplexed (HTTP/2/3). Why your *server* should care: each socket and its buffers cost memory and kernel resources; opening/closing thousands of connections per second burns CPU in TIME_WAIT quıeues and `EMFILE`/port exhaustion. Pooling benefits the upstream side too — a reverse proxy reuses its origin connections so the origin sees a steady trickle instead of a stampede. Node makes the server side easy — the `http.Server` handles keep-alive for you; the lessons show up when you exceed the ~6-connection browser limit or hit socket exhaustion under load.

### Prove It

```js
// 04-http-server.js — run: node 04-http-server.js
// (the self-test client fires 7 requests over ONE pooled keep-alive socket)
```

#### Gotchas / Edge Cases

- **TIME_WAIT**: after a client-initiated close, the socket lingers in TIME_WAIT — opening a burst of short-lived connections can exhaust ephemeral ports (a.k.a. the thundering herd of aborted keep-alives).
- A pooled socket may be **stale** (server closed it after idle timeout) — clients must retry once on `ECONNRESET`/`EPIPE` before giving up.
- Keep-alive **freeholders** memory if idle sockets are never released — pool idle timeouts (Node default 5s) are essential.
- Node 19+ defaults its HTTP agent to `keepAlive: true` — pool semantics changed silently between Node versions.
- `Connection: close` is still honored — proxies and servers use it to reclaim sockets during drain/shutdown.

---

## 17.11 Proxies & Load Balancers

### Explain It

A **forward proxy** sits in front of *clients* (corporate proxy, VPN exit) — it fetches on the client's behalf and hides the client. A **reverse proxy** sits in front of *servers* (nginx, Cloudflare, your API gateway) — it accepts client connections, may terminate TLS, then forwards to backend servers, hiding the *origin*. The **L4 vs L7** split: L4 (transport) balances purely on IP/port — fast, stateless, but blind to the HTTP message; L7 (application) sees the full HTTP request — it can route by *path* or *header* (`/api` → service A, `/web` → service B), cache responses, rewrite URLs, do auth, and rate-limit. Node's `http` server is naturally an L7 proxy: a request handler that pipes `clientReq` into a new upstream request and pipes the upstream response back. This is the **Week 19 build** — a reverse proxy into `jsonplaceholder.typicode.com`. Load balancers are just reverse proxies with a *distribution strategy* (round-robin, least-connections, IP hash for sticky sessions). TLS in real life is handled **at the proxy edge** — one cert, then internal HTTP to the origin — which is why "terminate TLS at the LB" is every ops handbook's first line.

### Prove It

```js
// 08-proxy.js — run: node 08-proxy.js
// (a real reverse proxy: 200->proxied data, 502 offline, 504 on timeout)
```

#### Gotchas / Edge Cases

- A proxy that streams must handle **upstream errors after headers are sent** — you can't send a 502 once `writeHead` has gone out; destroy the socket instead.
- Timeouts: a proxy still holding a connection to a hung origin must give up — **per-request timeout → 504 Gateway Timeout** — or you leak sockets forever.
- Pass through only the headers you trust (cookies, auth) — a careless proxy can leak internal IPs or cache private data.
- `agent: false` (or a per-origin pool) avoids pooled keep-alive sockets keeping the process alive at shutdown.
- Reverse proxies hide the origin — the client never sees backend IPs, and the origin sees only the proxy (nice for logging and security alike).

---

## 17.12 Interview Questions (Say It Out Loud)

### Explain It

Say these out loud: Walk through everything that happens when you type `https://example.com` into a browser. What is encapsulation and what does each layer of the TCP/IP stack do? What are the DNS record types A, AAAA, CNAME, MX, TXT and what is a TTL? Explain the TCP 3-way handshake and why it exists. How does TCP guarantee reliable delivery? When would you pick UDP over TCP, and why is QUIC built on UDP? Walk through the TLS handshake; what is SNI and what is forward secrecy? What changed in TLS 1.3 vs 1.2? What is HTTP idempotency and why does it matter? Name the HTTP status code families. How do Cache-Control, ETag, and If-None-Match interact? What is head-of-line blocking and how do HTTP/1.1, HTTP/2, and HTTP/3 each address it? What are keep-alive and connection pooling, and why do they matter on both sides? Forward proxy vs reverse proxy, and L4 vs L7? What certificate errors cause a browser to refuse to connect, and what is mixed content?

### Prove It

```js
// 09-interview-networking.js — run: node 09-interview-networking.js
```

---

## Sources

- RFC 1034/1035 — Domain Names: https://datatracker.ietf.org/doc/html/rfc1034
- RFC 793 — Transmission Control Protocol: https://datatracker.ietf.org/doc/html/rfc793
- RFC 8446 — TLS 1.3: https://datatracker.ietf.org/doc/html/rfc8446
- RFC 9110 — HTTP Semantics: https://datatracker.ietf.org/doc/html/rfc9110
- RFC 9113 — HTTP/2: https://datatracker.ietf.org/doc/html/rfc9113
- RFC 9000 — QUIC: https://datatracker.ietf.org/doc/html/rfc9000
- Node.js docs — dns / net / dgram / tls / http / http2: https://nodejs.org/api/