# @drdice/dice

`@drdice/dice` is the declaration-only package for DRDice's bounded,
literal-computing Dice Expression evaluator. It depends one-way on
`@drdice/prng` and is intended for reproducible games, tests, and TypeScript
type-system experimentation.

DRDice is non-cryptographic. Do not use it for secrets, security tokens,
gambling, or unpredictable entropy.

The v1 implementation is checked by exactly `typescript@7.0.2`. The pinned
`@typescript/typescript6@6.0.2` lane is advisory migration evidence only.

Only the package root is public. Consumers use type-only imports from
`@drdice/dice`; runtime imports and deep imports are unsupported. PRNG-owned
types remain owned by `@drdice/prng` and are not re-exported here.

The Dice grammar identity for v1 is
`dice-v1/utf16-bounded-left-to-right-1` (semantic version `1`). It is distinct
from the package version and from the PRNG Sequence Profile. The complete
evaluator exposes `Evaluate<Source, GeneratorState, MaximumAttempts>` for
literal nonnegative integers, `dS`/`NdS` terms, left-associative `+`/`-`,
parentheses, and ASCII space/tab/line-feed/carriage-return. Successful
evaluations return an exact signed total, a flat ordered Roll Trace, and the
actual successor Generator State. Each Die Sample is delegated to the public
`@drdice/prng` `Sample` operation with the configured per-sample attempt fuel.
Source, syntax, domain, and static resource diagnostics are selected before
state consumption; widened strings and numbers are outside the v1 contract.
