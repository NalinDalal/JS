/**
 * Module 14 — 14.2/14.3/14.4 Basics: Annotations, Inference, Core Types
 * Annotations vs inference, strict mode, primitives, arrays, tuples,
 * object shapes, literal types, optional props, null vs undefined.
 *
 * Run: npx tsx 02-basics.ts
 */

// ---- 14.2 Annotations vs inference ----

const inferred = 42; // inferred: number
const annotated: number = 42; // explicit annotation
let widenMe = 0; // inferred number (widened — could change)
widenMe = 7;

function add(a: number, b: number): number {
  return a + b; // params annotated, return annotated
}

console.log("add(2, 3) =", add(2, 3));

// ---- 14.3 Core types: primitives, arrays, tuples, objects ----

const str: string = "hello";
const bool: boolean = true;
const nums: number[] = [1, 2, 3];
const names: Array<string> = ["ada", "grace"];
const tuple: [string, number] = ["Ada", 36]; // positionally typed
const grid: number[][] = [
  [0, 1],
  [2, 3],
];

const user: { id: number; name: string } = { id: 1, name: "Ada" };

const method: "GET" = "GET"; // literal type — only the string "GET" allowed
type HttpMethod = "GET" | "POST" | "PUT" | "DELETE"; // literal union

console.log("tuple[0] =", tuple[0], "| tuple[1] =", tuple[1]);
console.log("user =", user, "| literal method =", method);
console.log("valid methods:", ["GET", "POST", "PUT", "DELETE"].join(", "));

// ---- 14.4 Optional, null vs undefined ----

interface Profile {
  name: string;
  age: number; // required
  email?: string; // optional — may be absent (string | undefined)
  nickname: string | null; // known-but-empty
}

const ada: Profile = { name: "Ada", age: 36, nickname: null };
const grace: Profile = { name: "Grace", age: 85, nickname: "Amazing Grace" };

function describe(p: Profile): string {
  // Narrow before using optional/nullable values
  const email = p.email ?? "no email on file";
  const nick = p.nickname === null ? "none" : p.nickname;
  return `${p.name}: ${email}, nickname: ${nick}`;
}

console.log("ada   ->", describe(ada));
console.log("grace ->", describe(grace));

// undefined vs null in action:
let unset: string | undefined; // declared, never assigned -> undefined
let cleared: string | null = "x";
cleared = null; // deliberately emptied
console.log("\nunset (undefined) =", unset, "| cleared (null) =", cleared);

// Return types:
function returnsNothing(): void {
  console.log("void: this function returns nothing usable");
}
returnsNothing();

const echo = <T,>(x: T): T => x; // inference + generic plumbing
console.log("generic identity echo(5) ->", echo(5));