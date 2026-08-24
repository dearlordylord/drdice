/* The issue #21 maximum arithmetic query used by both TypeScript 7 lanes. */
import type { GeneratorState } from "@drdice/prng";
import type { DiceEvaluation, Evaluate, Success } from "@drdice/dice";

type BudgetState = GeneratorState<readonly [
  "12345678",
  "9abcdef0",
  "13579bdf",
  "2468ace0",
]>;

type MaximumArithmetic = Evaluate<
  "1+1+1+1+1+1+1+1",
  BudgetState,
  4
>;

type Expected = Success<DiceEvaluation<8, [], BudgetState>>;
type Assert<Value extends true> = Value;
type Equal<Left, Right> =
  (<Value>() => Value extends Left ? 1 : 2) extends
  (<Value>() => Value extends Right ? 1 : 2) ? true : false;
export type MaximumArithmeticAssertion = Assert<Equal<MaximumArithmetic, Expected>>;
