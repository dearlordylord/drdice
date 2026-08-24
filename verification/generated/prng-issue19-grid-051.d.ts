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
type Grid51_0 = Sample<GeneratorState<readonly ["995f11db", "7e83a8ff", "b048a90b", "6e25b059"]>, 9, 3>;
type _Grid51_0 = Assert<Equal<Grid51_0, Success<{ readonly value: 2; readonly state: GeneratorState<readonly ["89f9097d", "5794102f", "2e4646d0", "30c53085"]>; readonly attempts: 1 }>>>;
