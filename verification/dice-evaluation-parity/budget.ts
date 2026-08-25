/* Maximum completed-sample Dice evaluation query for the Dice evaluation parity budget lane. */
import type { GeneratorState } from "@drdice/prng";
import type { DieSample, Evaluate, Success } from "@drdice/dice";

type BudgetState = GeneratorState<readonly [
  "00000001",
  "00000002",
  "00000003",
  "00000004",
]>;

type MaximumEvaluation = Evaluate<"8d1", BudgetState, 1>;
type Expected = Success<{
  readonly total: 8;
  readonly rollTrace: readonly [
    DieSample<1, 1>,
    DieSample<1, 1>,
    DieSample<1, 1>,
    DieSample<1, 1>,
    DieSample<1, 1>,
    DieSample<1, 1>,
    DieSample<1, 1>,
    DieSample<1, 1>,
  ];
  readonly nextState: GeneratorState<readonly [
    "3320a290",
    "ebdc5e1d",
    "90c43618",
    "e4b42f08",
  ]>;
}>;
type Equal<Left, Right> =
  (<Value>() => Value extends Left ? 1 : 2) extends
  (<Value>() => Value extends Right ? 1 : 2) ? true : false;
type Assert<Value extends true> = Value;
export type MaximumEvaluationAssertion = Assert<Equal<MaximumEvaluation, Expected>>;
