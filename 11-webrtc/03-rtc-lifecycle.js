/**
 * Module 11 — 11.7 Connection lifecycle, signaling states & ICE restart
 * Full RTCPeerConnection state machine simulation (no browser needed):
 * offer -> answer -> trickle ICE -> connected -> network blip -> disconnected
 * -> ICE restart -> connected again. Also demonstrates perfect-negotiation roles.
 *
 * Run: node 03-rtc-lifecycle.js
 */

class SimPeer {
  constructor(name) {
    this.name = name;
    this.signalingState = "stable"; // stable | have-local-offer | have-remote-offer | closed
    this.connectionState = "new"; // new | connecting | connected | disconnected | failed | closed
    this.iceState = "new"; // new | checking | connected | completed | disconnected | failed
    this.iceUfrag = `${name.toLowerCase()}-ufrag-${Math.random().toString(16).slice(2, 6)}`;
    this.icePwd = Math.random().toString(16).slice(2, 10);
    this.candidates = []; // collected transport addresses
    this.localDescription = null;
    this.remoteDescription = null;
    this.tracks = new Map(); // kind -> direction
  }

  log(states) {
    console.log(
      `  [${this.name}] signaling=${this.signalingState} ice=${this.iceState} connection=${this.connectionState}` +
        (states ? ` ${states}` : "")
    );
  }

  // --- negotiation ---
  createOffer() {
    this.signalingState = "have-local-offer";
    this.localDescription = {
      type: "offer",
      sdp: `v=0\r\no=${this.name} 0 0 IN IP4 0.0.0.0\r\ns=-\r\nt=0 0\r\na=ice-ufrag:${this.iceUfrag}\r\na=ice-pwd:${this.icePwd}`,
    };
    this.log("(createOffer)");
    return this.localDescription;
  }

  setRemote(desc) {
    this.remoteDescription = desc;
    // stable -> have-remote-offer when receiving an offer; -> stable after answering
    if (desc.type === "offer") this.signalingState = "have-remote-offer";
    if (desc.type === "answer") {
      this.signalingState = "stable";
      this.connectionState = "connecting";
      this.iceState = "checking";
      this.log("(setRemote answer) media starts connecting");
    }
  }

  createAnswer() {
    this.localDescription = { type: "answer", sdp: `v=0\r\no=${this.name} 0 0 IN IP4 0.0.0.0\r\na=ice-ufrag:${this.iceUfrag}\r\na=ice-pwd:${this.icePwd}` };
    this.signalingState = "stable";
    this.log("(createAnswer)");
    return this.localDescription;
  }

  // --- ICE ---
  gatherCandidates() {
    // real browsers trickle these as discovered; we emit 3 types in order
    const host = `${this.name}-lan-ip:55555`; // local address
    const srflx = `${this.name}-public-ip:44444`; // discovered via STUN
    const relay = `${this.name}-relay:33333`; // via TURN (only if needed)
    return [host, srflx, relay];
  }

  addRemoteCandidate(candidate, remoteName) {
    this.candidates.push({ from: remoteName, candidate });
    this.iceState = "checking";
  }

  connected() {
    this.iceState = "connected";
    this.connectionState = "connected";
    this.log("(ICE pairs matched, DTLS done) — CONNECTED");
  }

  networkBlip() {
    this.iceState = "disconnected";
    this.connectionState = "disconnected";
    this.log("(network blip detected — NOT dead, retry with ICE restart)");
  }

  iceRestart() {
    // fresh ufrag/pwd -> new offer forces new ICE gathering + checks
    this.iceUfrag = `${this.name.toLowerCase()}-ufrag-${Math.random().toString(16).slice(2, 6)}`;
    this.icePwd = Math.random().toString(16).slice(2, 10);
    const offer = this.createOffer();
    this.log("(ICE restart)");
    return offer;
  }

  fail() {
    this.iceState = "failed";
    this.connectionState = "failed";
    this.log("(ICE failed — give up: re-signal from scratch or show error)");
  }

  close() {
    this.connectionState = "closed";
    this.signalingState = "closed";
    this.log("(close)");
  }
}

console.log("=== Call setup: Alice calls Bob ===");
const alice = new SimPeer("alice");
const bob = new SimPeer("bob");

// 1) Alice creates offer -> signaling to Bob
const offer = alice.createOffer();
alice.log();
bob.setRemote(offer); // Bob now has remote offer
bob.log();

// 2) Bob answers -> signaling to Alice
const answer = bob.createAnswer();
bob.log();
alice.setRemote(answer); // Alice stable again, both connecting
alice.log();
bob.connected();
alice.connected();

// 3) ICE trickling — both sides exchange candidates as gathered
console.log("\n=== ICE trickle ===");
for (const c of alice.gatherCandidates()) bob.addRemoteCandidate(c, "alice");
for (const c of bob.gatherCandidates()) alice.addRemoteCandidate(c, "bob");
console.log(`  bob received ${bob.candidates.length} candidates from alice`);
console.log(`  alice received ${alice.candidates.length} candidates from bob`);

// 4) Network hiccup -> disconnected -> ICE restart (new ufrag -> renegotiate)
console.log("\n=== Network blip -> ICE restart ===");
alice.networkBlip();
const restartOffer = alice.iceRestart(); // perfect-negotiation: impolite peer restarts
bob.setRemote(restartOffer);
const restartAnswer = bob.createAnswer();
alice.setRemote(restartAnswer);
alice.connected();
bob.connected();

// 5) Hard failure when NAT traversal is impossible
console.log("\n=== Hard failure ===");
const carol = new SimPeer("carol");
const carolOffer = carol.createOffer();
bob.setRemote(carolOffer);
bob.createAnswer();
carol.iceState = "failed";
carol.connectionState = "failed";
carol.log("(no candidates, no TURN — can't connect)");

console.log("\n=== State transitions (interview version) ===");
// signaling: stable -> have-local-offer -> have-remote-offer -> stable (each negotiation)
// ice:       new -> checking -> connected -> completed | disconnected | failed
// connection:new -> connecting -> connected | disconnected -> failed -> closed
console.log("disconnected != failed — try ICE restart before giving up.");