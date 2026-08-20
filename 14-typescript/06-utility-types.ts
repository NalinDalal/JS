/**
 * Module 14 — 14.9 Utility Types
 * Partial, Required, Pick, Omit, Record, ReturnType, Parameters,
 * Exclude, Extract — each with a compile-time demo + printed output.
 *
 * Run: npx tsx 06-utility-types.ts
 */

interface User {
  id: number;
  name: string;
  email: string;
  admin: boolean;
}

const full: User = { id: 1, name: "Ada", email: "ada@x.dev", admin: true };

// ---- Partial: every prop optional (good for update forms) ----
const patch: Partial<User> = { email: "new@x.dev" }; // id/name/admin optional
console.log("Partial ->", patch);

// ---- Required: every prop mandatory (strips ?) ----
interface Config {
  host?: string;
  port?: number;
}
const fullConfig: Required<Config> = { host: "localhost", port: 3000 };
console.log("Required ->", fullConfig);

// ---- Pick: keep a subset ----
const summary: Pick<User, "id" | "name"> = { id: 1, name: "Ada" };
console.log("Pick    ->", summary);

// ---- Omit: drop a subset (all but the listed keys) ----
type PublicUser = Omit<User, "admin" | "email">;
const pub: PublicUser = { id: 1, name: "Ada" };
console.log("Omit    ->", pub);

// ---- Record: object type mapping keys to values ----
const roleLabels: Record<"user" | "admin" | "owner", string> = {
  user: "Member",
  admin: "Manager",
  owner: "Boss",
};
const cache: Record<string, number> = { first: 1, second: 2 };
console.log("Record  ->", roleLabels.owner, cache.second);

// ---- ReturnType / Parameters: introspect a function's shape ----
function buildQuery(base: string, page: number): string {
  return `${base}?page=${page}`;
}
type QueryResult = ReturnType<typeof buildQuery>; // string
type QueryArgs = Parameters<typeof buildQuery>; // [string, number]

const q: QueryResult = buildQuery("/users", 2);
const args: QueryArgs = ["/users", 2];
console.log("ReturnType ->", q, "(type: string)");
console.log("Parameters ->", args, "(type: [string, number])");

// ---- Exclude: remove members of a union ----
type Http = "GET" | "POST" | "PUT" | "DELETE";
type NonDestructive = Exclude<Http, "DELETE" | "PUT">; // "GET" | "POST"
const safe: NonDestructive = "GET";
console.log("Exclude ->", safe, "(GET|POST allowed; PUT/DELETE rejected at compile time)");

// ---- Extract: keep only shared members ----
type A = "a" | "b" | "c";
type B = "b" | "c" | "d";
type Shared = Extract<A, B>; // "b" | "c"
console.log("Extract ->", "b" satisfies Shared, "|", "c" satisfies Shared);

// ---- Composition: Partial + Omit ----
type NewUserForm = Partial<Omit<User, "id">>; // "id" can never appear
const form: NewUserForm = { name: "Grace", admin: false };
console.log("Partial<Omit<...>> ->", form);