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
type Grid145_0 = Sample<GeneratorState<readonly ["9786256f", "911c67f8", "37883c7a", "7065c3c9"]>, 25, 1>;
type _Grid145_0 = Assert<Equal<Grid145_0, Success<{ readonly value: 17; readonly state: GeneratorState<readonly ["76ff815e", "31127eed", "98c1e915", "cd218f0b"]>; readonly attempts: 1 }>>>;
