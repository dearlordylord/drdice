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
type Grid198_0 = Sample<GeneratorState<readonly ["b0e8eac3", "f2d79146", "a51937ed", "21243868"]>, 40, 3>;
type _Grid198_0 = Assert<Equal<Grid198_0, Failure<"sampling-attempts-exhausted", { readonly maximumAttempts: 3; readonly attempts: 3; readonly state: GeneratorState<readonly ["5e4d9c62", "b2cae572", "5099edd9", "cf2bc239"]> }>>>;
