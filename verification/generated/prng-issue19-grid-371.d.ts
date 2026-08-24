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
type Grid371_0 = Sample<GeneratorState<readonly ["01803402", "00003007", "00083e02", "0020280c"]>, 75, 1>;
type _Grid371_0 = Assert<Equal<Grid371_0, Success<{ readonly value: 2; readonly state: GeneratorState<readonly ["01a02c09", "01883a07", "01e80400", "00c05801"]>; readonly attempts: 1 }>>>;
