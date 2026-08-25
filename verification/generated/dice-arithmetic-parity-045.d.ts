/* GENERATED FILE. Run node verification/dice-arithmetic-parity/generate.mjs; do not edit by hand. */
import type { GeneratorState } from "@drdice/prng";
import type { Evaluate, Failure, Success } from "@drdice/dice";

type Equal<Left, Right> =
  (<Value>() => Value extends Left ? 1 : 2) extends
  (<Value>() => Value extends Right ? 1 : 2) ? true : false;
type Assert<Value extends true> = Value;

type Input = Evaluate<"d1", GeneratorState<readonly ["00000001", "00000002", "00000003", "00000004"]>, 6>;
type Expected = Failure<"resource-limit-exceeded", { readonly kind: "resource"; readonly code: "resource-limit-exceeded"; readonly offset: 0; readonly dimension: "rejection-sampling-attempts"; readonly limit: 5; readonly actual: 6 }>;
export type rejection_fuel_one_beyond = Assert<Equal<Input, Expected>>;
