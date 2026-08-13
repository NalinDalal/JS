/**
 * Module 03 — Question Bank: likely-asked interview questions (this & prototypes)
 *
 * Run: node 07-interview-questions.js
 */

const qa = [
  ["What are the 4 rules of this?", "1) Default: non-strict → global (window), strict → undefined. 2) Implicit: obj.method() → obj (call site decides). 3) Explicit: call/apply/bind force a value. 4) new: a fresh object. Priority: new > explicit > implicit > default."],
  ["Where does this point in arrow functions?", "Nowhere — arrows capture the this of their LEXICAL scope at definition time; call/apply/bind are ignored. That's why callbacks inside methods use arrows to keep the method's this."],
  ["call vs apply vs bind?", "call(fn, a, b) — args listed. apply(fn, [a, b]) — args as array. bind(fn, a) — returns a NEW function with this pre-bound (partial application too). Borrowing: [].slice.call(argumentsLike)."],
  ["__proto__ vs prototype?", "__proto__ is the actual prototype link on every object (used for lookup). prototype is a PROPERTY of constructor FUNCTIONS — the object that instances' __proto__ points to. new F() sets instance.__proto__ = F.prototype."],
  ["How does property lookup work?", "Get own property → if missing, walk the prototype chain (obj.__proto__.__proto__...) → object.prototype → null → undefined. 'inherited' = found up the chain, not copied."],
  ["What does new do (4 steps)?", "1) Create {} 2) Set its __proto__ to Constructor.prototype 3) Call Constructor with this = obj 4) Return the object unless the constructor explicitly returns an object. Writing myNew proves it."],
  ["Object.create vs new?", "Object.create(proto) — sets the prototype directly on a plain object, no constructor runs, no initialization. new — runs the constructor. Object.create(null) gives a prototype-less object (pure dictionary, dangerous for __proto__ keys)."],
  ["hasOwnProperty vs in vs Object.keys?", "hasOwnProperty: own only (not chain). 'x' in obj: own OR chain. Object.keys: own enumerable only. Object.getOwnPropertyNames: own non-enumerable too. for...in: own+chain enumerable (usually wrap with hasOwnProperty)."],
  ["Method borrowing? Why does it break?", "[].slice.call(obj) works because slice only needs length + indexing. It breaks when a method touches STRING internals or relies on array species. Also this-binding loss: const f = obj.method; f() → implicit rule gone → undefined this."],
  ["class vs function constructor?", "Class is syntactic sugar over prototypes + new: same prototype chain underneath. Adds: super, static, getters/setters, private #fields (real encapsulation, not closure-based), can't be called without new (throws)."],
  ["Extends + super — what happens?", "class B extends A { constructor(){ super(); } } — super() calls A's constructor and REQUIRES this before anything uses it; B.prototype.__proto__ = A.prototype so inherited methods resolve; static inheritance too; method override = shadowing."],
  ["What is prototype pollution?", "Attacker sets obj.__proto__ or constructor.prototype via unsafe merge/JSON.parse paths, injecting properties that EVERY object 'inherits'. Defense: Object.create(null) dictionaries, safe merges, freeze prototypes of critical objects."],
  ["Getter/setter vs plain property?", "get/set are accessor properties — logic on read/write, virtual properties (fullName from firstName+lastName), validated writes. Descriptors: configurable, enumerable, writable via Object.defineProperty."],
  ["Why [], {}, (function(){}) — the { } ambiguity?", "Brace at statement position = block, at expression position = object literal. This is why {} is not shorthand for Object: {}.constructor differs by context. Array/function literals are unambiguous."],
];

let n = 0;
for (const [q, a] of qa) {
  n++;
  console.log(`\n${String(n).padStart(2)}. ${q}`);
  console.log("   →", a);
}

// --- Whiteboard drills ---
// 1. Draw: function Animal(){} — Animal.prototype, dog.__proto__, Object.prototype, null.
// 2. Write myNew(Constructor, ...args) from scratch.
// 3. Predict: const f = user.greet; f() — what is this, and why?
