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
type Grid260_0 = Sample<GeneratorState<readonly ["89f9097d", "5794102f", "2e4646d0", "30c53085"]>, 44, 2>;
type _Grid260_0 = Assert<Equal<Grid260_0, Success<{ readonly value: 32; readonly state: GeneratorState<readonly ["eea829d7", "f02b5f82", "8f9f11ad", "8905533a"]>; readonly attempts: 1 }>>>;
