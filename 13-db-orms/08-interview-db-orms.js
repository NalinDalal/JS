/**
 * Module 13 — Interview Questions (DB & ORMs)
 * Say the answer out loud BEFORE reading it. Run for a quick daily drill.
 *
 * Run: node 08-interview-db-orms.js
 */

const qa = [
  [
    "When would you pick SQL over NoSQL, and vice versa?",
    "SQL when data is highly relational, needs joins, strong ACID transactions, and referential integrity (orders, money, user↔order↔product). NoSQL when shapes are flexible or evolving, workloads are write-heavy, and you need horizontal scaling as a first-class feature (activity feeds, catalogs, big JSON blobs). Rule of thumb: if you keep asking which rows this row relates to, use SQL; if your data is one big JSON document read/written as a unit, use MongoDB.",
  ],
  [
    "What is an ORM/ODM and what problems does it solve?",
    "An ORM maps SQL tables to JS classes; an ODM maps MongoDB documents to JS models (Mongoose is an ODM, Prisma is an ORM). It solves: SQL injection (all values are parameterized), type safety (Prisma generates TS types from the schema), productivity (validators, hooks, virtuals, migrations), and portability (same API across databases). The tradeoff: it hides SQL, so you still need to understand indexes and joins to write fast queries.",
  ],
  [
    "How does an ORM prevent SQL injection?",
    "An ORM never concatenates user input into a query string. Values are bound as parameters: the driver sends the SQL skeleton with placeholders and the values separately, so a malicious string can never be parsed as SQL syntax. Compare: `SELECT * FROM users WHERE name = '${input}'` (injectable) vs `WHERE name = $1` with input bound as data. The escape hatch is raw queries — in Prisma use queryRaw with parameters, never string interpolation.",
  ],
  [
    "What is the difference between a Schema and a Model in Mongoose?",
    "A Schema defines the shape: field names, types, validators, defaults, timestamps — it's a blueprint that exists only in code. A Model is the compiled, instantiable class you get from `mongoose.model('User', userSchema)`; it talks to a MongoDB collection. One schema can compile into one model; you save/find via the model, not the schema.",
  ],
  [
    "Which Mongoose validators do you use day-to-day and what do they do?",
    "required (field must exist), unique (DB-level unique index — actually an index, not a validator), min/max (number ranges), enum (whitelist of values), trim (strip whitespace), lowercase, minlength/maxlength, match (regex), and custom validate functions. They run on save() and validate() — but not on updateOne unless you pass runValidators: true.",
  ],
  [
    "How does Mongoose pre('save') relate to password hashing?",
    "pre('save') is a hook that runs before the document is written. The classic use: if this.isModified('password'), replace the plaintext with bcrypt.hash(password, 10) then next(). Because the hash happens at the last moment before insert, plaintext never touches the DB. Gotcha: it doesn't run for updateOne/findByIdAndUpdate — and if you skip the isModified check, every save re-hashes the stored hash and breaks login.",
  ],
  [
    "What is a Mongoose virtual and when do you use it?",
    "A virtual is a computed property not stored in the DB: userSchema.virtual('fullName').get(...) derives 'Alice Smith' from firstName + lastName on the fly. Use it for derived display values and for reverse relations via virtual populate (user.posts when Post stores authorId). Gotchas: you can't query on a virtual, and it's excluded from JSON unless toJSON: { virtuals: true } is set.",
  ],
  [
    "How does Mongoose population work, and what is the N+1 problem?",
    "Population replaces an ObjectId field (with ref) with the actual referenced documents by running additional queries — a field with ref: 'Post' becomes real posts after .populate('posts'). Deep populate chains relations via { path, populate }. The N+1 problem: populating inside a loop (100 users → 101 queries). Fix: populate once at the query level, use $lookup, or batch with $in.",
  ],
  [
    "What is a Prisma migration and why is it versioned?",
    "A migration is a versioned, ordered set of SQL changes derived from schema.prisma. `npx prisma migrate dev --name init` diffs the schema against the DB, writes a migration file under prisma/migrations/, applies it, and regenerates the typed client. Versioned means a teammate just runs prisma migrate dev to get the same DB state, and production applies them in order with prisma migrate deploy — like git for your schema.",
  ],
  [
    "How do you model one-to-many and many-to-many relations in Prisma?",
    "One-to-many: the child model holds the FK and a @relation — Post has author User @relation(fields: [authorId], references: [id]) plus authorId Int, and User has posts Post[]. Many-to-many: either an implicit join table (both sides declare Post[]/User[]) or an explicit join model with its own fields when the relation carries data (e.g., Follow with likedAt), declared with two @relation attributes and a composite @@id. Both sides of a relation must be declared.",
  ],
  [
    "What is the difference between select and include in Prisma?",
    "select narrows which fields of the model itself come back (prisma.user.findMany({ select: { email: true } })); include pulls related models (prisma.user.findMany({ include: { posts: true } })). You cannot use both at the same level — use nested selects: include: { posts: { select: { title: true } } }. select is the equivalent of choosing columns; include is the equivalent of a SQL JOIN.",
  ],
  [
    "How do you catch a unique-constraint violation in Prisma?",
    "Prisma throws PrismaClientKnownRequestError with a code property; unique violations are P2002 and err.meta.target names the constraint. Catch by code, never by message string: if (err.code === 'P2002') handle gracefully, otherwise rethrow. Also know P2025 (record not found on update/delete) and P2003 (foreign key violation).",
  ],
  [
    "What are MongoDB indexes vs Prisma @@index, and when does a compound index help?",
    "An index is a sorted structure for O(log n) lookups instead of full scans. In Mongo: collection.createIndex({ author: 1, createdAt: -1 }) or schema.index(); in Prisma: @@index([authorId, createdAt]) in the model, materialized by migrate. A compound index helps when the query filters AND sorts on those fields in order — and only when the leftmost prefix is used. Verify with .explain('executionStats') (totalDocsExamined vs nReturned) or EXPLAIN ANALYZE (Seq Scan vs Index Scan).",
  ],
  [
    "What are transactions, and how do MongoDB sessions differ from Prisma $transaction?",
    "A transaction makes multiple writes atomic — all succeed or all roll back (e.g., debit + credit). Prisma: prisma.$transaction([...]) for batches or $transaction(async (tx) => ...) when you need to read inside and then decide. MongoDB only supports real multi-document transactions on replica sets: start a session, call session.withTransaction(...), and pass { session } to every operation — forget it and a write silently runs outside the transaction. Keep transactions short; they hold locks.",
  ],
];

let i = 0;
function next() {
  if (i >= qa.length) {
    console.log("\nDone! Loop back to the top for another round.");
    process.exit(0);
  }
  const [q, a] = qa[i++];
  console.log(`\nQ${i}: ${q}`);
  console.log("   (press Enter to see the answer, or Ctrl+C to quit)");
}

if (!process.stdin.isTTY) {
  // Piped input (e.g. `echo | node ...`): setRawMode would crash. Not a TTY,
  // so there is no interactive drill — exit cleanly after showing a question.
  console.log("Say each answer out loud, then press Enter to check.");
  next();
  process.exit(0);
}

process.stdin.setRawMode(true);
process.stdin.resume();
process.stdin.on("data", () => next());
console.log("Say each answer out loud, then press Enter to check.");
next();
