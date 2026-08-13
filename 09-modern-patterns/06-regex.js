/**
 * Module 09 — 9.6 Regular Expressions
 * RegExp literals, constructor, flags, methods, groups, lookahead
 *
 * Run: node 06-regex.js
 */

console.log("--- Creating RegExp ---");
const re1 = /hello/i;     // literal, case-insensitive
const re2 = new RegExp("hello", "i"); // constructor

// Flags: g (global), i (case-insensitive), m (multiline), s (dotall),
//        u (unicode), y (sticky)

console.log("\n--- test() -> boolean ---");
console.log("/hello/.test('hello world'):", /hello/.test("hello world")); // true
console.log("/world/.test('hello'):", /world/.test("hello")); // false

console.log("\n--- exec() -> match result ---");
const match = /l{2,}/.exec("hello world");
console.log("exec result:", match);
// [0]: matched string, index, input, groups

console.log("\n--- String.match() ---");
const str = "The rain in Spain falls mainly on the plain";
console.log(str.match(/ain/g));   // ["ain", "ain", "ain", "ain"]
console.log(str.match(/ain/));    // first match only: ["ain", index: 5, ...]

console.log("\n--- String.replace() / replaceAll() ---");
console.log("hello world".replace(/world/, "JS"));       // "hello JS"
console.log("one one".replace(/one/g, "two"));          // "two two"
console.log("one one".replaceAll("one", "two"));         // "two two" (ES2021)
console.log("hello".replace(/(.)/, "$1$1")); // "hhello" (capture group backreference)

console.log("\n--- String.split() ---");
console.log("a,b,c".split(","));     // ["a", "b", "c"]
console.log("1-2-3".split(/-/));    // ["1", "2", "3"]

console.log("\n--- Character classes ---");
console.log("\\d = digit:", /\d/.test("abc123"));  // true
console.log("\\w = word:", /\w+/.test("hello"));   // true
console.log("\\s = space:", /\s/.test("a b"));     // true
console.log("\\D = non-digit:", /\D/.test("123"));  // false
console.log("\\W = non-word:", /\W/.test("hello")); // false (no match on 'hello')
console.log("\\S = non-space:", /\S/.test(" "));    // false

console.log("\n--- Quantifiers ---");
console.log("/colou?r/:", /colou?r/.test("color"));   // true (0 or 1)
console.log("/colou?r/:", /colou?r/.test("colour"));  // true
console.log("/a{2,4}/:", "aaaab".match(/a{2,4}/));    // "aaaa"
console.log("/a{2,}/:", "aaa".match(/a{2,}/));       // "aaa"

console.log("\n--- Anchors ---");
console.log("/^hello/:", /^hello/.test("hello world"));  // true
console.log("/world$/:", /world$/.test("hello world"));  // true
console.log("\\b = word boundary:", /\bcat\b/.test("cat"));           // true
console.log("\\b = word boundary:", /\bcat\b/.test("concatenate"));   // false

console.log("\n--- Groups and backreferences ---");
console.log("Capturing: 'hello hello':", /(\w+) \1/.test("hello hello")); // true
console.log("Named groups:", "2024-01-15".match(/(?<year>\d{4})-(?<month>\d{2})-(?<day>\d{2})/)?.groups);
// { year: "2024", month: "01", day: "15" }

console.log("\n--- Lookahead/Lookbehind ---");
console.log("Positive lookahead:", /foo(?=bar)/.test("foobar"));  // true (foo followed by bar)
console.log("Negative lookahead:", /foo(?!bar)/.test("foobaz"));  // true
// Lookbehind (ES2018):
console.log("Positive lookbehind:", /(?<=foo)bar/.test("foobar")); // true
console.log("Negative lookbehind:", /(?<!foo)bar/.test("bazbar")); // true
