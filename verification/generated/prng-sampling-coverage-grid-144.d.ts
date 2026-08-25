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
type Grid144_0 = Sample<GeneratorState<readonly ["eea829d7", "f02b5f82", "8f9f11ad", "8905533a"]>, 25, 0>;
type _Grid144_0 = Assert<Equal<Grid144_0, Failure<"sampling-attempts-exhausted", { readonly maximumAttempts: 0; readonly attempts: 0; readonly state: GeneratorState<readonly ["eea829d7", "f02b5f82", "8f9f11ad", "8905533a"]> }>>>;
