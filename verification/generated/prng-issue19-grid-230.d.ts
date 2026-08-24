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
type Grid230_0 = Sample<GeneratorState<readonly ["42386c0b", "11147a08", "90f07406", "81102216"]>, 47, 0>;
type _Grid230_0 = Assert<Equal<Grid230_0, Failure<"sampling-attempts-exhausted", { readonly maximumAttempts: 0; readonly attempts: 0; readonly state: GeneratorState<readonly ["42386c0b", "11147a08", "90f07406", "81102216"]> }>>>;
