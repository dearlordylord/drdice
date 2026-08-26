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

type CanonicalSeed = readonly ["00000001", "00000002", "00000003", "00000004"];
type Initialized = Initialize<CanonicalSeed>;
type _Initialize = Assert<Equal<Initialized, Success<GeneratorState<readonly ["e83c194b", "b7818bc1", "fb0d50b6", "8369c2d9"]>>>>;

type InputState0 = GeneratorState<readonly ["e83c194b", "b7818bc1", "fb0d50b6", "8369c2d9"]>;
type Step0 = Next<InputState0>;
type _Step0 = Assert<Equal<Step0, Success<{ readonly word: "e2c8791a"; readonly state: GeneratorState<readonly ["dcd45053", "a4b0c23c", "1026cbfd", "4248c1a7"]> }>>>;
