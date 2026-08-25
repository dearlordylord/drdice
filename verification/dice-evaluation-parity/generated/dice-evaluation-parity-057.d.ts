/* GENERATED FILE. Run node verification/dice-evaluation-parity/generate.mjs; do not edit by hand. */
import type { GeneratorState } from "@drdice/prng";
import type { DieSample, Evaluate, Failure, Success } from "@drdice/dice";

type Equal<Left, Right> =
  (<Value>() => Value extends Left ? 1 : 2) extends
  (<Value>() => Value extends Right ? 1 : 2) ? true : false;
type Assert<Value extends true> = Value;

type Input = Evaluate<"60 + 60", GeneratorState<readonly ["00000001", "00000002", "00000003", "00000004"]>, 1>;
type Expected = Failure<"resource-limit-exceeded", { readonly kind: "resource"; readonly code: "resource-limit-exceeded"; readonly offset: 3; readonly dimension: "arithmetic-magnitude"; readonly limit: 100; readonly actual: 120 }>;
export type constant_arithmetic_preflight = Assert<Equal<Input, Expected>>;
