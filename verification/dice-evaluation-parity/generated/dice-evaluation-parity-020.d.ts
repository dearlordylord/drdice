/* GENERATED FILE. Run node verification/dice-evaluation-parity/generate.mjs; do not edit by hand. */
import type { GeneratorState } from "@drdice/prng";
import type { DieSample, Evaluate, Failure, Success } from "@drdice/dice";

type Equal<Left, Right> =
  (<Value>() => Value extends Left ? 1 : 2) extends
  (<Value>() => Value extends Right ? 1 : 2) ? true : false;
type Assert<Value extends true> = Value;

type Input = Evaluate<"8d5", GeneratorState<readonly ["f6d4d22f", "179359c2", "e89fce39", "dc482244"]>, 4>;
type Expected = Success<{ readonly total: 24; readonly rollTrace: readonly [DieSample<5, 4>, DieSample<5, 5>, DieSample<5, 2>, DieSample<5, 1>, DieSample<5, 2>, DieSample<5, 4>, DieSample<5, 1>, DieSample<5, 5>]; readonly nextState: GeneratorState<readonly ["5032e3d1", "0b10a7db", "3a2a5e28", "c19115ca"]> }>;
export type post_consumption_dynamic_steps = Assert<Equal<Input, Expected>>;
