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
type Grid516_0 = Sample<GeneratorState<readonly ["dcd45053", "a4b0c23c", "1026cbfd", "4248c1a7"]>, 87, 0>;
type _Grid516_0 = Assert<Equal<Grid516_0, Failure<"sampling-attempts-exhausted", { readonly maximumAttempts: 0; readonly attempts: 0; readonly state: GeneratorState<readonly ["dcd45053", "a4b0c23c", "1026cbfd", "4248c1a7"]> }>>>;
