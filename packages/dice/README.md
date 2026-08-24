# @drdice/dice

`@drdice/dice` provides matching runtime and literal-computing implementations
of DRDice's bounded Dice Expression evaluator. It depends one-way on
`@drdice/prng` and is intended for reproducible games, tests, and TypeScript
type-system experimentation.

DRDice is non-cryptographic. It is suitable for reproducible game simulations,
deterministic tests, examples, and type-system experiments. Do not use it for
keys, secrets, passwords, authentication or reset tokens, security decisions,
gambling or wagering, or unpredictable entropy.

Exact literal type computation is checked with `typescript@7.0.2`. The pinned
`@typescript/typescript6@6.0.2` lane is advisory compatibility evidence only.

Only the package root is public. Runtime values and type-only helpers are both
imported from `@drdice/dice`; deep imports are unsupported. PRNG-owned
types remain owned by `@drdice/prng` and are not re-exported here.

The Dice semantic identity is
`dice-v3/utf16-bounded-left-to-right-3` (semantic version `3`). It is distinct
from the package version, the PRNG schema version, and the PRNG Sequence
Profile. A grammar, UTF-16 offset, limit, parser, evaluation-order, arithmetic,
sampling, failure-selection, or result-value change requires a new Dice
semantic identity and reviewed old and new vectors. Private refactors may
retain the identity only when all exact vectors and release gates remain equal.
The complete
evaluator exposes `Evaluate<Source, GeneratorState, MaximumAttempts = 5>` for
literal nonnegative integers, `dS`/`NdS` terms, left-associative `+`/`-`,
parentheses, and ASCII space/tab/line-feed/carriage-return. Successful
evaluations return an exact signed total, a flat ordered Roll Trace, and the
actual Next Generator State. Each Die Sample is delegated to the public
`@drdice/prng` `Sample` operation with the configured per-sample attempt fuel.
Source, syntax, domain, and static resource diagnostics are selected before
state consumption; widened strings and numbers are outside the v3 type contract.
Fuel defaults to the maximum supported value, `5`, which keeps the worst-case
per-die exhaustion probability below one part per million. Override it only
when a test or constrained type-checking budget needs to exercise another fuel.

Successful results can be projected with `PayloadOf`, `ValueOf`, `RollsOf`,
and `StateOf`. `ValueOf` is the resulting expression number; `PayloadOf` is the
complete `{ total, rollTrace, nextState }` object. A subsequent evaluation
uses `Evaluate<NextSource, StateOf<PreviousResult>>`. The result field remains named
`nextState` because it is the state after consuming that evaluation;
`StateOf<Result>` is the concise name once that state is extracted.

The lowercase `evaluate(source, state, maximumAttempts?)` function executes
the same profile at runtime. Literal arguments receive the exact corresponding
`Evaluate` result type; dynamic strings and states receive the broader
`EvaluationResult`. A subsequent runtime evaluation passes `stateOf(previous)`
to `evaluate`.
The lowercase `payloadOf`, `valueOf`, `rollsOf`, and `stateOf` functions are
the runtime counterparts of the capitalized extractor types.
