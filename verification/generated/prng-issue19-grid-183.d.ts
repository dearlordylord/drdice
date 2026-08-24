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
type Grid183_0 = Sample<GeneratorState<readonly ["d23c3415", "c3dc6205", "fa3c080d", "22c0f480"]>, 37, 3>;
type _Grid183_0 = Assert<Equal<Grid183_0, Failure<"sampling-attempts-exhausted", { readonly maximumAttempts: 3; readonly attempts: 3; readonly state: GeneratorState<readonly ["37f8b16b", "6f28b798", "5685570d", "8317705d"]> }>>>;
