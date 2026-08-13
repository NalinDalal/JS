/**
 * Module 11 — 11.5 Media: getUserMedia, constraints & tracks (BROWSER code)
 * This file runs in a browser page, not Node. Copy into a <script> tag or
 * use it directly in peer.html (same folder) for a working demo.
 *
 * Run: open peer.html in the browser — or paste into DevTools console.
 */

// --- 1. Capture camera + mic with constraints ---
async function startCamera() {
  const stream = await navigator.mediaDevices.getUserMedia({
    audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
    video: {
      width: { ideal: 1280 },
      height: { ideal: 720 },
      frameRate: { ideal: 30, max: 60 },
      facingMode: "user", // "environment" for back camera
    },
  });

  const videoEl = document.querySelector("video#local");
  videoEl.srcObject = stream;
  return stream;
}

// --- 2. Screen share (different permission flow) ---
async function startScreenShare() {
  const stream = await navigator.mediaDevices.getDisplayMedia({
    video: { frameRate: { ideal: 30 } }, // cursor: "always" is a display-media option
    audio: false,
  });
  document.querySelector("video#screen").srcObject = stream;
  return stream;
}

// --- 3. Working with tracks ---
const tracks = () => {
  const stream = /* the MediaStream from above */ null;

  // per-track control
  const videoTrack = stream.getVideoTracks()[0];
  videoTrack.enabled = false; // mute video (keeps camera, LED stays on — it's still capturing)

  // switch camera without renegotiation:
  //   const newTrack = (await navigator.mediaDevices.getUserMedia({video:{facingMode:"environment"}})).getVideoTracks()[0];
  //   sender.replaceTrack(newTrack);   // RTCRtpSender.replaceTrack — no SDP renegotiation needed

  // release hardware (camera LED goes off)
  videoTrack.stop();

  // enumerate devices
  navigator.mediaDevices.enumerateDevices().then((devices) => {
    devices.forEach((d) => console.log(d.kind, d.label || "(label hidden — grant permission to see)", d.deviceId));
  });
};

// --- 4. Sending media over RTCPeerConnection ---
async function addMediaToPeerConnection(pc, stream) {
  // the simple path: addTrack (auto-negotiates via renegotiationneeded)
  stream.getTracks().forEach((track) => pc.addTrack(track, stream));

  // the explicit path (fine control over direction/codec):
  // pc.addTransceiver("video", { direction: "sendrecv" });

  // wire the remote stream to a <video> element
  pc.ontrack = (event) => {
    document.querySelector("video#remote").srcObject = event.streams[0];
    console.log("got remote track:", event.track.kind);
  };
}

// --- 5. Multi-party note (mesh vs SFU) ---
// Mesh: pc per remote peer — N² connections; fine up to ~4 participants.
// SFU: one pc to the SFU server, which forwards/selects streams — what Meet/Zoom do at scale.
// Both use the exact same RTCPeerConnection + addTrack API.

// Copy into peer.html or DevTools. Key lines:
// getUserMedia({ audio, video })  -> MediaStream (tracks)
// getDisplayMedia()               -> screen share
// track.enabled = false           -> mute without stopping capture
// sender.replaceTrack(newTrack)   -> switch camera, no renegotiation
