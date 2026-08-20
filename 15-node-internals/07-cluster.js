/**
 * Module 15 — 15.8 cluster: Multi-Core Node
 * Primary picks two free ports, forks 2 workers (one port each), fires real
 * requests at each to prove per-process request counting, then a safety timer
 * shuts everything down. Exits on its own after ~2 seconds.
 *
 * Run: node 07-cluster.js
 */

const cluster = require("node:cluster");
const http = require("node:http");

if (cluster.isPrimary) {
  // ====================== PRIMARY (bookkeeping only) ======================
  // Sidebar: if two workers listen() on the SAME port, cluster hands the
  // shared socket to both and the OS load-balances — great for production,
  // bad for demonstrating per-worker state. So each worker gets its own port.
  console.log(`[primary ${process.pid}] finding two free ports...`);
  const freePorts = Array.from({ length: 2 }, () => new Promise((resolve) => {
    const s = http.createServer();
    s.listen(0, () => { const p = s.address().port; s.close(() => resolve(p)); });
  }));

  Promise.all(freePorts).then(([p1, p2]) => {
    console.log(`[primary] ports: ${p1}, ${p2} — forking 2 workers...`);
    cluster.fork({ WORKER_PORT: p1 });
    cluster.fork({ WORKER_PORT: p2 });
  });

  const ports = {}; // worker.id -> { port }
  let ready = 0;

  cluster.on("message", (worker, msg) => {
    if (msg.type !== "listening") return;
    ports[worker.id] = { port: msg.port };
    console.log(`[primary] worker ${worker.id} (${worker.process.pid}) up on port ${msg.port}`);

    if (++ready === 2) {
      // Both workers are up: hit worker 1 twice, worker 2 once.
      hit(1, (res) => console.log(`[primary] worker 1 -> "${res}"`));
      hit(1, (res) => console.log(`[primary] worker 1 -> "${res}"`));
      hit(2, (res) => console.log(`[primary] worker 2 -> "${res}"`));
    }
  });

  function hit(workerId, cb, attempts = 3) {
    const { port } = ports[workerId];
    const req = http.get(`http://127.0.0.1:${port}/`, (res) => {
      let body = "";
      res.on("data", (c) => (body += c));
      res.on("end", () => cb(body));
    });
    req.setTimeout(1000, () => req.destroy(new Error("timeout")));
    req.on("error", (err) => {
      console.error(`[primary] request to worker ${workerId} failed: ${err.message}`);
      if (attempts > 1) setTimeout(() => hit(workerId, cb, attempts - 1), 100);
    });
  }

  cluster.on("exit", (worker, code) => {
    console.log(`[primary] worker ${worker.id} exited with code ${code}`);
  });

  setTimeout(() => {
    console.log("\n[primary] demo over — sending 'shutdown' to all workers");
    for (const id in cluster.workers) cluster.workers[id].send("shutdown");
  }, 1500);
  setTimeout(() => process.exit(0), 3000); // hard stop so nothing hangs
} else {
  // ====================== WORKER (real request serving) ======================
  let count = 0; // each worker counts ITS OWN requests (isolated memory)
  const server = http.createServer((req, res) => {
    count++;
    res.end(`worker ${process.pid} handled request #${count}`);
  });

  server.listen(parseInt(process.env.WORKER_PORT, 10), () => {
    process.send({ type: "listening", port: server.address().port });
  });

  process.on("message", (msg) => {
    if (msg === "shutdown") {
      server.close(() => {
        console.log(`[worker ${process.pid}] closed; handled ${count} requests`);
        process.exit(0);
      });
    }
  });
}