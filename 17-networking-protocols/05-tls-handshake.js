/**
 * Module 17 — 17.5 TLS: Real Handshake to a Public Host
 * tls.connect to github.com:443 prints what the handshake negotiated:
 * TLS version, cipher suite, ALPN result, and the server certificate
 * (subject, issuer, validity). The invisible handshake: ClientHello ->
 * ServerHello + certificate -> key exchange -> Finished.
 *
 * Run: node 05-tls-handshake.js [host]
 */

const tls = require("node:tls");

const HOST = process.argv[2] || "github.com";
const PORT = 443;
let connected = false;

const socket = tls.connect(
  {
    host: HOST,
    port: PORT,
    servername: HOST, // SNI: tells the server WHICH certificate to present (virtual hosts)
    ALPNProtocols: ["h2", "http/1.1"],
  },
  () => {
    connected = true;
    const cert = socket.getPeerCertificate(true); // true = include chain info
    console.log(`[connected] ${HOST}:${PORT} — TLS handshake complete`);
    console.log(`  negotiated TLS version: ${socket.getProtocol()}`);
    const cipher = socket.getCipher();
    console.log(`  cipher suite: ${cipher.name} (${cipher.version})`);
    console.log(`  ALPN protocol: ${socket.alpnProtocol || "none"} (h2 = HTTP/2 runs over this TLS socket)`);
    console.log(`  cert subject: ${cert.subject.CN}`);
    console.log(`  cert issuer: ${cert.issuer.CN} — signed by a CA your OS trusts (the trust chain)`);
    console.log(`  valid from: ${cert.valid_from}`);
    console.log(`  valid to:   ${cert.valid_to}`);
    console.log(`  fingerprint (SHA-256): ${cert.fingerprint256}`);
    socket.end();
    setTimeout(() => process.exit(0), 100);
  }
);

// Graceful offline failure
socket.on("error", (err) => {
  console.log(`[offline or failure] ${err.code || err.message}`);
  console.log("No TLS handshake possible — are you offline? Exiting gracefully.");
  process.exit(0);
});

// Connect watchdog: if the handshake doesn't finish in 5s, give up quietly
setTimeout(() => {
  if (!connected) {
    console.log("[timeout] no TLS handshake within 5s — are you offline? Exiting gracefully.");
    socket.destroy();
    process.exit(0);
  }
}, 5000);
