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
type Grid264_0 = Sample<GeneratorState<readonly ["8acc70b8", "df2c16a6", "cac3b24b", "9f8f37e1"]>, 45, 0>;
type _Grid264_0 = Assert<Equal<Grid264_0, Failure<"sampling-attempts-exhausted", { readonly maximumAttempts: 0; readonly attempts: 0; readonly state: GeneratorState<readonly ["8acc70b8", "df2c16a6", "cac3b24b", "9f8f37e1"]> }>>>;
