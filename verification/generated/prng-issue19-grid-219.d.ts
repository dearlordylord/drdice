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
type Grid219_0 = Sample<GeneratorState<readonly ["d23c3415", "c3dc6205", "fa3c080d", "22c0f480"]>, 44, 4>;
type _Grid219_0 = Assert<Equal<Grid219_0, Success<{ readonly value: 5; readonly state: GeneratorState<readonly ["dbc776ae", "0e5551fe", "3012d666", "fe3e2f61"]>; readonly attempts: 4 }>>>;
