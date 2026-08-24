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
type Grid240_0 = Sample<GeneratorState<readonly ["8615d1a1", "16f6c103", "cbc1fbff", "055c3220"]>, 41, 0>;
type _Grid240_0 = Assert<Equal<Grid240_0, Failure<"sampling-attempts-exhausted", { readonly maximumAttempts: 0; readonly attempts: 0; readonly state: GeneratorState<readonly ["8615d1a1", "16f6c103", "cbc1fbff", "055c3220"]> }>>>;
