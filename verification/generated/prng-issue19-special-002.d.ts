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
type Special2_0 = Sample<GeneratorState<readonly ["00000001", "00000002", "00000003", "00000004"]>, 1, 5>;
type _Special2_0 = Assert<Equal<Special2_0, Failure<"invalid-attempt-fuel", { readonly maximumAttempts: 5 }>>>;
type Special2_1 = Sample<GeneratorState<readonly ["0000000A", "00000000", "00000000", "00000001"]>, 101, 5>;
type _Special2_1 = Assert<Equal<Special2_1, Failure<"invalid-state-word", { readonly state: GeneratorState<readonly ["0000000A", "00000000", "00000000", "00000001"]> }>>>;
type Special2_2 = Sample<GeneratorState<readonly ["00000000", "00000000", "00000000", "00000000"]>, 101, 5>;
type _Special2_2 = Assert<Equal<Special2_2, Failure<"invalid-state-zero", { readonly state: GeneratorState<readonly ["00000000", "00000000", "00000000", "00000000"]> }>>>;
