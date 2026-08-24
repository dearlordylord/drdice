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
type Grid60_0 = Sample<GeneratorState<readonly ["e83c194b", "b7818bc1", "fb0d50b6", "8369c2d9"]>, 11, 0>;
type _Grid60_0 = Assert<Equal<Grid60_0, Failure<"sampling-attempts-exhausted", { readonly maximumAttempts: 0; readonly attempts: 0; readonly state: GeneratorState<readonly ["e83c194b", "b7818bc1", "fb0d50b6", "8369c2d9"]> }>>>;
