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
type Grid165_0 = Sample<GeneratorState<readonly ["dcd45053", "a4b0c23c", "1026cbfd", "4248c1a7"]>, 28, 3>;
type _Grid165_0 = Assert<Equal<Grid165_0, Success<{ readonly value: 17; readonly state: GeneratorState<readonly ["3a2c53c8", "68425992", "ad76e3ae", "c01cdf37"]>; readonly attempts: 1 }>>>;
