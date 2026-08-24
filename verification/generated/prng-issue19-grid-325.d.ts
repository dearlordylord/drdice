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
type Grid325_0 = Sample<GeneratorState<readonly ["00e84e0f", "01c0120e", "103c2609", "4310300a"]>, 66, 0>;
type _Grid325_0 = Assert<Equal<Grid325_0, Failure<"sampling-attempts-exhausted", { readonly maximumAttempts: 0; readonly attempts: 0; readonly state: GeneratorState<readonly ["00e84e0f", "01c0120e", "103c2609", "4310300a"]> }>>>;
