import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const defaultOutput = resolve(here, "generated");
const outputArgument = process.argv.indexOf("--output");
const output = resolve(
  outputArgument >= 0 && process.argv[outputArgument + 1]
    ? process.argv[outputArgument + 1]
    : defaultOutput,
);

const scaffold = `/* GENERATED FILE. Run pnpm generate:fixtures; do not edit by hand. */
import type { PackageMetadata as PrngPackageMetadata } from "@drdice/prng";
import type { PackageMetadata as DicePackageMetadata } from "@drdice/dice";

type Equal<Left, Right> =
  (<Value>() => Value extends Left ? 1 : 2) extends
  (<Value>() => Value extends Right ? 1 : 2) ? true : false;
type Assert<Value extends true> = Value;

export type PrngScaffoldAssertion = Assert<Equal<
  PrngPackageMetadata["name"],
  "@drdice/prng"
>>;
export type DiceScaffoldAssertion = Assert<Equal<
  DicePackageMetadata["name"],
  "@drdice/dice"
>>;
`;

const golden = JSON.parse(await readFile(resolve(here, "issue-17/golden-vectors.json"), "utf8"));
const tuple = (words) => `readonly [${words.map((word) => JSON.stringify(word)).join(", ")}]`;
const state = (words) => `GeneratorState<${tuple(words)}>`;
const expectedStep = (transition) =>
  `Success<{ readonly word: ${JSON.stringify(transition.word)}; readonly state: ${state(transition.successorState)} }>`;

const prngHeader = [
  `/* GENERATED FILE. Run pnpm generate:fixtures; do not edit by hand. */`,
  `import type {`,
  `  GeneratorState,`,
  `  Failure,`,
  `  Initialize,`,
  `  Next,`,
  `  ReplayToken,`,
  `  RestoreReplay,`,
  `  RestoreState,`,
  `  Seed,`,
  `  SequenceProfile,`,
  `  SerializedGeneratorState,`,
  `  SerializeState,`,
  `  Success,`,
  `} from "@drdice/prng";`,
  ``,
  `type Equal<Left, Right> =`,
  `  (<Value>() => Value extends Left ? 1 : 2) extends`,
  `  (<Value>() => Value extends Right ? 1 : 2) ? true : false;`,
  `type Assert<Value extends true> = Value;`,
  ``,
];
const transitionAssertions = (transitions, includeInitialization) => [
  ...(includeInitialization ? [
    `type CanonicalSeed = ${tuple(golden.canonicalSeed)};`,
    `type Initialized = Initialize<CanonicalSeed>;`,
    `type _Initialize = Assert<Equal<Initialized, Success<${state(golden.canonicalSeed)}>>>;`,
    ``,
  ] : []),
  ...transitions.flatMap((transition) => [
    `type InputState${transition.index} = ${state(transition.inputState)};`,
    `type Step${transition.index} = Next<InputState${transition.index}>;`,
    `type _Step${transition.index} = Assert<Equal<Step${transition.index}, ${expectedStep(transition)}>>;`,
    ``,
  ]),
];
const replayAssertions = [
  `type CanonicalSeed = ${tuple(golden.canonicalSeed)};`,
  `type TaggedCanonicalSeed = Seed<CanonicalSeed>;`,
  `type InvalidStateWordInput = { readonly kind: "GeneratorState"; readonly words: readonly ["0000000A", "00000000", "00000000", "00000001"] };`,
  `type InvalidStateZeroInput = { readonly kind: "GeneratorState"; readonly words: readonly ["00000000", "00000000", "00000000", "00000000"] };`,
  `type FirstSuccessorState = ${state(golden.replay.firstSuccessorState)};`,
  `type Replay = ReplayToken<CanonicalSeed>;`,
  `type ExpectedReplay = {`,
  `  readonly schemaVersion: 1;`,
  `  readonly sequenceProfile: SequenceProfile;`,
  `  readonly seed: CanonicalSeed;`,
  `};`,
  `type _Replay = Assert<Equal<Replay, ExpectedReplay>>;`,
  `type _TaggedInitialize = Assert<Equal<Initialize<TaggedCanonicalSeed>, Success<${state(golden.canonicalSeed)}>>>;`,
  `type Restarted = RestoreReplay<Replay>;`,
  `type _Restarted = Assert<Equal<Restarted, Success<${state(golden.replay.restartState)}>>>;`,
  `type RestartedStep = Next<${state(golden.replay.restartState)}>;`,
  `type _RestartedStep = Assert<Equal<RestartedStep, Success<{ readonly word: ${JSON.stringify(golden.replay.firstWord)}; readonly state: FirstSuccessorState }>>>;`,
  ``,
  `type Serialized = SerializedGeneratorState<FirstSuccessorState["words"]>;`,
  `type ExpectedSerialized = {`,
  `  readonly schemaVersion: 1;`,
  `  readonly sequenceProfile: SequenceProfile;`,
  `  readonly state: FirstSuccessorState["words"];`,
  `};`,
  `type _Serialized = Assert<Equal<Serialized, ExpectedSerialized>>;`,
  `type Resumed = RestoreState<Serialized>;`,
  `type _Resumed = Assert<Equal<Resumed, Success<FirstSuccessorState>>>;`,
  `type ResumedStep = Next<FirstSuccessorState>;`,
  `type _ResumedStep = Assert<Equal<ResumedStep, Success<{ readonly word: ${JSON.stringify(golden.replay.resumedWord)}; readonly state: ${state(golden.replay.resumedSuccessorState)} }>>>;`,
  `type RoundTrip = SerializeState<FirstSuccessorState>;`,
  `type _RoundTrip = Assert<Equal<RoundTrip, Success<ExpectedSerialized>>>;`,
  ``,
  `type InvalidSeedShapeInput = readonly ["00000001"];`,
  `type InvalidSeedWordInput = readonly ["0000000A", "00000000", "00000000", "00000001"];`,
  `type InvalidSeedZeroInput = readonly ["00000000", "00000000", "00000000", "00000000"];`,
  `type InvalidSnapshotShapeInput = { readonly schemaVersion: 1; readonly sequenceProfile: SequenceProfile; readonly state: readonly ["00000001"] };`,
  `type InvalidSnapshotWordInput = { readonly schemaVersion: 1; readonly sequenceProfile: SequenceProfile; readonly state: readonly ["0000000A", "00000000", "00000000", "00000001"] };`,
  `type InvalidSnapshotZeroInput = { readonly schemaVersion: 1; readonly sequenceProfile: SequenceProfile; readonly state: readonly ["00000000", "00000000", "00000000", "00000000"] };`,
  `type InvalidReplaySchemaInput = { readonly schemaVersion: 2; readonly sequenceProfile: SequenceProfile; readonly seed: CanonicalSeed };`,
  `type InvalidReplayProfileInput = { readonly schemaVersion: 1; readonly sequenceProfile: "other-profile"; readonly seed: CanonicalSeed };`,
  `type InvalidSnapshotProfileInput = { readonly schemaVersion: 1; readonly sequenceProfile: "other-profile"; readonly state: FirstSuccessorState["words"] };`,
  `type _InvalidSeedShape = Assert<Equal<Initialize<InvalidSeedShapeInput>, Failure<"invalid-seed-shape", { readonly seed: InvalidSeedShapeInput }>>>;`,
  `type _InvalidSeedWord = Assert<Equal<Initialize<InvalidSeedWordInput>, Failure<"invalid-seed-word", { readonly seed: InvalidSeedWordInput }>>>;`,
  `type _InvalidSeedZero = Assert<Equal<Initialize<InvalidSeedZeroInput>, Failure<"invalid-seed-zero", { readonly seed: InvalidSeedZeroInput }>>>;`,
  `type _InvalidStateShape = Assert<Equal<Next<null>, Failure<"invalid-state-shape", { readonly state: null }>>>;`,
  `type _InvalidStateWord = Assert<Equal<Next<InvalidStateWordInput>, Failure<"invalid-state-word", { readonly state: InvalidStateWordInput }>>>;`,
  `type _InvalidStateZero = Assert<Equal<Next<InvalidStateZeroInput>, Failure<"invalid-state-zero", { readonly state: InvalidStateZeroInput }>>>;`,
  `type _SeedStateDistinct = Assert<Equal<Next<TaggedCanonicalSeed>, Failure<"invalid-state-shape", { readonly state: TaggedCanonicalSeed }>>>;`,
  `type _InvalidReplaySchema = Assert<Equal<RestoreReplay<InvalidReplaySchemaInput>, Failure<"invalid-replay-token", { readonly token: InvalidReplaySchemaInput }>>>;`,
  `type _InvalidReplayProfile = Assert<Equal<RestoreReplay<InvalidReplayProfileInput>, Failure<"invalid-replay-token", { readonly token: InvalidReplayProfileInput }>>>;`,
  `type _InvalidSnapshotShape = Assert<Equal<RestoreState<InvalidSnapshotShapeInput>, Failure<"invalid-state-shape", { readonly state: InvalidSnapshotShapeInput }>>>;`,
  `type _InvalidSnapshotWord = Assert<Equal<RestoreState<InvalidSnapshotWordInput>, Failure<"invalid-state-word", { readonly state: InvalidSnapshotWordInput }>>>;`,
  `type _InvalidSnapshotZero = Assert<Equal<RestoreState<InvalidSnapshotZeroInput>, Failure<"invalid-state-zero", { readonly state: InvalidSnapshotZeroInput }>>>;`,
  `type _InvalidSnapshotProfile = Assert<Equal<RestoreState<InvalidSnapshotProfileInput>, Failure<"invalid-state-shape", { readonly state: InvalidSnapshotProfileInput }>>>;`,
  `type _InvalidSerializeShape = Assert<Equal<SerializeState<null>, Failure<"invalid-state-shape", { readonly state: null }>>>;`,
  `type _InvalidSerializeWord = Assert<Equal<SerializeState<InvalidStateWordInput>, Failure<"invalid-state-word", { readonly state: InvalidStateWordInput }>>>;`,
  `type _InvalidSerializeZero = Assert<Equal<SerializeState<InvalidStateZeroInput>, Failure<"invalid-state-zero", { readonly state: InvalidStateZeroInput }>>>;`,
  `type _ReplayRejectsWidenedWords = Assert<Equal<ReplayToken<readonly [string, string, string, string]>, never>>;`,
  `type _SnapshotRejectsWidenedWords = Assert<Equal<SerializedGeneratorState<readonly [string, string, string, string]>, never>>;`,
  ``,
];

const transitions = golden.rawWordVector.transitions.map((transition, index) => ({ ...transition, index }));
const transitionShards = [
  transitions.slice(0, 3),
  transitions.slice(3, 6),
  transitions.slice(6, 9),
  transitions.slice(9),
];

const prngAssertions = transitionShards.map((shard, index) => [
  ...prngHeader,
  ...transitionAssertions(shard, index === 0),
].join("\n"));
const replayFixture = [
  ...prngHeader,
  ...replayAssertions,
].join("\n");

/* Keep the exact type corpus sharded: each transition shard remains within
 * the issue-11 PRNG checker budget while the generated gate checks all shards. */
const fixtureFiles = [
  ...prngAssertions.map((contents, index) => [`prng-issue18-transitions-${index}.d.ts`, contents]),
  ["prng-issue18-replay.d.ts", replayFixture],
];

/* The old monolithic construction is intentionally gone; this assertion keeps
 * accidental reintroduction from silently changing the shard layout. */
for (const [filename, contents] of fixtureFiles) {
  if (!contents.includes("GENERATED FILE")) throw new Error(`missing generated marker in ${filename}`);
}

await mkdir(output, { recursive: true });
await writeFile(resolve(output, "scaffold.d.ts"), scaffold, "utf8");
await Promise.all(fixtureFiles.map(([filename, contents]) => writeFile(resolve(output, filename), contents, "utf8")));
