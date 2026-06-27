/**
 * Module 05 — 5.6 Resource Management (using/await using)
 * Symbol.dispose, asyncDispose, practical patterns
 *
 * Note: `using` and `await using` require Node 22+ with --harmony-explicit-resource-management or similar.
 * This file demonstrates the patterns conceptually.
 *
 * Run: node 06-disposable.js
 */

console.log("--- Disposable Protocol (Symbol.dispose) ---");

class Connection {
  constructor(url) {
    this.url = url;
    this.connected = true;
    console.log(`Connected to ${url}`);
  }

  query(sql) {
    if (!this.connected) throw new Error("Not connected");
    return `Results for: ${sql}`;
  }

  // Called automatically when using block ends
  [Symbol.dispose]() {
    if (this.connected) {
      this.connected = false;
      console.log(`Disconnected from ${this.url}`);
    }
  }
}

// Simulate using block
console.log("\nUsing Connection:");
{
  const conn = new Connection("postgres://localhost");
  console.log(conn.query("SELECT * FROM users"));
  // Manually dispose (in real using, this is automatic)
  conn[Symbol.dispose]();
}

// --- Async Disposable Protocol ---
console.log("\n--- Async Disposable (Symbol.asyncDispose) ---");

class AsyncFile {
  constructor(path) {
    this.path = path;
    this.fd = null;
  }

  async open() {
    this.fd = Math.floor(Math.random() * 1000);
    console.log(`Opened ${this.path} (fd: ${this.fd})`);
    return this;
  }

  async read() {
    return `Contents of ${this.path}`;
  }

  async [Symbol.asyncDispose]() {
    if (this.fd !== null) {
      console.log(`Closing ${this.path} (fd: ${this.fd})`);
      this.fd = null;
    }
  }
}

async function processFile() {
  const file = await new AsyncFile("/tmp/data.txt").open();
  try {
    const data = await file.read();
    console.log(data);
  } finally {
    await file[Symbol.asyncDispose](); // normally: await using file = ...
  }
}

// Run the async example
processFile().then(() => console.log("File processed"));

// --- TempFile disposable ---
console.log("\n--- TempFile disposable ---");

class TempFile {
  constructor(content) {
    this.path = `/tmp/${Date.now()}.txt`;
    this.content = content;
    this.exists = true;
    console.log(`Created: ${this.path}`);
  }

  read() {
    if (!this.exists) throw new Error("File deleted");
    return this.content;
  }

  [Symbol.dispose]() {
    if (this.exists) {
      this.exists = false;
      console.log(`Deleted: ${this.path}`);
    }
  }
}

function processTemporaryData(data) {
  const tempFile = new TempFile(data);
  try {
    const result = tempFile.read().toUpperCase();
    return result;
  } finally {
    tempFile[Symbol.dispose]();
  }
}

const result = processTemporaryData("hello world");
console.log("Result:", result); // "HELLO WORLD"
// Output shows file created then deleted

// --- Multiple disposables ---
console.log("\n--- Multiple disposables ---");
function multiResourceExample() {
  const r1 = new TempFile("file 1");
  const r2 = new TempFile("file 2");
  try {
    console.log(r1.read());
    console.log(r2.read());
  } finally {
    r2[Symbol.dispose](); // LIFO
    r1[Symbol.dispose]();
  }
}
multiResourceExample();

// --- Equivalent try/finally ---
console.log("\n--- using is sugar for try/finally ---");
console.log(`
// Instead of:
const conn = new Connection();
try {
  conn.query("...");
} finally {
  conn[Symbol.dispose]();
}

// You write:
// using conn = new Connection();
// conn.query("...");
// auto-disposed!
`);
