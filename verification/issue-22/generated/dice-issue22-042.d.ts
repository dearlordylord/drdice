/* GENERATED FILE. Run node verification/issue-22/generate.mjs; do not edit by hand. */
import type { GeneratorState } from "@drdice/prng";
import type { DieSample, Evaluate, Failure, Success } from "@drdice/dice";

type Equal<Left, Right> =
  (<Value>() => Value extends Left ? 1 : 2) extends
  (<Value>() => Value extends Right ? 1 : 2) ? true : false;
type Assert<Value extends true> = Value;

type Input = Evaluate<"d101 + d0", GeneratorState<readonly ["00000001", "00000002", "00000003", "00000004"]>, 1>;
type Expected = Failure<"side-count-zero", { readonly kind: "domain"; readonly code: "side-count-zero"; readonly offset: 8; readonly subject: "side-count"; readonly value: "0" }>;
export type domain_beats_supported_side = Assert<Equal<Input, Expected>>;
