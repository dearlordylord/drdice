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
type Grid355_0 = Sample<GeneratorState<readonly ["00000001", "00000002", "00000003", "00000004"]>, 72, 0>;
type _Grid355_0 = Assert<Equal<Grid355_0, Failure<"sampling-attempts-exhausted", { readonly maximumAttempts: 0; readonly attempts: 0; readonly state: GeneratorState<readonly ["00000001", "00000002", "00000003", "00000004"]> }>>>;
