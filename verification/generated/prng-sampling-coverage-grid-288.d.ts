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
type Grid288_0 = Sample<GeneratorState<readonly ["9786256f", "911c67f8", "37883c7a", "7065c3c9"]>, 49, 0>;
type _Grid288_0 = Assert<Equal<Grid288_0, Failure<"sampling-attempts-exhausted", { readonly maximumAttempts: 0; readonly attempts: 0; readonly state: GeneratorState<readonly ["9786256f", "911c67f8", "37883c7a", "7065c3c9"]> }>>>;
