import type {
  GeneratorState,
  Sample,
  Success,
} from "../../../prototypes/prng-type-api";

type CeilingState = GeneratorState<[
  "87985aa5",
  "155b24a3",
  "4820f4c4",
  "81b3ac98",
]>;

type CeilingResult = Sample<CeilingState, 65, 4>;
type ObservedAttempts = CeilingResult extends Success<infer Value>
  ? Value extends { readonly attempts: infer Attempts }
    ? Attempts
    : never
  : never;
type ObservedValue = CeilingResult extends Success<infer Value>
  ? Value extends { readonly value: infer Sampled }
    ? Sampled
    : never
  : never;

declare const observedAttempts: ObservedAttempts;
declare const observedValue: ObservedValue;
const expectedAttempts: 4 = observedAttempts;
const expectedValue: 27 = observedValue;
