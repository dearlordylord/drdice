/* GENERATED FILE. Run node verification/issue-21/generate.mjs; do not edit by hand. */
import type { GeneratorState } from "@drdice/prng";
import type { Evaluate, Failure, Success } from "@drdice/dice";

type Equal<Left, Right> =
  (<Value>() => Value extends Left ? 1 : 2) extends
  (<Value>() => Value extends Right ? 1 : 2) ? true : false;
type Assert<Value extends true> = Value;

type Input = Evaluate<"01", GeneratorState<readonly ["00000001", "00000002", "00000003", "00000004"]>, 1>;
type Expected = Failure<"leading-zero", { readonly kind: "syntax"; readonly code: "leading-zero"; readonly offset: 0; readonly found: "1"; readonly expected: readonly ["canonical-integer"] }>;
export type leading_zero_integer = Assert<Equal<Input, Expected>>;
