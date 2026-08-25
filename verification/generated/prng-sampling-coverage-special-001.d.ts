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
type Special1_0 = Sample<GeneratorState<readonly ["8615d1a1", "16f6c103", "cbc1fbff", "055c3220"]>, 65, 5>;
type _Special1_0 = Assert<Equal<Special1_0, Failure<"sampling-attempts-exhausted", { readonly maximumAttempts: 5; readonly attempts: 5; readonly state: GeneratorState<readonly ["2cf3eb52", "667e2f2c", "1489b20b", "ebd30963"]> }>>>;
type Special1_1 = Sample<null, 101, 6>;
type _Special1_1 = Assert<Equal<Special1_1, Failure<"invalid-state-shape", { readonly state: null }>>>;
type Special1_2 = Sample<GeneratorState<readonly ["00000001", "00000002", "00000003", "00000004"]>, 101, 6>;
type _Special1_2 = Assert<Equal<Special1_2, Failure<"invalid-bound", { readonly bound: 101 }>>>;
