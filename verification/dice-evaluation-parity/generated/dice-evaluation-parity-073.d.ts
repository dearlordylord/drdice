/* GENERATED FILE. Run node verification/dice-evaluation-parity/generate.mjs; do not edit by hand. */
import type { GeneratorState } from "@drdice/prng";
import type { DieSample, Evaluate, Failure, Success } from "@drdice/dice";

type Equal<Left, Right> =
  (<Value>() => Value extends Left ? 1 : 2) extends
  (<Value>() => Value extends Right ? 1 : 2) ? true : false;
type Assert<Value extends true> = Value;

type Input = Evaluate<"d6", GeneratorState<readonly ["00000000", "00000000", "ffffffff", "00000000"]>, 0>;
type Expected = Failure<"sampling-attempts-exhausted", { readonly kind: "evaluation"; readonly code: "sampling-attempts-exhausted"; readonly offset: 0; readonly maximumAttempts: 0; readonly attempts: 0; readonly partialTrace: readonly []; readonly nextState: GeneratorState<readonly ["00000000", "00000000", "ffffffff", "00000000"]> }>;
export type forced_zero_fuel = Assert<Equal<Input, Expected>>;
