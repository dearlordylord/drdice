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
type Grid461_0 = Sample<GeneratorState<readonly ["3c48d385", "4838ca95", "1b58ae88", "4388a87b"]>, 93, 1>;
type _Grid461_0 = Assert<Equal<Grid461_0, Failure<"sampling-attempts-exhausted", { readonly maximumAttempts: 1; readonly attempts: 1; readonly state: GeneratorState<readonly ["37f8b16b", "6f28b798", "5685570d", "8317705d"]> }>>>;
