/* Public-only issue #21 Unicode mutation assertions. */
import type { GeneratorState } from "@drdice/prng";
import type { Evaluate, Failure } from "@drdice/dice";

type State = GeneratorState<readonly ["12345678", "9abcdef0", "13579bdf", "2468ace0"]>;
type Assert<Value extends true> = Value;
type Equal<Left, Right> =
  (<Value>() => Value extends Left ? 1 : 2) extends
  (<Value>() => Value extends Right ? 1 : 2) ? true : false;
type Unexpected<Found extends string> = Failure<"unexpected-token", {
  readonly kind: "syntax";
  readonly code: "unexpected-token";
  readonly offset: 0;
  readonly found: Found;
  readonly expected: readonly ["dice", "integer", "("];
}>;

type BmpAccent = Evaluate<"é", State, 1>;
type BmpSnowman = Evaluate<"☃", State, 1>;
type MinimumAstral = Evaluate<"\ud800\udc00", State, 1>;
type MaximumAstral = Evaluate<"\udbff\udfff", State, 1>;

export type BmpAccentAssertion = Assert<Equal<BmpAccent, Unexpected<"é">>>;
export type BmpSnowmanAssertion = Assert<Equal<BmpSnowman, Unexpected<"☃">>>;
export type MinimumAstralAssertion = Assert<Equal<MinimumAstral, Unexpected<"\ud800">>>;
export type MaximumAstralAssertion = Assert<Equal<MaximumAstral, Unexpected<"\udbff">>>;
