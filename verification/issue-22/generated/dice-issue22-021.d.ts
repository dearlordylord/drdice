/* GENERATED FILE. Run node verification/issue-22/generate.mjs; do not edit by hand. */
import type { GeneratorState } from "@drdice/prng";
import type { DieSample, Evaluate, Failure, Success } from "@drdice/dice";

type Equal<Left, Right> =
  (<Value>() => Value extends Left ? 1 : 2) extends
  (<Value>() => Value extends Right ? 1 : 2) ? true : false;
type Assert<Value extends true> = Value;

type Input = Evaluate<"", GeneratorState<readonly ["00000001", "00000002", "00000003", "00000004"]>, 1>;
type Expected = Failure<"expected-expression", { readonly kind: "syntax"; readonly code: "expected-expression"; readonly offset: 0; readonly found: "eof"; readonly expected: readonly ["dice", "integer", "("] }>;
export type empty_input = Assert<Equal<Input, Expected>>;
