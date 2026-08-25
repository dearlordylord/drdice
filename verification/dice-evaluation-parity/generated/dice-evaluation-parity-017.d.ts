/* GENERATED FILE. Run node verification/dice-evaluation-parity/generate.mjs; do not edit by hand. */
import type { GeneratorState } from "@drdice/prng";
import type { DieSample, Evaluate, Failure, Success } from "@drdice/dice";

type Equal<Left, Right> =
  (<Value>() => Value extends Left ? 1 : 2) extends
  (<Value>() => Value extends Right ? 1 : 2) ? true : false;
type Assert<Value extends true> = Value;

type Input = Evaluate<"d1", GeneratorState<readonly ["00000001", "00000002", "00000003", "00000004"]>, 4>;
type Expected = Success<{ readonly total: 1; readonly rollTrace: readonly [DieSample<1, 1>]; readonly nextState: GeneratorState<readonly ["00000007", "00000000", "00000402", "00003000"]> }>;
export type sample_attempt_fuel_four = Assert<Equal<Input, Expected>>;
