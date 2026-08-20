/**
 * Module 13 — 13.1/13.2 Mini ODM (Zero-Dependency)
 * A tiny hand-rolled ODM: schema validation + a Model class over an in-memory
 * "collection" (array of documents). Shows what Mongoose does under the hood:
 * define a shape -> validate on save -> expose find/save/update APIs.
 *
 * Run: node 01-mini-odm.js
 */

// ---- Schema: describes a document's shape + validators ----

class Schema {
  constructor(fields) {
    this.fields = fields; // { name: { type: String, required: true }, ... }
  }

  // Validate a plain object against this schema. Returns list of errors.
  validate(obj) {
    const errors = [];
    for (const [key, opts] of Object.entries(this.fields)) {
      const value = obj[key];
      if (opts.required && (value === undefined || value === null || value === "")) {
        errors.push(`${key} is required`);
        continue;
      }
      if (value === undefined) continue;
      if (opts.type === String && typeof value !== "string") {
        errors.push(`${key} must be a string`);
      }
      if (opts.type === Number && typeof value !== "number") {
        errors.push(`${key} must be a number`);
      }
      if (opts.min !== undefined && typeof value === "number" && value < opts.min) {
        errors.push(`${key} must be >= ${opts.min}`);
      }
      if (opts.enum && !opts.enum.includes(value)) {
        errors.push(`${key} must be one of ${opts.enum.join(", ")}`);
      }
    }
    return errors;
  }
}

// ---- Model: one class per "collection" ----

class Model {
  constructor(name, schema) {
    this.name = name;
    this.schema = schema;
    this.rows = []; // our in-memory "collection"
  }

  // Create a document instance with defaults applied
  build(obj) {
    const doc = { ...obj };
    for (const [key, opts] of Object.entries(this.schema.fields)) {
      if (doc[key] === undefined && opts.default !== undefined) {
        doc[key] = typeof opts.default === "function" ? opts.default() : opts.default;
      }
    }
    return doc;
  }

  // Simulates new Doc(data).save() -> inserts into the "collection"
  async create(obj) {
    const errors = this.schema.validate(obj);
    if (errors.length > 0) {
      const err = new Error(`Validation failed: ${errors.join(", ")}`);
      err.name = "ValidationError";
      throw err;
    }
    const doc = this.build(obj);
    doc._id = this.rows.length + 1; // autoincrement like an ObjectId
    doc.createdAt = new Date().toISOString();
    this.rows.push(doc);
    return { ...doc };
  }

  // Simulates Model.find(filter) -> array of matches
  find(filter = {}) {
    return this.rows.filter((doc) =>
      Object.entries(filter).every(([k, v]) => doc[k] === v)
    ).map((d) => ({ ...d }));
  }

  // Simulates Model.findOne(filter) -> first match or null
  findOne(filter) {
    const found = this.find(filter);
    return found.length ? found[0] : null;
  }

  // Simulates Model.findById(id)
  findById(id) {
    return this.findOne({ _id: id });
  }
}

// ---- Demo ----

async function main() {
  // A User schema with the same validators Mongoose supports
  const userSchema = new Schema({
    name: { type: String, required: true, min: 3 },
    age: { type: Number, min: 18 },
    role: { type: String, enum: ["user", "admin"], default: "user" },
  });

  const User = new Model("User", userSchema);

  console.log("== Mini ODM demo ==");

  // Valid create
  const alice = await User.create({ name: "Alice", age: 30 });
  const bob = await User.create({ name: "Bob", age: 22, role: "admin" });
  console.log("created:", alice, bob);

  // Validation failure -> throws like Mongoose ValidationError
  try {
    await User.create({ name: "X", age: 15 }); // name too short-ish + age < 18
  } catch (err) {
    console.log("caught validation error:", err.message);
  }

  // find / findOne / findById behave like Mongoose
  console.log("find({role:'admin'}):", User.find({ role: "admin" }));
  console.log("findOne({name:'Alice'}):", User.findOne({ name: "Alice" }));
  console.log("findById(2):", User.findById(2));

  // Defaults applied
  console.log("default role applied:", User.build({ name: "Cara", age: 25 }));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
