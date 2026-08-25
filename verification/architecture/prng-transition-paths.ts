import {
  next,
  sample,
  type BoundedResult,
  type BoundedSuccess,
  type GeneratorState,
  type Next,
  type Sample,
  type StepResult,
  type Success,
} from "@drdice/prng";

type Equal<Left, Right> =
  (<Value>() => Value extends Left ? 1 : 2) extends
  (<Value>() => Value extends Right ? 1 : 2) ? true : false;
type Assert<Value extends true> = Value;

type Input = GeneratorState<readonly ["e83c194b", "b7818bc1", "fb0d50b6", "8369c2d9"]>;
type Output = GeneratorState<readonly ["dcd45053", "a4b0c23c", "1026cbfd", "4248c1a7"]>;

export type RawHexTransition = Assert<Equal<Next<Input>, Success<{
  readonly word: "e2c8791a";
  readonly state: Output;
}>>>;

/* Bound one deliberately uses the state-only transition path, which skips
 * output scrambling and bit-prefix sampling while still consuming one Word. */
export type BoundOneStateOnlyTransition = Assert<Equal<Sample<Input, 1, 1>, BoundedSuccess<0, Output, 1>>>;

declare const dynamicState: GeneratorState;
const dynamicStep = next(dynamicState);
const dynamicSample = sample(dynamicState, 6, 5);
export type WidenedRuntimeNext = Assert<Equal<typeof dynamicStep, StepResult>>;
export type WidenedRuntimeSample = Assert<Equal<typeof dynamicSample, BoundedResult>>;
