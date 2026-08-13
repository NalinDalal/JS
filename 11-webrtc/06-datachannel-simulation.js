/**
 * Module 11 — 11.6 RTCDataChannel: reliable vs unreliable, ordered vs unordered
 * Simulates the SCTP-over-DTLS delivery semantics: partial reliability (maxRetransmits /
 * maxPacketLifetime), ordering, and backpressure via bufferedAmount.
 *
 * Run: node 06-datachannel-simulation.js
 */

class DataChannelSim {
  constructor(name, opts = {}) {
    this.name = name;
    this.reliable = opts.reliable ?? true;
    this.ordered = opts.ordered ?? true;
    this.maxRetransmits = opts.maxRetransmits; // 0 = never retransmit, N = up to N retries
    this.maxPacketLifetime = opts.maxPacketLifetime; // ms before a message is dropped
    this.state = "connecting"; // connecting | open | closing | closed
    this.bufferedAmount = 0;
    this.dropRate = opts.dropRate ?? 0; // simulated network loss 0..1
    setTimeout(() => { this.state = "open"; console.log(`  [${this.name}] channel OPEN (reliable=${this.reliable}, ordered=${this.ordered})`); }, 10);
  }

  // app-level send with simulated loss + partial reliability
  send(message, now = Date.now()) {
    if (this.state !== "open") throw new Error("channel not open");
    this.bufferedAmount += message.length;
    // fire-and-forget (maxRetransmits=0 / maxPacketLifetime=0) OR a truly reliable channel?
    const canRetx = this.maxRetransmits > 0 || this.maxPacketLifetime > 0;

    // packet lost on the wire?
    if (Math.random() < this.dropRate) {
      if (!canRetx) {
        // unreliable: no retransmissions budget left -> dropped for good
        this.bufferedAmount -= message.length;
        console.log(`  [${this.name}] SEND (DROP)     ${message}  <- lost, NOT resent`);
        return false;
      }
      // retransmit (limited by maxRetransmits/maxPacketLifetime in reality)
      console.log(`  [${this.name}] SEND (RETX)     ${message}  <- lost, resent`);
    }
    this.bufferedAmount -= message.length;
    console.log(`  [${this.name}] SEND (DELIVERED) ${message}`);
    return true;
  }

  // simulate two peers sharing the semantics: reliable+ordered vs unreliable+unordered
  static async demo() {
    console.log("--- chat: reliable + ordered (TCP-like) ---");
    const chat = new DataChannelSim("chat", { reliable: true, ordered: true });
    await new Promise((r) => setTimeout(r, 20)); // wait until state === "open"
    ["hello", "how are you?", "brb"].forEach((m, i) => chat.send(m, i * 50));
    // every message arrives, in order, exactly once

    console.log("\n--- game updates: unreliable + unordered (UDP-like) ---");
    const game = new DataChannelSim("game", { reliable: false, ordered: false, maxRetransmits: 0, dropRate: 0.3 });
    await new Promise((r) => setTimeout(r, 20));
    let sent = 0, dropped = 0;
    for (let i = 0; i < 10; i++) {
      const delivered = game.send(`pos:${i}`);
      sent++;
      if (!delivered) dropped++;
    }
    console.log(`  dropped ${dropped}/${sent} — latest-state wins in games, nobody retransmits stale positions`);

    console.log("\n--- file transfer: reliable, but watch backpressure ---");
    const file = new DataChannelSim("file", { reliable: true });
    await new Promise((r) => setTimeout(r, 20));
    const CHUNK = 64 * 1024; // 64KB — sizes near WebRTC's 256KB maxMessageSize
    let ok = true;
    for (let i = 0; i < 5 && ok; i++) {
      file.bufferedAmount += CHUNK;
      ok = file.bufferedAmount < 512 * 1024; // bufferedAmountLowThreshold pattern
    }
    console.log(`  bufferedAmount grew past 512KB → app must wait for 'bufferedamountlow' before sending more`);
  }
}

DataChannelSim.demo();

console.log("\n--- Summary ---");
console.log("reliable+ordered  : chat, file transfer (TCP semantics)");
// unreliable+unordered: position/state sync, realtime games (UDP semantics)
// maxRetransmits=0  : fire-and-forget (like ULP — unreliable, low latency)
console.log("maxPacketLifetime : 'drop if not delivered in X ms'");
// 'bufferedamountlow' + bufferedAmountLowThreshold: backpressure without flooding
// Real impl: SCTP maps each DataChannel to one stream; multiple channels multiplexed.