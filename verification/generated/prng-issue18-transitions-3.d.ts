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

type InputState3 = GeneratorState<readonly ["01803402", "00003007", "00083e02", "0020280c"]>;
type Step3 = Next<InputState3>;
type _Step3 = Assert<Equal<Step3, Success<{ readonly word: "04389d80"; readonly state: GeneratorState<readonly ["01a02c09", "01883a07", "01e80400", "00c05801"]> }>>>;
