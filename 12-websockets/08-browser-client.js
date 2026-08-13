/**
 * Module 12 — Browser WebSocket Client Patterns
 * Covers: new WebSocket(), readyState, text/binary messages, Blob/ArrayBuffer,
 * url/protocol introspection, event handling, and common pitfalls.
 *
 * This file is meant to be pasted into browser DevTools console
 * while 01-websocket-protocol.js is running on ws://localhost:3000.
 */

// ---- Connection ----

const ws = new WebSocket("ws://localhost:3000");

ws.addEventListener("open", () => {
  console.log("[open] readyState=" + ws.readyState, "protocol=" + ws.protocol);
  ws.send("hello from browser");
});

ws.addEventListener("message", (event) => {
  console.log("[message]", event.data);
  if (event.data instanceof Blob) {
    console.log("  (binary Blob, size=" + event.data.size + ")");
  }
});

ws.addEventListener("close", (event) => {
  console.log("[close] code=" + event.code, "reason=" + event.reason, "wasClean=" + event.wasClean);
});

ws.addEventListener("error", (event) => {
  console.log("[error]", event);
});

// ---- readyState values ----
// 0 CONNECTING — socket not open yet
// 1 OPEN       — ready to send/receive
// 2 CLOSING    — close handshake in progress
// 3 CLOSED     — connection closed

setTimeout(() => {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send("late message");
    ws.close(1000, "done");
  }
}, 2000);

// ---- Binary send/receive (requires a server that handles binary opcode 0x2) ----

async function binaryRoundTrip() {
  const binaryWs = new WebSocket("ws://localhost:3000");
  binaryWs.binaryType = "arraybuffer"; // or "blob"

  binaryWs.addEventListener("open", () => {
    const buffer = new ArrayBuffer(8);
    const view = new Uint8Array(buffer);
    view[0] = 0xDE;
    view[1] = 0xAD;
    view[2] = 0xBE;
    view[3] = 0xEF;
    binaryWs.send(buffer);
    console.log("[binary] sent ArrayBuffer:", view);
  });

  binaryWs.addEventListener("message", (event) => {
    if (event.data instanceof ArrayBuffer) {
      console.log("[binary] received ArrayBuffer:", new Uint8Array(event.data));
    } else {
      console.log("[binary] received text:", event.data);
    }
  });
}

// Uncomment to test:
// binaryRoundTrip();

// ---- Gotchas / Edge Cases ----
// - ws.send() throws INVALID_STATE_ERR if readyState !== OPEN. Check ws.readyState first.
// - ws.protocol is empty unless the server returned Sec-WebSocket-Protocol in the handshake.
// - event.data is a string for text frames, Blob or ArrayBuffer for binary (set ws.binaryType to control).
// - ws.close() is idempotent — calling it twice is safe; the second call is a no-op.
// - Event callbacks (onopen, onmessage, onclose, onerror) fire in order of registration.
// - Chrome/Firefox limit WebSocket connections per origin (~255). Reuse one connection; don't open per-feature.
