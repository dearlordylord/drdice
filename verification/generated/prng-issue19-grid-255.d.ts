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
type Grid255_0 = Sample<GeneratorState<readonly ["d23c3415", "c3dc6205", "fa3c080d", "22c0f480"]>, 52, 0>;
type _Grid255_0 = Assert<Equal<Grid255_0, Failure<"sampling-attempts-exhausted", { readonly maximumAttempts: 0; readonly attempts: 0; readonly state: GeneratorState<readonly ["d23c3415", "c3dc6205", "fa3c080d", "22c0f480"]> }>>>;
