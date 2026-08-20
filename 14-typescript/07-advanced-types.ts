/**
 * Module 14 — 14.10/14.11/14.12 Advanced: any vs unknown vs never,
 * function overloads + this param, and typed classes.
 *
 * Run: npx tsx 07-advanced-types.ts
 */

// ---- 14.10 any / unknown / never ----

// any: total escape hatch — no checks, danger
function anythingGoes(x: any): any {
  return x.toUpperCase(); // compiler trusts you; runtime may explode
}
console.log('anythingGoes("ok") ->', anythingGoes("ok")); // works
// anythingGoes(42) would throw at RUNTIME — any hides it from the compiler.

// unknown: type-safe counterpart — must narrow before use
function processUnknown(x: unknown): string {
  if (typeof x === "string") {
    return x.toUpperCase(); // narrowed: safe
  }
  if (Array.isArray(x)) {
    return `array of ${x.length}`;
  }
  return "unknown shape";
}
console.log('processUnknown("hi") ->', processUnknown("hi"));
console.log("processUnknown([1,2]) ->", processUnknown([1, 2]));

// never: unreachable / impossible. A function that always throws:
function fail(msg: string): never {
  throw new Error(msg);
}

function assertNever(x: never): never {
  throw new Error(`Unhandled case: ${JSON.stringify(x)}`);
}

type Shape =
  | { kind: "circle"; radius: number }
  | { kind: "square"; side: number };

function area(s: Shape): number {
  switch (s.kind) {
    case "circle":
      return Math.PI * s.radius ** 2;
    case "square":
      return s.side ** 2;
    default:
      return assertNever(s); // add a third kind -> compile error here
  }
}
console.log("area(circle r=2) ->", area({ kind: "circle", radius: 2 }));

// never is assignable to everything (TS statically allows this):
let result: number;
try {
  result = fail("never reached"); // TS knows fail never returns
} catch (err) {
  console.log("fail() threw at runtime:", (err as Error).message);
  result = -1; // unreachable in practice — but the try/catch keeps it runnable
}
console.log("result value (never assigned) ->", result);

// ---- 14.11 Function overloads + this param ----

type Id = number | string;
interface Person {
  id: number;
}

const people = new Map<number, Person>([
  [1, { id: 1 }],
  [2, { id: 2 }],
]);

// Overload signatures (visible to callers):
function findPerson(id: number): Person | undefined;
function findPerson(name: string, surname: string): Person | undefined;
// Implementation signature (hidden, wider):
function findPerson(idOrName: Id, surname?: string): Person | undefined {
  if (typeof idOrName === "number") {
    return people.get(idOrName);
  }
  return people.get(1); // pretend name lookup
}
const byId = findPerson(2); // number overload
const byName = findPerson("Ada", "Lovelace"); // name overload
console.log("\nfindPerson(2) ->", byId, "| byName ->", byName);

// Typed `this` param: the first "parameter" is a type-only declaration
interface Clickable {
  label: string;
}
function onClick(this: Clickable, event: string): void {
  console.log(`${this.label} clicked (${event})`);
}
const btn: Clickable & { click: typeof onClick } = {
  label: "OK",
  click: onClick, // this: Clickable is enforced
};
btn.click("mouse");

// void vs undefined
function returnsVoid(): void {} // fine — may return anything, ignored
function returnsUndefined(): undefined {
  return undefined; // must literally return undefined
}
console.log("void() ->", returnsVoid(), "| undefined() ->", returnsUndefined());

// ---- 14.12 Classes ----

abstract class Animal {
  constructor(protected name: string) {}
  abstract speak(): string; // subclasses MUST implement
  greet(): string {
    return `${this.name}: ${this.speak()}`;
  }
}

interface Runner {
  run(): string;
}

class Dog extends Animal implements Runner {
  constructor(name: string, private speedKmh = 20) {
    super(name);
  }
  speak(): string {
    return "woof";
  }
  run(): string {
    return `${this.name} runs at ${this.speedKmh} km/h`;
  }
}

const rex = new Dog("Rex", 25);
console.log("\nrex.greet() ->", rex.greet());
console.log("rex.run()   ->", rex.run());
// new Animal() would be a compile error — abstract.

// readonly + access modifiers
class Counter {
  readonly start: number;
  private count = 0; // private modifier — enforced at compile time
  constructor(start = 0) {
    this.start = start;
    this.count = start;
  }
  increment(): number {
    return ++this.count;
  }
}
const c = new Counter(5);
console.log("Counter.start (readonly) ->", c.start, "| increment ->", c.increment());