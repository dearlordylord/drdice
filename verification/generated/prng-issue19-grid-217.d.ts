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
type Grid217_0 = Sample<GeneratorState<readonly ["00e84e0f", "01c0120e", "103c2609", "4310300a"]>, 44, 2>;
type _Grid217_0 = Assert<Equal<Grid217_0, Success<{ readonly value: 24; readonly state: GeneratorState<readonly ["42386c0b", "11147a08", "90f07406", "81102216"]>; readonly attempts: 1 }>>>;
