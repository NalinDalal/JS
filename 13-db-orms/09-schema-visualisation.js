/**
 * Module 13 — 13.1 SQL Tables vs NoSQL Documents (Visualised)
 * The SAME data drawn two ways: normalized relational tables
 * (rows + foreign keys + JOIN) vs flexible JSON documents
 * (nested or referenced). Read doc section 13.1 first.
 *
 * Run: node 09-schema-visualisation.js
 */

const SQL_TABLES = `
▶ SQL: TABLES — fixed columns, one ROW per record, tables linked by FOREIGN KEYs

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
       │
       data is NORMALIZED: "Alice" lives ONCE in users; her orders
       store only her id, never a copy of her name/email.
`;

const SQL_ROWS = `
  A TABLE in action — columns are the schema, each row is one record:

  ┌──────────┬──────────┬────────────────┬───────────────────┐
  │ id       │ name     │ email          │ created_at        │
  ├──────────┼──────────┼────────────────┼───────────────────┤
  │ 1        │ Alice    │ a@dev.com      │ 2026-01-01T10:00  │
  │ 2        │ Bob      │ b@dev.com      │ 2026-02-03T09:30  │
  └──────────┴──────────┴────────────────┴───────────────────┘

  Reading "Alice + her orders" needs a JOIN — two tables merged on the FK:

    SELECT * FROM users
    JOIN orders ON orders.user_id = users.id
    WHERE users.id = 1;
`;

const NOSQL_EMBEDDED = `
▶ NoSQL (MongoDB): DOCUMENTS — flexible JSON objects, related data NESTED inside

  One user document = the user AND all their orders in a single object
  (no JOIN needed — one read returns everything):

  ┌──────────────────────────────────────────────────────────────────┐
  │ {                                                                 │
  │   "_id": "65f1a2b3c4d5e6f7a8b9c0d1",  // like a PRIMARY KEY       │
  │   "name": "Alice",                                              │
  │   "email": "a@dev.com",                                         │
  │   "address": {                      // nested OBJECT            │
  │     "city": "Mumbai",                                           │
  │     "zip": "400001"                                             │
  │   },                                                             │
  │   "orders": [                       // nested ARRAY             │
  │     { "id": 1, "total": 999, "createdAt": "2026-01-01" },       │
  │     { "id": 2, "total": 25,  "createdAt": "2026-02-03" }        │
  │   ]                                                              │
  │ }                                                                 │
  └──────────────────────────────────────────────────────────────────┘

  Schema is optional PER DOCUMENT: Bob's document may add a "phone"
  field or skip "address" — the database does not reject it.
`;

const NOSQL_REFERENCED = `
  ...OR keep documents small and REFERENCE each other (like an FK):

  ┌───────────────────────┐        ┌──────────────────────────┐
  │ users                 │        │ orders                   │
  ├───────────────────────┤        ├──────────────────────────┤
  │ _id: "u1"             │        │ _id: "o1"                │
  │ name: "Alice"         │        │ user_id: "u1" ──────────►│
  │ email: "a@dev.com"    │        │ total: 999               │
  └───────────────────────┘        └──────────────────────────┘

  Mongoose calls this populate(): the ref id is replaced with the real
  document AFTER an extra query — it is NOT a database-level JOIN, and
  it is the classic source of the N+1 problem (one query per doc).
`;

const ORM_MAPPING = `
▶ How the two ORMs/ODMs in this module map to those structures:

   Prisma model ─────────────────► SQL table (typed, migrated)
   model User {                     ┌────────────────────┐
     id     Int   @id               │ users              │
     email  String @unique          │ id       INTEGER PK│
     orders Order[]                 │ email  VARCHAR UNIQ│
   }                                └────────────────────┘

   Mongoose schema ───────────────► MongoDB documents (validated)
   const userSchema = new Schema({   { "_id": ObjectId,
     name:  { type: String,           "name": "Alice",
              required: true },       "email": "a@dev.com",
     email: { type: String,           "orders": [ ... ]
              unique: true },       }
     orders: [{ total: Number }]
   });

   Same data, same JS models — the shapes below the API differ.
`;

const SUMMARY = `
│                 │ SQL + Prisma                │ NoSQL + Mongoose          │
│ home of data    │ tables, rows, columns       │ collections, documents    │
│ schema          │ fixed, enforced before write │ optional, per document   │
│ relations       │ FOREIGN KEY + JOIN           │ nested docs OR refs      │
│ read user+orders│ JOIN (1 query) or N+1         │ 1 query (embedded)       │
│ consistency     │ strong (ACID transactions)    │ eventual by design       │
│ scale           │ vertical, then read replicas  │ horizontal (sharding)    │
│ best for        │ money, relations, integrity   │ flexible shapes, hot docs│

  Visual cheat-sheet:
    SQL:    [users] 1──N [orders]   -> join on id      (normalized)
    NoSQL:  { user: { ..., orders: [...] } }           (denormalized)
`;

console.log("SAME DATA, TWO MODELS — how Alice's profile + her 2 orders live:\n");
console.log(SQL_TABLES);
console.log(SQL_ROWS);
console.log(NOSQL_EMBEDDED);
console.log(NOSQL_REFERENCED);
console.log(ORM_MAPPING);
console.log(SUMMARY);
