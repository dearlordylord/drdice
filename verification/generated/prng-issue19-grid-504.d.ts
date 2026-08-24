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
type Grid504_0 = Sample<GeneratorState<readonly ["3a2c53c8", "68425992", "ad76e3ae", "c01cdf37"]>, 85, 0>;
type _Grid504_0 = Assert<Equal<Grid504_0, Failure<"sampling-attempts-exhausted", { readonly maximumAttempts: 0; readonly attempts: 0; readonly state: GeneratorState<readonly ["3a2c53c8", "68425992", "ad76e3ae", "c01cdf37"]> }>>>;
