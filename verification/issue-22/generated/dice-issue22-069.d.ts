/* GENERATED FILE. Run node verification/issue-22/generate.mjs; do not edit by hand. */
import type { GeneratorState } from "@drdice/prng";
import type { DieSample, Evaluate, Failure, Success } from "@drdice/dice";

type Equal<Left, Right> =
  (<Value>() => Value extends Left ? 1 : 2) extends
  (<Value>() => Value extends Right ? 1 : 2) ? true : false;
type Assert<Value extends true> = Value;

type Input = Evaluate<"d1", GeneratorState<readonly ["00000001", "00000002", "00000003", "00000004"]>, -1>;
type Expected = Failure<"invalid-attempt-fuel", { readonly maximumAttempts: -1; readonly partialTrace: []; readonly nextState: GeneratorState<readonly ["00000001", "00000002", "00000003", "00000004"]> }>;
export type invalid_fuel_negative = Assert<Equal<Input, Expected>>;
