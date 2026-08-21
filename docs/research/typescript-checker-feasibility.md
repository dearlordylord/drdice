# TypeScript checker feasibility and performance evidence

Research checked: 2026-08-20.

## Decision

DRDice's proposed static pipeline is feasible: TypeScript can decompose literal
strings, recurse through a parser, transform fixed-width tuple state, and return a
literal result with successor state. The checker is therefore capable of a bounded
type-level parser, PRNG step, die sampler, and evaluator.

Feasibility is not evidence that an unrestricted public API will be usable. DRDice
must treat compiler support and type-checker cost as public contracts. It should not
promise a maximum expression length, roll count, rejection count, seed format, or
supported compiler range until a representative prototype has been measured on both
TypeScript 6 and TypeScript 7. These are separate checker implementations, despite
their intended semantic compatibility.

The evidence required for later decisions is:

1. parity and diagnostic tests on every supported compiler line;
2. isolated, baseline-adjusted type-instantiation measurements for each public
   operation and for complete expressions;
3. cold CLI check time and peak memory under a fixed single-checker configuration;
4. editor diagnostic and hover latency on the same workload; and
5. explicit successful-input limits with typed budget failures below the compiler's
   internal failure guards.

## Why the computation is expressible

[Template literal types](https://www.typescriptlang.org/docs/handbook/2/template-literal-types.html)
can infer and split literal-string components. The handbook warns that interpolated
unions are cross-multiplied and recommends ahead-of-time generation for large unions,
so a parser should scan a literal sequentially rather than enumerate the language.

[Recursive conditional types](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-1.html#recursive-conditional-types)
have been supported since TypeScript 4.1. The TypeScript team explicitly warns that
these types increase checking time, can hit an internal recursion limit, and should
not be shipped casually in public declaration files. TypeScript 4.5 added
[tail-recursion elimination for conditional types](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-5.html#tail-recursion-elimination-on-conditional-types),
but only when a branch immediately returns the next conditional computation. Adding
the recursive result to a union is the documented counterexample; accumulator-style
helpers are the documented alternative.

These features are enough for the intended shape:

```ts
type Step<State> = {
  readonly word: Word32
  readonly state: Word32
}

type Evaluate<Expression extends string, State extends Word32> =
  Parse<Expression> extends infer Ast
    ? EvaluateAst<Ast, State>
    : never
```

There are existing existence proofs, but they establish possibility rather than a
performance promise. A pinned type-level xorshift experiment represents a word as a
bit tuple and implements its transition with tuple fill/slice, shifts, and XOR
([source](https://github.com/yossuli/vitePG/blob/421807d481eed43960abf532f1519c0905828cba/pg1/src/3/random.ts)).
ArkType's parser pairs recursive static parsing with runtime parsing in production
source ([entry point](https://github.com/arktypeio/arktype/blob/03b1f015d9b7c5af5dac2caed1aeedefaf705ab3/ark/type/parser/string.ts#L42-L116)).
Neither source demonstrates the full DRDice workload of parsing followed by repeated
fixed-width generation, rejection sampling, accumulation, and trace construction.

## Current implementation ceilings

The compiler's guards are implementation details, not specified language limits.
Nevertheless, they show why DRDice must stop well before compiler failure.

TypeScript 6.0.3's checker rejects a computation when instantiation depth reaches 100
or a single statement/expression causes five million instantiations
([checker source](https://github.com/microsoft/TypeScript/blob/050880ce59e30b356b686bd3144efe24f875ebc8/src/compiler/checker.ts#L21018-L21038)).
Its optimized conditional-type loop stops after 1,000 tail steps
([checker source](https://github.com/microsoft/TypeScript/blob/050880ce59e30b356b686bd3144efe24f875ebc8/src/compiler/checker.ts#L19774-L19787)).

The native TypeScript 7 checker currently carries the same three guards: depth 100
and five million instantiations
([checker source](https://github.com/microsoft/typescript-go/blob/89d5d5b2849a0db0957065889ca58536fa6d2e4a/internal/checker/checker.go#L22217-L22255)),
plus 1,000 tail iterations
([checker source](https://github.com/microsoft/typescript-go/blob/89d5d5b2849a0db0957065889ca58536fa6d2e4a/internal/checker/checker.go#L24426-L24438)).
Matching numbers do not make them stable API. They can change without a language
breaking-change announcement, and the two implementations need not have equal cost
below those ceilings.

The failure modes also measure different shapes:

- **Instantiation depth** punishes nested non-tail work. One PRNG step may contain
  several nested tuple transforms even when a roll loop itself is tail-recursive.
- **Instantiation count** punishes breadth and repeated expansion. Distributed
  conditionals, unions of parser states, and materialized roll traces can multiply it.
- **Tail count** bounds even optimized sequential work. Parsing characters, rolling
  dice, and rejected candidates all consume sequential work somewhere in the pipeline.

DRDice should therefore carry explicit fuel and size counters and return named error
types before these compiler diagnostics become reachable. A compiler error such as
`TS2589` is not a valid library diagnostic.

## Compiler-version sensitivity

TypeScript 7 is a native Go implementation. The release announcement says it is
intended to match TypeScript 6 when 6 runs with `stableTypeOrdering`, while also
documenting changed defaults and behavior
([TypeScript 7 announcement](https://devblogs.microsoft.com/typescript/announcing-typescript-7-0/#updates-since-5-x-and-new-behaviors-from-6-0)).
The transition is directly relevant to a library whose implementation executes inside
the checker:

- TypeScript 7 changes template-literal inference from UTF-16 code units to Unicode
  code points. An ASCII-only dice grammar avoids a direct semantic difference, but the
  change proves that string-scanning semantics can change between compiler majors.
- TypeScript 7 has no compiler API in 7.0, while TypeScript 6 remains available through
  a compatibility package. A benchmark harness must invoke compiler CLIs rather than
  depend on one shared programmatic API
  ([side-by-side guidance](https://devblogs.microsoft.com/typescript/announcing-typescript-7-0/#running-side-by-side-with-typescript-6-0)).
- The TypeScript team reports large whole-project speedups for 7.0, but those results do
  not establish the cost of one deeply recursive type expression. DRDice must measure
  its own workload rather than apply the reported 7.7x-11.9x project speedups
  ([published measurements](https://devblogs.microsoft.com/typescript/announcing-typescript-7-0/#what-does-a-faster-typescript-mean)).
- TypeScript 7 type checking is parallel by default. Reproducible comparisons should
  use `--singleThreaded` (or a fixed checker count), which the release documentation
  provides specifically for debugging and comparisons.

The initial measurement matrix should include TypeScript 6.0.3 and 7.0.2. Add 5.9.3
only if a later support decision proposes a 5.x floor. Supporting a range means running
the full parity, negative-diagnostic, and performance suite at the oldest and newest
supported releases; testing only the development compiler is insufficient.

## Measured precedent

ArkType's Attest project demonstrates an appropriate type-performance practice. Its
author-owned documentation says it can report the type instantiations contributed by
a benchmark body, explains that an API benchmark needs a distinct baseline expression
to subtract cached setup cost, and supports CI thresholds
([Attest benchmark documentation](https://github.com/arktypeio/arktype/blob/03b1f015d9b7c5af5dac2caed1aeedefaf705ab3/ark/attest/README.md#L242-L296)).

ArkType's TypeScript 5.9.3 regex benchmark records, among other cases:

| Static operation | Recorded instantiations |
| --- | ---: |
| repeat 100 | 666 |
| repeat 500 | 3,528 |
| repeat 512 | 557 |
| repeat 513 | 5,928 |
| fifteen optional characters | 282,048 |
| semantic-version regex | 35,386 |

The source and exact snapshots are available in the
[pinned benchmark](https://github.com/arktypeio/arktype/blob/03b1f015d9b7c5af5dac2caed1aeedefaf705ab3/ark/regex/__tests__/regex.bench.ts#L13-L67),
and the workspace pins
[TypeScript 5.9.3](https://github.com/arktypeio/arktype/blob/03b1f015d9b7c5af5dac2caed1aeedefaf705ab3/pnpm-workspace.yaml#L4-L7).
The sharp 512/513 discontinuity and the optional-character expansion show why source
length alone is not a trustworthy cost model. Algorithm branches and union expansion
must be benchmarked explicitly.

The TypeScript team's official performance guide recommends `--extendedDiagnostics`
for counts, memory, and phase timings, and `--generateTrace` plus
`@typescript/analyze-trace` when aggregate diagnostics are insufficient
([performance guide](https://github.com/microsoft/TypeScript/wiki/Performance#extendeddiagnostics)).
It warns that trace format is unstable, so traces are diagnostic artifacts, not a
machine-readable compatibility contract.

## Required benchmark corpus

Later algorithm, representation, and grammar decisions should use one checked-in
corpus with forced type evaluation. Each case must compile in isolation as well as in
an aggregate consumer file, because checker caches change instantiation counts.

### Generator package

- seed validation: valid nonzero word, zero word, malformed width;
- one transition, then 2, 8, 32, 128, and the proposed maximum consecutive steps;
- output materialized as a word, numeric literal, and public result structure;
- distinct seeds and repeated identical seeds to expose cache effects;
- the runtime parity vectors used by the algorithm contract.

### Dice package

- smallest valid forms: `d6`, `1d6`, an integer, and whitespace variants;
- each grammar branch, nesting depth, longest numeric literal, and longest source;
- 1, 2, 8, 32, and the proposed maximum dice count;
- accepted-first-try sampling and a seed exercising every supported rejection-fuel
  depth;
- roll traces at every proposed maximum, because retaining every face may dominate the
  final type size;
- malformed inputs near every limit so diagnostics are measured, not only success;
- complete parse-plus-evaluate cases rather than summing isolated component costs.

For every case, record compiler version and platform, pass/fail, instantiations, type
count, cold check time, peak memory, diagnostic code, and inferred result. Run multiple
cold samples and report a median plus a high percentile rather than one wall-clock
observation. Separately record editor time to first diagnostic and hover resolution;
the official guide notes that editor requests do not have the same shape as a full
`tsc` check
([editor performance guidance](https://github.com/microsoft/TypeScript/wiki/Performance#optimizing-editing-experience-performance-of-ts-server)).

## Consequences for later design

- Prefer fixed-width tuples, named intermediate aliases, non-distributive conditionals,
  and accumulator-style tail recursion. Measure each choice; do not assume a source
  code simplification is a checker simplification.
- Keep the grammar ASCII. This is semantically sufficient for the proposed dice
  language and avoids the known TypeScript 6/7 string-unit difference.
- Bound source length, numeric width, AST depth, dice count, trace length, and rejection
  fuel independently. They are different cost axes and need distinct errors.
- Make widened `string`, widened `number`, and nonliteral seed behavior explicit; they
  must short-circuit instead of accidentally distributing into expensive work.
- Freeze the compiler support matrix for each release. A new TypeScript major requires
  parity and budget evidence before it is added, even if ordinary TypeScript libraries
  would assume compatibility.
- Do not derive a shipping budget from the checker's 100/1,000/five-million guards.
  The product budget must leave substantial headroom for the consumer's surrounding
  types and for compiler-version variance.

The next architecture decisions may proceed with **bounded feasibility** as an
established fact. Exact public limits remain intentionally undecided until the chosen
PRNG state representation and parser/evaluator prototype produce this measurement
matrix.
