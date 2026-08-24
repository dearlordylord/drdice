/* GENERATED FILE. Run pnpm generate:fixtures; do not edit by hand. */
import type {
  Failure,
  GeneratorState,
  Sample,
  Success,
} from "@drdice/prng";

type Equal<Left, Right> =
  (<Value>() => Value extends Left ? 1 : 2) extends
  (<Value>() => Value extends Right ? 1 : 2) ? true : false;
type Assert<Value extends true> = Value;
type Grid162_0 = Sample<GeneratorState<readonly ["b0e8eac3", "f2d79146", "a51937ed", "21243868"]>, 33, 2>;
type _Grid162_0 = Assert<Equal<Grid162_0, Failure<"sampling-attempts-exhausted", { readonly maximumAttempts: 2; readonly attempts: 2; readonly state: GeneratorState<readonly ["1974791a", "3eee5eab", "9550c2c3", "79d7bbd3"]> }>>>;
