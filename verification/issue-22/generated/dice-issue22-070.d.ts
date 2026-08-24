/* GENERATED FILE. Run node verification/issue-22/generate.mjs; do not edit by hand. */
import type { GeneratorState } from "@drdice/prng";
import type { DieSample, Evaluate, Failure, Success } from "@drdice/dice";

type Equal<Left, Right> =
  (<Value>() => Value extends Left ? 1 : 2) extends
  (<Value>() => Value extends Right ? 1 : 2) ? true : false;
type Assert<Value extends true> = Value;

type Input = Evaluate<"d6 + d6", GeneratorState<readonly ["00000000", "00000000", "ffffffff", "00000000"]>, 1>;
type Expected = Failure<"sampling-attempts-exhausted", { readonly kind: "evaluation"; readonly code: "sampling-attempts-exhausted"; readonly offset: 5; readonly maximumAttempts: 1; readonly attempts: 1; readonly partialTrace: [DieSample<6, 1>]; readonly successorState: GeneratorState<readonly ["ffffffff", "00000000", "000001ff", "ffffffff"]> }>;
export type post_consumption_sampling_exhaustion = Assert<Equal<Input, Expected>>;
