/* GENERATED FILE. Run node verification/dice-evaluation-parity/generate.mjs; do not edit by hand. */
import type { GeneratorState } from "@drdice/prng";
import type { DieSample, Evaluate, Failure, Success } from "@drdice/dice";

type Equal<Left, Right> =
  (<Value>() => Value extends Left ? 1 : 2) extends
  (<Value>() => Value extends Right ? 1 : 2) ? true : false;
type Assert<Value extends true> = Value;

type Input = Evaluate<"d97", GeneratorState<readonly ["00000001", "00000002", "00000003", "00000004"]>, 1>;
type Expected = Success<{ readonly total: 1; readonly rollTrace: readonly [DieSample<97, 1>]; readonly nextState: GeneratorState<readonly ["00000007", "00000000", "00000402", "00003000"]> }>;
export type Side97 = Assert<Equal<Input, Expected>>;
