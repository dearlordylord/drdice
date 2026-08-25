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
type Grid304_0 = Sample<GeneratorState<readonly ["b0e8eac3", "f2d79146", "a51937ed", "21243868"]>, 51, 4>;
type _Grid304_0 = Assert<Equal<Grid304_0, Success<{ readonly value: 36; readonly state: GeneratorState<readonly ["631b43ed", "e7264c68", "bad3512e", "9d49769f"]>; readonly attempts: 1 }>>>;
