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
type Grid248_0 = Sample<GeneratorState<readonly ["eea829d7", "f02b5f82", "8f9f11ad", "8905533a"]>, 42, 2>;
type _Grid248_0 = Assert<Equal<Grid248_0, Success<{ readonly value: 19; readonly state: GeneratorState<readonly ["9786256f", "911c67f8", "37883c7a", "7065c3c9"]>; readonly attempts: 1 }>>>;
