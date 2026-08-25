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
type Grid402_0 = Sample<GeneratorState<readonly ["995f11db", "7e83a8ff", "b048a90b", "6e25b059"]>, 68, 0>;
type _Grid402_0 = Assert<Equal<Grid402_0, Failure<"sampling-attempts-exhausted", { readonly maximumAttempts: 0; readonly attempts: 0; readonly state: GeneratorState<readonly ["995f11db", "7e83a8ff", "b048a90b", "6e25b059"]> }>>>;
