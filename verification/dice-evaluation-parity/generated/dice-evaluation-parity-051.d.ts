/* GENERATED FILE. Run node verification/dice-evaluation-parity/generate.mjs; do not edit by hand. */
import type { GeneratorState } from "@drdice/prng";
import type { DieSample, Evaluate, Failure, Success } from "@drdice/dice";

type Equal<Left, Right> =
  (<Value>() => Value extends Left ? 1 : 2) extends
  (<Value>() => Value extends Right ? 1 : 2) ? true : false;
type Assert<Value extends true> = Value;

type Input = Evaluate<"d1+d1+d1+d1+d1", GeneratorState<readonly ["00000001", "00000002", "00000003", "00000004"]>, 1>;
type Expected = Failure<"resource-limit-exceeded", { readonly kind: "resource"; readonly code: "resource-limit-exceeded"; readonly offset: 12; readonly dimension: "dice-term-count"; readonly limit: 4; readonly actual: 5 }>;
export type dice_terms_one_beyond = Assert<Equal<Input, Expected>>;
