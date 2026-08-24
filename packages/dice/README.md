# @drdice/dice

`@drdice/dice` is the declaration-only package for DRDice's bounded,
literal-computing Dice Expression evaluator. It depends one-way on
`@drdice/prng` and is intended for reproducible games, tests, and TypeScript
type-system experimentation.

DRDice is non-cryptographic. It is suitable for reproducible game simulations,
deterministic tests, examples, and type-system experiments. Do not use it for
keys, secrets, passwords, authentication or reset tokens, security decisions,
gambling or wagering, or unpredictable entropy.

The v2 implementation is checked by exactly `typescript@7.0.2`. The pinned
`@typescript/typescript6@6.0.2` lane is advisory migration evidence only.

Only the package root is public. Consumers use type-only imports from
`@drdice/dice`; runtime imports and deep imports are unsupported. PRNG-owned
types remain owned by `@drdice/prng` and are not re-exported here.

The Dice semantic identity is
`dice-v2/utf16-bounded-left-to-right-2` (semantic version `2`). It is distinct
from the package version, the PRNG schema version, and the PRNG Sequence
Profile. A grammar, UTF-16 offset, limit, parser, evaluation-order, arithmetic,
sampling, failure-selection, or result-value change requires a new Dice
semantic identity and reviewed old and new vectors. Private refactors may
retain the identity only when all exact vectors and release gates remain equal.
The complete
evaluator exposes `Evaluate<Source, GeneratorState, MaximumAttempts>` for
literal nonnegative integers, `dS`/`NdS` terms, left-associative `+`/`-`,
parentheses, and ASCII space/tab/line-feed/carriage-return. Successful
evaluations return an exact signed total, a flat ordered Roll Trace, and the
actual successor Generator State. Each Die Sample is delegated to the public
`@drdice/prng` `Sample` operation with the configured per-sample attempt fuel.
Source, syntax, domain, and static resource diagnostics are selected before
state consumption; widened strings and numbers are outside the v2 contract.
For ordinary game play, pass the maximum supported sampling fuel, `5`, so the
worst-case per-die exhaustion probability remains below one part per million.
