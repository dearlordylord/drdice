/* GENERATED FILE. Run node verification/dice-arithmetic-parity/generate.mjs; do not edit by hand. */
import type { GeneratorState } from "@drdice/prng";
import type { Evaluate, Failure, Success } from "@drdice/dice";

type Equal<Left, Right> =
  (<Value>() => Value extends Left ? 1 : 2) extends
  (<Value>() => Value extends Right ? 1 : 2) ? true : false;
type Assert<Value extends true> = Value;

type Input = Evaluate<"1.5", GeneratorState<readonly ["00000001", "00000002", "00000003", "00000004"]>, 1>;
type Expected = Failure<"unexpected-token", { readonly kind: "syntax"; readonly code: "unexpected-token"; readonly offset: 1; readonly found: "."; readonly expected: readonly ["+", "-", "EOF"] }>;
export type decimal_token = Assert<Equal<Input, Expected>>;
