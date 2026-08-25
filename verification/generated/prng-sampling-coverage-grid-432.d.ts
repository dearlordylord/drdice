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
type Grid432_0 = Sample<GeneratorState<readonly ["76ff815e", "31127eed", "98c1e915", "cd218f0b"]>, 73, 0>;
type _Grid432_0 = Assert<Equal<Grid432_0, Failure<"sampling-attempts-exhausted", { readonly maximumAttempts: 0; readonly attempts: 0; readonly state: GeneratorState<readonly ["76ff815e", "31127eed", "98c1e915", "cd218f0b"]> }>>>;
