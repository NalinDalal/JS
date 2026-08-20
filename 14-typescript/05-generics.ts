/**
 * Module 14 — 14.8 Generics
 * Generic functions, extends constraints, generic interfaces,
 * and default type parameters — with printed outputs.
 *
 * Run: npx tsx 05-generics.ts
 */

// ---- Generic identity + inference ----

function identity<T>(x: T): T {
  return x;
}

console.log("identity(5)        ->", identity(5)); // T inferred as number
console.log('identity("s")      ->', identity("s")); // T inferred as string
console.log("identity([1,2,3])  ->", identity([1, 2, 3]));

// ---- Generic first with constraint ----

function first<T>(arr: T[]): T | undefined {
  return arr[0];
}

console.log("first([10,20,30])  ->", first([10, 20, 30]));

interface HasName {
  name: string;
}

function greetAll<T extends HasName>(items: T[]): string[] {
  return items.map((i) => `Hello, ${i.name}!`);
}

console.log("greetAll(...)      ->", greetAll([{ name: "Ada" }, { name: "Grace" }]));

// ---- Generic merge with constraint ----

function merge<A extends object, B extends object>(a: A, b: B): A & B {
  return { ...a, ...b };
}

const mergedPerson = merge({ id: 1, name: "Ada" }, { age: 36 });
console.log("merge(...)         ->", mergedPerson);

// ---- Generic interface: ApiResponse<T> ----

interface ApiResponse<T> {
  status: number;
  data: T;
  meta?: { cached: boolean };
}

const userResponse: ApiResponse<{ id: number; username: string }> = {
  status: 200,
  data: { id: 7, username: "ada" },
};

const listResponse: ApiResponse<string[]> = {
  status: 200,
  data: ["a", "b", "c"],
  meta: { cached: true },
};

console.log("ApiResponse<User>    ->", userResponse);
console.log("ApiResponse<string[]>->", listResponse);

// ---- Default type parameters ----

interface Box<T = string> {
  value: T;
}

const stringBox: Box = { value: "default string" }; // T defaults to string
const numberBox: Box<number> = { value: 42 }; // explicit T
console.log("Box default          ->", stringBox.value, "| Box<number> ->", numberBox.value);

// ---- Generic helper on tuples (common real-world utility) ----

function pair<A, B>(a: A, b: B): [A, B] {
  return [a, b];
}

const nameAge = pair("Ada", 36); // inferred tuple [string, number]
console.log("pair('Ada', 36)      ->", nameAge);