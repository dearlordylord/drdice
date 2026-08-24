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

type CanonicalSeed = readonly ["00000001", "00000002", "00000003", "00000004"];
type Initialized = Initialize<CanonicalSeed>;
type _Initialize = Assert<Equal<Initialized, Success<GeneratorState<readonly ["00000001", "00000002", "00000003", "00000004"]>>>>;

type InputState0 = GeneratorState<readonly ["00000001", "00000002", "00000003", "00000004"]>;
type Step0 = Next<InputState0>;
type _Step0 = Assert<Equal<Step0, Success<{ readonly word: "00002d00"; readonly state: GeneratorState<readonly ["00000007", "00000000", "00000402", "00003000"]> }>>>;
