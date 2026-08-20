/**
 * Module 17 — 17.2 DNS: Lookup & Record Types
 * Shows the resolution hierarchy in action: dns.lookup (OS resolver, checks
 * /etc/hosts first), then A / AAAA / CNAME / MX record queries against the
 * configured DNS servers, plus TTL (how long an answer may be cached).
 *
 * Run: node 01-dns.js [host]
 */

const dns = require("node:dns").promises;
const fs = require("node:fs");

const HOST = process.argv[2] || "github.com";
const CNAME_HOST = HOST.startsWith("www.") ? HOST : "www." + HOST; // apex can't be a CNAME
const MX_HOST = "gmail.com"; // github.com has no MX records; gmail.com does

(async () => {
  // Watchdog: if DNS is unreachable (offline), give up gracefully after 6s.
  const watchdog = setTimeout(() => {
    console.log("[offline] DNS timed out — are you offline? Exiting gracefully.");
    process.exit(0);
  }, 6000);

  try {
    // /etc/hosts is consulted FIRST by dns.lookup (via getaddrinfo), before any server
    const hostsFile = fs.existsSync("/etc/hosts")
      ? fs.readFileSync("/etc/hosts", "utf8")
      : "";
    const inHosts = hostsFile.split("\n").some((l) => l.includes(HOST));
    console.log(`Host: ${HOST}`);
    console.log(
      `  /etc/hosts: ${inHosts ? "FOUND here — the hosts file wins over DNS" : "not listed (falls through to DNS servers)"}`
    );
    console.log(
      "  (dns.lookup uses the OS resolver: browser cache -> OS cache -> /etc/hosts -> DNS)"
    );

    const { address, family } = await dns.lookup(HOST);
    console.log(`\n[dns.lookup] ${HOST} -> ${address} (IPv${family})`);

    // A record: IPv4 address of the host (what the resolver returns)
    console.log(`[A]    ${HOST} -> ${(await dns.resolve(HOST, "A")).join(", ")}`);

    // AAAA record: IPv6 address (many hosts have none — the query fails with ENODATA)
    try {
      console.log(`[AAAA] ${HOST} -> ${(await dns.resolve(HOST, "AAAA")).join(", ")}`);
    } catch {
      console.log(`[AAAA] ${HOST} -> none (no IPv6 address published)`);
    }

    // CNAME: an alias. The apex (bare github.com) cannot be a CNAME — www.* often is.
    try {
      console.log(`[CNAME] ${CNAME_HOST} -> ${(await dns.resolve(CNAME_HOST, "CNAME")).join(", ")}`);
    } catch {
      console.log(`[CNAME] ${CNAME_HOST} -> none (it resolves via a direct A record)`);
    }

    // MX: mail exchange records with priority (lower = preferred)
    try {
      const mx = await dns.resolve(MX_HOST, "MX");
      console.log(
        `[MX]   ${MX_HOST} -> ${mx
          .map((m) => `${m.exchange} (prio ${m.priority})`)
          .join(", ")}`
      );
    } catch {
      console.log(`[MX]   ${MX_HOST} -> none`);
    }

    // TTL: how long caches may reuse the answer before re-querying
    try {
      const withTtl = await dns.resolve4(HOST, { ttl: true });
      const ttl = withTtl[0] && withTtl[0].ttl;
      console.log(
        `\n[TTL]  A record TTL for ${HOST}: ${ttl}s — browser/OS/resolver caches may reuse the answer for that long, then re-query.`
      );
    } catch {
      /* TTL is a nice-to-have */
    }

    console.log(
      "\nResolution order: browser cache -> OS cache -> /etc/hosts -> resolver -> root -> TLD -> authoritative server."
    );
    console.log("This happens BEFORE any TCP connection — DNS is the first step of every request.");
  } catch (err) {
    console.log(`[offline or bad host] ${err.code}: ${err.message}`);
    console.log("Tip: this is exactly what fails first when you're offline.");
  } finally {
    clearTimeout(watchdog);
    process.exit(0);
  }
})();
