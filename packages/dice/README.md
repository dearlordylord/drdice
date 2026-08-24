# @drdice/dice

Deterministic dice-expression evaluation with matching runtime behavior and
literal-computing TypeScript types. It uses `@drdice/prng` for reproducible
randomness.

## Install

```sh
npm install @drdice/prng @drdice/dice
```

Exact literal result types require TypeScript 7.0.2. Inputs known only at
runtime still work normally and receive broader result types.

## Quick start

```ts
import { initialize, stateOf as prngStateOf } from "@drdice/prng";
import { evaluate, rollsOf, stateOf, valueOf } from "@drdice/dice";

const initialized = initialize([
  "00000001",
  "00000002",
  "00000003",
  "00000004",
] as const);

const d20 = evaluate("d20", prngStateOf(initialized));
const value = valueOf(d20);
//    ^? const value: 12

console.log({ value, rolls: rollsOf(d20), nextState: stateOf(d20) });
```

The roll happens at runtime. Because the seed and expression are literals,
TypeScript also computes the exact result. Pass `stateOf(d20)` to the next
evaluation to continue the sequence.

## Expressions and API

`evaluate(source, state, maximumAttempts?)` supports nonnegative integers,
`dS` and `NdS` dice terms, parentheses, and left-associative `+` and `-`.
Examples include `d20`, `4d6 + 3`, and `d6 + (2d6 - 1)`.

Successful results contain the total, the ordered roll trace, and the next
generator state. Use `payloadOf`, `valueOf`, `rollsOf`, and `stateOf` to extract
them. Their type-level counterparts are `Evaluate`, `PayloadOf`, `ValueOf`,
`RollsOf`, and `StateOf`.

Invalid or overly complex expressions return structured failures without
silently consuming state. Check `result.ok` before using an extractor when an
evaluation can fail. Each die receives up to five rejection-sampling attempts
by default; ordinary game code can omit this option.

## Reproducibility and safety

Reproducing a result requires the same generator state, expression, options,
and package versions.

DRDice is deterministic, not cryptographic randomness. Do not use it for
secrets, authentication, security decisions, or wagering.
