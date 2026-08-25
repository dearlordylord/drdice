/* GENERATED FILE. Run node verification/dice-evaluation-parity/generate.mjs; do not edit by hand. */
import type { GeneratorState } from "@drdice/prng";
import type { DieSample, Evaluate, Failure, Success } from "@drdice/dice";

type Equal<Left, Right> =
  (<Value>() => Value extends Left ? 1 : 2) extends
  (<Value>() => Value extends Right ? 1 : 2) ? true : false;
type Assert<Value extends true> = Value;

type Input = Evaluate<"d6 + (2d6 - 1)", GeneratorState<readonly ["00000001", "00000002", "00000003", "00000004"]>, 1>;
type Expected = Success<{ readonly total: 2; readonly rollTrace: readonly [DieSample<6, 1>, DieSample<6, 1>, DieSample<6, 1>]; readonly nextState: GeneratorState<readonly ["01803402", "00003007", "00083e02", "0020280c"]> }>;
export type parenthesized_depth_first = Assert<Equal<Input, Expected>>;
