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
type Grid245_0 = Sample<GeneratorState<readonly ["9272d56d", "ff18e9f4", "13e99466", "f4352d42"]>, 41, 5>;
type _Grid245_0 = Assert<Equal<Grid245_0, Success<{ readonly value: 8; readonly state: GeneratorState<readonly ["995f11db", "7e83a8ff", "b048a90b", "6e25b059"]>; readonly attempts: 1 }>>>;
