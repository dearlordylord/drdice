import type { GeneratorState, Sample, Success } from "@drdice/prng";

/* This is the maximum-width, four-attempt public Sample query used for the
 * blocking sampling ceiling.  The state is fixed so the query also exercises
 * four transitions before acceptance. */
type State = GeneratorState<readonly [
  "87985aa5",
  "155b24a3",
  "4820f4c4",
  "81b3ac98",
]>;
type Result = Sample<State, 65, 4>;
type ObservedAttempts = Result extends Success<infer Value>
  ? Value extends { readonly attempts: infer Attempts } ? Attempts : never
  : never;

declare const attempts: ObservedAttempts;
const expected: 4 = attempts;

export type PrngIssue19BudgetQuery = Result;
