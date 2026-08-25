import type { GeneratorState, Sample, Success } from "@drdice/prng";

/* This is the maximum-width, five-output public Sample query used for the
 * blocking sampling ceiling.  The state is fixed so the query also exercises
 * five output-word transitions before acceptance. */
type State = GeneratorState<readonly [
  "95bf2282",
  "5b22eb5d",
  "a0562c5e",
  "5799189d",
]>;
type Result = Sample<State, 65, 5>;
type ObservedAttempts = Result extends Success<infer Value>
  ? Value extends { readonly attempts: infer Attempts } ? Attempts : never
  : never;

declare const attempts: ObservedAttempts;
const expected: 5 = attempts;

export type PrngSamplingCoverageBudgetQuery = Result;
