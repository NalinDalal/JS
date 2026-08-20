/**
 * Module 13 — 13.12 Indexes & Query Performance (Query Comparison)
 * Zero-dependency: prints a side-by-side comparison of the same query written
 * in Mongoose vs Prisma (console.table), plus the N+1 problem explained with
 * actual query counts.
 *
 * Run: node 07-query-comparison.js
 */

// ---- Same logical query, both ORMs ----
// "Find the first 10 published posts by author #7, newest first, only title + createdAt"

const mongooseVersion = [
  "Post.find({",
  "  author: userId,",
  "  published: true,",
  "}).sort({ createdAt: -1 }).limit(10).select('title createdAt')",
].join("\n");

const prismaVersion = [
  "prisma.post.findMany({",
  "  where: {",
  "    authorId: userId,",
  "    published: true,",
  "  },",
  "  orderBy: { createdAt: 'desc' },",
  "  take: 10,",
  "  select: { title: true, createdAt: true },",
  "})",
].join("\n");

console.log("== Same query, two ORMs ==");
console.table([
  {
    ORM: "Mongoose (MongoDB)",
    Query: mongooseVersion,
    Filter: "author + published",
    Sorting: ".sort({ createdAt: -1 })",
    Limit: ".limit(10)",
    Field_Selection: ".select('title createdAt')",
    "SQL generated": "none — MongoDB query object, no SQL",
  },
  {
    ORM: "Prisma (SQL)",
    Query: prismaVersion,
    Filter: "authorId + published",
    Sorting: "orderBy: { createdAt: 'desc' }",
    Limit: "take: 10",
    Field_Selection: "select: { title, createdAt }",
    "SQL generated":
      "SELECT title, createdAt FROM Post WHERE authorId = ? AND published = ? ORDER BY createdAt DESC LIMIT 10",
  },
]);

// ---- Index advice for each ----
console.log("\n== Index advice ==");
console.table([
  {
    Engine: "MongoDB",
    Index: `db.posts.createIndex({ author: 1, createdAt: -1 })`,
    Why: "Compound index matches the filter + sort order exactly — no in-memory sort, no collection scan.",
  },
  {
    Engine: "Prisma (Postgres)",
    Index: `@@index([authorId, createdAt])  // in Post model`,
    Why: "Same logic: one B-tree covering (authorId, createdAt) serves filter AND order.",
  },
  {
    Engine: "Both",
    Index: "Never index a boolean/low-cardinality column alone",
    Why: "The optimizer ignores it; it only helps as a trailing member of a compound index.",
  },
]);

// ---- N+1 problem with real numbers ----
console.log("\n== The N+1 problem ==");
function nPlusOne(parents, childrenPerParent) {
  const parentsQuery = 1;
  const childrenQueries = parents * childrenPerParent;
  return { parentsQuery, childrenQueries, total: parentsQuery + childrenQueries };
}

for (const [parents, kids] of [[10, 3], [100, 3], [1000, 3]]) {
  const naive = nPlusOne(parents, kids);
  console.log(
    `${parents} users x ${kids} posts each — naive populate in a loop: ${naive.total} queries ` +
      `(1 for parents + ${naive.childrenQueries} for children). ` +
      `Fixed: one query + one populate => ${naive.parentsQuery + 1} queries.`
  );
}

console.log("\nRule of thumb: if query count grows with row count, it's N+1. Fix it by populating/include-ing at the query level, or using $lookup / SQL JOIN.");
