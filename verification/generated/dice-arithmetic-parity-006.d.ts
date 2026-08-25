/* GENERATED FILE. Run node verification/dice-arithmetic-parity/generate.mjs; do not edit by hand. */
import type { GeneratorState } from "@drdice/prng";
import type { Evaluate, Failure, Success } from "@drdice/dice";

type Equal<Left, Right> =
  (<Value>() => Value extends Left ? 1 : 2) extends
  (<Value>() => Value extends Right ? 1 : 2) ? true : false;
type Assert<Value extends true> = Value;

type Input = Evaluate<" \t\r\n", GeneratorState<readonly ["00000001", "00000002", "00000003", "00000004"]>, 1>;
type Expected = Failure<"expected-expression", { readonly kind: "syntax"; readonly code: "expected-expression"; readonly offset: 4; readonly found: "eof"; readonly expected: readonly ["dice", "integer", "("] }>;
export type whitespace_only = Assert<Equal<Input, Expected>>;
