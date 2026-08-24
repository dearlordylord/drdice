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
type Grid408_0 = Sample<GeneratorState<readonly ["01a02c09", "01883a07", "01e80400", "00c05801"]>, 82, 3>;
type _Grid408_0 = Assert<Equal<Grid408_0, Success<{ readonly value: 60; readonly state: GeneratorState<readonly ["00e84e0f", "01c0120e", "103c2609", "4310300a"]>; readonly attempts: 1 }>>>;
