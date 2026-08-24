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

type InputState4 = GeneratorState<readonly ["01a02c09", "01883a07", "01e80400", "00c05801"]>;
type Step4 = Next<InputState4>;
type _Step4 = Assert<Equal<Step4, Success<{ readonly word: "79199d9b"; readonly state: GeneratorState<readonly ["00e84e0f", "01c0120e", "103c2609", "4310300a"]> }>>>;
