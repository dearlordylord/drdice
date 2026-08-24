/* GENERATED FILE. Run node verification/issue-22/generate.mjs; do not edit by hand. */
import type { GeneratorState } from "@drdice/prng";
import type { DieSample, Evaluate, Failure, Success } from "@drdice/dice";

type Equal<Left, Right> =
  (<Value>() => Value extends Left ? 1 : 2) extends
  (<Value>() => Value extends Right ? 1 : 2) ? true : false;
type Assert<Value extends true> = Value;

type Input = Evaluate<"d1", GeneratorState<readonly ["00000000", "00000000", "00000000", "00000000"]>, 1>;
type Expected = Failure<"invalid-state-zero", { readonly state: GeneratorState<readonly ["00000000", "00000000", "00000000", "00000000"]>; readonly partialTrace: []; readonly successorState: null }>;
export type invalid_state_zero = Assert<Equal<Input, Expected>>;
