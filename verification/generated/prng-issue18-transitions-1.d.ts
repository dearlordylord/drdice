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

type InputState4 = GeneratorState<readonly ["01a02c09", "01883a07", "01e80400", "00c05801"]>;
type Step4 = Next<InputState4>;
type _Step4 = Assert<Equal<Step4, Success<{ readonly word: "79199d9b"; readonly state: GeneratorState<readonly ["00e84e0f", "01c0120e", "103c2609", "4310300a"]> }>>>;

type InputState5 = GeneratorState<readonly ["00e84e0f", "01c0120e", "103c2609", "4310300a"]>;
type Step5 = Next<InputState5>;
type _Step5 = Assert<Equal<Step5, Success<{ readonly word: "61963b24"; readonly state: GeneratorState<readonly ["42386c0b", "11147a08", "90f07406", "81102216"]> }>>>;
