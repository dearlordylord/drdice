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
type Grid336_0 = Sample<GeneratorState<readonly ["9272d56d", "ff18e9f4", "13e99466", "f4352d42"]>, 57, 0>;
type _Grid336_0 = Assert<Equal<Grid336_0, Failure<"sampling-attempts-exhausted", { readonly maximumAttempts: 0; readonly attempts: 0; readonly state: GeneratorState<readonly ["9272d56d", "ff18e9f4", "13e99466", "f4352d42"]> }>>>;
