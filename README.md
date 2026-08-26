# Doctor Dice: Deterministic Random Type-level Dice

Deterministic pseudo-random generation and dice-expression evaluation with
matching runtime and literal-computing TypeScript APIs.

## Quick start

Exact literal result types require TypeScript 7.0.2.

```sh
npm install @drdice/prng @drdice/dice
```

```ts
import { initialize, stateOf as prngStateOf } from "@drdice/prng";
import { evaluate, rollsOf, stateOf, valueOf } from "@drdice/dice";

// A fixed seed makes the sequence reproducible.
const initialized = initialize([
  "00000001",
  "00000002",
  "00000003",
  "00000004",
] as const);

const d20 = evaluate("d20", prngStateOf(initialized));
const d20Value = valueOf(d20);
//    ^? const d20Value: 12

const combinedRoll = evaluate(`4d6 + ${d20Value}`, stateOf(d20));
const combinedValue = valueOf(combinedRoll);
//    ^? const combinedValue: 34

console.log({
  value: combinedValue,
  rolls: rollsOf(combinedRoll), // faces 5, 6, 6, 5
  nextState: stateOf(combinedRoll),
});
```

Both calls roll at runtime. Because the seed and expressions are literals,
TypeScript also knows that the results are `12` and `34`—without you
writing either expected result. Passing `stateOf(d20)` continues the same
sequence; reusing an earlier state replays the same rolls.

The lowercase functions run at runtime. Their type counterparts—`Initialize`,
`Sample`, and `Evaluate`—follow the same deterministic rules in TypeScript.
Inputs known only at runtime still roll normally and use broader result types
such as `number` and `EvaluationResult`.

## Seeds and replay

Pass four eight-digit lowercase hexadecimal words to `initialize` for a
reproducible sequence. Call `randomSeed()` when you want the host to create a
fresh seed.

DRDice never mutates a generator state. After a successful evaluation, pass
`stateOf(result)` to the next `evaluate` call. Check `result.ok` before using
the extractor functions when an evaluation can fail.

## Core API

`@drdice/prng` exposes `randomSeed`, `initialize`, `validateState`, `next`,
`sample`, and state/replay helpers, with compile-time counterparts `Initialize`,
`ValidateState`, `Next`, and `Sample`.

`@drdice/dice` exposes `evaluate` for expressions such as `d20`, `4d6 + 3`, and
`d6 + (2d6 - 1)`. Use `valueOf`, `rollsOf`, and `stateOf` after a successful
evaluation; `ValueOf`, `RollsOf`, and `StateOf` provide the matching type-level
projections.

Invalid or overly complex expressions return structured failures. Each die gets
up to five rejection-sampling attempts by default; ordinary game code can omit
this option.

## Reproducibility and safety

The runtime and type-level implementations are checked against the same
deterministic examples. Reproducing a result requires the same package versions,
seed or generator state, dice expression, and options.

DRDice is deterministic, not cryptographic randomness. Use it for games,
simulations, and tests—not secrets, security decisions, or wagering.

## Development

```sh
pnpm install --frozen-lockfile
pnpm verify
```

Runtime source lives in `packages/*/src/index.ts`, and compile-time computation
lives in `packages/*/src/types.ts`. `pnpm build` compiles both into the ignored
`packages/*/dist` output. Package packing runs that build automatically.

Maintainer qualification and publishing steps are documented in the
[release guide](verification/release/README.md).
