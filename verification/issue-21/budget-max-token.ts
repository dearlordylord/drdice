/* Exact maximum numeric-token query: the value is retained in the diagnostic,
 * while magnitude analysis must remain capped at 101 tuple elements. */
import type { GeneratorState } from "@drdice/prng";
import type { Evaluate, Failure } from "@drdice/dice";

type BudgetState = GeneratorState<readonly [
  "12345678",
  "9abcdef0",
  "13579bdf",
  "2468ace0",
]>;

type MaximumToken = Evaluate<"999", BudgetState, 1>;
type Expected = Failure<"resource-limit-exceeded", {
  readonly kind: "resource";
  readonly code: "resource-limit-exceeded";
  readonly offset: 0;
  readonly dimension: "arithmetic-magnitude";
  readonly limit: 100;
  readonly actual: 999;
}>;
type Assert<Value extends true> = Value;
type Equal<Left, Right> =
  (<Value>() => Value extends Left ? 1 : 2) extends
  (<Value>() => Value extends Right ? 1 : 2) ? true : false;
export type MaximumTokenAssertion = Assert<Equal<MaximumToken, Expected>>;
