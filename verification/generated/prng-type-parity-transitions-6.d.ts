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

type InputState6 = GeneratorState<readonly ["eea829d7", "f02b5f82", "8f9f11ad", "8905533a"]>;
type Step6 = Next<InputState6>;
type _Step6 = Assert<Equal<Step6, Success<{ readonly word: "cfe4f018"; readonly state: GeneratorState<readonly ["9786256f", "911c67f8", "37883c7a", "7065c3c9"]> }>>>;
