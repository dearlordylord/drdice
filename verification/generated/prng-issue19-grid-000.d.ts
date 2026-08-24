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
type Grid0_0 = Sample<GeneratorState<readonly ["89f9097d", "5794102f", "2e4646d0", "30c53085"]>, 1, 0>;
type _Grid0_0 = Assert<Equal<Grid0_0, Failure<"sampling-attempts-exhausted", { readonly maximumAttempts: 0; readonly attempts: 0; readonly state: GeneratorState<readonly ["89f9097d", "5794102f", "2e4646d0", "30c53085"]> }>>>;
