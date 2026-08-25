/* GENERATED FILE. Run node verification/dice-evaluation-parity/generate.mjs; do not edit by hand. */
import type { GeneratorState } from "@drdice/prng";
import type { DieSample, Evaluate, Failure, Success } from "@drdice/dice";

type Equal<Left, Right> =
  (<Value>() => Value extends Left ? 1 : 2) extends
  (<Value>() => Value extends Right ? 1 : 2) ? true : false;
type Assert<Value extends true> = Value;

type Input = Evaluate<"d 6", GeneratorState<readonly ["00000001", "00000002", "00000003", "00000004"]>, 1>;
type Expected = Failure<"expected-die-sides", { readonly kind: "syntax"; readonly code: "expected-die-sides"; readonly offset: 1; readonly found: " "; readonly expected: readonly ["positive-integer"] }>;
export type whitespace_inside_die = Assert<Equal<Input, Expected>>;
