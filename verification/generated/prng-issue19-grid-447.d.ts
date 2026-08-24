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
type Grid447_0 = Sample<GeneratorState<readonly ["d23c3415", "c3dc6205", "fa3c080d", "22c0f480"]>, 90, 2>;
type _Grid447_0 = Assert<Equal<Grid447_0, Failure<"sampling-attempts-exhausted", { readonly maximumAttempts: 2; readonly attempts: 2; readonly state: GeneratorState<readonly ["3c48d385", "4838ca95", "1b58ae88", "4388a87b"]> }>>>;
