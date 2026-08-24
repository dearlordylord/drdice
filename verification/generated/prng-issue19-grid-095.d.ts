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
type Grid95_0 = Sample<GeneratorState<readonly ["01803402", "00003007", "00083e02", "0020280c"]>, 20, 0>;
type _Grid95_0 = Assert<Equal<Grid95_0, Failure<"sampling-attempts-exhausted", { readonly maximumAttempts: 0; readonly attempts: 0; readonly state: GeneratorState<readonly ["01803402", "00003007", "00083e02", "0020280c"]> }>>>;
