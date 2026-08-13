/**
 * Module 09 — Question Bank: likely-asked interview questions (modern patterns)
 *
 * Run: node 13-interview-questions.js
 */

const qa = [
  ["Destructuring — array vs object tricks?", "Objects: const { name, address: { city } = {} } = user — rename, default, NESTED with safe defaults (crash-free optional nesting). Arrays: const [first, , third] = arr — skip, rest: const [head, ...tail] = arr (head = first!). Swap: [a, b] = [b, a]."],
  ["Spread vs rest — same operator, two jobs?", "Rest gathers: in params (fn(...args)) and destructuring— PACKS remaining items into an array. Spread scatters: in calls (fn(...arr)), array/object literals — UNPACKS iterable/object. Common uses: copy, merge, clone-and-override, Math.max(...arr) — but NOT for huge arrays (spread allocates)."],
  ["Optional chaining vs && ?", "user?.address?.city — STOPS evaluation and returns undefined if any link is null/undefined. Difference from &&: ?. checks only null/undefined, doesn't evaluate falsy 0/''/false as absent — so score?.toFixed() works when score = 0, where score && score.toFixed() fails. ?.[key] and ?.(args) also exist."],
  ["|| vs ?? (nullish coalescing)?", "||: falsy (0, '', NaN, false) → default kicks in. ??: only null/undefined trigger the default — correct for: count ?? 0 keeping 0, name ?? 'guest' keeping ''. Chain: a ?? b ?? c. Can't mix with ||/&& without parens (SyntaxError): (a ?? b) || c."],
  ["Template literals — beyond interpolation?", "Backticks: interpolation, multiline, tagged templates for DSLs (styled-components, i18n), expression ANY type (auto-coerces), nesting. Tagged fn receives raw + cooked strings — enables custom escaping."],
  ["Default params — gotchas?", "Defaults apply ONLY for undefined (not null, 0, ''). Evaluated at CALL time (each call, fresh). Can reference earlier params (function f(a, b = a*2)). Destructured defaults: function f({ x = 1 } = {})."],
  ["Arrow vs regular function — 4 differences?", "1) No own this (lexical) 2) No arguments object 3) Cannot be constructors (no new, no prototype) 4) Syntax light. Also: no hoisting as declarations, cannot be generators (no function* syntax) without async."],
  ["Debounce vs throttle?", "Debounce: delay execution until X ms of INACTIVITY — trailing, used for search-as-you-type/finish-editing. Throttle: run at most once per X ms — leading, used for scroll/resize (spread over time). Both preserve latest args; cancelable for cleanup."],
  ["Regex basics + groups?", "/.../ flags g (global) i (insensitive) m (multiline) s (dotall) u (unicode). Groups: () capture, (?:) non-capture, (?<name>) named. Lookarounds: (?=x) / (?!x) / (?<=x) / (?<!x). Greedy vs lazy (* vs *?). matchAll with g for iteration."],
  ["Date — the universal traps?", "Months are 0-INDEXED (getMonth() → 10 = November). getTime() = ms since epoch (correct for math). new Date(string) parsing varies by engine (ISO safe, human formats risky — ALWAYS pass ISO or components). UTC vs local: getUTC* vs get*. Timezones: store UTC, format locally. Math: use timestamps, not Date objects."],
  ["Currying vs partial application?", "Curry: f(a)(b)(c) — one arg per call, returns closures. Partial: f.bind(null, a) — fix N args, apply the rest later. Why: reusable config (logger(logLevel)(msg)), composition, React HOFs. Trade-off: uncurried users → the classic interview trap: curry(fn)(1,2) must be supported via rest args."],
  ["Pure functions & immutability", "Pure: same inputs → same outputs, no side effects. Immutable updates: { ...state, items: [...state.items, newItem] } — new reference, old preserved (undo/snapshot, React re-render correctness). Immer/mutative libs hide this. Deeply delete/update: structuredClone-then-mutate or recursive helpers."],
  ["for...of vs for...in vs forEach?", "for...of: iterables — VALUES, correct for arrays/strings/Maps/Sets, break/continue/await supported. for...in: KEY NAMES as strings, includes inherited enumerable — for objects only (and even then prefer Object.keys/entries). forEach: no break (throw or return per-element), awkward async."],
  ["Object.fromEntries / entries — when?", "entries: [key, value] array — the bridge to array methods (filter keys). fromEntries: array → object — pair with map/filter for object transforms: Object.fromEntries(Object.entries(o).filter(...))."],
];

let n = 0;
for (const [q, a] of qa) {
  n++;
  console.log(`\n${String(n).padStart(2)}. ${q}`);
  console.log("   →", a);
}

console.log("\n--- Whiteboard drills ---");
console.log("1. Write debounce (trailing) in 8 lines with clearTimeout.");
console.log("2. Parsing query strings: URLSearchParams vs manual split.");
console.log("3. ?. ?? || precedence — why (a ?? b) || c needs parens.");