/**
 * Module 12 — 12.7 Scaling WebSockets
 * Conceptual overview of sticky sessions, pub/sub, and multi-instance patterns.
 * This file is explanatory + runnable simulation (no real Redis needed).
 *
 * Run: node 06-scaling.js
 */

// ---- Simulated in-memory pub/sub (stand-in for Redis) ----

class MockPubSub {
  constructor() {
    this.channels = new Map(); // channel -> Set<callback>
  }

  subscribe(channel, callback) {
    if (!this.channels.has(channel)) this.channels.set(channel, new Set());
    this.channels.get(channel).add(callback);
    return () => this.channels.get(channel)?.delete(callback);
  }

  publish(channel, message) {
    const subs = this.channels.get(channel);
    if (!subs) return;
    for (const cb of subs) {
      try { cb(message); } catch {}
    }
  }
}

// ---- Simulated WebSocket server process ----

class ServerProcess {
  constructor(id, pubsub) {
    this.id = id;
    this.pubsub = pubsub;
    this.localSockets = new Map(); // connectionId -> { userId, rooms }
    this.connectionIdSeq = 0;
  }

  registerConnection(userId, rooms) {
    const connId = `conn-${this.id}-${++this.connectionIdSeq}`;
    this.localSockets.set(connId, { userId, rooms });
    console.log(`  [proc ${this.id}] registered ${connId} for user ${userId}, rooms ${rooms.join(",")}`);
    return connId;
  }

  handleMessage(fromConnId, message) {
    const conn = this.localSockets.get(fromConnId);
    if (!conn) return;

    const { type, room, text, targetUserId } = message;

    if (type === "join") {
      conn.rooms = conn.rooms || [];
      if (!conn.rooms.includes(room)) conn.rooms.push(room);
      this.pubsub.subscribe(`room:${room}`, (msg) => {
        if (msg.userId !== conn.userId) {
          console.log(`  [proc ${this.id}] forwarding to ${fromConnId}: ${msg.text}`);
        }
      });
      console.log(`  [proc ${this.id}] ${fromConnId} joined ${room}`);
      return;
    }

    if (type === "message") {
      if (!room || !text) return;
      console.log(`  [proc ${this.id}] ${fromConnId} -> room:${room}: ${text}`);
      this.pubsub.publish(`room:${room}`, { userId: conn.userId, text });
    }
  }
}

// ---- Demo: two processes, one pub/sub ----

const pubsub = new MockPubSub();
const procA = new ServerProcess("A", pubsub);
const procB = new ServerProcess("B", pubsub);

// User connects to process A
const alice = procA.registerConnection("alice", ["general"]);
procA.handleMessage(alice, { type: "join", room: "general" });

// Bob connects to process B (different process!)
const bob = procB.registerConnection("bob", ["general"]);
procB.handleMessage(bob, { type: "join", room: "general" });

// Alice sends a message on process A — Bob on process B must receive it via pub/sub
console.log("\n--- Alice sends message from process A ---");
procA.handleMessage(alice, { type: "message", room: "general", text: "hello from alice" });

// Bob sends back
console.log("\n--- Bob sends message from process B ---");
procB.handleMessage(bob, { type: "message", room: "general", text: "hi alice, this is bob" });

// ---- Sticky sessions ----

console.log("\n--- Sticky sessions ---");
console.log("Load balancer routes by cookie or IP hash:");
console.log("  IP hash:    client IP -> hash -> process index");
console.log("  Cookie:     SET-WS-PROCESS=A or B -> subsequent requests go to same backend");
console.log("  Path-based: /ws/A or /ws/B — client picks at connect time");

// ---- Comparison table (also in websockets.md 12.8) ----

console.log("\n--- WebSocket vs SSE vs Long-Polling ---");
const comparisons = [
  ["Direction", "Full-duplex", "Server -> client", "Request/response"],
  ["Protocol", "ws:// / wss://", "HTTP/2 or HTTP/1.1", "HTTP"],
  ["Browser API", "WebSocket", "EventSource", "fetch / XHR"],
  ["Binary data", "Yes", "No", "Yes"],
  ["Reconnect", "Manual or library", "Automatic (browser)", "Manual"],
  ["Proxy-friendly", "Sometimes blocked", "Yes", "Yes"],
  ["Best for", "Chat, games, collab", "Notifications, feeds", "Legacy fallback"],
];
for (const [feature, ws, sse, lp] of comparisons) {
  console.log(`  ${feature.padEnd(18)} ${ws.padEnd(20)} ${sse.padEnd(20)} ${lp}`);
}
