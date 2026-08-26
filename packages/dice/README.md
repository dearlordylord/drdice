# DRDice

Deterministic pseudo-random generation and Dice Expression evaluation with
matching runtime and literal-computing TypeScript APIs, plus runtime Dice Group
Sampling for large dynamic requests.

## Quick start

Exact literal result types require TypeScript 7.0.2.

```sh
npm install @drdice/prng @drdice/dice
```

```ts
import { initialize, stateOf as prngStateOf } from "@drdice/prng";
import { evaluate, rollsOf, sampleDiceGroups, stateOf, valueOf } from "@drdice/dice";

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

const groups = sampleDiceGroups([
  { count: 2, sideCount: 20 },
  { count: 6, sideCount: 6 },
], stateOf(combinedRoll));

if (groups.ok) {
  console.log(groups.value.groups, groups.value.nextState);
}
```

Both calls roll at runtime. Because the seed and expressions are literals,
TypeScript also knows that the results are `12` and `34`—without you
writing either expected result. Passing `stateOf(d20)` continues the same
sequence; reusing an earlier state replays the same rolls.

The lowercase functions run at runtime. Their type counterparts—`Initialize`,
`Sample`, and `Evaluate`—follow the same deterministic rules in TypeScript.
Inputs known only at runtime still roll normally and use broader result types
such as `number` and `EvaluationResult`.

`sampleDiceGroups` is intentionally runtime-only: it serves large dynamic
requests and returns the broad `DiceGroupSamplingResult` type rather than
performing literal computation in the TypeScript checker.

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

For dynamic application requests, `sampleDiceGroups` accepts ordered
`{ count, sideCount }` groups and an explicit Generator State. It validates the
whole request first and returns all grouped faces with one Next Generator State.
Sampling is transactional: failures do not expose a state for callers to commit.
The structured API supports up to 10,000 Die Samples with side counts through
100 and retries bounded rejection-sampling exhaustion in deterministic blocks.

Invalid or overly complex expressions return structured failures. Each die gets
up to five rejection-sampling attempts by default; ordinary game code can omit
this option.

## Reproducibility and safety

The matching PRNG and Dice Expression implementations, and the runtime Dice
Group Sampling implementation, are checked against independent deterministic
oracles. Reproducing a result requires the same package versions, seed or
Generator State, request, and options.

DRDice is deterministic, not cryptographic randomness. Use it for games,
simulations, and tests—not secrets, security decisions, or wagering.
