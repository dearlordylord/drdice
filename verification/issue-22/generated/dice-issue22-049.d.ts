/* GENERATED FILE. Run node verification/issue-22/generate.mjs; do not edit by hand. */
import type { GeneratorState } from "@drdice/prng";
import type { DieSample, Evaluate, Failure, Success } from "@drdice/dice";

type Equal<Left, Right> =
  (<Value>() => Value extends Left ? 1 : 2) extends
  (<Value>() => Value extends Right ? 1 : 2) ? true : false;
type Assert<Value extends true> = Value;

type Input = Evaluate<"1+1+1+1+1+1+1+1", GeneratorState<readonly ["00000001", "00000002", "00000003", "00000004"]>, 1>;
type Expected = Success<{ readonly total: 8; readonly rollTrace: []; readonly successorState: GeneratorState<readonly ["00000001", "00000002", "00000003", "00000004"]> }>;
export type ast_nodes_at_limit = Assert<Equal<Input, Expected>>;
