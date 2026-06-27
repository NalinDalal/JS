/**
 * Module 08 — 8.3 Custom Errors + 8.4 throw
 * ValidationError, ApiError hierarchy, throw, re-throw, cause
 *
 * Run: node 03-custom-errors.js
 */

// --- Basic custom error ---
console.log("--- Custom ValidationError ---");
class ValidationError extends Error {
  constructor(message, field) {
    super(message);
    this.name = "ValidationError";
    this.field = field;
  }
}

function validateAge(age) {
  if (age < 0 || age > 150) {
    throw new ValidationError("Age must be 0-150", "age");
  }
  return true;
}

try {
  validateAge(-5);
} catch (e) {
  if (e instanceof ValidationError) {
    console.log(`Field "${e.field}": ${e.message}`);
  }
}

// --- Error hierarchy ---
console.log("\n--- Error hierarchy ---");
class AppError extends Error {
  constructor(message, code) {
    super(message);
    this.name = "AppError";
    this.code = code;
  }
}

class NotFoundError extends AppError {
  constructor(resource) {
    super(`${resource} not found`, "NOT_FOUND");
    this.name = "NotFoundError";
    this.resource = resource;
  }
}

try {
  throw new NotFoundError("User");
} catch (e) {
  if (e instanceof NotFoundError) {
    console.log("code:", e.code);        // "NOT_FOUND"
    console.log("resource:", e.resource); // "User"
    console.log("instanceof AppError:", e instanceof AppError); // true
  }
}

// --- ES2022 cause property ---
console.log("\n--- Error cause (ES2022) ---");
class DatabaseError extends Error {
  constructor(message, cause) {
    super(message, { cause });
    this.name = "DatabaseError";
  }
}

try {
  try {
    JSON.parse("oops");
  } catch (original) {
    throw new DatabaseError("Connection failed", original);
  }
} catch (e) {
  console.log("message:", e.message);           // "Connection failed"
  console.log("cause.message:", e.cause.message); // "Unexpected token..."
}

// --- throw statement patterns ---
console.log("\n--- throw patterns ---");
function divide(a, b) {
  if (typeof a !== "number" || typeof b !== "number") {
    throw new TypeError("Arguments must be numbers");
  }
  if (b === 0) {
    throw new RangeError("Cannot divide by zero");
  }
  return a / b;
}

try {
  divide(10, 0);
} catch (e) {
  console.log("instanceof RangeError:", e instanceof RangeError); // true
}

// Guard clause pattern
console.log("\n--- Guard clause pattern ---");
function setPrice(price) {
  if (price < 0) throw new RangeError("Price cannot be negative");
  if (typeof price !== "number") throw new TypeError("Price must be a number");
  return price * 1.1;
}

console.log("setPrice(100):", setPrice(100)); // 110
try { setPrice(-10); } catch (e) { console.log("Error:", e.message); }
