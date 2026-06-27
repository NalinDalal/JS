/**
 * Module 07 — 7.9 Geolocation + Notification APIs
 * navigator.geolocation, Notification API
 *
 * Paste in browser DevTools console.
 */

console.log("--- Geolocation API ---");

/*
if ("geolocation" in navigator) {
  // One-time position
  navigator.geolocation.getCurrentPosition(
    (position) => {
      console.log("Latitude:", position.coords.latitude);
      console.log("Longitude:", position.coords.longitude);
      console.log("Accuracy:", position.coords.accuracy, "meters");
      console.log("Timestamp:", position.timestamp);
    },
    (error) => {
      // error.code: 1=PERMISSION_DENIED, 2=POSITION_UNAVAILABLE, 3=TIMEOUT
      console.error("Geolocation error:", error.message);
    },
    {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 60000, // cache age in ms
    }
  );
} else {
  console.log("Geolocation not supported");
}
*/

// --- watchPosition for continuous tracking ---
/*
const watchId = navigator.geolocation.watchPosition(
  (pos) => console.log("Position updated:", pos.coords),
  (err) => console.error("Watch error:", err),
);
// Later: navigator.geolocation.clearWatch(watchId);
*/

console.log("\n--- Notification API ---");

/*
if ("Notification" in window) {
  // Check current permission
  console.log("Permission:", Notification.permission); // "default", "granted", "denied"

  // Request permission (must be from user gesture)
  Notification.requestPermission().then(perm => {
    if (perm === "granted") {
      new Notification("Hello!", {
        body: "This is a notification",
        icon: "/icon.png",
        tag: "unique-tag", // replaces existing with same tag
        vibrate: [200, 100, 200],
      });
    }
  });

  // Handle notification click
  navigator.serviceWorker?.addEventListener("notificationclick", (event) => {
    console.log("Notification clicked:", event.notification);
    event.notification.close();
    clients.openWindow("/");
  });
}
*/

console.log("\nBoth APIs require HTTPS (except localhost) and user permission.");
