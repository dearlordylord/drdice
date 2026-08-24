/* GENERATED FILE. Run node verification/issue-22/generate.mjs; do not edit by hand. */
import type { GeneratorState } from "@drdice/prng";
import type { DieSample, Evaluate, Failure, Success } from "@drdice/dice";

type Equal<Left, Right> =
  (<Value>() => Value extends Left ? 1 : 2) extends
  (<Value>() => Value extends Right ? 1 : 2) ? true : false;
type Assert<Value extends true> = Value;

type Input = Evaluate<"d6)", GeneratorState<readonly ["00000001", "00000002", "00000003", "00000004"]>, 1>;
type Expected = Failure<"unexpected-token", { readonly kind: "syntax"; readonly code: "unexpected-token"; readonly offset: 2; readonly found: ")"; readonly expected: readonly ["EOF"] }>;
export type unmatched_closing_parenthesis = Assert<Equal<Input, Expected>>;
