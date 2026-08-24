# @drdice/prng

`@drdice/prng` provides one Seeded PRNG as matching runtime functions and
literal-computing types. It is intended for reproducible games, tests, and TypeScript
type-system experimentation; it is not a source of cryptographic randomness,
secrets, security tokens, gambling outcomes, or unpredictable entropy.

The v2 implementation is checked by exactly `typescript@7.0.2`. The pinned
`@typescript/typescript6@6.0.2` lane is advisory migration evidence only.

Only the package root is public. Runtime values and type-only helpers are both
imported from `@drdice/prng`; deep imports are unsupported.

The immutable PRNG Sequence Profile is
`xoshiro128ss-1.1/warmup16-msb-chunk-rejection-2`. The development package version (`0.3.0-dev.4`),
Replay Token/Serialized Generator State schema version (`1`), and Sequence
Profile identity are separate compatibility identities. A package contract
change requires a new package release; a serialized-shape change requires a
new schema version; and a sequence-changing implementation change requires a
new Sequence Profile plus reviewed old and new vectors. A private refactor may
retain all three only when the exact vectors and release gates remain equal.

The root provides exact literal type operations:

- `Initialize<SeedWords>` validates four lowercase eight-digit hexadecimal
  words, diffuses even simple human-chosen seeds through 16 state transitions,
  and returns a tagged `GeneratorState` or a structured failure.
- `Next<GeneratorState>` returns one raw Word32 and its explicit next
  state. It never mutates or advances an input type.
- `Sample<GeneratorState, Bound, MaximumAttempts = 5>` returns an exact unbiased
  integer in `[0, Bound)` for every bound from 1 through 100. It scans every
  complete fixed-width candidate in an output word before consuming another
  state, supports output-word fuel from 0 through 5, and reports exact
  exhaustion state. Fuel 5 keeps worst-case per-die exhaustion below one part
  per million across all supported bounds.
- `PayloadOf<Result>` extracts the complete successful payload,
  `ValueOf<SampleResult>` extracts the sampled integer, `WordOf<NextResult>`
  extracts a raw word, and `StateOf<Result>` extracts the current state without
  a local conditional helper.
- `ReplayToken<SeedWords>` and `RestoreReplay<Token>` restart from the Seed.
- `SerializedGeneratorState<StateWords>`, `RestoreState<Snapshot>`, and
  `SerializeState<State>` preserve the current state and resume at its next
  word. Replay restart and serialized-state resume are intentionally distinct.

The lowercase runtime functions implement the same operations: `initialize`,
`next`, `sample`, `serializeState`, `restoreState`, and `restoreReplay`.
Their generic signatures compute exact return types for literal arguments and
widen naturally for runtime-only inputs. `randomSeed()` creates four seed words
from the host entropy source; the generator remains non-cryptographic.
The lowercase `payloadOf`, `valueOf`, `wordOf`, and `stateOf` functions are the
runtime counterparts of the capitalized extractor types.

All-zero and malformed Seed or Generator State values fail structurally and do
not advance state. Invalid bounds and attempt fuel are rejected before any
transition. The public type API is literal-computing: widened strings and
numbers are outside the v2 contract. This package is suitable for reproducible
game simulations, deterministic tests, examples, and type-system experiments.
It is not cryptographic and must not be used for keys, secrets, passwords,
authentication or reset tokens, security decisions, gambling or wagering, or
unpredictable entropy.
