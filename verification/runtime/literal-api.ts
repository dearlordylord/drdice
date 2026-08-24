import {
  initialize,
  next,
  sample,
  type Initialize,
  type Next,
  type Sample,
} from "@drdice/prng";
import { evaluate, stateOf, valueOf, type Evaluate, type StateOf, type ValueOf } from "@drdice/dice";

type Equal<Left, Right> =
  (<Value>() => Value extends Left ? 1 : 2) extends
  (<Value>() => Value extends Right ? 1 : 2) ? true : false;
type Assert<Value extends true> = Value;

const seed = ["00000001", "00000002", "00000003", "00000004"] as const;
const initialized = initialize(seed);
type _InitializeParity = Assert<Equal<typeof initialized, Initialize<typeof seed>>>;

if (initialized.ok) {
  const stepped = next(initialized.value);
  type _NextParity = Assert<Equal<typeof stepped, Next<typeof initialized.value>>>;

  const sampled = sample(initialized.value, 100);
  type _SampleParity = Assert<Equal<typeof sampled, Sample<typeof initialized.value, 100>>>;

  const rolled = evaluate("d20", initialized.value);
  type _EvaluateParity = Assert<Equal<typeof rolled, Evaluate<"d20", typeof initialized.value>>>;
  type _KnownRuntimeValue = Assert<Equal<ValueOf<typeof rolled>, 12>>;
  const extractedValue = valueOf(rolled);
  type _RuntimeValueExtractor = Assert<Equal<typeof extractedValue, 12>>;

  const continued = evaluate("4d6 + 12", stateOf(rolled));
  type _ContinuedParity = Assert<Equal<
    typeof continued,
    Evaluate<"4d6 + 12", StateOf<typeof rolled>>
  >>;
}

declare const dynamicExpression: string;
declare const dynamicState: import("@drdice/prng").GeneratorState;
const dynamicRoll = evaluate(dynamicExpression, dynamicState);
type _DynamicResult = Assert<Equal<typeof dynamicRoll, import("@drdice/dice").EvaluationResult>>;
