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
type Grid422_0 = Sample<GeneratorState<readonly ["8615d1a1", "16f6c103", "cbc1fbff", "055c3220"]>, 71, 2>;
type _Grid422_0 = Assert<Equal<Grid422_0, Failure<"sampling-attempts-exhausted", { readonly maximumAttempts: 2; readonly attempts: 2; readonly state: GeneratorState<readonly ["9904d142", "6ecbe581", "703fb4dc", "df9e0065"]> }>>>;
