# Module 13: Databases & ORMs (Mongoose + Prisma)

---

## 13.1 SQL vs NoSQL

### Explain It

SQL databases (Postgres, MySQL, SQLite) store data in **tables with fixed rows and typed columns**, and the schema is enforced before any data goes in. NoSQL databases (MongoDB, DynamoDB, Redis) store **documents** (JSON-like objects) or key/value pairs, and each document can have a different shape. You pick SQL when your data is highly relational (users ↔ orders ↔ products), you need **joins** across tables, strong **transactions** (ACID), or you must guarantee referential integrity. You pick NoSQL when you have flexible or evolving shapes, huge write-heavy workloads, and you want **horizontal scaling** (sharding across many machines) as a first-class feature. A useful rule: if you keep asking "which other rows does this row relate to?", you probably want SQL; if your data is a big JSON blob you read and write as one unit, a document store feels natural. In practice, PostgreSQL with JSONB columns blurs the line — you can have relational integrity and JSON flexibility in one place.

#### Visualised: SQL Tables vs NoSQL Documents

The same data — "Alice and her 2 orders" — lives completely differently in the two worlds:

**SQL: normalized TABLES, rows, and FOREIGN KEYs** (read "Alice + orders" by joining):

```sql
┌──────────────────┐         ┌──────────────────────────┐
│ users            │         │ orders                   │
├──────────────────┤         ├──────────────────────────┤
│ id       INTEGER │ 1     N │ id        INTEGER        │
│ name     VARCHAR │────────►│ user_id   INTEGER  (FK)  │
│ email    VARCHAR │         │ total     DECIMAL        │
│ created_at TS    │         │ created_at TIMESTAMP     │
└──────────────────┘         └──────────────────────────┘
     ▲                                 ▲
     │ PK: users.id ◄──────────────────┘ FK: orders.user_id

one row per record:                    JOIN merges both tables on the FK:
┌────────┬──────────┬─────────────┐
│ id     │ name     │ email       │   SELECT * FROM users
├────────┼──────────┼─────────────┤   JOIN orders ON orders.user_id = users.id
│ 1      │ Alice    │ a@dev.com   │   WHERE users.id = 1;
│ 2      │ Bob      │ b@dev.com   │
└────────┴──────────┴─────────────┘
```

**NoSQL: flexible DOCUMENTS with nested related data** (read "Alice + orders" in ONE query):

```js
{
  "_id": "65f1a2b3c4d5e6f7a8b9c0d1",   // like a PRIMARY KEY
  "name": "Alice",
  "email": "a@dev.com",
  "address": {                          // nested OBJECT
    "city": "Mumbai",
    "zip": "400001"
  },
  "orders": [                           // nested ARRAY — no JOIN needed
    { "id": 1, "total": 999, "createdAt": "2026-01-01" },
    { "id": 2, "total": 25,  "createdAt": "2026-02-03" }
  ]
}
```

NoSQL also supports small documents that **reference** each other (`user_id: "u1"`), which Mongoose resolves with `populate()` — but that's an extra application-side query, not a database-level JOIN (see 13.7). Run the full visualisation with all six diagrams:

```bash
node 09-schema-visualisation.js
```

### Prove It

```js
// 01-mini-odm.js — run: node 01-mini-odm.js
// 09-schema-visualisation.js — run: node 09-schema-visualisation.js
```

#### Gotchas / Edge Cases

- NoSQL databases do not enforce uniqueness or referential integrity by default — orphaned references are on you.
- SQL transactions (ACID) are strong; MongoDB only gets real transactions via replica sets, and they are slower.
- Joins: SQL does them natively; MongoDB emulates them with `$lookup` (pipeline) or application-side `populate()`, which can be slow.
- Horizontal scaling: MongoDB shards by a shard key; Postgres can replicate reads but writes are typically single-primary.
- Choose by access pattern, not hype — most startups start with SQL and only move to NoSQL when a concrete bottleneck appears.

---

## 13.2 What an ORM/ODM Is and Why You Need One

### Explain It

An **ORM** (Object-Relational Mapper) maps SQL tables to JavaScript classes, and an **ODM** (Object-Document Mapper) maps MongoDB documents to JS models — Mongoose is an ODM, Prisma and Sequelize are ORMs. Instead of writing raw SQL strings, you call methods: `User.find({ age: { $gte: 21 } })`. The biggest win is **SQL injection prevention**: an ORM parameterizes every value, so user input can never be parsed as SQL syntax. Second is **type safety**: Prisma generates TypeScript types straight from your schema, so a typo in a column name is a compile error, not a runtime 500. Third is **productivity**: migrations, validation, virtual fields, hooks, and relation traversal all come for free. Fourth, ORMs give you **portability** — the same query API can target Postgres, MySQL, or SQLite. The tradeoff: an ORM hides the SQL underneath, so you still need to understand indexes, joins, and query plans to write fast code.

### Prove It

```js
// 01-mini-odm.js — run: node 01-mini-odm.js
```

#### Gotchas / Edge Cases

- ORMs do not fix bad schema design — a slow join in SQL is a slow ORM query too.
- Raw SQL escape hatch: never use `Model.find().where(rawUserInput)` style concatenation; use `$in`, params, or Prisma `queryRaw` with placeholders.
- ORMs add overhead: a simple select may generate 3 SQL statements. Profile with the query log before assuming it's free.
- Type safety only helps when your schema file is the single source of truth — drift between migrations and code is a real risk.

---

## 13.3 Mongoose: Schema → Model

### Explain It

In Mongoose you define the shape of a document with a **Schema**, then compile it into a **Model**: `const User = mongoose.model("User", userSchema)`. The schema supports **validators** like `required` (must exist), `unique` (only one doc may have this value), `min`/`max` (numbers), `trim` (strings), `enum`, `minlength`, `match` (regex), and `validate` (custom function). You can set a `default` value used when the field is missing, and `timestamps: true` makes Mongoose maintain `createdAt`/`updatedAt` automatically. By default all fields are required unless you say so — actually the opposite: fields are **optional** unless you add `required`. The schema is not the database: Mongoose builds the MongoDB collection lazily, and `unique` becomes a real unique index in MongoDB. Validation runs on `save()` and `validate()` — not on `find`-style updates.

### Prove It

```js
// 02-mongoose-schema.js — run: node 02-mongoose-schema.js
```

#### Gotchas / Edge Cases

- `unique` is an index, not a validator — it enforces at the DB level, and duplicate-key errors surface as E11000, not a validation error.
- `required` only applies on document creation paths; `findOneAndUpdate` and `updateOne` skip validation unless you pass `{ runValidators: true }`.
- `timestamps: true` uses server time; it does not update if you disable timestamps on a nested schema.
- Numbers with `min`/`max` only validate on save; casting happens silently (a string `"25"` becomes `25`).
- Mongoose does not enforce the schema on documents written by other clients — it's a JS-level contract.

---

## 13.4 Mongoose CRUD + Query Operators

### Explain It

The bread and butter: `Model.create(doc)` (or `new Model(doc).save()`), `Model.find(filter)` (returns an array), `Model.findOne(filter)` (first match or null), `Model.findById(id)`, `Model.updateOne(filter, update)`, `Model.updateMany`, `Model.deleteOne(filter)`, `Model.deleteMany`. Query operators: `$gte`/`$lte`/`$gt`/`$lt` for ranges, `$in`/`$nin` for arrays of allowed values, `$regex` for substring matching, `$ne`, `$exists`. Chainables: `.sort({ age: -1 })`, `.limit(10)`, `.skip(20)`, `.select("name email")` (or `-password` to exclude). Update operators: `$set` (overwrite a field), `$inc` (increment a number atomically), `$push` (append to array), `$addToSet` (append if absent), `$unset` (remove). Query objects are **thenable** — you can `await` them directly, and `.exec()` returns a real Promise if you prefer. When no doc matches `findOneAndUpdate`, pass `{ upsert: true }` to create it.

### Prove It

```js
// 03-mongoose-crud.js — run: node 03-mongoose-crud.js
```

#### Gotchas / Edge Cases

- `find()` never throws on empty — it returns `[]`. `findOne` returns `null`. Check for null before touching fields.
- `Model.findOneAndUpdate` returns the **old** document by default; add `{ new: true }` to get the updated one.
- String equality in Mongo is case-sensitive: `find({ name: "Bob" })` misses `"bob"`. Use `$regex` with `i` flag.
- `$inc` is atomic — do not read-modify-write counters yourself; two concurrent reads will lose an update.
- Query objects are lazy: if you don't `await` or `.exec()`, nothing hits the database. Leaked unawaited queries are a memory leak source.

---

## 13.5 Mongoose Middleware Hooks

### Explain It

Mongoose **middleware** (hooks) run at points in a document's lifecycle: `pre("save")` and `post("save")` run before/after `save()`, `pre("remove")`/`pre("deleteOne")` before deletion, `pre("findOneAndUpdate")` for update queries, and `pre("validate")`. The classic use: hash a password in `pre("save")` — you check if the password changed (`this.isModified("password")`), bcrypt it, and replace the plaintext, so the hash never hits the DB. Other uses: auto-populate refs, lowercase emails, generate slugs, audit logs, cascade deletes in `pre("remove")`. In `pre` hooks, call `next()` (or return a promise) or the save never completes. `post` hooks receive the saved doc and can trigger side effects (emit an event, enqueue a job). Because `findByIdAndUpdate` bypasses `save()`, hooks on it must be registered with the full hook name (`pre("findOneAndUpdate")`).

### Prove It

```js
// 02-mongoose-schema.js — run: node 02-mongoose-schema.js
```

#### Gotchas / Edge Cases

- `pre("save")` does NOT run for `updateOne`/`findByIdAndUpdate` — only for documents going through `save()`.
- If `this.isModified` is not used, every save re-hashes the password — breaking login on the next sign-in.
- An error thrown in a `pre` hook rejects the save; make sure to `next(err)` rather than throwing async errors.
- Hooks are registered on the schema **before** compiling the model — registering after `model()` has no effect.
- In arrow functions, `this` is not the document — always use `function` syntax in hooks.

---

## 13.6 Mongoose Methods, Statics, Virtuals

### Explain It

Mongoose lets you hang application logic on your model. **Document methods** (`schema.methods`) are instance functions: `user.verifyPassword(input)` compares input with the stored hash — cleaner than copying bcrypt logic everywhere. **Statics** (`schema.statics`) are functions on the Model class itself: `User.findByEmail(email)` or `User.paginate(page)` encapsulate query patterns in one named place. **Virtuals** are fields computed on the fly, not stored in the DB: `userSchema.virtual("fullName").get(function () { return this.firstName + " " + this.lastName; })` — they serialize into JSON only if you pass `{ toJSON: { virtuals: true } }`. Virtuals with refs enable **virtual populate** (`virtual("posts", { ref: "Post", localField: "_id", foreignField: "author" })`) which flips the relationship direction when you only have a child-side reference. Methods and statics keep route handlers thin and make the model the single place your data logic lives.

### Prove It

```js
// 02-mongoose-schema.js — run: node 02-mongoose-schema.js
```

#### Gotchas / Edge Cases

- Virtuals are not persisted — do not `find` on a virtual field; use a real field or a static that computes the query.
- `this` inside methods/virtuals must come from `function`, not arrow functions.
- Virtuals appear in `console.log` output but are excluded from JSON unless `toJSON: { virtuals: true }` is set.
- Statics can be async and must return the query or value; remember that queries are thenable.
- Populate a virtual needs `ref`, `localField`, and `foreignField` — the child docs store the parent's `_id`.

---

## 13.7 Mongoose Population

### Explain It

MongoDB has no joins, but Mongoose gives you **population**: store an `ObjectId` in one field with `ref: "Post"`, and `await user.populate("posts")` (or `Model.find().populate("posts")`) replaces those ids with the actual documents, by running a second query under the hood. The field can be a single ObjectId (populates to one doc) or an array of ObjectIds (populates to an array). **Deep populate** chains relationships: `.populate({ path: "posts", populate: { path: "comments", select: "body author" } })`. You can shape results with `.populate({ path: "posts", select: "title createdAt -_id", match: { published: true } })` — `select` picks fields, `match` filters which children come back, `options: { limit: 5 }` caps them. Population is the #1 source of the **N+1 problem**: looping 100 users and populating each individually is 101 queries — populate once at the query level, not inside a loop.

### Prove It

```js
// 04-mongoose-populate.js — run: node 04-mongoose-populate.js
```

#### Gotchas / Edge Cases

- `populate` only works on fields that have `ref` — populate a plain ObjectId field and it stays an id.
- A `match` in populate filters children, but the parent doc still comes back even with zero matched children.
- Populated docs are plain objects, not Mongoose documents with their own methods — re-populate after mutating if needed.
- Deep populate multiplies queries: each level adds one query per populated path (N+1 grows quickly).
- Invalid ObjectIds in the array cause cast errors — sanitize ids coming from the client before populate.

---

## 13.8 Prisma: schema.prisma + Migrations

### Explain It

Prisma is a modern TypeScript-first ORM where the **Prisma schema** (`schema.prisma`) is the single source of truth. You declare `model User { id Int @id @default(autoincrement()) email String @unique posts Post[] }`, an `enum Role { USER ADMIN }`, and relations like `posts Post[]` (one-to-many) or `@relation` for many-to-many join tables. Special attributes: `@id` marks the primary key, `@default` sets defaults (including `autoincrement()`, `uuid()`, `now()`), `@unique` makes a unique constraint, `@updatedAt` auto-maintains an updated timestamp. Then `npx prisma migrate dev --name init` diffs your schema against the database, generates a migration SQL file, applies it, and **regenerates the typed Prisma Client** — so after every schema change, your code's types update instantly. Migrations are versioned files in `prisma/migrations/`, so a teammate pulls and runs `npx prisma migrate dev` to get the same DB. `prisma generate` regenerates the client when you're not migrating.

### Prove It

```js
// 05-prisma-schema.prisma — run: npx prisma migrate dev --name init
```

#### Gotchas / Edge Cases

- Migrate dev should never run against production — it's for local development; production uses `prisma migrate deploy`.
- Every change to the schema requires a new migration or `migrate dev` — your client and DB can drift apart silently.
- `@default` needs a valid value for existing rows when you add a required field — the migration will prompt or fail.
- The `@relation` attribute is required to disambiguate when two models relate in more than one way (give each relation a name).
- `autoIncrement()` only works on integer/`BigInt` ids; Postgres supports `@default(dbgenerated())` for exotic defaults.

---

## 13.9 Prisma Client CRUD

### Explain It

The generated Prisma Client gives you fully typed CRUD: `prisma.user.create({ data: { email, name } })`, `prisma.user.findMany({ where: { age: { gte: 21 } }, orderBy: { createdAt: "desc" }, take: 10, skip: 20 })`, `prisma.user.findUnique({ where: { email } })`, `prisma.user.update({ where: { id }, data: { name } })`, and `prisma.user.delete({ where: { id } })`. The `where` object supports `equals`, `in`, `contains` (string search), `startsWith`, `gt/gte/lt/lte`, `AND`, `OR`, `NOT` — all composed as plain objects with full TypeScript autocomplete, so a typo in a field name fails at compile time. `select` controls which fields come back, and `include` pulls relations (`prisma.user.findMany({ include: { posts: true } })`). Upserts: `prisma.user.upsert({ where, update, create })` does insert-or-update in one atomic call. Errors come back as `PrismaClientKnownRequestError` with a `code` (e.g. `P2002` = unique constraint violation) — catch by code, not by message.

### Prove It

```js
// 06-prisma-client.js — run: node 06-prisma-client.js
```

#### Gotchas / Edge Cases

- `findUnique` takes only fields with `@unique` or `@id` in `where` — anything else needs `findFirst`.
- `update`/`delete` throw if no row matches (`P2025`); guard with `findFirst` or wrap in try/catch by code.
- `contains` is case-insensitive in Postgres by default; in MySQL you must set collation.
- Prisma Client must be a singleton — create one instance and share it; don't `new PrismaClient()` per request (connection exhaustion).
- `take` is pagination's `LIMIT`; don't `findMany` with no `take` in production — a 10M-row table will OOM your server.

---

## 13.10 Prisma Relations

### Explain It

Prisma relations are declared on both sides of the schema. **One-to-many**: `User { posts Post[] }` on one side, `Post { author User @relation(fields: [authorId], references: [id]) authorId Int }` on the other — the side holding the foreign key is the relation owner. **Many-to-many**: either an implicit join table (both sides just declare `Post[]`) or an explicit join model (`@relation` with two `fields` pairs) when the relation has extra data like `joinedAt`. To fetch relations you `include` them: `prisma.user.findMany({ include: { posts: true } })`; to shape them, `include: { posts: { select: { title: true } } }`. You can also filter parent rows by child conditions with `where: { posts: { some: { published: true } } }` — this becomes an EXISTS/SQL join under the hood. Nested writes: `prisma.user.create({ data: { name, posts: { create: [{ title: "x" }] } } })` creates the user and their posts in one transaction.

### Prove It

```js
// 06-prisma-client.js — run: node 06-prisma-client.js
```

#### Gotchas / Edge Cases

- Both sides of a relation must be declared, or the schema fails validation with an unclear error — Prisma is strict here.
- The relation owner (side with `fields`) is the only side allowed to hold the FK column — you cannot skip `authorId`.
- Implicit many-to-many join tables are invisible in your schema but visible in migrations — never hand-edit them.
- `include` with nested `include` causes N+1-like behavior; always check the generated SQL with logging enabled.
- Deleting a parent with related rows throws a foreign-key error; add `onDelete: Cascade` on the relation for auto-cleanup.

---

## 13.11 Mongoose vs Prisma Comparison

### Explain It

Same goal, different philosophies. Mongoose is a schema layer on top of MongoDB: flexible, JS-only, no migration system of its own (you write index scripts), validation in application code. Prisma is a code-generated typed ORM for SQL databases: rigid schemas, versioned migrations, full TypeScript safety, but it does not support MongoDB with full relation features (Mongo connector lacks joins and enums). Pick Mongoose when you're all-in on MongoDB and want document flexibility. Pick Prisma when you want SQL integrity, migrations, and compile-time safety on Postgres/MySQL/SQLite. Many teams end up using both in the same company — Mongo for flexible catalogs, Postgres+Prisma for money and relations.

### Prove It

| Feature | Mongoose (ODM) | Prisma (ORM) |
|---------|----------------|--------------|
| Database target | MongoDB | Postgres, MySQL, SQLite, SQL Server, (Mongo connector) |
| Type safety | No (JS-only, needs `@types/mongoose` + manual types) | Full — types generated from schema |
| Migrations | None built-in (DIY index scripts / `mongoose-sync`) | First-class versioned migrations (`prisma migrate dev`) |
| Validation | Rich: required, min/max, enum, custom validators, middleware | Via DB constraints + optional `zod`-style libraries |
| Relations | `populate()` — separate queries, app-side | SQL joins via `include` — single query |
| Schema model | Flexible documents, mutable shapes | Strict typed models, enforced at DB level |
| Learning curve | Low (JSON in, JSON out) | Medium (schema syntax, migrations, concepts) |
| When to choose | MongoDB app, flexible JSON docs, quick prototyping | Relational data, teams wanting compile-time guarantees, money apps |
| Hooks/middleware | `pre`/`post` save, remove, findOneAndUpdate | Via Prisma extensions / event hooks (limited) |

#### Gotchas / Edge Cases

- Prisma's MongoDB connector does not support enums, implicit many-to-many, or transactions — read the docs before choosing it.
- Mongoose has no migration story — schema drift across environments is handled manually, which causes production bugs.
- Both still need raw query escapes: `$where` in Mongo and `queryRaw` in Prisma can be injection-prone if you string-build them.
- The "best" tool is often decided by the DBA's comfort: SQL shops pick Prisma, Mongo shops pick Mongoose.

---

## 13.12 Indexes & Query Performance

### Explain It

An **index** is a sorted copy of one or more fields that lets the DB find rows in O(log n) instead of scanning the whole table/collection (O(n)). MongoDB: `collection.createIndex({ email: 1 })` or `schema.index({ email: 1 })` in Mongoose — compound indexes `{ userId: 1, createdAt: -1 }` support queries that filter on both fields. Prisma: `@@index([email])`, `@@unique([userId, postId])` — and `npx prisma migrate dev` creates them in SQL. To prove an index works, MongoDB's `.explain("executionStats")` shows `totalDocsExamined` vs `nReturned` (if they're equal, no index was used); SQL's `EXPLAIN ANALYZE` shows `Seq Scan` vs `Index Scan`. The classic performance trap is the **N+1 problem**: one query to fetch parents, then one query per parent to fetch children — 100 parents = 101 queries. Fixes: `populate` once, `include` relations, batch `$in`, or `$lookup`/SQL `JOIN`. Indexes cost write speed and disk — index only what your actual `where`/`sort` clauses use, and use `select` to avoid hauling whole documents across the wire.

### Prove It

```js
// 07-query-comparison.js — run: node 07-query-comparison.js
```

#### Gotchas / Edge Cases

- An index on the leftmost prefix only helps queries that use that prefix — `{ a: 1, b: 1 }` does NOT speed up a query on `b` alone.
- Leading wildcard `$regex: /^foo/` can use an index; `$regex: /foo/` cannot.
- `sort` on an unindexed field triggers an in-memory sort — at 32MB MongoDB bails with an error; add a compound index.
- N+1 hides behind ORMs: `populate`/`include` inside loops is the same bug in drag. Log the query count to catch it.
- Cardinality matters: an index on a boolean column is nearly useless — selectivity decides whether the optimizer even uses it.

---

## 13.13 Transactions

### Explain It

A **transaction** groups multiple writes so they all succeed or all fail — no partial states. Classic case: transfer money (debit one account, credit another) — if the credit fails, the debit must roll back. SQL databases have native transactions: Prisma exposes `prisma.$transaction([...])` (array of operations) or `prisma.$transaction(async (tx) => { ... })` (interactive — you can read inside, then write conditionally). MongoDB only supports real transactions on **replica sets** (not standalone), via sessions: `const session = await mongoose.startSession(); await session.withTransaction(async () => { ... })` — every operation gets `{ session }` passed to it. Rules of thumb: keep transactions short, do reads/writes only through the session/tx client, never call the plain client inside a transaction. Prisma also supports `interactiveTransactions` timeouts, and `$transaction` arrays run as a single SQL transaction when the connector allows it. If you don't need atomicity across many writes, don't pay for it — transactions hold locks and serialize traffic.

### Prove It

```js
// 06-prisma-client.js — run: node 06-prisma-client.js
```

#### Gotchas / Edge Cases

- MongoDB standalone (no replica set) silently supports no multi-doc transactions — `startSession()` throws at runtime.
- Long-running interactive transactions starve concurrent writes; always set a short `maxWait`/`timeout` in Prisma.
- Every query inside a MongoDB session must pass `{ session }` — forgetting one silently runs outside the transaction.
- Nested transactions are not allowed; check `session.inTransaction()` before starting.
- Transaction code should be idempotent — a retry after a timeout can double-apply an effect (e.g., double credit).

---

## 13.14 Interview Questions

### Explain It

Say these out loud: When would you pick SQL over NoSQL, and vice versa? What is an ORM/ODM and what problems does it solve? How does an ORM prevent SQL injection? What is the difference between a Schema and a Model in Mongoose? Which Mongoose validators do you use day-to-day and what do they do? How does Mongoose `pre("save")` hooking relate to password hashing? What is a Mongoose virtual and when do you use it? How does Mongoose population work, and what is the N+1 problem? What is a Prisma migration and why is it versioned? How do you model one-to-many and many-to-many relations in Prisma? What is the difference between `select` and `include` in Prisma? How do you catch a unique-constraint violation in Prisma (P2002)? What are MongoDB indexes vs Prisma `@@index`, and when does a compound index help? What are transactions, and how do MongoDB sessions differ from Prisma `$transaction`?

### Prove It

```js
// 08-interview-db-orms.js — run: node 08-interview-db-orms.js
```

---

## Sources

- Mongoose docs — Schemas, Models, Population: https://mongoosejs.com/docs/guide.html
- Prisma docs — schema, migrations, client: https://www.prisma.io/docs
- MongoDB transactions docs: https://www.mongodb.com/docs/manual/core/transactions/
- SQL injection OWASP cheat sheet: https://owasp.org/www-project-top-ten/
- EXPLAIN ANALYZE (Postgres): https://www.postgresql.org/docs/current/using-explain.html
