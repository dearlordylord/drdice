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
type Grid272_0 = Sample<GeneratorState<readonly ["00000001", "00000002", "00000003", "00000004"]>, 55, 2>;
type _Grid272_0 = Assert<Equal<Grid272_0, Success<{ readonly value: 0; readonly state: GeneratorState<readonly ["00000007", "00000000", "00000402", "00003000"]>; readonly attempts: 1 }>>>;
