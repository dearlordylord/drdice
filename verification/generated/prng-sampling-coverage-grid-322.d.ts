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
type Grid322_0 = Sample<GeneratorState<readonly ["3a2c53c8", "68425992", "ad76e3ae", "c01cdf37"]>, 54, 4>;
type _Grid322_0 = Assert<Equal<Grid322_0, Success<{ readonly value: 53; readonly state: GeneratorState<readonly ["9272d56d", "ff18e9f4", "13e99466", "f4352d42"]>; readonly attempts: 1 }>>>;
