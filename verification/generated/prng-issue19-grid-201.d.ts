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
type Grid201_0 = Sample<GeneratorState<readonly ["8615d1a1", "16f6c103", "cbc1fbff", "055c3220"]>, 34, 3>;
type _Grid201_0 = Assert<Equal<Grid201_0, Success<{ readonly value: 27; readonly state: GeneratorState<readonly ["95bf2282", "5b22eb5d", "a0562c5e", "5799189d"]>; readonly attempts: 1 }>>>;
