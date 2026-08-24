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
type Grid99_0 = Sample<GeneratorState<readonly ["e83c194b", "b7818bc1", "fb0d50b6", "8369c2d9"]>, 17, 3>;
type _Grid99_0 = Assert<Equal<Grid99_0, Success<{ readonly value: 11; readonly state: GeneratorState<readonly ["dcd45053", "a4b0c23c", "1026cbfd", "4248c1a7"]>; readonly attempts: 1 }>>>;
