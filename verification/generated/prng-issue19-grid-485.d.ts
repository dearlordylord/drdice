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
type Grid485_0 = Sample<GeneratorState<readonly ["8acc70b8", "df2c16a6", "cac3b24b", "9f8f37e1"]>, 81, 5>;
type _Grid485_0 = Assert<Equal<Grid485_0, Success<{ readonly value: 47; readonly state: GeneratorState<readonly ["ca6f51ff", "9f23d455", "18228ef3", "190a3a05"]>; readonly attempts: 1 }>>>;
