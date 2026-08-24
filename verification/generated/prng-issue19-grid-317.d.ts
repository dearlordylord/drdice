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
type Grid317_0 = Sample<GeneratorState<readonly ["3c48d385", "4838ca95", "1b58ae88", "4388a87b"]>, 64, 2>;
type _Grid317_0 = Assert<Equal<Grid317_0, Success<{ readonly value: 63; readonly state: GeneratorState<readonly ["37f8b16b", "6f28b798", "5685570d", "8317705d"]>; readonly attempts: 1 }>>>;
