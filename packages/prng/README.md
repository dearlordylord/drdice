# @drdice/prng

`@drdice/prng` is the declaration-only package for DRDice's literal-computing
Seeded PRNG. It is intended for reproducible games, tests, and TypeScript
type-system experimentation; it is not a source of cryptographic randomness,
secrets, security tokens, gambling outcomes, or unpredictable entropy.

The v1 implementation is checked by exactly `typescript@7.0.2`. The pinned
`@typescript/typescript6@6.0.2` lane is advisory migration evidence only.

Only the package root is public. Consumers use type-only imports from
`@drdice/prng`; runtime imports and deep imports are unsupported.

The immutable PRNG Sequence Profile is
`xoshiro128ss-1.1/direct128-msb-rejection-1`. The package version (`0.1.0`),
Replay Token/Serialized Generator State schema version (`1`), and Sequence
Profile identity are separate compatibility identities. A package contract
change requires a new package release; a serialized-shape change requires a
new schema version; and a sequence-changing implementation change requires a
new Sequence Profile plus reviewed old and new vectors. A private refactor may
retain all three only when the exact vectors and release gates remain equal.

The root provides exact literal type operations:

- `Initialize<SeedWords>` validates four lowercase eight-digit hexadecimal
  words and returns a tagged `GeneratorState` or a structured failure.
- `Next<GeneratorState>` returns one raw Word32 and its explicit successor
  state. It never mutates or advances an input type.
- `Sample<GeneratorState, Bound, MaximumAttempts>` returns an exact unbiased
  integer in `[0, Bound)` for every bound from 1 through 100. Each attempt
  consumes one successor state; bound one consumes one output, and exhaustion
  reports its exact attempt count and advanced state.
- `ReplayToken<SeedWords>` and `RestoreReplay<Token>` restart from the Seed.
- `SerializedGeneratorState<StateWords>`, `RestoreState<Snapshot>`, and
  `SerializeState<State>` preserve the current state and resume at its next
  word. Replay restart and serialized-state resume are intentionally distinct.

All-zero and malformed Seed or Generator State values fail structurally and do
not advance state. Invalid bounds and attempt fuel are rejected before any
transition. The public type API is literal-computing: widened strings and
numbers are outside the v1 contract. This package is suitable for reproducible
game simulations, deterministic tests, examples, and type-system experiments.
It is not cryptographic and must not be used for keys, secrets, passwords,
authentication or reset tokens, security decisions, gambling or wagering, or
unpredictable entropy.
