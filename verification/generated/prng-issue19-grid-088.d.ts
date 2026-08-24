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
type Grid88_0 = Sample<GeneratorState<readonly ["3320a290", "ebdc5e1d", "90c43618", "e4b42f08"]>, 18, 3>;
type _Grid88_0 = Assert<Equal<Grid88_0, Success<{ readonly value: 2; readonly state: GeneratorState<readonly ["dbc776ae", "0e5551fe", "3012d666", "fe3e2f61"]>; readonly attempts: 3 }>>>;
