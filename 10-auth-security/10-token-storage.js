/**
 * Module 10 — 10.10 Token Storage & Browser Strategy
 * XSS vs CSRF trade-offs for localStorage vs HttpOnly cookies,
 * plus the canonical 401 -> refresh -> replay interceptor.
 *
 * Run: node 10-token-storage.js
 */

console.log("--- Where can the access token live? ---");

const options = [
  {
    where: "localStorage",
    xss: "XSS-VULNERABLE — any injected script reads it (localStorage.getItem)",
    csrf: "CSRF-SAFE — sent via Authorization header, not auto-attached",
    note: "Survives reloads, leaks to every 3rd-party script you trust",
  },
  {
    where: "sessionStorage",
    xss: "XSS-VULNERABLE — same read access as localStorage",
    csrf: "CSRF-SAFE — header-based",
    note: "Cleared when the tab closes — slightly smaller blast radius",
  },
  {
    where: "In-memory variable",
    xss: "XSS-RESISTANT — not readable by injected scripts",
    csrf: "CSRF-SAFE — header-based",
    note: "Lost on reload — must refresh from the HttpOnly cookie",
  },
  {
    where: "HttpOnly cookie",
    xss: "XSS-PROOF — document.cookie cannot read it",
    csrf: "CSRF-RISK — cookies auto-attach; mitigate with SameSite=Strict/Lax + CSRF tokens",
    note: "The refresh token's home; Secure flag required; cross-site contexts get tricky",
  },
];

for (const o of options) {
  console.log(`\n[${o.where}]`);
  console.log("  XSS:  " + o.xss);
  console.log("  CSRF: " + o.csrf);
  console.log("  Note: " + o.note);
}

console.log("\n--- Recommended modern stack ---");
console.log("access token : in memory (XSS-resistant, short-lived)");
console.log("refresh token: HttpOnly + Secure + SameSite=Strict cookie (XSS-proof)");
console.log("on load      : memory empty -> silent refresh using the cookie");

console.log("\n--- 401 -> refresh -> replay interceptor (canonical pattern) ---");

// The network layer every SPA auth library (axios interceptors, etc.) implements:
class ApiClient {
  constructor({ getAccessToken, setAccessToken, refresh }) {
    this.accessToken = null; // in-memory only
    this.refreshing = null; // single-flight refresh promise
    this.queue = []; // requests that 401'd while a refresh is in flight
    this.getAccessToken = getAccessToken;
    this.setAccessToken = setAccessToken;
    this.refresh = refresh;
  }

  async call(path, { retried = false } = {}) {
    const res = await fetch(path, {
      headers: { Authorization: `Bearer ${this.getAccessToken()}` },
    });

    if (res.status === 401 && !retried) {
      const newAccess = await this.refreshAccessToken(); // may re-login if refresh cookie dead
      if (!newAccess) throw new Error("Session expired — please log in");
      return this.call(path, { retried: true }); // replay the ORIGINAL request once
    }
    return res;
  }

  // single-flight: concurrent 401s share ONE refresh call
  async refreshAccessToken() {
    if (this.refreshing) return this.refreshing;
    this.refreshing = this.refresh()
      .then((newAccess) => {
        this.setAccessToken(newAccess); // memory only
        return newAccess;
      })
      .finally(() => (this.refreshing = null));
    return this.refreshing;
  }
}

// Fake backend
const BACKEND_TOKEN = "server-issued-access-token";
let refreshCookieAlive = true;

const client = new ApiClient({
  getAccessToken: () => client.accessToken,
  setAccessToken: (t) => (client.accessToken = t),
  refresh: async () => {
    // POST /auth/refresh — HttpOnly cookie rides along automatically
    if (!refreshCookieAlive) throw new Error("refresh cookie expired");
    return BACKEND_TOKEN;
  },
});

globalThis.fetch = async (url, opts = {}) => {
  const auth = opts.headers?.Authorization || "";
  if (auth === `Bearer ${BACKEND_TOKEN}`) return { status: 200 };
  if (auth === "Bearer null" || auth === "Bearer undefined") return { status: 401 };
  return { status: 401 };
};

(async () => {
  // first call: no token yet -> 401 -> silent refresh -> replay succeeds
  const r1 = await client.call("/api/data");
  console.log("call with no token -> auto-refresh ->", r1.status, "and access token now set:", client.accessToken !== null);

  // concurrent calls while refresh is in flight share one refresh (single-flight)
  client.accessToken = null;
  const [a, b, c] = await Promise.all([
    client.call("/api/a"),
    client.call("/api/b"),
    client.call("/api/c"),
  ]);
  console.log("3 concurrent 401s -> one refresh ->", [a.status, b.status, c.status]);

  // refresh cookie revoked -> refresh fails -> must re-login
  refreshCookieAlive = false;
  client.accessToken = null;
  try {
    await client.call("/api/data");
  } catch (e) {
    console.log("refresh cookie dead ->", e.message);
  }
})();