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
  ValidateState,
} from "@drdice/prng";

type Equal<Left, Right> =
  (<Value>() => Value extends Left ? 1 : 2) extends
  (<Value>() => Value extends Right ? 1 : 2) ? true : false;
type Assert<Value extends true> = Value;

type InputState3 = GeneratorState<readonly ["9272d56d", "ff18e9f4", "13e99466", "f4352d42"]>;
type Step3 = Next<InputState3>;
type _Step3 = Assert<Equal<Step3, Success<{ readonly word: "b08ff665"; readonly state: GeneratorState<readonly ["995f11db", "7e83a8ff", "b048a90b", "6e25b059"]> }>>>;
