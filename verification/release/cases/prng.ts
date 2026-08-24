/* Release qualification: public PRNG query. */
import type { GeneratorState, Sample, Success } from "@drdice/prng";

type State = GeneratorState<readonly [
  "95bf2282",
  "5b22eb5d",
  "a0562c5e",
  "5799189d",
]>;

type Result = Sample<State, 65, 5>;
type Attempts = Result extends Success<infer Value>
  ? Value extends { readonly attempts: infer Count } ? Count : never
  : never;

declare const attempts: Attempts;
const expected: 5 = attempts;
export type ReleasePrngQuery = Result;
