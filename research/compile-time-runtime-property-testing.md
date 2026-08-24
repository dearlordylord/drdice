# Property-testing runtime/type-level parity

Research date: 2026-08-24

## Decision-ready summary

DRDice should generate **executable TypeScript fixtures from fuzzed inputs and
an independent oracle**. Each fixture should contain one expected literal that
serves two purposes:

1. its literal type is compared exactly with the type inferred for the runtime
   call; and
2. its JavaScript value is compared with the runtime result.

There is no need to reflect an inferred type into a running program. TypeScript
erases types when it emits JavaScript, so a generic type argument or inferred
literal cannot be inspected at runtime ([TypeScript Handbook: erased
types](https://www.typescriptlang.org/docs/handbook/typescript-from-scratch#erased-types)).
Instead, the generated literal is the bridge between both worlds:

```ts
const expected = 12 as const; // generated from the independent oracle
const result = evaluate("d20", inputState, 5);
if (!result.ok) throw new Error("expected success");
const actual = valueOf(result);

type Equal<Left, Right> =
  (<T>() => T extends Left ? 1 : 2) extends
  (<T>() => T extends Right ? 1 : 2) ? true : false;
type Assert<T extends true> = T;
type _Parity = Assert<Equal<typeof actual, typeof expected>>;

if (actual !== expected) throw new Error(`runtime ${actual} !== expected ${expected}`);
```

`as const` preserves literal values in the type of `expected`; TypeScript
documents const assertions as preventing literal widening and making object and
array members readonly ([TypeScript 3.4 release notes](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-4.html#const-assertions)).
The exact `Equal` assertion matters: `satisfies` validates compatibility while
preserving an expression's inferred type, but it is still an assignability
check, so an accidentally widened `number` can accept `12` ([TypeScript 4.9
release notes](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-9.html#the-satisfies-operator)).

The production gate should compare the **complete evaluation result**, not only
the total. That additionally covers failure codes, roll traces, rejection
attempts, and `nextState`:

```ts
const expected = { ok: true, value: { /* oracle-produced literal payload */ } } as const;
const actual = evaluate(sourceLiteral, stateLiteral, fuelLiteral);
type _ExactResult = Assert<Equal<typeof actual, typeof expected>>;
assertDeepEqual(actual, expected);
```

## Recommended DRDice workflow

1. Build a bounded arbitrary for a serializable case: four canonical seed
   words, a grammar-generated dice expression, and literal fuel. Generate the
   grammar structurally rather than filtering arbitrary strings. fast-check
   arbitraries combine generation with shrinking, and its documentation advises
   constructing constrained arbitraries instead of heavily filtering them
   ([fast-check arbitraries](https://fast-check.dev/docs/core-blocks/arbitraries/),
   [properties](https://fast-check.dev/docs/core-blocks/properties/#filtering-and-performance)).
2. Compute `expected` with the existing independent oracles in
   `verification/issue-17/oracle.mjs` and `verification/issue-20/oracle.mjs`.
   Do not compute it with the production runtime: that would test type/runtime
   parity, but both could agree on the same wrong answer.
3. Render temporary executable `.ts` shards. Give every case a stable ID and
   embed its source, state, fuel, and complete oracle result as literals. Infer
   `typeof actual` from the lowercase runtime call so the test also covers the
   public function signature, then assert exact type equality and runtime deep
   equality against the same `expected` constant.
4. Run the pinned TypeScript 7 CLI once over the generated shard set, emit to a
   temporary directory, and execute the emitted JavaScript. This avoids one
   compiler startup per case. TypeScript's ordinary emit removes the static
   assertions while retaining the runtime assertion; `noEmitOnError` can prevent
   execution after a type failure ([TSConfig reference](https://www.typescriptlang.org/tsconfig/explainFiles.html#noEmitOnError)).
5. Print and retain the fuzz seed plus the failing case descriptor. fast-check
   exposes `seed` and `path` specifically for replaying a failing case and
   reports shrink counts and minimal counterexamples
   ([fast-check runner parameters](https://fast-check.dev/docs/api/interfaces/Parameters/),
   [run details](https://fast-check.dev/docs/api/interfaces/RunDetailsCommon/)).

Use two execution modes:

- **Blocking CI:** a fixed seed and a few hundred bounded cases, rendered and
  compiled as one set. A fixed seed makes regressions reproducible; periodically
  rotating or adding a seed grows coverage deliberately.
- **Nightly/local fuzzing:** fresh seeds and a time budget. If the batched gate
  fails, replay the reported case through a slower one-case property that invokes
  `tsc` inside the predicate, allowing fast-check to shrink the expression,
  state, and fuel. Compiler-per-candidate shrinking is too expensive for the
  normal green path.

This extends rather than replaces DRDice's current design. The repository
already generates oracle-backed exact-type fixtures in
`verification/issue-22/generate.mjs` and separately compares runtime code with
the same independent oracle in `verification/runtime/check.mjs`. The new gate
would join those two assertions in each generated executable fixture and vary
many more inputs.

## Why not extract the inferred type directly?

| Mechanism | What it can do | Why it is not the primary gate |
| --- | --- | --- |
| Compiler API / language service | In the JavaScript compiler, `Program#getTypeChecker`, `getTypeAtLocation`, and `typeToString` can inspect inferred types ([official compiler API guide](https://github.com/microsoft/TypeScript/wiki/Using-the-Compiler-API#type-checker-apis)); the language service supports long-lived, on-demand checking ([official language-service guide](https://github.com/microsoft/TypeScript/wiki/Using-the-Language-Service-API)). | DRDice's supported exact computation uses TypeScript 7.0.2, and TypeScript 7.0 explicitly ships **without a programmatic API**; the team expects a different API in 7.1 ([TypeScript 7.0 announcement](https://devblogs.microsoft.com/typescript/announcing-typescript-7-0/#running-side-by-side-with-typescript-60)). Querying through TypeScript 6 would test a different compiler. |
| Declaration emit | Exported values can be emitted to `.d.ts` files with `declaration` or `emitDeclarationOnly` ([TSConfig declaration docs](https://www.typescriptlang.org/tsconfig/explainFiles.html#declaration), [emitDeclarationOnly docs](https://www.typescriptlang.org/tsconfig/emitDeclarationOnly.html)). | Parsing pretty-printed declaration text creates an unnecessary text protocol and still does not make a type available to JavaScript. It is useful for diagnostics or snapshots, not equality. |
| Type assertion tools | `tsd` offers strict `expectType` checks against declaration files ([tsd documentation](https://github.com/tsdjs/tsd#strict-type-assertions)). | Its test files are explicitly not executed, so a separate runtime assertion and the same expected literal are still required. Plain generated `Assert<Equal<...>>` keeps the TypeScript 7 CLI as the only checker dependency. |

## ArkType and `@ark/attest`

ArkType's relevant tool is [`@ark/attest`](https://github.com/arktypeio/arktype/tree/main/ark/attest),
whose stated purpose is to make TypeScript types available to runtime tests and
to combine type assertions, value assertions, snapshots, and instantiation
benchmarks. Its ergonomics validate several choices for DRDice: keep a fast
runtime-only development lane, run integrated type assertions in CI, cache or
batch compiler analysis, assert exact types, and track compiler cost alongside
correctness ([Attest README](https://github.com/arktypeio/arktype/blob/main/ark/attest/README.md)).

Attest is not a suitable implementation dependency for the DRDice parity gate.
Its current implementation imports the JavaScript `typescript` API, creates a
virtual language-service environment, obtains a `Program` and `TypeChecker`,
and uses some non-public checker methods
([Attest compiler integration](https://github.com/arktypeio/arktype/blob/main/ark/attest/cache/ts.ts),
[assertion-cache analysis](https://github.com/arktypeio/arktype/blob/main/ark/attest/cache/writeAssertionCache.ts)).
That mechanism depends on the programmatic compiler API that TypeScript 7.0
does not ship. It also introduces an alpha test framework and several
dependencies where DRDice only needs one generated literal and the pinned CLI.

The lesson to borrow is therefore architectural, not a package dependency:
precompute type evidence in a slower setup phase, cache or shard it, and let the
ordinary test process perform cheap runtime assertions. DRDice's generated
`expected as const` fixture provides that separation without depending on a
compiler API unavailable in its supported compiler.

## Acceptance property

For every generated case within the documented static-computation bounds:

```text
oracle(case) = inferred literal type of evaluate(case)
oracle(case) = runtime value of evaluate(case)
```

The two independently checked equalities establish the desired result:

```text
inferred literal result = runtime result
```

The oracle also prevents “both implementations made the same mistake” from
passing as parity.
