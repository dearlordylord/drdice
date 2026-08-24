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
type Grid398_0 = Sample<GeneratorState<readonly ["42386c0b", "11147a08", "90f07406", "81102216"]>, 80, 3>;
type _Grid398_0 = Assert<Equal<Grid398_0, Success<{ readonly value: 38; readonly state: GeneratorState<readonly ["d23c3415", "c3dc6205", "fa3c080d", "22c0f480"]>; readonly attempts: 1 }>>>;
