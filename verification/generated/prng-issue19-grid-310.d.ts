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
type Grid310_0 = Sample<GeneratorState<readonly ["00003007", "00000405", "00000405", "01800000"]>, 63, 0>;
type _Grid310_0 = Assert<Equal<Grid310_0, Failure<"sampling-attempts-exhausted", { readonly maximumAttempts: 0; readonly attempts: 0; readonly state: GeneratorState<readonly ["00003007", "00000405", "00000405", "01800000"]> }>>>;
