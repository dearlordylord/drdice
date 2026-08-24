/* GENERATED FILE. Run node verification/issue-22/generate.mjs; do not edit by hand. */
import type { GeneratorState } from "@drdice/prng";
import type { DieSample, Evaluate, Failure, Success } from "@drdice/dice";

type Equal<Left, Right> =
  (<Value>() => Value extends Left ? 1 : 2) extends
  (<Value>() => Value extends Right ? 1 : 2) ? true : false;
type Assert<Value extends true> = Value;

type Input = Evaluate<"8d5", GeneratorState<readonly ["f6d4d22f", "179359c2", "e89fce39", "dc482244"]>, 4>;
type Expected = Failure<"resource-limit-exceeded", { readonly kind: "resource"; readonly code: "resource-limit-exceeded"; readonly offset: 0; readonly dimension: "evaluation-steps"; readonly limit: 24; readonly actual: 25; readonly partialTrace: [DieSample<5, 4>, DieSample<5, 5>, DieSample<5, 2>, DieSample<5, 2>, DieSample<5, 4>, DieSample<5, 2>, DieSample<5, 5>, DieSample<5, 4>]; readonly successorState: GeneratorState<readonly ["c22deee4", "3c929a21", "36861b80", "ea3ff13a"]> }>;
export type post_consumption_dynamic_steps = Assert<Equal<Input, Expected>>;
