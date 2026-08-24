/* GENERATED FILE. Run node verification/issue-22/generate.mjs; do not edit by hand. */
import type { GeneratorState } from "@drdice/prng";
import type { DieSample, Evaluate, Failure, Success } from "@drdice/dice";

type Equal<Left, Right> =
  (<Value>() => Value extends Left ? 1 : 2) extends
  (<Value>() => Value extends Right ? 1 : 2) ? true : false;
type Assert<Value extends true> = Value;

type Input = Evaluate<"d1", GeneratorState<readonly ["00000001", "00000002", "00000003", "00000004"]>, 0>;
type Expected = Failure<"sampling-attempts-exhausted", { readonly kind: "evaluation"; readonly code: "sampling-attempts-exhausted"; readonly offset: 0; readonly maximumAttempts: 0; readonly attempts: 0; readonly partialTrace: readonly []; readonly nextState: GeneratorState<readonly ["00000001", "00000002", "00000003", "00000004"]> }>;
export type sample_attempt_fuel_zero = Assert<Equal<Input, Expected>>;
