import type { GeneratorState, Initialize, Next, Success } from "@drdice/prng";

type Seed = readonly ["00000001", "00000002", "00000003", "00000004"];
type Initialized = Initialize<Seed>;
type State0 = Initialized extends Success<infer Value extends GeneratorState> ? Value : never;
type Step0 = Next<State0>;
type Step1 = Next<GeneratorState<readonly ["00000007", "00000000", "00000402", "00003000"]>>;
type Step2 = Next<GeneratorState<readonly ["00003007", "00000405", "00000405", "01800000"]>>;
export type PrngBudgetQuery = Step2;
