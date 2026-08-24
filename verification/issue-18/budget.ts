import type { GeneratorState, Initialize, Next, Success } from "@drdice/prng";

type Seed = readonly ["00000001", "00000002", "00000003", "00000004"];
type Initialized = Initialize<Seed>;
type State0 = Initialized extends Success<infer Value extends GeneratorState> ? Value : never;
type Step0 = Next<State0>;
export type PrngBudgetQuery = Step0;
