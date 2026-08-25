/* Public-only Dice arithmetic parity UTF-16 boundary assertions. */
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
type SourceLength<Actual extends number> = Failure<"resource-limit-exceeded", {
  readonly kind: "resource";
  readonly code: "resource-limit-exceeded";
  readonly offset: 0;
  readonly dimension: "source-length";
  readonly limit: 64;
  readonly actual: Actual;
}>;

type GrinningFace = Evaluate<"😀", State, 1>;
type PlaneOneAstral = Evaluate<"𐀀", State, 1>;
type PrefixPlusGrinningFace = Evaluate<"1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1 😀", State, 1>;
type PrefixPlusTwoAstrals = Evaluate<"1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1+1 𐀀😀", State, 1>;

export type GrinningFaceAssertion = Assert<Equal<GrinningFace, Unexpected<"\ud83d">>>;
export type PlaneOneAstralAssertion = Assert<Equal<PlaneOneAstral, Unexpected<"\ud800">>>;
export type PrefixPlusGrinningFaceAssertion = Assert<Equal<PrefixPlusGrinningFace, SourceLength<66>>>;
export type PrefixPlusTwoAstralsAssertion = Assert<Equal<PrefixPlusTwoAstrals, SourceLength<68>>>;
