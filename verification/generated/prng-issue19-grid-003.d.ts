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
type Grid3_0 = Sample<GeneratorState<readonly ["76ff815e", "31127eed", "98c1e915", "cd218f0b"]>, 1, 3>;
type _Grid3_0 = Assert<Equal<Grid3_0, Success<{ readonly value: 0; readonly state: GeneratorState<readonly ["8acc70b8", "df2c16a6", "cac3b24b", "9f8f37e1"]>; readonly attempts: 1 }>>>;
