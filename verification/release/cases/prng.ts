/* Release qualification: public PRNG query. */
import type { GeneratorState, Sample, Success } from "@drdice/prng";

type State = GeneratorState<readonly [
  "87985aa5",
  "155b24a3",
  "4820f4c4",
  "81b3ac98",
]>;

type Result = Sample<State, 65, 4>;
type Attempts = Result extends Success<infer Value>
  ? Value extends { readonly attempts: infer Count } ? Count : never
  : never;

declare const attempts: Attempts;
const expected: 4 = attempts;
export type ReleasePrngQuery = Result;
