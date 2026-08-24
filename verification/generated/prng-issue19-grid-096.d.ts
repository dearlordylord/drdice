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
type Grid96_0 = Sample<GeneratorState<readonly ["b0e8eac3", "f2d79146", "a51937ed", "21243868"]>, 17, 0>;
type _Grid96_0 = Assert<Equal<Grid96_0, Failure<"sampling-attempts-exhausted", { readonly maximumAttempts: 0; readonly attempts: 0; readonly state: GeneratorState<readonly ["b0e8eac3", "f2d79146", "a51937ed", "21243868"]> }>>>;
