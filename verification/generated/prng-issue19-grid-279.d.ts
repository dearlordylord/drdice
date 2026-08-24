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
type Grid279_0 = Sample<GeneratorState<readonly ["d23c3415", "c3dc6205", "fa3c080d", "22c0f480"]>, 56, 4>;
type _Grid279_0 = Assert<Equal<Grid279_0, Success<{ readonly value: 55; readonly state: GeneratorState<readonly ["3320a290", "ebdc5e1d", "90c43618", "e4b42f08"]>; readonly attempts: 1 }>>>;
