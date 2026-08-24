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
type Grid82_0 = Sample<GeneratorState<readonly ["00003007", "00000405", "00000405", "01800000"]>, 17, 2>;
type _Grid82_0 = Assert<Equal<Grid82_0, Success<{ readonly value: 0; readonly state: GeneratorState<readonly ["01803402", "00003007", "00083e02", "0020280c"]>; readonly attempts: 1 }>>>;
