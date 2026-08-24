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
type Grid225_0 = Sample<GeneratorState<readonly ["00000007", "00000000", "00000402", "00003000"]>, 46, 0>;
type _Grid225_0 = Assert<Equal<Grid225_0, Failure<"sampling-attempts-exhausted", { readonly maximumAttempts: 0; readonly attempts: 0; readonly state: GeneratorState<readonly ["00000007", "00000000", "00000402", "00003000"]> }>>>;
