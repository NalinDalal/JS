/**
 * Module 13 — 13.9/13.10/13.13 Prisma Client CRUD, Relations & Transactions
 * Real Prisma Client code: create/findMany/update/delete, where with AND/OR,
 * include/select relations, nested writes, $transaction.
 *
 * npm i prisma @prisma/client && npx prisma migrate dev --name init
 * Run: node 06-prisma-client.js
 */

// Graceful fail: if the client wasn't generated, explain instead of crashing.
let PrismaClient;
try {
  ({ PrismaClient } = require("@prisma/client"));
} catch {
  console.error(
    "Prisma Client is missing. Run:\n" +
      "  npm i prisma @prisma/client\n" +
      "  npx prisma migrate dev --name init\n" +
      "then re-run this file."
  );
  process.exit(1);
}

const prisma = new PrismaClient();

async function main() {
  // ---- CREATE ----
  const alice = await prisma.user.create({
    data: { email: "alice@example.com", name: "Alice" },
  });
  const bob = await prisma.user.create({
    data: { email: "bob@example.com", name: "Bob", role: "ADMIN" },
  });

  // Nested write: create a user AND their posts in one call
  const carol = await prisma.user.create({
    data: {
      email: "carol@example.com",
      name: "Carol",
      posts: { create: [{ title: "Hello Prisma" }, { title: "Second post" }] },
    },
  });
  console.log("created users:", alice.email, bob.email, carol.email);

  // ---- READ: where with operators, AND/OR ----
  const adults = await prisma.user.findMany({
    where: { OR: [{ role: "ADMIN" }, { name: { startsWith: "C" } }] },
    orderBy: { name: "asc" },
    select: { email: true, name: true, role: true }, // shape the response
  });
  console.log("filtered users (ADMIN or name starts with C):", adults);

  // ---- include: pull relations in one query (SQL JOIN) ----
  const withPosts = await prisma.user.findMany({
    where: { email: "carol@example.com" },
    include: { posts: { select: { title: true } } },
  });
  console.log("carol + her posts:", JSON.stringify(withPosts[0].posts));

  // ---- UPDATE ----
  const updated = await prisma.post.update({
    where: { id: withPosts[0].posts[0].id },
    data: { published: false },
  });
  console.log("unpublished post:", updated.title, "-> published:", updated.published);

  // ---- Unique-constraint violation: catch by error code P2002 ----
  try {
    await prisma.user.create({ data: { email: "alice@example.com", name: "Dup" } });
  } catch (err) {
    if (err.code === "P2002") {
      console.log("caught P2002: unique constraint on", err.meta.target);
    } else throw err;
  }

  // ---- 13.13 Transactions: both writes or neither ----
  await prisma.$transaction([
    prisma.post.create({ data: { title: "Tx post 1", authorId: alice.id } }),
    prisma.post.create({ data: { title: "Tx post 2", authorId: alice.id } }),
  ]);
  // Interactive transaction: read inside, then decide
  await prisma.$transaction(async (tx) => {
    const posts = await tx.post.findMany({ where: { authorId: alice.id } });
    console.log("inside interactive tx, alice has", posts.length, "posts");
  });

  console.log("prisma demo done.");
}

main()
  .catch((err) => {
    console.error("prisma error:", err.message);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
