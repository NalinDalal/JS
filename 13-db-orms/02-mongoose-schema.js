/**
 * Module 13 — 13.3/13.5/13.6 Mongoose Schema, Validators, Hooks, Methods & Virtuals
 * Real Mongoose code: schema with validators, a custom document method, a
 * virtual, and a pre('save') hook. Gracefully fails if no MongoDB is running.
 *
 * npm i mongoose
 * Run: node 02-mongoose-schema.js
 */

// Graceful fail: if mongoose isn't installed, explain instead of crashing.
let mongoose;
try {
  mongoose = require("mongoose");
} catch {
  console.error("Mongoose is missing. Run: npm i mongoose");
  process.exit(1);
}

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
      minlength: 2,
    },
    lastName: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true, // becomes a real unique index in MongoDB
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Please use a valid email"],
    },
    age: { type: Number, min: 13, max: 120, default: 18 },
    password: { type: String, required: true, minlength: 8, select: false },
    role: { type: String, enum: ["user", "admin", "moderator"], default: "user" },
    bio: { type: String, maxlength: 280 },
  },
  { timestamps: true } // maintains createdAt / updatedAt automatically
);

// ---- pre('save') hook: the classic password-hash pattern ----
// this = the document being saved. Only re-hash when the password changed,
// otherwise login with the already-hashed value breaks.
userSchema.pre("save", function (next) {
  if (this.isModified("password")) {
    // Real apps use bcrypt.hash(this.password, 10). We fake the hash here so
    // the demo runs with zero extra deps — the pattern is identical.
    this.password = `hashed(${this.password})`;
    console.log(`[pre-save] hashed password for ${this.email}`);
  }
  next();
});

// ---- Custom document method (schema.methods) ----
userSchema.methods.sayHello = function () {
  return `Hi, I'm ${this.firstName} ${this.lastName} (${this.role}).`;
};

// ---- Static (schema.statics) ----
userSchema.statics.findByEmail = function (email) {
  return this.findOne({ email: email.trim().toLowerCase() });
};

// ---- Virtual: computed field, never stored in the DB ----
userSchema.virtual("fullName").get(function () {
  return `${this.firstName} ${this.lastName}`;
});

const User = mongoose.model("User", userSchema);

// ---- Connect with graceful failure ----
async function main() {
  try {
    await mongoose.connect("mongodb://127.0.0.1:27017/db_orms_demo", {
      serverSelectionTimeoutMS: 2000,
    });
    console.log("connected to MongoDB (mongoose)");

    await User.deleteMany({}); // clean slate
    const alice = await User.create({
      firstName: "Alice",
      lastName: "Smith",
      email: "Alice@Example.com", // lowercased by schema
      password: "supersecret",
      role: "admin",
    });

    console.log("saved:", alice.fullName, "|", alice.email, "| role:", alice.role);
    console.log("method call:", alice.sayHello());
    console.log("timestamps:", alice.createdAt, "->", alice.updatedAt);

    // Static in action
    const found = await User.findByEmail("alice@example.com");
    console.log("static findByEmail found:", found ? found.fullName : null);

    // Validation failure -> Mongoose ValidationError
    try {
      await User.create({ firstName: "A", email: "bad", password: "short" });
    } catch (err) {
      console.log("caught ValidationError keys:", Object.keys(err.errors));
    }

    await mongoose.disconnect();
    console.log("done.");
  } catch (err) {
    console.error(
      "Could not connect to MongoDB. Start it first: brew services start mongodb-community\n" +
        `  (error: ${err.message})`
    );
    process.exit(1);
  }
}

main();
