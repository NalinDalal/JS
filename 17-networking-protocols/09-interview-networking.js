/**
 * Module 17 — Interview Questions (Networking Protocols)
 * Say the answer out loud BEFORE reading it. Run for a quick daily drill.
 *
 * Run: node 09-interview-networking.js
 */

const qa = [
  [
    "Walk through everything that happens when you type https://example.com in a browser.",
    "1) Browser cache checked for the page. 2) DNS lookup: browser cache -> OS cache -> /etc/hosts -> resolver -> root -> TLD -> authoritative nameserver -> IP. 3) TCP 3-way handshake (SYN, SYN-ACK, ACK). 4) TLS handshake (ClientHello -> ServerHello + cert -> key exchange -> Finished), cert chain validated against a trusted CA. 5) HTTP request sent (GET / with Host header), 6) response received, HTML parsed, subresources fetched.",
  ],
  [
    "What is encapsulation and what does each layer do in the TCP/IP stack?",
    "Each layer wraps the layer above: HTTP adds a request line + headers, TCP adds a segment header with ports + seq/ack numbers, IP adds a packet header with source/dest addresses, the link layer adds Ethernet framing. The peer on the other side strips the same headers in reverse order. Layering means HTTP doesn't know or care whether it's running over Wi-Fi or fiber.",
  ],
  [
    "What are the DNS record types A, AAAA, CNAME, MX, TXT?",
    "A maps a name to an IPv4 address; AAAA to IPv6. CNAME aliases one name to another (the apex can't be a CNAME). MX lists mail servers with priority. TXT holds arbitrary text — used for SPF/DKIM email auth and domain verification. NXDOMAIN is the 'doesn't exist' answer; TTL says how long any cache may keep the answer.",
  ],
  [
    "Explain the TCP 3-way handshake and why it exists.",
    "SYN (client: 'I want to connect, my initial sequence number is X'), SYN-ACK (server: 'OK, my sequence number is Y, I acknowledge X+1'), ACK (client acknowledges Y+1). It exists so both sides agree on initial sequence numbers — that's what lets them detect lost, duplicated, and out-of-order segments. It also proves both directions work before data flows.",
  ],
  [
    "How does TCP guarantee reliable delivery?",
    "Every segment carries a sequence number and every received segment is acknowledged. If the sender doesn't get an ACK within the timeout (or gets duplicate ACKs), it retransmits. The receiver reorders out-of-order segments and the sender slows down on congestion (slow start / congestion avoidance). That's the TCP 'reliable byte stream' guarantee — at the cost of latency.",
  ],
  [
    "TCP vs UDP: when would you pick each?",
    "TCP: connection-oriented, ordered, reliable, with handshake and retransmission — for HTTP, email, anything where losing data is unacceptable. UDP: connectionless, no ordering, no retransmission, minimal overhead — for DNS (single question/answer), live video/voice (a late packet is useless anyway), games, and QUIC. QUIC runs over UDP because TCP lives in the OS kernel and can't be upgraded fast enough.",
  ],
  [
    "Walk through the TLS handshake. What is SNI and what is forward secrecy?",
    "Client sends ClientHello (TLS version, cipher suites, SNI hostname, random). Server replies ServerHello (chosen suite), its certificate chain, and key exchange (e.g. ECDHE). Client validates the cert against trusted CAs, computes the shared session key, both send Finished. SNI lets one server host many certificates on one IP. ECDHE gives forward secrecy: ephemeral per-session keys, so even if the server's long-term key leaks, past sessions stay encrypted.",
  ],
  [
    "TLS 1.2 vs TLS 1.3?",
    "1.3 removed legacy cipher suites (RSA key exchange, CBC, SHA-1), making everything AEAD (AES-GCM/ChaCha20) with forward secrecy mandatory. It cut the handshake to one round trip (0-RTT with session resumption), replaced the cipher negotiation list with a small fixed set, and removed renegotiation attacks. Today you should reject anything below 1.2.",
  ],
  [
    "HTTP methods: what is idempotency and why does it matter?",
    "Idempotent: repeating the request gives the same server state — GET, PUT, DELETE, HEAD, OPTIONS. POST is NOT idempotent (creates a new resource each time) — that's why browsers warn on form resubmission and why retry logic is safe for GET but dangerous for POST. 405 Method Not Allowed must include an Allow header. PATCH is not guaranteed idempotent; PUT is.",
  ],
  [
    "Explain the HTTP status code families.",
    "1xx informational (100 Continue, 101 Switching Protocols), 2xx success (200 OK, 201 Created, 204 No Content, 206 Partial Content for range requests), 3xx redirection (301/308 permanent, 302/307 temporary, 304 Not Modified), 4xx client error (400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found, 405 Method Not Allowed, 429 Too Many Requests), 5xx server error (500, 502 Bad Gateway, 503 Unavailable, 504 Gateway Timeout).",
  ],
  [
    "How do Cache-Control, ETag, and If-None-Match interact?",
    "Cache-Control: max-age=N says a cache may serve the response without asking for N seconds. When it expires, the client revalidates: it sends If-None-Match with the stored ETag; if the ETag matches, the server returns 304 Not Modified with no body and the client reuses the cached copy. ETags are stronger than Last-Modified (exact bytes, not a timestamp). no-store forbids caching entirely.",
  ],
  [
    "What is head-of-line blocking and how do HTTP/1.1, HTTP/2, HTTP/3 fix it?",
    "HTTP/1.1: one request at a time per connection — a slow first response blocks everything behind it; browsers work around it with ~6 parallel connections. HTTP/2 multiplexes many streams over one connection (binary framing + HPACK header compression), removing the application-level HOL blocking, but TCP-level HOL remains: one lost packet stalls all streams. HTTP/3 runs QUIC over UDP with independent streams, so one stream's packet loss doesn't block others, plus built-in TLS 1.3 and 0-RTT.",
  ],
  [
    "What are connection pooling and keep-alive, and why do they matter?",
    "HTTP/1.1 defaults to keep-alive: the TCP connection is reused for multiple requests instead of a new handshake (SYN/SYN-ACK/ACK) + TLS handshake per request. Connection pooling = a client keeps a pool of open sockets and reuses them. Without it, every request pays a handshake and hits TIME_WAIT/connection limits. The server side matters too: node's http server reuses sockets; a reverse proxy pools its upstream connections to reduce origin-server load.",
  ],
  [
    "Forward proxy vs reverse proxy? L4 vs L7?",
    "Forward proxy sits in front of clients (corporate proxy, VPN exit): it fetches on the client's behalf, hiding the client. Reverse proxy sits in front of servers (nginx, Cloudflare): it terminates client connections, handles TLS, caching, rate limits, and load balancing — the origin stays hidden. L4 (transport) balances on IP/port — fast, sees no HTTP; L7 (application) sees full HTTP — can route by path/host, do caching, auth. Node's http server makes an L7 reverse proxy trivial.",
  ],
];

let i = 0;
function next() {
  if (i >= qa.length) {
    console.log("\nDone! Loop back to the top for another round.");
    process.exit(0);
  }
  const [q, a] = qa[i++];
  console.log(`\nQ${i}: ${q}`);
  console.log("   (press Enter to see the answer, or Ctrl+C to quit)");
}

if (typeof process.stdin.setRawMode === "function" && process.stdin.isTTY) {
  // Interactive mode (real terminal): wait for each Enter press
  process.stdin.setRawMode(true);
  process.stdin.resume();
  process.stdin.on("data", () => next());
  console.log("Say each answer out loud, then press Enter to check.");
  next();
} else {
  // Piped input (e.g. `echo | node ...`): step through on each line
  process.stdin.resume();
  process.stdin.on("data", () => next());
  process.stdin.on("end", () => process.exit(0));
  console.log("No TTY — one Enter per question (piped).");
  next();
}
