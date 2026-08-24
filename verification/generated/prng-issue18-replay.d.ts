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
type TaggedCanonicalSeed = Seed<CanonicalSeed>;
type InvalidStateWordInput = { readonly kind: "GeneratorState"; readonly words: readonly ["0000000A", "00000000", "00000000", "00000001"] };
type InvalidStateNonStringInput = { readonly kind: "GeneratorState"; readonly words: readonly ["00000001", 2, "00000000", "00000001"] };
type InvalidStateZeroInput = { readonly kind: "GeneratorState"; readonly words: readonly ["00000000", "00000000", "00000000", "00000000"] };
type FirstSuccessorState = GeneratorState<readonly ["00000007", "00000000", "00000402", "00003000"]>;
type Replay = ReplayToken<CanonicalSeed>;
type ExpectedReplay = {
  readonly schemaVersion: 1;
  readonly sequenceProfile: SequenceProfile;
  readonly seed: CanonicalSeed;
};
type _Replay = Assert<Equal<Replay, ExpectedReplay>>;
type _TaggedInitialize = Assert<Equal<Initialize<TaggedCanonicalSeed>, Success<GeneratorState<readonly ["00000001", "00000002", "00000003", "00000004"]>>>>;
type Restarted = RestoreReplay<Replay>;
type _Restarted = Assert<Equal<Restarted, Success<GeneratorState<readonly ["00000001", "00000002", "00000003", "00000004"]>>>>;
type RestartedStep = Next<GeneratorState<readonly ["00000001", "00000002", "00000003", "00000004"]>>;
type _RestartedStep = Assert<Equal<RestartedStep, Success<{ readonly word: "00002d00"; readonly state: FirstSuccessorState }>>>;

type Serialized = SerializedGeneratorState<FirstSuccessorState["words"]>;
type ExpectedSerialized = {
  readonly schemaVersion: 1;
  readonly sequenceProfile: SequenceProfile;
  readonly state: FirstSuccessorState["words"];
};
type _Serialized = Assert<Equal<Serialized, ExpectedSerialized>>;
type Resumed = RestoreState<Serialized>;
type _Resumed = Assert<Equal<Resumed, Success<FirstSuccessorState>>>;
type ResumedStep = Next<FirstSuccessorState>;
type _ResumedStep = Assert<Equal<ResumedStep, Success<{ readonly word: "00000000"; readonly state: GeneratorState<readonly ["00003007", "00000405", "00000405", "01800000"]> }>>>;
type RoundTrip = SerializeState<FirstSuccessorState>;
type _RoundTrip = Assert<Equal<RoundTrip, Success<ExpectedSerialized>>>;

type InvalidSeedShapeInput = readonly ["00000001"];
type InvalidSeedWordInput = readonly ["0000000A", "00000000", "00000000", "00000001"];
type InvalidSeedNonStringInput = readonly ["00000001", 2, "00000000", "00000001"];
type InvalidSeedZeroInput = readonly ["00000000", "00000000", "00000000", "00000000"];
type InvalidSnapshotShapeInput = { readonly schemaVersion: 1; readonly sequenceProfile: SequenceProfile; readonly state: readonly ["00000001"] };
type InvalidSnapshotWordInput = { readonly schemaVersion: 1; readonly sequenceProfile: SequenceProfile; readonly state: readonly ["0000000A", "00000000", "00000000", "00000001"] };
type InvalidSnapshotNonStringInput = { readonly schemaVersion: 1; readonly sequenceProfile: SequenceProfile; readonly state: readonly ["00000001", 2, "00000000", "00000001"] };
type InvalidSnapshotZeroInput = { readonly schemaVersion: 1; readonly sequenceProfile: SequenceProfile; readonly state: readonly ["00000000", "00000000", "00000000", "00000000"] };
type InvalidSnapshotWordState = { readonly kind: "GeneratorState"; readonly words: InvalidSnapshotWordInput["state"] };
type InvalidSnapshotNonStringState = { readonly kind: "GeneratorState"; readonly words: InvalidSnapshotNonStringInput["state"] };
type InvalidSnapshotZeroState = { readonly kind: "GeneratorState"; readonly words: InvalidSnapshotZeroInput["state"] };
type InvalidReplaySchemaInput = { readonly schemaVersion: 2; readonly sequenceProfile: SequenceProfile; readonly seed: CanonicalSeed };
type InvalidReplayProfileInput = { readonly schemaVersion: 1; readonly sequenceProfile: "other-profile"; readonly seed: CanonicalSeed };
type InvalidSnapshotProfileInput = { readonly schemaVersion: 1; readonly sequenceProfile: "other-profile"; readonly state: FirstSuccessorState["words"] };
type _InvalidSeedShape = Assert<Equal<Initialize<InvalidSeedShapeInput>, Failure<"invalid-seed-shape", { readonly seed: InvalidSeedShapeInput }>>>;
type _InvalidSeedWord = Assert<Equal<Initialize<InvalidSeedWordInput>, Failure<"invalid-seed-word", { readonly seed: InvalidSeedWordInput }>>>;
type _InvalidSeedNonString = Assert<Equal<Initialize<InvalidSeedNonStringInput>, Failure<"invalid-seed-word", { readonly seed: InvalidSeedNonStringInput }>>>;
type _InvalidSeedZero = Assert<Equal<Initialize<InvalidSeedZeroInput>, Failure<"invalid-seed-zero", { readonly seed: InvalidSeedZeroInput }>>>;
type _InvalidStateShape = Assert<Equal<Next<null>, Failure<"invalid-state-shape", { readonly state: null }>>>;
type _InvalidStateWord = Assert<Equal<Next<InvalidStateWordInput>, Failure<"invalid-state-word", { readonly state: InvalidStateWordInput }>>>;
type _InvalidStateNonString = Assert<Equal<Next<InvalidStateNonStringInput>, Failure<"invalid-state-word", { readonly state: InvalidStateNonStringInput }>>>;
type _InvalidStateZero = Assert<Equal<Next<InvalidStateZeroInput>, Failure<"invalid-state-zero", { readonly state: InvalidStateZeroInput }>>>;
type _SeedStateDistinct = Assert<Equal<Next<TaggedCanonicalSeed>, Failure<"invalid-state-shape", { readonly state: TaggedCanonicalSeed }>>>;
type _InvalidReplaySchema = Assert<Equal<RestoreReplay<InvalidReplaySchemaInput>, Failure<"invalid-replay-token", { readonly token: InvalidReplaySchemaInput }>>>;
type _InvalidReplayProfile = Assert<Equal<RestoreReplay<InvalidReplayProfileInput>, Failure<"invalid-replay-token", { readonly token: InvalidReplayProfileInput }>>>;
type _InvalidSnapshotShape = Assert<Equal<RestoreState<InvalidSnapshotShapeInput>, Failure<"invalid-state-shape", { readonly state: InvalidSnapshotShapeInput }>>>;
type _InvalidSnapshotWord = Assert<Equal<RestoreState<InvalidSnapshotWordInput>, Failure<"invalid-state-word", { readonly state: InvalidSnapshotWordState }>>>;
type _InvalidSnapshotNonString = Assert<Equal<RestoreState<InvalidSnapshotNonStringInput>, Failure<"invalid-state-word", { readonly state: InvalidSnapshotNonStringState }>>>;
type _InvalidSnapshotZero = Assert<Equal<RestoreState<InvalidSnapshotZeroInput>, Failure<"invalid-state-zero", { readonly state: InvalidSnapshotZeroState }>>>;
type _InvalidSnapshotProfile = Assert<Equal<RestoreState<InvalidSnapshotProfileInput>, Failure<"invalid-state-shape", { readonly state: InvalidSnapshotProfileInput }>>>;
type _InvalidSerializeShape = Assert<Equal<SerializeState<null>, Failure<"invalid-state-shape", { readonly state: null }>>>;
type _InvalidSerializeWord = Assert<Equal<SerializeState<InvalidStateWordInput>, Failure<"invalid-state-word", { readonly state: InvalidStateWordInput }>>>;
type _InvalidSerializeZero = Assert<Equal<SerializeState<InvalidStateZeroInput>, Failure<"invalid-state-zero", { readonly state: InvalidStateZeroInput }>>>;
type _ReplayRejectsWidenedWords = Assert<Equal<ReplayToken<readonly [string, string, string, string]>, never>>;
type _SnapshotRejectsWidenedWords = Assert<Equal<SerializedGeneratorState<readonly [string, string, string, string]>, never>>;
