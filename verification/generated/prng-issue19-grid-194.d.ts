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
type Grid194_0 = Sample<GeneratorState<readonly ["995f11db", "7e83a8ff", "b048a90b", "6e25b059"]>, 33, 2>;
type _Grid194_0 = Assert<Equal<Grid194_0, Success<{ readonly value: 32; readonly state: GeneratorState<readonly ["eea829d7", "f02b5f82", "8f9f11ad", "8905533a"]>; readonly attempts: 2 }>>>;
