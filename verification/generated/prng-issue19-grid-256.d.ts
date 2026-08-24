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
type Grid256_0 = Sample<GeneratorState<readonly ["3320a290", "ebdc5e1d", "90c43618", "e4b42f08"]>, 52, 1>;
type _Grid256_0 = Assert<Equal<Grid256_0, Failure<"sampling-attempts-exhausted", { readonly maximumAttempts: 1; readonly attempts: 1; readonly state: GeneratorState<readonly ["3c48d385", "4838ca95", "1b58ae88", "4388a87b"]> }>>>;
