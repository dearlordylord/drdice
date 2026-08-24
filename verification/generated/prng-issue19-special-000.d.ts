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
type Special0_0 = Sample<GeneratorState<readonly ["00000001", "00000002", "00000003", "00000004"]>, 1, 1>;
type _Special0_0 = Assert<Equal<Special0_0, Success<{ readonly value: 0; readonly state: GeneratorState<readonly ["00000007", "00000000", "00000402", "00003000"]>; readonly attempts: 1 }>>>;
type Special0_1 = Sample<GeneratorState<readonly ["b0e8eac3", "f2d79146", "a51937ed", "21243868"]>, 7, 2>;
type _Special0_1 = Assert<Equal<Special0_1, Success<{ readonly value: 6; readonly state: GeneratorState<readonly ["1974791a", "3eee5eab", "9550c2c3", "79d7bbd3"]>; readonly attempts: 2 }>>>;
type Special0_2 = Sample<GeneratorState<readonly ["b0e8eac3", "f2d79146", "a51937ed", "21243868"]>, 6, 0>;
type _Special0_2 = Assert<Equal<Special0_2, Failure<"sampling-attempts-exhausted", { readonly maximumAttempts: 0; readonly attempts: 0; readonly state: GeneratorState<readonly ["b0e8eac3", "f2d79146", "a51937ed", "21243868"]> }>>>;
