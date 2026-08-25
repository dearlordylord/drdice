/* Release qualification: public Dice query with the maximum completed sample
 * count and maximum supported side count represented separately below. */
import type { GeneratorState } from "@drdice/prng";
import type { DieSample, Evaluate, Success } from "@drdice/dice";

type State = GeneratorState<readonly [
  "00000001",
  "00000002",
  "00000003",
  "00000004",
]>;

type Result = Evaluate<"4d100+2d20-3", State, 5>;
type Expected = Success<{
  readonly total: number;
  readonly rollTrace: readonly [
    DieSample<100, number>,
    DieSample<100, number>,
    DieSample<100, number>,
    DieSample<100, number>,
    DieSample<20, number>,
    DieSample<20, number>,
  ];
  readonly nextState: GeneratorState;
}>;

/* Keep this assertion structural: the exact values are covered by suite-owned
 * golden vectors, while this lane measures the public package query shape. */
type Assert<Value extends true> = Value;
type IsResult = Result extends Expected ? true : false;
export type ReleaseDiceQuery = Assert<IsResult>;
