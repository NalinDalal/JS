/**
 * Module 13 — 13.7 Mongoose Population
 * User + Post schemas with ObjectId refs, populate() for relations,
 * deep populate, populate with select/match. Gracefully fails if no MongoDB.
 *
 * npm i mongoose
 * Run: node 04-mongoose-populate.js
 */

// Graceful fail: if mongoose isn't installed, explain instead of crashing.
let mongoose;
try {
  mongoose = require("mongoose");
} catch {
  console.error("Mongoose is missing. Run: npm i mongoose");
  process.exit(1);
}

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
});

const postSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    body: String,
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    published: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Reverse relation: virtual populate — child docs (Post) hold the author's _id,
// so we expose user.posts without storing anything on the User.
userSchema.virtual("posts", {
  ref: "Post",
  localField: "_id",
  foreignField: "author",
});

const User = mongoose.model("User", userSchema);
const Post = mongoose.model("Post", postSchema);

async function main() {
  try {
    await mongoose.connect("mongodb://127.0.0.1:27017/db_orms_demo", {
      serverSelectionTimeoutMS: 2000,
    });
    console.log("connected to MongoDB (mongoose)");

    await Promise.all([User.deleteMany({}), Post.deleteMany({})]);

    const alice = await User.create({ name: "Alice" });
    const bob = await User.create({ name: "Bob" });

    await Post.create([
      { title: "Understanding Mongoose", body: "doc 1", author: alice._id },
      { title: "Prisma vs Mongoose", body: "doc 2", author: alice._id },
      { title: "Hidden draft", body: "doc 3", author: alice._id, published: false },
      { title: "Bob's post", body: "doc 4", author: bob._id },
    ]);

    // ---- populate: turn author ids into User documents (second query under the hood) ----
    const posts = await Post.find().populate("author").sort({ title: 1 });
    console.log("populated authors:", posts.map((p) => `${p.title} -> ${p.author.name}`).join(" | "));

    // ---- populate with select + match: shape children ----
    const aliceWithPosts = await User.findOne({ name: "Alice" }).populate({
      path: "posts", // virtual populate — only works because of the virtual above
      select: "title",
      match: { published: true }, // filters child docs
    });
    console.log("alice published posts:", aliceWithPosts.posts.map((p) => p.title).join(", "));

    // ---- deep populate: Post -> author (and skip if we had Comment -> Post) ----
    const deep = await Post.find({ title: "Prisma vs Mongoose" }).populate({
      path: "author",
      select: "name -_id", // only name, drop _id
    });
    console.log("deep populate result:", deep[0].author.name);

    // ---- N+1 warning: never populate inside a loop like this ----
    const users = await User.find();
    for (const u of users) {
      // One populate = one extra query PER user. With 100 users that's 101 queries.
      // Prefer a single .populate() at the query level (see aliceWithPosts above).
      await u.populate("posts");
    }
    console.log(`N+1 demo: ${users.length} users populated individually (would be N+1 queries)`);

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
