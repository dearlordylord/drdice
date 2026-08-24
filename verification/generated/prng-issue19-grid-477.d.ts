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
type Grid477_0 = Sample<GeneratorState<readonly ["00000007", "00000000", "00000402", "00003000"]>, 96, 2>;
type _Grid477_0 = Assert<Equal<Grid477_0, Success<{ readonly value: 0; readonly state: GeneratorState<readonly ["00003007", "00000405", "00000405", "01800000"]>; readonly attempts: 1 }>>>;
