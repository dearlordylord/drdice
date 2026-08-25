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
type Grid386_0 = Sample<GeneratorState<readonly ["dcd45053", "a4b0c23c", "1026cbfd", "4248c1a7"]>, 65, 2>;
type _Grid386_0 = Assert<Equal<Grid386_0, Success<{ readonly value: 55; readonly state: GeneratorState<readonly ["9272d56d", "ff18e9f4", "13e99466", "f4352d42"]>; readonly attempts: 2 }>>>;
