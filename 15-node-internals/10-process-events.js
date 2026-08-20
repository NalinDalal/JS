/**
 * Module 15 — 15.11/15.14 process Object, Signals, Graceful Shutdown & Error Paths
 * Prints argv/env/platform/version, registers SIGINT/SIGTERM handlers, then
 * triggers unhandledRejection and uncaughtException handlers in turn and
 * performs a graceful shutdown (server.close -> exit). Terminates on its own.
 *
 * Run: node 10-process-events.js
 */

const http = require("node:http");

// Big picture: don't exit with zero; every path below ends in an explicit
// process.exit so the demo never hangs in terminal sessions.
console.log("== process info ==");
console.log(`  argv        : ${JSON.stringify(process.argv)}`);
console.log(`  argv[2]     : ${process.argv[2] ?? "(no extra args)"}   (real args start at index 2)`);
console.log(`  env.PATH    : ${process.env.PATH?.slice(0, 40)}...`);
console.log(`  platform    : ${process.platform} | version: ${process.version} | pid: ${process.pid}`);
console.log(`  memory      : ${(process.memoryUsage().rss / 1024 / 1024).toFixed(0)}MB RSS`);
console.log("  exit codes  : 0 = success, 1 = uncaught exception/rejection, 2 = shell-level error");

// ---- Signals ----
process.on("SIGINT", () => {
  console.log("\n[SIGINT] received — Ctrl+C. Graceful shutdown this way: server.close()...");
  shutdown(0);
});
process.on("SIGTERM", () => {
  console.log("\n[SIGTERM] received (kill/terminate). Same pattern, same code path.");
  shutdown(0);
});
console.log("\n[SIGINT/SIGTERM handlers registered — will not fire during a self-terminating demo]");

// ---- Graceful shutdown machinery ----
const server = http.createServer((req, res) => res.end("ok"));
let shuttingDown = false;
function shutdown(code) {
  if (shuttingDown) return;
  shuttingDown = true;
  console.log("[shutdown] server.close() — stop accepting, drain pending connections");
  server.close(() => {
    console.log(`[shutdown] complete — process.exit(${code})`);
    process.exit(code);
  });
  setTimeout(() => process.exit(code), 2000); // hard fallback: stubborn keep-alives
}
server.listen(0, () => console.log(`[demo server listening on port ${server.address().port}]`));

// ---- Error paths: register handlers, trigger once, exit ----
process.on("unhandledRejection", (reason, promise) => {
  console.log(`\n[unhandledRejection] ${reason.message} — a Promise rejected with no .catch().`);
  console.log("Real apps: log loudly + exit(1). Demo: continuing so you can see the next handler...");
});

process.on("uncaughtException", (err) => {
  console.log(`\n[uncaughtException] "${err.message}" — a throw escaped the stack.`);
  console.log("Never swallow: the heap may be corrupted. Log, alert, then exit.");
  shutdown(1); // graceful, but with failure code
});

setTimeout(() => {
  Promise.reject(new Error("demo: rejection with no catcher")); // fires unhandledRejection
}, 300);

setTimeout(() => {
  throw new Error("demo: bare throw inside a timer"); // fires uncaughtException -> shutdown(1)
}, 900);

// Safety net: if everything above somehow stalls, force-quit so this file
// always terminates on its own.
setTimeout(() => {
  console.log("[safety] forced exit");
  process.exit(2);
}, 6000);