/* GENERATED FILE. Run node verification/dice-arithmetic-parity/generate.mjs; do not edit by hand. */
import type { GeneratorState } from "@drdice/prng";
import type { Evaluate, Failure, Success } from "@drdice/dice";

type Equal<Left, Right> =
  (<Value>() => Value extends Left ? 1 : 2) extends
  (<Value>() => Value extends Right ? 1 : 2) ? true : false;
type Assert<Value extends true> = Value;

type Input = Evaluate<"8d1+((1+1+1))", GeneratorState<readonly ["00000001", "00000002", "00000003", "00000004"]>, 1>;
type Expected = Failure<"resource-limit-exceeded", { readonly kind: "resource"; readonly code: "resource-limit-exceeded"; readonly offset: 10; readonly dimension: "evaluation-steps"; readonly limit: 24; readonly actual: 25 }>;
export type evaluation_steps_one_beyond = Assert<Equal<Input, Expected>>;
