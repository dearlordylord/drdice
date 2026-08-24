/* GENERATED FILE. Run node verification/issue-21/generate.mjs; do not edit by hand. */
import type { GeneratorState } from "@drdice/prng";
import type { Evaluate, Failure, Success } from "@drdice/dice";

type Equal<Left, Right> =
  (<Value>() => Value extends Left ? 1 : 2) extends
  (<Value>() => Value extends Right ? 1 : 2) ? true : false;
type Assert<Value extends true> = Value;

type Input = Evaluate<"d1", { readonly kind: "GeneratorState"; readonly words: readonly ["0000000A", "00000000", "00000000", "00000001"] }, 1>;
type Expected = Failure<"invalid-state-word", { readonly state: { readonly kind: "GeneratorState"; readonly words: readonly ["0000000A", "00000000", "00000000", "00000001"] }; readonly partialTrace: readonly []; readonly nextState: null }>;
export type invalid_state_word = Assert<Equal<Input, Expected>>;
