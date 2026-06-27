/**
 * Module 09 — 9.3 Optional Chaining (?.)
 * Safely access nested properties without checking each level
 *
 * Run: node 03-optional-chaining.js
 */

console.log("--- Without optional chaining ---");
const user = {
  profile: {
    // address is missing
  },
};
// Old way: nested checks
const city = user && user.profile && user.profile.address && user.profile.address.city;
console.log("Old way:", city); // undefined

console.log("\n--- With ?. operator ---");
const city2 = user?.profile?.address?.city;
console.log("With ?.:", city2); // undefined (no error)

console.log("\n--- Optional chaining with arrays ---");
const arr = [{ id: 1 }, null, { id: 3 }];
console.log("arr[0]?.id:", arr[0]?.id);  // 1
console.log("arr[1]?.id:", arr[1]?.id);  // undefined (null check)
console.log("arr[5]?.id:", arr[5]?.id);  // undefined (out of bounds)

console.log("\n--- Optional chaining with functions ---");
const obj = {
  greet: () => "hello",
  // sayHi is missing
};
console.log("obj.greet?.():", obj.greet?.());  // "hello"
console.log("obj.sayHi?.():", obj.sayHi?.());  // undefined

console.log("\n--- ??? combining with nullish coalescing ---");
const city3 = user?.profile?.address?.city ?? "Unknown";
console.log("With ??:", city3); // "Unknown"

console.log("\n--- Dynamic property ---");
const key = "address";
const value = user?.profile?.[key]?.city;
console.log("dynamic key:", value); // undefined
