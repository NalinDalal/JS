/**
 * Module 02 — Question Bank: likely-asked interview questions (scope & closures)
 *
 * Run: node 06-interview-questions.js
 */

const qa = [
  ["What is lexical scope?", "Scope determined at author time by where code sits in the file — inner functions can access outer variables regardless of where they're CALLED. The scope chain is a linked list of enclosing environments, resolved at runtime by walking up."],
  ["What is a closure?", "A function that 'remembers' its lexical environment even after the outer function returns — the inner function holds a reference to the outer function's variables. Enables private state: function counter() { let c = 0; return () => ++c; }"],
  ["Classic: setTimeout in a loop with var vs let.", "var: all callbacks share the same binding → prints 3,3,3. let: fresh binding per iteration → 0,1,2. Fix for var: IIFE or .bind per iteration."],
  ["What is hoisting?", "Declarations are processed before code runs: function declarations fully hoisted (callable early), var hoisted as undefined, let/const hoisted but in TDZ. Assignments never hoist."],
  ["TDZ — what triggers it?", "Accessing a let/const before its declaration line in the same scope. Also applies to class declarations and default params referencing each other. ReferenceError, distinct from var's silent undefined."],
  ["Block scope vs function scope.", "var/function declarations: function (or global) scope. let/const/class: nearest { } block. If (true) { var x = 1; let y = 2; } — x is visible outside, y is not."],
  ["What is shadowing?", "An inner scope declaring a name that already exists in an outer scope — the inner one wins inside. The outer binding is inaccessible (except via closure references captured before shadowing)."],
  ["Why IIFE? (Immediately Invoked Function Expression)", "(function(){...})() — creates a fresh scope to avoid leaking globals and capture loop values; the classic pre-module encapsulation pattern. Still used: module bundler wrappers, avoiding top-level pollution."],
  ["Module pattern — what is it?", "Closures + IIFE = private data with a public API: const store = (() => { let items = []; return { add: (i) => items.push(i), get: () => items.slice() }; })(); — items is unreachable outside."],
  ["Closure memory leak?", "The closure keeps the whole captured environment alive as long as the inner function lives. If you store callbacks globally, they retain their scopes (potential leak). Detach listeners/callbacks when done; modern engines GC what's provably unused."],
  ["var on window vs let on window?", "var at top level becomes a globalThis/window property (and can be deleted via delete only for var). let/const create global LEXICAL bindings — not window properties, not deletable, but still global."],
  ["What's the scope chain in nested functions?", "Each function has its own environment; lookup goes inner → outer → ... → global, taking the FIRST match (shadowing wins). If not found anywhere: ReferenceError."],
  ["'use strict' — what changes?", "Prevents silent globals (undeclared assignment throws), this in plain functions is undefined (not global), duplicate params/octal literals error, makes eval have its own scope, disables delete on non-configurable."],
  ["Function declaration vs expression hoisting.", "Declaration: function f(){} — hoisted whole, callable before definition. Expression: const f = function(){} — only the const is hoisted (TDZ), so calling early throws ReferenceError (or TypeError with var)."],
];

let n = 0;
for (const [q, a] of qa) {
  n++;
  console.log(`\n${String(n).padStart(2)}. ${q}`);
  console.log("   →", a);
}

// --- Whiteboard drills ---
// 1. Predict: for(var i=0;i<3;i++){setTimeout(()=>console.log(i))} → 3,3,3
// 2. Write a once(fn) that runs a function exactly once, using a closure.
// 3. Is the inner function's scope chain fixed at definition or call time?
