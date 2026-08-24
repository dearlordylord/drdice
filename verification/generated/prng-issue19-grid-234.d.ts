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
type Grid234_0 = Sample<GeneratorState<readonly ["b0e8eac3", "f2d79146", "a51937ed", "21243868"]>, 47, 4>;
type _Grid234_0 = Assert<Equal<Grid234_0, Failure<"sampling-attempts-exhausted", { readonly maximumAttempts: 4; readonly attempts: 4; readonly state: GeneratorState<readonly ["23acbb29", "bc1e94c9", "9b1e95bb", "093a5bef"]> }>>>;
