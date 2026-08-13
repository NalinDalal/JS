/**
 * Module 01 — Question Bank: likely-asked interview questions
 * Same format as 10-auth-security/12 and 11-webrtc/08: say the answer
 * out loud BEFORE reading it. Run for a quick daily drill.
 *
 * Run: node 06-interview-questions.js
 */

const qa = [
  ["var vs let vs const?", "var: function-scoped, hoisted as undefined, re-declarable, global on window. let/const: block-scoped, hoisted to TDZ (ReferenceError before init), no re-declare. const: no reassignment (object contents still mutable)."],
  ["What is the Temporal Dead Zone?", "The window between entering a scope and the declaration's initialization where let/const exist but throw ReferenceError on access. It exists to catch use-before-init bugs; var instead silently gives undefined."],
  ["What are the 8 data types?", "Primitives: string, number, bigint, boolean, undefined, symbol, null. Plus object. Gotcha: typeof null === 'object' — a historical bug kept for compatibility."],
  ["== vs === vs Object.is?", "===: strict, no coercion, but NaN !== NaN and -0 === +0. ==: coerces both sides (algorithms per type pair). Object.is: SameValueZero — NaN === NaN, distinguishes -0/+0. Prefer ===; use Object.is for exactness."],
  ["Give 3 implicit coercion examples.", "'5' + 3 → '53' (+ prefers string). '5' - 3 → 2 (- prefers number). [] + [] → '' (both coerce to ''). '' == 0 → true. null == undefined → true but null === undefined → false."],
  ["List falsy values.", "false, 0, -0, 0n, '', null, undefined, NaN. Everything else (including [] and {}) is truthy."],
  ["0.1 + 0.2 === 0.3?", "false — IEEE-754 doubles can't represent 0.1/0.2 exactly. Fix: round to tolerance (Math.abs(a-b) < 1e-9), toFixed, or work in integer cents."],
  ["Number vs parseInt vs Math.floor?", "Number('12px') → NaN (strict), parseInt('12px') → 12 (reads until invalid char), Math.floor(2.9) → 2 (numeric, truncates toward -inf). parseInt with radix: parseInt('08', 10) — always pass 10."],
  ["What is NaN and how do you check it?", "NaN is the only value not equal to itself. isNaN('abc') → true (coerces!). Number.isNaN('abc') → false (no coercion) — use Number.isNaN. Also Number.isFinite."],
  ["++i vs i++?", "Both add 1; ++i evaluates to the new value, i++ evaluates to the old value. In expressions: let i = 0; a = i++ → a=0; a = ++i → a=1. In isolation identical."],
  ["switch vs if/else?", "switch: readable multi-way dispatch, strict === comparison, fallthrough unless break/return, default clause last. if/else: arbitrary conditions. Performance is identical in modern engines (both compile to lookups)."],
  ["Slice vs splice vs substring?", "slice(start,end): non-mutating, works on strings+arrays, negative indexes from end. splice(start,count,...items): mutating array only. substring: string only, swaps args if start>end, negative → 0."],
  ["String immutability?", "Strings are primitive and immutable — every 'modification' returns a new string. In a loop, use array join/push or template build-ups rather than str += (allocation churn, though engines optimize)."],
  ["Template literals tricks?", "Backticks + ${} interpolation, multiline without \\n, tagged templates (fn`...`) for custom processing, nesting ${`inner ${x}`}."],
  ["Does JS have integers?", "One Number type — IEEE-754 double. Safe integer range: ±2^53-1 (Number.MAX_SAFE_INTEGER). Beyond that use BigInt (123n), and note BigInt + Number throws TypeError."],
  ["Operator precedence gotcha.", "'3' + 4 + 5 → '345' (left-assoc, + prefers string first) but 3 + 4 + '5' → '75'. ?: and assignment are right-associative. When unsure: parenthesize — precedence is not readability."],
];

let n = 0;
for (const [q, a] of qa) {
  n++;
  console.log(`\n${String(n).padStart(2)}. ${q}`);
  console.log("   →", a);
}

// --- Whiteboard drills ---
// 1. Write the coercion chain for: [] == ![]  (hint: it's true)
// 2. Predict: typeof undefined, typeof null, typeof NaN, typeof typeof 1
// 3. Output of: for (var i=0;i<3;i++){} console.log(i)  vs  let i
