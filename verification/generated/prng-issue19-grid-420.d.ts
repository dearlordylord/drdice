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
type Grid420_0 = Sample<GeneratorState<readonly ["01a02c09", "01883a07", "01e80400", "00c05801"]>, 85, 0>;
type _Grid420_0 = Assert<Equal<Grid420_0, Failure<"sampling-attempts-exhausted", { readonly maximumAttempts: 0; readonly attempts: 0; readonly state: GeneratorState<readonly ["01a02c09", "01883a07", "01e80400", "00c05801"]> }>>>;
