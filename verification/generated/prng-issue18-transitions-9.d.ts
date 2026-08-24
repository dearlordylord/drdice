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

type InputState9 = GeneratorState<readonly ["3c48d385", "4838ca95", "1b58ae88", "4388a87b"]>;
type Step9 = Next<InputState9>;
type _Step9 = Assert<Equal<Step9, Success<{ readonly word: "fdce1a54"; readonly state: GeneratorState<readonly ["37f8b16b", "6f28b798", "5685570d", "8317705d"]> }>>>;
