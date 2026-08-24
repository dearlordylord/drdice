import { mkdir, readdir, readFile, unlink, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { oracleSample, oracleStateFromWords } from "./issue-17/oracle.mjs";

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
  `type InvalidStateNonStringInput = { readonly kind: "GeneratorState"; readonly words: readonly ["00000001", 2, "00000000", "00000001"] };`,
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
  `type InvalidSeedNonStringInput = readonly ["00000001", 2, "00000000", "00000001"];`,
  `type InvalidSeedZeroInput = readonly ["00000000", "00000000", "00000000", "00000000"];`,
  `type InvalidSnapshotShapeInput = { readonly schemaVersion: 1; readonly sequenceProfile: SequenceProfile; readonly state: readonly ["00000001"] };`,
  `type InvalidSnapshotWordInput = { readonly schemaVersion: 1; readonly sequenceProfile: SequenceProfile; readonly state: readonly ["0000000A", "00000000", "00000000", "00000001"] };`,
  `type InvalidSnapshotNonStringInput = { readonly schemaVersion: 1; readonly sequenceProfile: SequenceProfile; readonly state: readonly ["00000001", 2, "00000000", "00000001"] };`,
  `type InvalidSnapshotZeroInput = { readonly schemaVersion: 1; readonly sequenceProfile: SequenceProfile; readonly state: readonly ["00000000", "00000000", "00000000", "00000000"] };`,
  `type InvalidSnapshotWordState = { readonly kind: "GeneratorState"; readonly words: InvalidSnapshotWordInput["state"] };`,
  `type InvalidSnapshotNonStringState = { readonly kind: "GeneratorState"; readonly words: InvalidSnapshotNonStringInput["state"] };`,
  `type InvalidSnapshotZeroState = { readonly kind: "GeneratorState"; readonly words: InvalidSnapshotZeroInput["state"] };`,
  `type InvalidReplaySchemaInput = { readonly schemaVersion: 2; readonly sequenceProfile: SequenceProfile; readonly seed: CanonicalSeed };`,
  `type InvalidReplayProfileInput = { readonly schemaVersion: 1; readonly sequenceProfile: "other-profile"; readonly seed: CanonicalSeed };`,
  `type InvalidSnapshotProfileInput = { readonly schemaVersion: 1; readonly sequenceProfile: "other-profile"; readonly state: FirstSuccessorState["words"] };`,
  `type _InvalidSeedShape = Assert<Equal<Initialize<InvalidSeedShapeInput>, Failure<"invalid-seed-shape", { readonly seed: InvalidSeedShapeInput }>>>;`,
  `type _InvalidSeedWord = Assert<Equal<Initialize<InvalidSeedWordInput>, Failure<"invalid-seed-word", { readonly seed: InvalidSeedWordInput }>>>;`,
  `type _InvalidSeedNonString = Assert<Equal<Initialize<InvalidSeedNonStringInput>, Failure<"invalid-seed-word", { readonly seed: InvalidSeedNonStringInput }>>>;`,
  `type _InvalidSeedZero = Assert<Equal<Initialize<InvalidSeedZeroInput>, Failure<"invalid-seed-zero", { readonly seed: InvalidSeedZeroInput }>>>;`,
  `type _InvalidStateShape = Assert<Equal<Next<null>, Failure<"invalid-state-shape", { readonly state: null }>>>;`,
  `type _InvalidStateWord = Assert<Equal<Next<InvalidStateWordInput>, Failure<"invalid-state-word", { readonly state: InvalidStateWordInput }>>>;`,
  `type _InvalidStateNonString = Assert<Equal<Next<InvalidStateNonStringInput>, Failure<"invalid-state-word", { readonly state: InvalidStateNonStringInput }>>>;`,
  `type _InvalidStateZero = Assert<Equal<Next<InvalidStateZeroInput>, Failure<"invalid-state-zero", { readonly state: InvalidStateZeroInput }>>>;`,
  `type _SeedStateDistinct = Assert<Equal<Next<TaggedCanonicalSeed>, Failure<"invalid-state-shape", { readonly state: TaggedCanonicalSeed }>>>;`,
  `type _InvalidReplaySchema = Assert<Equal<RestoreReplay<InvalidReplaySchemaInput>, Failure<"invalid-replay-token", { readonly token: InvalidReplaySchemaInput }>>>;`,
  `type _InvalidReplayProfile = Assert<Equal<RestoreReplay<InvalidReplayProfileInput>, Failure<"invalid-replay-token", { readonly token: InvalidReplayProfileInput }>>>;`,
  `type _InvalidSnapshotShape = Assert<Equal<RestoreState<InvalidSnapshotShapeInput>, Failure<"invalid-state-shape", { readonly state: InvalidSnapshotShapeInput }>>>;`,
  `type _InvalidSnapshotWord = Assert<Equal<RestoreState<InvalidSnapshotWordInput>, Failure<"invalid-state-word", { readonly state: InvalidSnapshotWordState }>>>;`,
  `type _InvalidSnapshotNonString = Assert<Equal<RestoreState<InvalidSnapshotNonStringInput>, Failure<"invalid-state-word", { readonly state: InvalidSnapshotNonStringState }>>>;`,
  `type _InvalidSnapshotZero = Assert<Equal<RestoreState<InvalidSnapshotZeroInput>, Failure<"invalid-state-zero", { readonly state: InvalidSnapshotZeroState }>>>;`,
  `type _InvalidSnapshotProfile = Assert<Equal<RestoreState<InvalidSnapshotProfileInput>, Failure<"invalid-state-shape", { readonly state: InvalidSnapshotProfileInput }>>>;`,
  `type _InvalidSerializeShape = Assert<Equal<SerializeState<null>, Failure<"invalid-state-shape", { readonly state: null }>>>;`,
  `type _InvalidSerializeWord = Assert<Equal<SerializeState<InvalidStateWordInput>, Failure<"invalid-state-word", { readonly state: InvalidStateWordInput }>>>;`,
  `type _InvalidSerializeZero = Assert<Equal<SerializeState<InvalidStateZeroInput>, Failure<"invalid-state-zero", { readonly state: InvalidStateZeroInput }>>>;`,
  `type _ReplayRejectsWidenedWords = Assert<Equal<ReplayToken<readonly [string, string, string, string]>, never>>;`,
  `type _SnapshotRejectsWidenedWords = Assert<Equal<SerializedGeneratorState<readonly [string, string, string, string]>, never>>;`,
  ``,
];

const transitions = golden.rawWordVector.transitions.map((transition, index) => ({ ...transition, index }));
const transitionShards = transitions.map((transition) => [transition]);

const prngAssertions = transitionShards.map((shard, index) => [
  ...prngHeader,
  ...transitionAssertions(shard, index === 0),
].join("\n"));
const replayFixture = [
  ...prngHeader,
  ...replayAssertions,
].join("\n");

/* -------------------------------------------------------------------------- */
/* Issue #19 bounded-sampling fixtures                                       */
/* -------------------------------------------------------------------------- */

/* The fixture generator is the only place that consults the private numeric
 * oracle.  Generated declarations contain only literal inputs and expected
 * public results, so the package and its consumers never depend on runtime
 * verification code. */
const samplingHeader = [
  `/* GENERATED FILE. Run pnpm generate:fixtures; do not edit by hand. */`,
  `import type {`,
  `  Failure,`,
  `  GeneratorState,`,
  `  Sample,`,
  `  Success,`,
  `} from "@drdice/prng";`,
  ``,
  `type Equal<Left, Right> =`,
  `  (<Value>() => Value extends Left ? 1 : 2) extends`,
  `  (<Value>() => Value extends Right ? 1 : 2) ? true : false;`,
  `type Assert<Value extends true> = Value;`,
  ``,
].join("\n");

const sampleExpected = (vector) => {
  const result = vector.result;
  const inputState = vector.state === null
    ? "null"
    : vector.state.kind === "GeneratorState"
      ? `GeneratorState<${tuple(vector.state.words)}>`
      : JSON.stringify(vector.state);
  if (result.ok) {
    return `Success<{ readonly value: ${result.value.value}; readonly state: ${state(result.value.state.words)}; readonly attempts: ${result.value.attempts} }>`;
  }
  if (result.code === "sampling-attempts-exhausted") {
    return `Failure<"sampling-attempts-exhausted", { readonly maximumAttempts: ${result.details.maximumAttempts}; readonly attempts: ${result.details.attempts}; readonly state: ${state(result.details.state.words)} }>`;
  }
  if (result.code === "invalid-bound") {
    return `Failure<"invalid-bound", { readonly bound: ${String(result.details.bound)} }>`;
  }
  if (result.code === "invalid-attempt-fuel") {
    return `Failure<"invalid-attempt-fuel", { readonly maximumAttempts: ${String(result.details.maximumAttempts)} }>`;
  }
  if (result.code === "invalid-state-shape") {
    return `Failure<"invalid-state-shape", { readonly state: ${inputState} }>`;
  }
  if (result.code === "invalid-state-word") {
    return `Failure<"invalid-state-word", { readonly state: ${inputState} }>`;
  }
  if (result.code === "invalid-state-zero") {
    return `Failure<"invalid-state-zero", { readonly state: ${inputState} }>`;
  }
  throw new Error(`unsupported issue-19 fixture result: ${JSON.stringify(result)}`);
};

const sampleAssertion = (vector) => {
  const input = vector.state === null
    ? "null"
    : vector.state.kind === "GeneratorState"
      ? `GeneratorState<${tuple(vector.state.words)}>`
      : JSON.stringify(vector.state);
  const expected = sampleExpected(vector);
  return [
    `type ${vector.alias} = Sample<${input}, ${String(vector.bound)}, ${String(vector.maximumAttempts)}>;`,
    `type _${vector.alias} = Assert<Equal<${vector.alias}, ${expected}>>;`,
    ``,
  ].join("\n");
};

const stateWordsPool = [
  golden.canonicalSeed,
  ...golden.rawWordVector.transitions.slice(0, 10).map(({ inputState }) => inputState),
  golden.craftedRejectionState,
];

const makeState = (words) => oracleStateFromWords(words);
const gridVectors = [];
for (let bound = 1; bound <= 100; bound += 1) {
  for (let maximumAttempts = 0; maximumAttempts <= 4; maximumAttempts += 1) {
    const words = stateWordsPool[(bound * 5 + maximumAttempts) % stateWordsPool.length];
    const inputState = makeState(words);
    gridVectors.push({
      id: `grid-bound-${bound}-fuel-${maximumAttempts}`,
      state: inputState,
      bound,
      maximumAttempts,
      result: oracleSample(inputState, bound, maximumAttempts),
    });
  }
}

const specialInputs = [
  {
    id: "bound-one-consumes-one",
    state: makeState(golden.canonicalSeed),
    bound: 1,
    maximumAttempts: 1,
  },
  {
    id: "forced-rejection-then-acceptance",
    state: makeState(golden.craftedRejectionState),
    bound: 7,
    maximumAttempts: 2,
  },
  {
    id: "forced-rejection-exhaustion-zero",
    state: makeState(golden.craftedRejectionState),
    bound: 6,
    maximumAttempts: 0,
  },
  {
    id: "forced-rejection-exhaustion-four",
    state: makeState(golden.craftedRejectionState),
    bound: 6,
    maximumAttempts: 4,
  },
  {
    id: "invalid-state-precedes-bound-and-fuel",
    state: null,
    bound: 101,
    maximumAttempts: 5,
  },
  {
    id: "invalid-bound-precedes-fuel",
    state: makeState(golden.canonicalSeed),
    bound: 101,
    maximumAttempts: 5,
  },
  {
    id: "invalid-fuel-after-valid-bound",
    state: makeState(golden.canonicalSeed),
    bound: 1,
    maximumAttempts: 5,
  },
  {
    id: "invalid-state-word-precedes-preflight",
    state: { kind: "GeneratorState", words: ["0000000A", "00000000", "00000000", "00000001"] },
    bound: 101,
    maximumAttempts: 5,
  },
  {
    id: "invalid-state-zero-precedes-preflight",
    state: { kind: "GeneratorState", words: ["00000000", "00000000", "00000000", "00000000"] },
    bound: 101,
    maximumAttempts: 5,
  },
];

const specialVectors = specialInputs.map((input) => ({
  ...input,
  result: oracleSample(input.state, input.bound, input.maximumAttempts),
}));

/* Keep every bound/fuel query in its own real artifact.  The checker discovers
 * these exact names and rejects missing, extra, or dirty shards; the budget
 * lane therefore measures the complete 500-query grid rather than a bundled
 * representative subset. */
const samplingShardSize = 1;
const chunk = (values, size) => Array.from(
  { length: Math.ceil(values.length / size) },
  (_, index) => values.slice(index * size, (index + 1) * size),
);
const samplingShards = chunk(gridVectors, samplingShardSize);
const samplingFixtureFiles = samplingShards.map((vectors, shardIndex) => [
  `prng-issue19-grid-${String(shardIndex).padStart(3, "0")}.d.ts`,
  `${samplingHeader}${vectors.map((vector, vectorIndex) => sampleAssertion({
    ...vector,
    alias: `Grid${shardIndex}_${vectorIndex}`,
  })).join("")}`,
]);
const specialFixtureFiles = chunk(specialVectors, 3).map((vectors, shardIndex) => [
  `prng-issue19-special-${String(shardIndex).padStart(3, "0")}.d.ts`,
  `${samplingHeader}${vectors.map((vector, vectorIndex) => sampleAssertion({
    ...vector,
    alias: `Special${shardIndex}_${vectorIndex}`,
  })).join("")}`,
]);

/* Keep each exact transition and the replay assertions in separate artifacts.
 * The budget gate checks every artifact under both TypeScript 7 checker policies. */
const fixtureFiles = [
  ...prngAssertions.map((contents, index) => [`prng-issue18-transitions-${index}.d.ts`, contents]),
  ["prng-issue18-replay.d.ts", replayFixture],
  ...samplingFixtureFiles,
  ...specialFixtureFiles,
];

/* The old monolithic construction is intentionally gone; this assertion keeps
 * accidental reintroduction from silently changing the shard layout. */
for (const [filename, contents] of fixtureFiles) {
  if (!contents.includes("GENERATED FILE")) throw new Error(`missing generated marker in ${filename}`);
}

await mkdir(output, { recursive: true });
const generatedNames = new Set(fixtureFiles.map(([filename]) => filename).concat("scaffold.d.ts"));
const staleIssue19 = (await readdir(output))
  .filter((filename) => /^prng-issue19-.*\.d\.ts$/.test(filename) && !generatedNames.has(filename));
await Promise.all(staleIssue19.map((filename) => unlink(resolve(output, filename))));
await writeFile(resolve(output, "scaffold.d.ts"), scaffold, "utf8");
await Promise.all(fixtureFiles.map(([filename, contents]) => writeFile(resolve(output, filename), contents, "utf8")));
