/* Release qualification: one source imports both package roots and composes
 * the public Dice evaluator with the public PRNG state type. */
import type { GeneratorState, Sample, Success as PrngSuccess } from "@drdice/prng";
import type { DieSample, Evaluate, Success as DiceSuccess } from "@drdice/dice";

type State = GeneratorState<readonly [
  "00000001",
  "00000002",
  "00000003",
  "00000004",
]>;

type SampleResult = Sample<State, 100, 5>;
type DiceResult = Evaluate<"2d100+2d20", State, 5>;

type SampleShape = PrngSuccess<{
  readonly value: number;
  readonly state: GeneratorState;
  readonly attempts: number;
}>;
type DiceShape = DiceSuccess<{
  readonly total: number;
  readonly rollTrace: readonly [
    DieSample<100, number>,
    DieSample<100, number>,
    DieSample<20, number>,
    DieSample<20, number>,
  ];
  readonly nextState: GeneratorState;
}>;
type Assert<Value extends true> = Value;
export type ReleaseCombinedQuery = Assert<
  SampleResult extends SampleShape
    ? DiceResult extends DiceShape ? true : false
    : false
>;
