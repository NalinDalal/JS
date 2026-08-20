/**
 * Module 14 — Interview Questions (TypeScript)
 * Say the answer out loud BEFORE reading it. Run for a quick daily drill.
 *
 * Run: node 09-interview-typescript.js
 */

const qa = [
  [
    "What is TypeScript and how is it different from JavaScript?",
    "TypeScript is a superset of JavaScript with a static type system that runs at compile time only. Types are erasable — tsc strips annotations and emits plain JS with zero runtime overhead. The difference is safety: TS catches typos, wrong argument shapes, and null access before the code runs, while JS defers everything to runtime.",
  ],
  [
    "What does 'types are erasable' mean and why does it matter?",
    "It means type annotations compile to nothing — the emitted .js is identical in behavior to the source .ts with types removed. No runtime type checks, no extra bytes. It also means TS can't protect you from things like bad JSON.parse results or untyped library boundaries — those need runtime validation (or unknown).",
  ],
  [
    "What's the difference between `interface` and `type`?",
    "Both describe object shapes. interface supports declaration merging (two blocks with the same name fuse) and is the idiomatic choice for object contracts and implements. type can express unions, intersections, tuples, and mapped/conditional types that interfaces can't. Rule of thumb: prefer interface until you need a union or intersection, then use type.",
  ],
  [
    "Explain structural typing with an example.",
    "TS compatibility is decided by shape, not name — unlike Java/C# nominal typing. A function expecting {x: number; y: number} accepts any object with exactly those properties, whether it's an interface Point, an interface Coordinate, a class Vec2, or an inline object literal. Gotcha: fresh literals get excess property checks, but the same extra properties assigned to a variable first are allowed.",
  ],
  [
    "What is strict mode and what does strictNullChecks do?",
    "strict: true enables the whole safety family — noImplicitAny, strictNullChecks, strictFunctionTypes, strictPropertyInitialization and more. strictNullChecks makes null and undefined real types: they're no longer assignable to string or number unless the type explicitly includes them. Off, null/undefined silently flow everywhere; on, the compiler forces you to handle them.",
  ],
  [
    "How do you narrow a union type?",
    "With checks that exist at runtime anyway: typeof for primitives, instanceof for classes, 'key' in obj for object members, truthiness to remove null/undefined/'', and === against literal values for literal unions. TypeScript narrows the type inside each branch, so after typeof x === 'number', x is number.",
  ],
  [
    "What is a discriminated union?",
    "A union of object types where each variant carries a literal discriminant field, like type Result<T> = {ok: true, value: T} | {ok: false, error: string}. Switching on the discriminant (res.ok, or res.type) narrows each case to its exact shape, and an exhaustiveness check using never turns 'forgot a case' into a compile error.",
  ],
  [
    "What's the difference between any, unknown, and never?",
    "any disables the type checker entirely — assignable both ways, no narrowing, the escape hatch that reintroduces the bugs TS prevents. unknown accepts anything but requires narrowing before use — the safe choice for JSON.parse and API responses. never is the bottom type: a value that can never exist, e.g. a function that always throws, used for exhaustive switch checks.",
  ],
  [
    "How do generics work and what is a constraint?",
    "Generics parametrize a function or type over a type variable: identity<T>(x: T): T. T is inferred from the call site, so identity(5) has T = number and the relationship input—output is preserved. A constraint, T extends HasId, limits which types are allowed and lets you access properties on T. Defaults like <T = string> make the generic optional.",
  ],
  [
    "Name five utility types and what they do.",
    "Partial<T>: all props optional. Pick<T, K>: keep a subset of keys. Omit<T, K>: drop keys. Record<K, V>: object type mapping keys to values (lookup tables). ReturnType<F>: the return type of a function type. Plus Required, Parameters, Exclude, Extract — and they compose, e.g. Partial<Omit<User, 'id'>> is an 'id excluded, everything optional' form type.",
  ],
  [
    "What's the difference between null and undefined in TypeScript?",
    "undefined means 'never initialized / key absent', null means 'deliberately empty'. Under strictNullChecks they're distinct, and neither is assignable where the other's type is expected. Convention: null for known-but-empty fields, undefined for not-provided values. Runtime tools: ?? and ?. handle both; typeof x === 'undefined' narrows undefined.",
  ],
  [
    "How does TypeScript compile to JavaScript and what is tsconfig.json?",
    "tsc type-checks and emits the .ts files as .js (downleveling syntax to your target, erasing types). tsconfig.json configures it: target, module, moduleResolution, strict, outDir, esModuleInterop, include/exclude. For dev, tsx runs .ts directly via esbuild with no emit — but tsx doesn't type-check; CI runs tsc --noEmit for real checking.",
  ],
  [
    "How do you type an Express request/response and how does Prisma generate types?",
    "Install @types/express; then Request<Params, ResBody, ReqBody, Query> and Response<Body> type req.params, req.body, and res.json(). Prisma reads schema.prisma and generates a typed client: every model becomes a TS type (User, UserCreateInput) with typed findMany/create results. Rename a column in the schema, run prisma generate, and every usage breaks at compile time.",
  ],
  [
    "What is never used for in exhaustiveness checking?",
    "In a switch over a discriminated union, the default branch assigns the value to a never-typed parameter via a helper like assertNever(x): never. Because never accepts nothing, TS only allows that branch if the union has been fully covered — adding a new variant makes the switch fail to compile until you handle it.",
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

try {
  process.stdin.setRawMode(true);
} catch {
  // not a TTY (e.g. piped input) — fall back to line mode, still works
}
process.stdin.resume();
process.stdin.on("data", () => next());
process.stdin.on("end", () => process.exit(0)); // EOF (piped) — exit cleanly
console.log("Say each answer out loud, then press Enter to check.");
next();