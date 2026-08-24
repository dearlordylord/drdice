# @drdice/prng

Deterministic seeded random generation with matching runtime functions and
literal-computing TypeScript types. Use it for reproducible games, simulations,
and tests.

## Install

```sh
npm install @drdice/prng
```

Exact literal result types require TypeScript 7.0.2. Inputs known only at
runtime still work normally and receive broader result types.

## Quick start

```ts
import { initialize, sample, stateOf, valueOf } from "@drdice/prng";

const initialized = initialize([
  "00000001",
  "00000002",
  "00000003",
  "00000004",
] as const);

const first = sample(stateOf(initialized), 20);
const firstValue = valueOf(first);
//    ^? const firstValue: 11

const second = sample(stateOf(first), 6);
const secondValue = valueOf(second);
//    ^? const secondValue: 4

console.log({ firstValue, secondValue });
```

Generator states are immutable. Pass the returned state into the next operation
to continue a sequence, or reuse an earlier state to replay it.

## API

- `randomSeed()` creates a fresh four-word seed using host entropy.
- `initialize(seed)` creates a generator state.
- `next(state)` returns a raw 32-bit word and the next state.
- `sample(state, bound, maximumAttempts?)` returns an unbiased integer in
  `[0, bound)` for bounds from 1 through 100.
- `serializeState` and `restoreState` save and resume the current position.
- `payloadOf`, `valueOf`, `wordOf`, and `stateOf` extract successful results.

The matching type-level API uses capitalized names: `Initialize`, `Next`,
`Sample`, `SerializeState`, `RestoreState`, `PayloadOf`, `ValueOf`, `WordOf`,
and `StateOf`.

Operations return structured failures for malformed seeds or states, invalid
bounds, and exhausted sampling attempts. Check `result.ok` before using an
extractor when an operation can fail.

## Reproducibility and safety

Reproducing a sequence requires the same seed or serialized state and the same
package version. Serialized generator states use schema version `1`.

This generator is deterministic, not cryptographically secure. Do not use it
for secrets, authentication, security decisions, or wagering.
