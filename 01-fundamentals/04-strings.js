/**
 * Module 01 — 1.6 Strings & Template Literals
 * Template literals, includes, padStart, split, trim, repeat
 *
 * Run: node 04-strings.js
 */

// --- Template Literal Interpolation ---
// --- Template Literals ---
const name = "JS";
const str = `Hello ${name.toUpperCase()}!`;
console.log(str); // "Hello JS!"

// Expressions inside ${}
console.log(`2 + 3 = ${2 + 3}`); // "2 + 3 = 5"

// --- Multiline ---
// --- Multiline ---
const html = `
  <div>
    <h1>${name}</h1>
  </div>
`;
console.log(html);

// --- String Methods ---
// --- includes / startsWith / endsWith ---
console.log("hello".includes("ell")); // true
console.log("hello".startsWith("he")); // true
console.log("hello".endsWith("lo")); // true
console.log("hello".includes("xyz")); // false

// --- padStart / padEnd ---
console.log("5".padStart(3, "0")); // "005"
console.log("5".padEnd(3, "0")); // "500"
console.log("hi".padStart(10, "-")); // "--------hi"

// --- split ---
console.log("a,b,c".split(",")); // ["a", "b", "c"]
console.log("hello".split("")); // ["h","e","l","l","o"]

// --- repeat ---
console.log("hi".repeat(3)); // "hihihi"

// --- trim ---
console.log("  hi  ".trim()); // "hi"
console.log("  hi  ".trimStart()); // "hi  "
console.log("  hi  ".trimEnd()); // "  hi"

// --- slice ---
console.log("hello".slice(1, 3)); // "el"
console.log("hello".slice(-2)); // "lo"

// --- indexOf ---
console.log("hello".indexOf("l")); // 2
console.log("hello".indexOf("l", 3)); // 3 (start from index 3)

// --- Expected Output ---
// --- Template Literals ---
// Hello JS!
//
// --- Multiline ---
//
//   <div>
//     <h1>JS</h1>
//   </div>
//
//
// --- includes / startsWith / endsWith ---
// true
// true
// true
// false
//
// --- padStart / padEnd ---
// 005
// 500
// --------hi
//
// --- split ---
// [ 'a', 'b', 'c' ]
// [ 'h', 'e', 'l', 'l', 'o' ]
//
// --- repeat ---
// hihihi
//
// --- trim ---
// hi
// hi
//   hi
//
// --- slice ---
// el
// lo
//
// --- indexOf ---
// 2
// 3
