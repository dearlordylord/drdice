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

type InputState4 = GeneratorState<readonly ["995f11db", "7e83a8ff", "b048a90b", "6e25b059"]>;
type Step4 = Next<InputState4>;
type _Step4 = Assert<Equal<Step4, Success<{ readonly word: "925a6b9c"; readonly state: GeneratorState<readonly ["89f9097d", "5794102f", "2e4646d0", "30c53085"]> }>>>;
