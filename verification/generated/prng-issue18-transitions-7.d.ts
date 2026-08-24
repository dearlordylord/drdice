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

type InputState7 = GeneratorState<readonly ["d23c3415", "c3dc6205", "fa3c080d", "22c0f480"]>;
type Step7 = Next<InputState7>;
type _Step7 = Assert<Equal<Step7, Success<{ readonly word: "de9d7431"; readonly state: GeneratorState<readonly ["3320a290", "ebdc5e1d", "90c43618", "e4b42f08"]> }>>>;
