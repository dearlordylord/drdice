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
type Grid400_0 = Sample<GeneratorState<readonly ["3320a290", "ebdc5e1d", "90c43618", "e4b42f08"]>, 81, 0>;
type _Grid400_0 = Assert<Equal<Grid400_0, Failure<"sampling-attempts-exhausted", { readonly maximumAttempts: 0; readonly attempts: 0; readonly state: GeneratorState<readonly ["3320a290", "ebdc5e1d", "90c43618", "e4b42f08"]> }>>>;
