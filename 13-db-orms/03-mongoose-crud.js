/**
 * Module 13 — 13.4 Mongoose CRUD + Query Operators
 * find/findOne/findById, $gte/$in/$regex, sort/limit, $set/$inc/$push,
 * deleteOne. Gracefully fails if no local MongoDB is running.
 *
 * npm i mongoose
 * Run: node 03-mongoose-crud.js
 */

// Graceful fail: if mongoose isn't installed, explain instead of crashing.
let mongoose;
try {
  mongoose = require("mongoose");
} catch {
  console.error("Mongoose is missing. Run: npm i mongoose");
  process.exit(1);
}

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  price: { type: Number, required: true, min: 0 },
  category: { type: String, enum: ["electronics", "books", "toys"] },
  tags: { type: [String], default: [] },
  stock: { type: Number, default: 0 },
});

const Product = mongoose.model("Product", productSchema);

async function main() {
  try {
    await mongoose.connect("mongodb://127.0.0.1:27017/db_orms_demo", {
      serverSelectionTimeoutMS: 2000,
    });
    console.log("connected to MongoDB (mongoose)");

    await Product.deleteMany({}); // clean slate

    // ---- CREATE ----
    await Product.insertMany([
      { name: "Laptop", price: 1200, category: "electronics", tags: ["tech"], stock: 10 },
      { name: "Mouse", price: 25, category: "electronics", tags: ["tech", "peripheral"], stock: 100 },
      { name: "Book: JS Deep Dive", price: 40, category: "books", tags: ["js"], stock: 5 },
      { name: "Rubik Cube", price: 15, category: "toys", tags: ["puzzle"], stock: 0 },
    ]);
    console.log("created 4 products");

    // ---- READ with operators ----
    const cheap = await Product.find({ price: { $gte: 0, $lte: 50 } }).sort({ price: 1 });
    console.log("price <= 50 sorted asc:", cheap.map((p) => p.name).join(", "));

    const tech = await Product.find({ category: "electronics", tags: { $in: ["peripheral"] } });
    console.log("electronics with 'peripheral' tag:", tech.map((p) => p.name).join(", "));

    const search = await Product.find({ name: { $regex: /book/i } }).select("name price");
    console.log("regex search 'book':", search);

    const one = await Product.findOne({ category: "toys" });
    const byId = await Product.findById(one._id);
    console.log("findOne + findById match:", byId.name === one.name);

    // ---- UPDATE operators ----
    // $inc: atomic increment (never read-modify-write a counter yourself)
    await Product.updateOne({ name: "Mouse" }, { $inc: { stock: -5 } });
    // $set + $push together
    const updated = await Product.findOneAndUpdate(
      { name: "Laptop" },
      { $set: { price: 1100 }, $push: { tags: "laptop" } },
      { new: true } // return the NEW document
    );
    console.log("updated laptop:", updated.price, "tags:", updated.tags.join(","));

    // ---- DELETE ----
    const gone = await Product.deleteOne({ name: "Rubik Cube" });
    const remaining = await Product.countDocuments();
    console.log(`deleted ${gone.deletedCount} product; ${remaining} left`);

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
