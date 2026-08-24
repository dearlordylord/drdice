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
type Special1_0 = Sample<GeneratorState<readonly ["b0e8eac3", "f2d79146", "a51937ed", "21243868"]>, 6, 4>;
type _Special1_0 = Assert<Equal<Special1_0, Failure<"sampling-attempts-exhausted", { readonly maximumAttempts: 4; readonly attempts: 4; readonly state: GeneratorState<readonly ["23acbb29", "bc1e94c9", "9b1e95bb", "093a5bef"]> }>>>;
type Special1_1 = Sample<null, 101, 5>;
type _Special1_1 = Assert<Equal<Special1_1, Failure<"invalid-state-shape", { readonly state: null }>>>;
type Special1_2 = Sample<GeneratorState<readonly ["00000001", "00000002", "00000003", "00000004"]>, 101, 5>;
type _Special1_2 = Assert<Equal<Special1_2, Failure<"invalid-bound", { readonly bound: 101 }>>>;
