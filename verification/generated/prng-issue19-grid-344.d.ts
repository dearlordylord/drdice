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
type Grid344_0 = Sample<GeneratorState<readonly ["8615d1a1", "16f6c103", "cbc1fbff", "055c3220"]>, 58, 2>;
type _Grid344_0 = Assert<Equal<Grid344_0, Success<{ readonly value: 43; readonly state: GeneratorState<readonly ["95bf2282", "5b22eb5d", "a0562c5e", "5799189d"]>; readonly attempts: 1 }>>>;
