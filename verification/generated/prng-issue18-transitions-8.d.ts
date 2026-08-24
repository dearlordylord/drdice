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

type InputState8 = GeneratorState<readonly ["3320a290", "ebdc5e1d", "90c43618", "e4b42f08"]>;
type Step8 = Next<InputState8>;
type _Step8 = Assert<Equal<Step8, Success<{ readonly word: "de458f35"; readonly state: GeneratorState<readonly ["3c48d385", "4838ca95", "1b58ae88", "4388a87b"]> }>>>;
