/* GENERATED FILE. Run node verification/issue-22/generate.mjs; do not edit by hand. */
import type { GeneratorState } from "@drdice/prng";
import type { DieSample, Evaluate, Failure, Success } from "@drdice/dice";

type Equal<Left, Right> =
  (<Value>() => Value extends Left ? 1 : 2) extends
  (<Value>() => Value extends Right ? 1 : 2) ? true : false;
type Assert<Value extends true> = Value;

type Input = Evaluate<"d7", GeneratorState<readonly ["b0e8eac3", "f2d79146", "a51937ed", "21243868"]>, 2>;
type Expected = Success<{ readonly total: 7; readonly rollTrace: [DieSample<7, 7>]; readonly successorState: GeneratorState<readonly ["1974791a", "3eee5eab", "9550c2c3", "79d7bbd3"]> }>;
export type forced_rejection_then_acceptance = Assert<Equal<Input, Expected>>;
