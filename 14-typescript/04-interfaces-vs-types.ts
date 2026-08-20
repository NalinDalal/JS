/**
 * Module 14 — 14.5/14.6 interface vs type & Structural Typing
 * interface extends, type unions/intersections, declaration merging,
 * and the duck-typing demo: shape matters, not name.
 *
 * Run: npx tsx 04-interfaces-vs-types.ts
 */

// ---- 14.5 interface composition ----

interface HasId {
  id: number;
}

interface User extends HasId {
  name: string;
  email: string;
}

interface Admin extends HasId {
  name: string;
  permissions: string[];
}

// type aliases: unions & intersections
type UserOrAdmin = User | Admin;
type UserWithBadge = User & { badge: string }; // intersection

const alice: User = { id: 1, name: "Alice", email: "alice@x.dev" };
const bob: Admin = { id: 2, name: "Bob", permissions: ["delete"] };
const aliceBoss: UserWithBadge = { id: 1, name: "Alice", email: "alice@x.dev", badge: "gold" };

function who(u: UserOrAdmin): string {
  if ("permissions" in u) {
    return `${u.name} (admin: ${u.permissions.join(",")})`;
  }
  return `${u.name} <${u.email}>`;
}

console.log("who(alice)     ->", who(alice));
console.log("who(bob)       ->", who(bob));
console.log("aliceBoss      ->", aliceBoss.badge);

// Declaration merging: two blocks with the same name fuse
interface Merged {
  a: number;
}
interface Merged {
  b: number;
}
const merged: Merged = { a: 1, b: 2 };
console.log("merged (merged interfaces) =", merged);

// ---- 14.6 Structural typing: shape, not name ----

interface Point {
  x: number;
  y: number;
}
interface Coordinate {
  x: number;
  y: number;
}

// Different declared types, same shape -> interchangeable:
const p: Point = { x: 1, y: 2 };
const c: Coordinate = p; // NO error — structurally identical
console.log("\nPoint assigned to Coordinate:", c);

// Function parameter accepts any structurally-matching object:
function distanceFromOrigin(pt: Point): number {
  return Math.hypot(pt.x, pt.y);
}
const plainObject = { x: 3, y: 4 };
console.log("distanceFromOrigin(plain object) =", distanceFromOrigin(plainObject));

// Fresh object literal with EXTRA properties -> excess property check error (compile-time).
// const extra = distanceFromOrigin({ x: 1, y: 2, z: 3 }); // ERROR: z is excess
// But a variable carrying the extra props sails through:
const withZ = { x: 1, y: 2, z: 99 };
console.log("extra props via variable (no error) =", distanceFromOrigin(withZ));

// Classes satisfy interfaces structurally too:
class Vec2 {
  constructor(public x: number, public y: number) {}
}
const asPoint: Point = new Vec2(5, 6); // fine — has x and y
console.log("Vec2 instance used as Point:", asPoint);