/**
 * Module 05 — 5.5 Proxy & Reflect
 * Traps, Reflect, validation, logging, reactive data
 *
 * Run: node 05-proxy-reflect.js
 */

// --- Basic Proxy with get/set traps ---
console.log("--- Basic Proxy ---");
const handler = {
  get(target, prop, receiver) {
    console.log(`Accessing: ${String(prop)}`);
    return Reflect.get(target, prop, receiver);
  },
  set(target, prop, value, receiver) {
    console.log(`Setting ${String(prop)} = ${value}`);
    return Reflect.set(target, prop, value, receiver);
  }
};

const user = new Proxy({ name: "Alice", age: 30 }, handler);
console.log("name:", user.name);   // logs "Accessing: name", returns "Alice"
user.age = 31;                     // logs "Setting age = 31"

// --- Validation ---
console.log("\n--- Validation ---");
const validatedPerson = new Proxy({}, {
  set(target, prop, value) {
    if (prop === "age" && typeof value !== "number") {
      throw new TypeError("Age must be a number");
    }
    if (prop === "age" && (value < 0 || value > 150)) {
      throw new RangeError("Age must be 0-150");
    }
    return Reflect.set(target, prop, value);
  }
});

validatedPerson.age = 25;    // OK
console.log("Age set to 25");

try { validatedPerson.age = "old"; } catch (e) {
  console.log("Error:", e.message);
}
try { validatedPerson.age = 200; } catch (e) {
  console.log("Error:", e.message);
}

// --- Default values ---
console.log("\n--- Default values ---");
const defaultHandler = {
  get(target, prop) {
    return prop in target ? target[prop] : "default value";
  }
};

const config = new Proxy({ timeout: 5000 }, defaultHandler);
console.log("timeout:", config.timeout);  // 5000
console.log("retries:", config.retries);  // "default value"
console.log("port:", config.port);        // "default value"

// --- Logging / Auditing ---
console.log("\n--- Audited Proxy ---");
function createAuditedProxy(obj, name) {
  return new Proxy(obj, {
    get(target, prop, receiver) {
      console.log(`[${name}] GET ${String(prop)}`);
      return Reflect.get(target, prop, receiver);
    },
    set(target, prop, value, receiver) {
      console.log(`[${name}] SET ${String(prop)} = ${JSON.stringify(value)}`);
      return Reflect.set(target, prop, value, receiver);
    }
  });
}

const audited = createAuditedProxy({ x: 1, y: 2 }, "audit");
audited.x;
audited.y = 10;

// --- Reactive data (Vue.js style) ---
console.log("\n--- Reactive data ---");
function reactive(obj, onChange) {
  return new Proxy(obj, {
    set(target, prop, value, receiver) {
      const oldValue = target[prop];
      const result = Reflect.set(target, prop, value, receiver);
      if (oldValue !== value) {
        onChange(prop, value, oldValue);
      }
      return result;
    }
  });
}

const state = reactive({ count: 0 }, (prop, newVal, oldVal) => {
  console.log(`${prop}: ${oldVal} → ${newVal}`);
});

state.count = 1;  // "count: 0 → 1"
state.count = 5;  // "count: 1 → 5"

// --- Negative array indexing ---
console.log("\n--- Negative array indexing ---");
function createNegativeIndexArray(arr) {
  return new Proxy(arr, {
    get(target, prop, receiver) {
      const index = Number(prop);
      if (!isNaN(index) && index < 0) {
        return Reflect.get(target, target.length + index, receiver);
      }
      return Reflect.get(target, prop, receiver);
    }
  });
}

const arr = createNegativeIndexArray([10, 20, 30, 40]);
console.log("arr[-1]:", arr[-1]); // 40
console.log("arr[-2]:", arr[-2]); // 30
console.log("arr[0]:", arr[0]);   // 10

// --- Immutable Proxy ---
console.log("\n--- Immutable Proxy ---");
function immutable(obj) {
  return new Proxy(obj, {
    set() { throw new TypeError("Object is immutable"); },
    deleteProperty() { throw new TypeError("Object is immutable"); },
    defineProperty() { throw new TypeError("Object is immutable"); },
  });
}

const frozen = immutable({ x: 10 });
console.log("frozen.x:", frozen.x); // 10
try { frozen.x = 20; } catch (e) {
  console.log("Error:", e.message); // Object is immutable
}

// --- Reflect basics ---
console.log("\n--- Reflect methods ---");
const target = { a: 1, b: 2 };
console.log("Reflect.get:", Reflect.get(target, "a")); // 1
Reflect.set(target, "c", 3);
console.log("After Reflect.set:", target); // { a: 1, b: 2, c: 3 }
console.log("Reflect.has:", Reflect.has(target, "a")); // true
Reflect.deleteProperty(target, "b");
console.log("After Reflect.deleteProperty:", target); // { a: 1, c: 3 }
