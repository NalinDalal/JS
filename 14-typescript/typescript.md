# Module 14: TypeScript — Typed JavaScript

---

## 14.1 What TypeScript Is

### Explain It

TypeScript is a **superset of JavaScript**: every valid JS program is valid TS. It adds a **static type system** that runs *at compile time only* — the types are **erasable**, meaning the compiled output is plain JavaScript with zero runtime overhead (no type checks in the emitted code, no extra bytes beyond stripped annotations). `tsc` compiles `.ts` → `.js` by removing types, downleveling syntax, and rewriting certain features (like `enum`) — but the core story is *erase + transform*. The win is catching whole classes of bugs before they run: typos in property names, wrong argument counts, `null`/`undefined` access, and refactor breakage across a codebase. This is why teams adopt TS for anything larger than a script: the type checker is a free regression suite that runs on every save, and the types double as always-in-sync documentation.

### Prove It

```ts
// 01-what-ts-compiles-to.js — run: node 01-what-ts-compiles-to.js
```

#### Gotchas / Edge Cases

- Type checking happens at compile time — TS does **not** protect you from runtime errors caused by *other* sources (bad API responses, `JSON.parse` results, `any` leaks).
- `tsc` does not run the code — it only checks and emits. Runtime behavior is identical to the JS you wrote.
- Types are erased, so you cannot use a type as a value at runtime: `typeof T` throws; use the `type` field trick or a "branded type" workaround.
- Features like `enum`, `namespace`, and decorators emit **runtime code** — they are the exceptions to "types only."
- `.d.ts` declaration files contain only types and never emit JS — they describe the shape of existing JS libraries.

---

## 14.2 Annotations vs Inference + Strict Mode

### Explain It

You can **annotate** types explicitly (`const x: number = 5`) or let TS **infer** them from the value (`const x = 5` infers `number`). Inference is the default and is usually enough for local variables; annotations matter at **boundaries** — function parameters, return types, and exported/public APIs where you want an explicit contract. **Strict mode** (`"strict": true` in `tsconfig.json`) is the default recommended configuration: it enables `noImplicitAny` (error when a parameter has no type and can't be inferred), `strictNullChecks` (null/undefined are only assignable where allowed), and several other checks. With `strict` on, an untyped parameter like `function f(a) {}` is a compile error instead of silently becoming `any` — this is the single highest-value flag in TS because it forces you to be honest about unknown inputs.

### Prove It

```ts
// 02-basics.ts — run: npx tsx 02-basics.ts
```

#### Gotchas / Edge Cases

- Inference is *widened* for `let` (a `let x = 0` is `number`, not literal `0`) but *narrowed* for `const` (a `const x = 0` is literal type `0`).
- `noImplicitAny` fires only for *implicit* any — a deliberate `: any` annotation is still allowed (that's why you should also use ESLint's `no-explicit-any`).
- `strict` is a bundle: `strictNullChecks`, `noImplicitAny`, `strictFunctionTypes`, `strictPropertyInitialization`, and more — you can't easily turn one off without seeing the others shift.
- Inference on function *parameters* never happens — parameters must be annotated (or have a contextual type).
- `"strict": true` in a new project is table stakes; converting a legacy JS codebase usually starts with it **off**, then turns flags on incrementally.

---

## 14.3 Core Types

### Explain It

TS has the JS primitives (`string`, `number`, `boolean`, `null`, `undefined`, `bigint`, `symbol`) plus object shapes. Arrays are `T[]` or `Array<T>`. **Tuples** are fixed-length, positionally-typed arrays: `[string, number]` means index 0 is a string and index 1 is a number. Object types are written inline (`{ name: string; age: number }`) or as `interface`/`type`. **Literal types** pin a value to a type: `"GET"` is a type meaning *the string "GET" and nothing else*. The special types `any`, `unknown`, `never`, `void` cover the "untyped, unknown, unreachable, no-return" corners. Learning to reach for the *right* core type — tuple for coordinate pairs, literal unions for options, interface for object contracts — is most of the battle in day-to-day TS.

### Prove It

```ts
// 02-basics.ts — run: npx tsx 02-basics.ts
```

#### Gotchas / Edge Cases

- `number` and `Number` are different: `Number` (capital) is the wrapper object type — always use the lowercase primitive.
- Tuple type literals are still *arrays* at runtime — TS cannot enforce length at runtime; out-of-bounds access is a compile-time warning only (and with strict, a "possibly undefined" error).
- `readonly [number, number]` prevents reassigning tuple elements — the readonly modifier works on arrays and tuples.
- `Array<number>` and `number[]` are interchangeable; `number[][]` is an array of arrays of numbers.
- Object literal excess property checks: passing `{ name, age, extra }` where `{ name, age }` is expected errors on the extra property at compile time (but the check does not apply to variables — see 14.6).

---

## 14.4 Union, Literal, Optional, null vs undefined

### Explain It

A **union type** `string | number` means "either." A **literal union** `"GET" | "POST"` means "one of these exact strings" — the foundation of discriminated unions (14.7) and safe option enums. **Optional properties** (`name?: string`) mean the key may be absent; under `strictNullChecks`, `string | undefined` means the value may be present but `undefined`. `null` and `undefined` are **different values with different meanings**: `undefined` = "never initialized / key absent", `null` = "deliberately empty." Under `strictNullChecks`, neither can be used where the other type is expected unless the type says so (`string | null`). Best practice: reserve `null` for "known-but-empty" (e.g., a not-yet-loaded field) and `undefined` for "not provided" — and make *both* explicit in your types instead of letting them hide.

### Prove It

```ts
// 02-basics.ts — run: npx tsx 02-basics.ts
```

#### Gotchas / Edge Cases

- Optional parameter `f(x?: number)` types `x` as `number | undefined` — inside, always narrow before using.
- With `strictNullChecks` off, `null` and `undefined` are assignable to everything — that's the old silent-bug world; keep the flag on.
- `??` (nullish coalescing) and `?.` (optional chaining) are your runtime tools for these — TS types don't narrow across a `||` if the left side could legitimately be `""`/`0`.
- `in` and `typeof` narrowing (14.7) treat `undefined` and `null` separately — `typeof x === "undefined"` is the way to narrow them.
- A function returning `never` (throwing) is assignable to *any* return type — handy for exhaustive checks.

---

## 14.5 interface vs type

### Explain It

`interface` and `type` overlap heavily, but they have different philosophies. `interface` is **declaration-mergeable** (two `interface Foo` blocks in the same scope merge — used for augmenting global types like `Window`) and is the idiomatic choice for *object shapes*, *classes* (`implements`), and *public API contracts*. `type` can express **everything else**: unions (`string | number`), intersections (`A & B`), mapped types, tuple aliases, and computed/conditional types — things an interface can't do. Both support `extends`-like composition: `interface B extends A {}` and `type B = A & { extra: string }`. The community convention: **prefer `interface` until you need a union/intersection/utility — then use `type`.** For most object shapes the two are interchangeable, so consistency matters more than the choice itself.

### Prove It

```ts
// 04-interfaces-vs-types.ts — run: npx tsx 04-interfaces-vs-types.ts
```

#### Gotchas / Edge Cases

- Two `type` aliases with the same name are a compile error; two `interface`s with the same name **merge** — use merging deliberately (library augmentation) or it hides bugs.
- `interface` cannot extend a union type (`interface X extends (A | B) {}` is invalid) — use `type` for that.
- Intersection `A & B` merges properties; a *conflicting* property (`name: string` in A, `name: number` in B) becomes `string & number` (≈ `never`) — you get a type, not an error.
- When a class `implements` an interface with optional members, the class is not forced to declare them — `strictPropertyInitialization` may not catch what you expect.
- Declaration merging only works with `interface`/`namespace`, and the merged result must be a valid object type — you can't merge a union.

---

## 14.6 Structural Typing (Duck Typing)

### Explain It

TS is **structurally typed**: compatibility is decided by *shape*, not by declaration name or location. If an object has all the required properties with the right types, it satisfies the interface — even if it was never declared to implement it. This is the #1 difference vs Java/C# (which are *nominally* typed: a type's identity is its declared name). In practice: you can pass an untyped object literal straight to a function expecting `{ id: number; name: string }`; two unrelated interfaces with identical shapes are interchangeable; and a *fresh* object literal gets stricter "excess property checks" (extra properties error) that the same object assigned to a variable then passed in would not. Structural typing is what makes TS play so well with plain JS libraries — any JS value with the right shape is "typed" for free.

### Prove It

```ts
// 04-interfaces-vs-types.ts — run: npx tsx 04-interfaces-vs-types.ts
```

#### Gotchas / Edge Cases

- Excess property checks apply to **fresh object literals only** — assign the object to a variable first and the extra props sail through (a classic trick that hides bugs).
- Functions are structurally compared on parameters: a function accepting fewer params is assignable where more are expected (parameter *contravariance* rules).
- `strictFunctionTypes` makes function type comparisons safer but only applies to function *types* (not methods declared on interfaces).
- If you *need* nominal behavior, use a **brand** trick: `type UserId = string & { __brand: "UserId" }` — runtime value is still a string, compile time is distinct.
- Structural typing compares each property recursively — a deeply nested mismatch fails at the deepest property, and error messages can get long.

---

## 14.7 Narrowing

### Explain It

**Narrowing** is TS's process of refining a union type down to a more specific type inside a branch, using checks that exist at runtime anyway. The big tools: `typeof` (for primitives: `typeof x === "string"`), `instanceof` (for class instances), `in` (for "does this object have a key"), truthiness (`if (x)` removes `null`/`undefined`/`""`/`0`), and equality (`x === "GET"` narrows a literal union). The most powerful pattern is the **discriminated union**: a union of object types that each carry a literal `type`/`kind` field, so switching on that field narrows the whole object — each `case` sees its exact shape and TS verifies you handled every variant. A `Result<T>` (success/failure) union is the canonical example, and an `exhaustive` helper (checking `never`) turns "forgot a case" into a compile error.

### Prove It

```ts
// 03-unions-narrowing.ts — run: npx tsx 03-unions-narrowing.ts
```

#### Gotchas / Edge Cases

- `typeof null === "object"` — a truthiness check, not `typeof`, is how you eliminate `null` from `string | null`.
- `in` narrowing works on object unions: `"ok" in res` narrows `Result<T>`'s success branch.
- Narrowing *assignments* are resets: after `let x: string | number = "a"` then `x = 5`, the narrowed type in the next branch is the *declared* union again.
- `const` inside a switch case does not share scope with the next case — but you *can* `return` from each case to get exhaustive narrowing.
- Discriminated unions require the discriminant to be a **literal type** (`type: "success"`), not a general `string` — otherwise TS can't narrow.

---

## 14.8 Generics

### Explain It

**Generics** let you write one function/type that works with many types while keeping the relationship between input and output typed. `function identity<T>(x: T): T` says "input and output are the *same* type, whatever it is." TS infers `T` from the call site: `identity(5)` gives `number`. **Constraints** (`T extends HasId`) restrict what types are allowed and let you access their properties. Generic **interfaces** like `ApiResponse<T>` parametrize whole shapes. **Default type parameters** (`<T = string>`) make the generic optional at the call site. Generics are how you write utilities, API clients, and collections that are both reusable *and* type-safe — they're the difference between a `first(array): any` (useless) and `first(array: T[]): T` (compiler-enforced).

### Prove It

```ts
// 05-generics.ts — run: npx tsx 05-generics.ts
```

#### Gotchas / Edge Cases

- Constraint vs actual: `T extends HasId` allows *any* type that has an `id` — a wider object is fine (structural typing), so don't over-constrain.
- Without a constraint, you can't access properties on `T` (TS doesn't know they exist) — that's the compiler protecting you, not being mean.
- Generic *functions* and generic *classes* infer; generic *interfaces* need explicit type args (`ApiResponse<User>`) or defaults.
- `function f<T>(x: T): T` with `x = "string"` infers `T = string`, but `f<string>("x")` is always allowed explicitly.
- Defaults apply only when inference fails: `createApi<User>()` with `<T = string>` uses `User`; `createApi()` uses `string`.

---

## 14.9 Utility Types

### Explain It

TS ships a standard library of **utility types** that transform types at compile time. The "pick/omit" family reshapes objects: `Partial<T>` (all props optional), `Required<T>` (all props required), `Pick<T, "a" | "b">` (keep a subset), `Omit<T, "a">` (drop a subset), `Record<K, V>` (an object type mapping keys to values — great for lookup tables and maps). The "function" family inspects signatures: `ReturnType<F>` (what a function returns), `Parameters<F>` (a tuple of its params). The "union" family filters sets: `Exclude<A, B>` (remove members of B from A), `Extract<A, B>` (keep only members present in both). These compose: `Partial<Omit<User, "id">>` is "a user form where id can't be set and everything else is optional" — one line that a hand-written type would take ten. They are the Swiss-army knife of type transformations.

### Prove It

```ts
// 06-utility-types.ts — run: npx tsx 06-utility-types.ts
```

#### Gotchas / Edge Cases

- `Partial`/`Required`/`Pick`/`Omit` only work on object types; `ReturnType`/`Parameters` need a *function type* — passing a generic function doesn't work without `typeof` or inference.
- `Record<string, V>` allows arbitrary string keys (including `"__proto__"` at runtime — object-literal keys are a mild footgun; prefer `Map` for dynamic keys).
- `Exclude` works on unions of *types*; `Omit` works on *keys* — `Omit` is literally `Pick<T, Exclude<keyof T, K>>`.
- `ReturnType<typeof myFn>` is the idiomatic way to reference a function's return without naming it twice.
- Utility types are shallow: `Partial<{ nested: { a: number } }>` does NOT deep-partial `nested`.

---

## 14.10 any vs unknown vs never

### Explain It

`any` turns off the type checker for that value — assignable to everything and from everything, no checks, no narrowing. It's the "escape hatch" that reintroduces the entire class of bugs TS exists to prevent, so it should be a last resort, kept behind a linter rule (`no-explicit-any`). `unknown` is the **type-safe cousin**: it accepts *anything* (like `any`) but you must **narrow it before using it** — you can't call methods or pass it along until you've checked it. Use `unknown` for API responses, `JSON.parse`, and untyped library boundaries. `never` is the **bottom type**: it's the type of a value that can never exist — a function that always throws, or an impossible combination in a discriminated union. TS uses `never` in exhaustiveness checks: if a function's last case assigns to a `never`-typed variable, adding a new union variant becomes a compile error until you handle it.

### Prove It

```ts
// 07-advanced-types.ts — run: npx tsx 07-advanced-types.ts
```

#### Gotchas / Edge Cases

- `any` silently propagates: pass it into a typed function and the return type can become polluted (any + T = any).
- `unknown` is not assignable to anything except `unknown` and `any` — you *must* narrow; that's the point.
- `never` is assignable to every type (you can return it anywhere) but nothing is assignable *to* `never` (a dead end).
- An array of `any` disables checks on every element — prefer `unknown[]` + a validator.
- `Object`/`{}` are *not* the same as `unknown` — `{}` means "any non-nullish value" and allows almost nothing useful. Use `unknown`.

---

## 14.11 Functions

### Explain It

Functions in TS type their **parameters** (required, optional with `?`, rest with `...args: T[]`, and defaults), their **return type** (annotated after `): Type {`), and sometimes a **`this` parameter** (the fake first parameter `this: Context` types what `this` is inside — essential for event handlers and callbacks). `void` means "return value intentionally unused" (a function that returns `undefined` or nothing); `undefined` as a return type means "explicitly returns undefined" — the difference matters for callback assignability. **Overloads** declare multiple signatures for one implementation: the public signature list advertises the valid call shapes (e.g., `f(name: string): User; f(id: number): User`), and the implementation signature (usually wider) is hidden. Overloads give you *documented* polymorphism where unions would be ambiguous.

### Prove It

```ts
// 07-advanced-types.ts — run: npx tsx 07-advanced-types.ts
```

#### Gotchas / Edge Cases

- The implementation signature is not visible to callers — only the overloads are; callers can't call "in the middle" shapes.
- Overload resolution is top-down: the first matching overload wins, so order specific → general.
- `void` and `undefined` are different: a function typed `(): void` can return a value without error when passed as a callback (void "absorbs"), but `(): undefined` must return undefined.
- Optional params (`x?: number`) are `number | undefined` inside — use `x ?? default` rather than assuming.
- Rest params must be the last param; spread of a tuple `(...args: [string, number])` maps positionally.

---

## 14.12 Classes

### Explain It

TS classes add **access modifiers** on top of JS classes: `public` (default, accessible everywhere), `private` (only inside the class — enforced *at compile time*; with `#` fields it's enforced at runtime), `protected` (inside the class and subclasses). **`readonly`** makes a property assign-once (at declaration or in the constructor). **Parameter properties** (`constructor(private name: string)`) declare, type, and assign a field in one stroke — a huge boilerplate saver. A class can **`implements`** an interface (compiler checks the class has the shape — useful for strategies/ports) and **`extends`** another class (runtime inheritance + type inheritance). **`abstract`** classes declare methods with no body (`abstract method(): void`) that subclasses must implement — you can't `new` an abstract class, only subclass it. This gives you OOP discipline while still compiling to plain prototype-based JS.

### Prove It

```ts
// 07-advanced-types.ts — run: npx tsx 07-advanced-types.ts
```

#### Gotchas / Edge Cases

- `private` and `#private` are different: `private` is compile-time-only (erased), `#` is a real runtime private field (and `private` on classes from *other* files with the same name still conflict — TS treats `private` as nominal).
- `implements` checks the *public* shape only — private members don't participate, so an interface can't force privates.
- `readonly` ≠ `const`: the reference can't be reassigned, but the object it points to can still mutate (`readonly arr.push()` works).
- `abstract` methods must have no implementation; concrete methods may call them, and TS forces subclasses to implement before instantiation.
- Parameter properties (`constructor(private x)`) are shorthand that emits real JS — the emitted code includes the assignment.

---

## 14.13 TypeScript Config

### Explain It

`tsconfig.json` is the compiler's instruction sheet. Key options: **`target`** (which ECMAScript version the JS is downleveled to — `ES2020` is a sane baseline), **`module`** (`commonjs` or `esnext`/`nodenext` — how imports become requires), **`moduleResolution`** (`node16`/`nodenext` are modern; `bundler` for bundlers), **`strict`** (the whole strict family at once), **`outDir`** (where emitted JS goes — `tsc` *always* emits, so point it somewhere like `dist/`), and **`esModuleInterop`** (fixes `import express from "express"` for CommonJS packages — always on). You compile with `npx tsc` (emit + check) or watch with `npx tsc --watch`. **`tsx`** skips the compile step entirely — it runs `.ts` files directly (via esbuild), which is perfect for dev/scripts; `tsc` is still used for type-checking and production builds. `npx tsc --noEmit` is the "typecheck only" command CI runs.

### Prove It

```ts
// 08-api-client.ts — run: npx tsx 08-api-client.ts
```

#### Gotchas / Edge Cases

- Without `outDir`, `tsc` emits `.js` files **next to** your `.ts` files — inside your source tree. Point it at `dist/` and add `dist` to `.gitignore`.
- `esModuleInterop` off breaks `import express from "express"` (you'd need `* as express`); it's on in every modern template.
- `moduleResolution` must match `module` (e.g., `nodenext` + `esnext` is invalid; the TS 5.x default is fine for most projects).
- `tsx` does *not* type-check — it strips types and runs. A file with type errors runs fine under `tsx`; run `tsc --noEmit` for real checking.
- `include`/`exclude` control which files get checked — a stray old `.ts` file can drag a broken config into your build.

---

## 14.14 TypeScript in the Backend

### Explain It

In an Express + Prisma backend, TS earns its keep at every boundary. Express has its own types (`@types/express`): `Request`, `Response`, `NextFunction`, and generic request `Request<Params, ResBody, ReqBody, Query>` — so `req.body` is typed once you install the types (or via `express.json()` augmentation). **Prisma generates** its client (`node_modules/.prisma/client`) straight from your `schema.prisma` — every model becomes a TS type: `User`, `Prisma.UserCreateInput`, and the `findMany`/`create` result types. The stack: route handlers annotate `(req: Request<{}, {}, CreateUserBody>, res: Response<User>)`, Prisma calls return typed rows, and errors get discriminated (`PrismaClientKnownRequestError` vs generic `Error`). The payoff: a column rename in `schema.prisma` is a compile error everywhere it's used — refactors become safe. This is where "types as a regression suite" stops being a slogan.

### Prove It

```ts
// 08-api-client.ts — run: npx tsx 08-api-client.ts (offline typed fetch client)
```

#### Gotchas / Edge Cases

- `req.params`/`req.query` are typed as `string | undefined`-ish — always parse/validate, never trust.
- Without `@types/express`, Express infers almost nothing; with `@types/node` and `@types/express` installed, TS wires them up automatically.
- Prisma's generated types require running `prisma generate` after every schema change — stale types = misleading errors.
- `Request`/`Response` generics are positional: `Request<Params, ResBody, ReqBody, Query>` — missing middle args silently types them as `any`-ish defaults.
- For error handlers, `res.status(400).json(...)` returns `Response`, so `return res.json(...)` in a `void` handler is a no-op trap — don't `return` the response.

---

## 14.15 Interview Questions (Say It Out Loud)

### Explain It

Say these out loud: What is TypeScript and how is it different from JavaScript? What does "types are erasable" mean and why does it matter? What is the difference between `interface` and `type`? Explain structural typing with an example. What is `strict` mode and what does `strictNullChecks` do? How do you narrow a union type? What is a discriminated union? What is the difference between `any`, `unknown`, and `never`? How do generics work and what is a constraint? Name five utility types and what they do. What is the difference between `null` and `undefined` in TypeScript? How does TypeScript compile to JavaScript and what is `tsconfig.json`? How do you type an Express `Request`/`Response`? How does Prisma generate types and why is that powerful? What is `never` used for in exhaustiveness checking?

### Prove It

```js
// 09-interview-typescript.js — run: node 09-interview-typescript.js
```

---

## Sources

- TypeScript Handbook: https://www.typescriptlang.org/docs/handbook/intro.html
- TSConfig reference: https://www.typescriptlang.org/tsconfig
- Utility Types: https://www.typescriptlang.org/docs/handbook/utility-types.html
- tsx (TypeScript runner): https://tsx.is
- Prisma typed client: https://www.prisma.io/docs/orm/prisma-client/typed-sql
