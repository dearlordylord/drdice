/* GENERATED FILE. Run pnpm generate:fixtures; do not edit by hand. */
import type {
  GeneratorState,
  Failure,
  Initialize,
  Next,
  ReplayToken,
  RestoreReplay,
  RestoreState,
  Seed,
  SequenceProfile,
  SerializedGeneratorState,
  SerializeState,
  Success,
} from "@drdice/prng";

type Equal<Left, Right> =
  (<Value>() => Value extends Left ? 1 : 2) extends
  (<Value>() => Value extends Right ? 1 : 2) ? true : false;
type Assert<Value extends true> = Value;

type InputState2 = GeneratorState<readonly ["00003007", "00000405", "00000405", "01800000"]>;
type Step2 = Next<InputState2>;
type _Step2 = Assert<Equal<Step2, Success<{ readonly word: "005a7080"; readonly state: GeneratorState<readonly ["01803402", "00003007", "00083e02", "0020280c"]> }>>>;
