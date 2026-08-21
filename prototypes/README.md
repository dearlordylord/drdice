# Dice Evaluation type API prototype

This is the throwaway issue #10 artifact on branch
`prototype/dice-evaluation-type-api`, created from `main` at `bf65891`. It is
planning evidence only, not a package implementation.

Issue #10 asks:

> What rough type-level API and diagnostic artifact makes valid Dice
> Evaluations, Roll Traces, successor states, parse failures, resource-limit
> failures, and composition with the PRNG package concrete enough for a human
> to accept or revise?

## Run the interactive model

Open [dice-evaluation-type-api.html](./dice-evaluation-type-api.html) directly
in a browser. It contains the pure DOM-free model and a thin button shell with
free play, deterministic reset, full state/result rendering after every click,
and one button per ordered transition in the Happy, Parse failure, Predictable
resource, Partial exhaustion, Late arithmetic, and Illegal domain walkthroughs.

The model uses the accepted #9 `Initialize`/`Next`/`Sample` boundary: each Die
Sample asks the bounded sampler for a successor Generator State, then records
exactly `{ sideCount, face }` in a flat Roll Trace. Replay/profile concerns stay
at the PRNG boundary; the evaluation result carries the actual successor state.

## Check the type artifact and independent oracle

From this directory:

```sh
npx --yes -p typescript@5.9.3 tsc --pretty false --strict \
  --target es2020 --module commonjs --noEmit \
  prototypes/dice-evaluation-type-api.ts

outdir=$(mktemp -d)
npx --yes -p typescript@5.9.3 tsc --pretty false --strict \
  --target es2020 --module commonjs --outDir "$outdir" \
  prototypes/dice-evaluation-type-api.ts
node "$outdir/dice-evaluation-type-api.js"
```

Expected runtime output:

```text
Dice evaluation prototype oracle vectors passed; literal probes compiled.
```

The TypeScript aliases materialize integer-only success with an unchanged
state/empty trace, d1/d6/d100, whitespace and `D`, left-associative subtraction,
parentheses, negative totals, per-Die-Sample fuel, zero-attempt exhaustion, and
the forced partial-trace/no-rollback exhaustion case. The runtime oracle checks
the same contract independently; it is not generated from the HTML model.

The HTML/model smoke check used for this artifact is:

```sh
sed -n '/^[[:space:]]*<script>/,/^[[:space:]]*<\/script>/p' \
  prototypes/dice-evaluation-type-api.html | sed '1d;$d' | node --check
awk '/\/\* PURE MODEL START/{inside=1;next} \
     /\/\* PURE MODEL END/{inside=0} inside{print}' \
  prototypes/dice-evaluation-type-api.html | node --check
```

## Contract and decision suggested

The smallest useful composition remains:

```ts
Evaluate<Source, GeneratorState, MaximumAttempts>
  -> { ok: true; value: {
       total: number;
       rollTrace: readonly DieSample[];
       successorState: GeneratorState;
     }}
   | { ok: false; code: DiagnosticCode; details: Diagnostic };
```

The prototype suggests accepting this as the public design direction:

- Parse the bounded v1 grammar (`dS`, `NdS`, canonical nonnegative integers,
  `+`, `-`, parentheses, and space/tab/LF/CR), with `+` and `-` at one left-
  associative precedence level.
- Validate in the visible order source length, parsing, domain, predictable
  resources, PRNG input/fuel, then depth-first left-to-right evaluation. Source
  diagnostics use zero-based UTF-16 offsets and report only the first failure.
- Keep syntax, domain, resource, and evaluation-resource codes structured. The
  sketch materializes every syntax code, both domain codes, and every resource
  dimension: source length, numeric-token length, nesting depth, AST nodes, dice
  terms, Die Samples, supported side count, arithmetic magnitude, evaluation
  steps, and rejection-sampling attempts.
- Keep predictable failures state-preserving. If evaluation has consumed a
  sample, fail fast without rollback: return the completed partial trace and
  actual successor state, never an incomplete sample or a total.
- Keep `DieSample` minimal (`sideCount`, `face`) and make a successful
  `DiceEvaluation` exactly `{ total, rollTrace, successorState }`.

The numeric limits in the artifact are explicitly illustrative (`64` source
characters, `100` sides, and the other small counters). Issue #11 must measure
TypeScript checker behavior before any threshold or compiler support promise is
made. Final package exports, full parity vectors, and production parser/runtime
implementation remain deferred.
