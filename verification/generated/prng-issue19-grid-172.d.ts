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
type Grid172_0 = Sample<GeneratorState<readonly ["3320a290", "ebdc5e1d", "90c43618", "e4b42f08"]>, 35, 2>;
type _Grid172_0 = Assert<Equal<Grid172_0, Failure<"sampling-attempts-exhausted", { readonly maximumAttempts: 2; readonly attempts: 2; readonly state: GeneratorState<readonly ["37f8b16b", "6f28b798", "5685570d", "8317705d"]> }>>>;
