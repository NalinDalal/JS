/**
 * Module 14 — 14.7 Unions & Narrowing
 * Union types, typeof/instanceof/in/truthiness/equality narrowing,
 * and the discriminated union pattern with an exhaustive Result<T>.
 *
 * Run: npx tsx 03-unions-narrowing.ts
 */

// ---- Basic unions ----

type Id = string | number;

function formatId(id: Id): string {
  // typeof narrowing
  if (typeof id === "number") {
    return `#${id.toFixed(0)}`;
  }
  return id.toUpperCase(); // narrowed to string here
}

console.log("formatId(42)      ->", formatId(42));
console.log('formatId("abc")   ->', formatId("abc"));

// Truthiness narrowing (removes null/undefined/"")
function maybeLen(x: string | null | undefined): number {
  if (x) {
    return x.length; // x is string here
  }
  return 0;
}

console.log("maybeLen(null)    ->", maybeLen(null));
console.log('maybeLen("ts")    ->', maybeLen("ts"));

// instanceof narrowing
class Rectangle {
  constructor(readonly w: number, readonly h: number) {}
  area(): number {
    return this.w * this.h;
  }
}

function describeShape(shape: Rectangle | Date): string {
  if (shape instanceof Rectangle) {
    return `rectangle ${shape.w}x${shape.h}, area ${shape.area()}`;
  }
  return `date: ${shape.toISOString()}`;
}

console.log("describeShape(new Rectangle(2, 3)) ->", describeShape(new Rectangle(2, 3)));
console.log("describeShape(new Date(0))         ->", describeShape(new Date(0)));

// Equality narrowing on a literal union
function colorName(c: "red" | "green" | "blue"): number {
  if (c === "red") return 0xff0000;
  if (c === "green") return 0x00ff00;
  return 0x0000ff; // narrowed to "blue"
}
console.log("colorName('green') ->", colorName("green"));

// ---- Discriminated union: the Result<T> pattern ----

type Result<T> =
  | { ok: true; value: T }
  | { ok: false; error: string };

function parseJson(input: string): Result<Record<string, unknown>> {
  try {
    const value = JSON.parse(input) as Record<string, unknown>;
    return { ok: true, value };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}

// 'in' narrowing — each case sees its exact shape
function report(r: Result<Record<string, unknown>>): string {
  if ("value" in r) {
    return `SUCCESS: got ${JSON.stringify(r.value)}`; // r is {ok:true,...}
  }
  return `FAILURE: ${r.error}`; // r is {ok:false,...}
}

const good = parseJson('{"a":1}');
const bad = parseJson("not json");
console.log("\nparseJson good ->", report(good));
console.log("parseJson bad  ->", report(bad));

// Exhaustiveness check: never = "impossible state"
function exhaustive(x: never): never {
  throw new Error(`Unhandled case: ${JSON.stringify(x)}`);
}

function matchResult<T>(r: Result<T>): string {
  switch (r.ok) {
    case true:
      return `ok: ${JSON.stringify(r.value)}`;
    case false:
      return `err: ${r.error}`;
    default:
      return exhaustive(r); // TS proves this branch can never run
  }
}
console.log("matchResult(good) ->", matchResult(good));
console.log("matchResult(bad)  ->", matchResult(bad));