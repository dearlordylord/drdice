import type {
  GeneratorState,
  RestoreReplay,
  RestoreState,
  RuntimeInitialize,
  RuntimeNext,
  RuntimeSample,
  SeedWords,
  SerializeState,
  Success,
  Word32Text,
} from "./types.js";

export type {
  SequenceProfile,
  SchemaVersion,
  Word32Text,
  SeedWords,
  StateWords,
  Seed,
  GeneratorState,
  FailureCode,
  Failure,
  Success,
  PayloadOf,
  ValueOf,
  WordOf,
  StateOf,
  InvalidSeedFailure,
  InvalidStateFailure,
  InvalidReplayFailure,
  StepSuccess,
  StepResult,
  BoundedSuccess,
  InvalidBoundFailure,
  InvalidAttemptFuelFailure,
  SamplingExhausted,
  BoundedResult,
  Initialize,
  InitializeResult,
  Next,
  Sample,
  ReplayToken,
  SerializedGeneratorState,
  RestoreState,
  RestoreStateResult,
  RestoreReplay,
  RestoreReplayResult,
  SerializeState,
  SerializeStateResult,
  PackageMetadata,
} from "./types.js";

export const SEQUENCE_PROFILE = "xoshiro128ss-1.1/warmup16-msb-chunk-rejection-2" as const;
export const SCHEMA_VERSION = 1 as const;

const MAX_BOUND = 100;
const MAX_ATTEMPTS = 5;
const WORD_PATTERN = /^[0-9a-f]{8}$/;

type WordTuple = [string, string, string, string];
type NumericState = [number, number, number, number];
type RuntimeGeneratorState = { kind: "GeneratorState"; words: WordTuple };
type RuntimeFailure = { ok: false; code: string; details: object };

const success = <Value>(value: Value) => ({ ok: true as const, value });
const failure = (code: string, details: object): RuntimeFailure => ({ ok: false, code, details });
const isRecord = (value: unknown): value is Record<PropertyKey, unknown> => typeof value === "object" && value !== null;
const uint32 = (value: number) => value >>> 0;
const toWord = (value: number) => uint32(value).toString(16).padStart(8, "0");
const fromWord = (value: string) => Number.parseInt(value, 16) >>> 0;

const wordsFromSeed = (seed: unknown): unknown => {
  if (Array.isArray(seed)) return seed;
  if (isRecord(seed) && seed.kind === "Seed") return seed.words;
  return undefined;
};

const wordsFromState = (state: unknown): unknown => isRecord(state) && state.kind === "GeneratorState"
  ? state.words
  : undefined;

const validWords = (words: unknown): words is WordTuple => Array.isArray(words)
  && words.length === 4
  && words.every((word) => typeof word === "string" && WORD_PATTERN.test(word));
const allZero = (words: readonly string[]) => words.every((word) => word === "00000000");
const generatorState = (words: readonly string[]): RuntimeGeneratorState => ({
  kind: "GeneratorState" as const,
  words: [words[0], words[1], words[2], words[3]],
});

const validateState = (state: unknown): RuntimeFailure | null => {
  const words = wordsFromState(state);
  if (!Array.isArray(words) || words.length !== 4) {
    return failure("invalid-state-shape", { state });
  }
  if (!validWords(words)) return failure("invalid-state-word", { state });
  if (allZero(words)) return failure("invalid-state-zero", { state });
  return null;
};

const transition = ([s0, s1, s2, s3]: NumericState): NumericState => {
  const shifted = uint32(s1 << 9);
  const next2 = uint32(s2 ^ s0);
  const next3 = uint32(s3 ^ s1);
  const next1 = uint32(s1 ^ next2);
  const next0 = uint32(s0 ^ next3);
  return [
    next0,
    next1,
    uint32(next2 ^ shifted),
    uint32((next3 << 11) | (next3 >>> 21)),
  ];
};

export const randomSeed = (): SeedWords => {
  const words = new Uint32Array(4);
  globalThis.crypto.getRandomValues(words);
  if (words.every((word) => word === 0)) words[3] = 1;
  return [...words].map(toWord) as WordTuple;
};

const initializeRuntime = (seed: unknown) => {
  const words = wordsFromSeed(seed);
  if (!Array.isArray(words) || words.length !== 4) {
    return failure("invalid-seed-shape", { seed });
  }
  if (!validWords(words)) return failure("invalid-seed-word", { seed });
  if (allZero(words)) return failure("invalid-seed-zero", { seed });

  let warmed = words.map(fromWord) as NumericState;
  for (let index = 0; index < 16; index += 1) warmed = transition(warmed);
  return success(generatorState(warmed.map(toWord)));
};

/** Initialize and warm a runtime Generator State using the Sequence Profile. */
export const initialize = initializeRuntime as <const Input>(seed: Input) => RuntimeInitialize<Input>;

const nextRuntime = (state: unknown) => {
  const invalid = validateState(state);
  if (invalid) return invalid;
  const words = wordsFromState(state) as WordTuple;
  const numericWords = words.map(fromWord) as NumericState;
  const timesFive = uint32(Math.imul(numericWords[1], 5));
  const rotated = uint32((timesFive << 7) | (timesFive >>> 25));
  const word = uint32(Math.imul(rotated, 9));
  return success({
    word: toWord(word),
    state: generatorState(transition(numericWords).map(toWord)),
  });
};

/** Generate one raw Word32 and its next state. */
export const next = nextRuntime as <const Input>(state: Input) => RuntimeNext<Input>;

const widthForBound = (bound: number) => {
  let width = 0;
  let range = 1;
  while (range < bound) {
    width += 1;
    range *= 2;
  }
  return width;
};

const sampleRuntime = (state: unknown, bound: number, maximumAttempts = MAX_ATTEMPTS) => {
  const invalid = validateState(state);
  if (invalid) return invalid;
  if (!Number.isInteger(bound) || bound < 1 || bound > MAX_BOUND) {
    return failure("invalid-bound", { bound });
  }
  if (!Number.isInteger(maximumAttempts) || maximumAttempts < 0 || maximumAttempts > MAX_ATTEMPTS) {
    return failure("invalid-attempt-fuel", { maximumAttempts });
  }

  const width = widthForBound(bound);
  let current: unknown = state;
  let attempts = 0;
  while (attempts < maximumAttempts) {
    const stepped = nextRuntime(current);
    if (!stepped.ok) return stepped;
    attempts += 1;
    current = stepped.value.state;
    if (width === 0) return success({ value: 0, state: current, attempts });
    const word = fromWord(stepped.value.word);
    const mask = (1 << width) - 1;
    for (let offset = 0; offset + width <= 32; offset += width) {
      const candidate = (word >>> (32 - offset - width)) & mask;
      if (candidate < bound) return success({ value: candidate, state: current, attempts });
    }
  }
  return failure("sampling-attempts-exhausted", {
    maximumAttempts,
    attempts,
    state: current,
  });
};

/** Generate an unbiased bounded integer; output-word fuel defaults to 5. */
export const sample = sampleRuntime as <
  const Input,
  const Bound extends number,
  const MaximumAttempts extends number = 5,
>(state: Input, bound: Bound, maximumAttempts?: MaximumAttempts) => RuntimeSample<Input, Bound, MaximumAttempts>;

const serializeStateRuntime = (state: unknown) => {
  const invalid = validateState(state);
  if (invalid) return invalid;
  return success({
    schemaVersion: SCHEMA_VERSION,
    sequenceProfile: SEQUENCE_PROFILE,
    state: [...(wordsFromState(state) as WordTuple)],
  });
};

/** Serialize a current state for later resume. */
export const serializeState = serializeStateRuntime as <const Input>(state: Input) => SerializeState<Input>;

const restoreStateRuntime = (snapshot: unknown) => {
  if (!isRecord(snapshot)
    || snapshot.schemaVersion !== SCHEMA_VERSION
    || snapshot.sequenceProfile !== SEQUENCE_PROFILE
    || !Array.isArray(snapshot.state)
    || snapshot.state.length !== 4) {
    return failure("invalid-state-shape", { state: snapshot });
  }
  const restored = generatorState(snapshot.state);
  return validateState(restored) ?? success(restored);
};

/** Restore a serialized current state without advancing it. */
export const restoreState = restoreStateRuntime as <const Input>(snapshot: Input) => RestoreState<Input>;

const restoreReplayRuntime = (token: unknown) => {
  if (!isRecord(token)
    || token.schemaVersion !== SCHEMA_VERSION
    || token.sequenceProfile !== SEQUENCE_PROFILE
    || !Object.hasOwn(token, "seed")) {
    return failure("invalid-replay-token", { token });
  }
  return initializeRuntime(token.seed);
};

/** Restore a Replay Token by restarting from its Seed. */
export const restoreReplay = restoreReplayRuntime as <const Input>(token: Input) => RestoreReplay<Input>;

const requireSuccess = (result: { ok?: boolean; value?: unknown } | null | undefined): unknown => {
  if (!result?.ok) throw new TypeError("Cannot extract a value from a failed PRNG result");
  return result.value;
};

export const payloadOf = requireSuccess as <const Payload>(result: Success<Payload>) => Payload;
export const valueOf = ((result: Success<{ readonly value: number }>) =>
  (requireSuccess(result) as { value: number }).value) as <const Value extends number>(
    result: Success<{ readonly value: Value }>,
  ) => Value;
export const wordOf = ((result: Success<{ readonly word: Word32Text }>) =>
  (requireSuccess(result) as { word: Word32Text }).word) as <const Word extends Word32Text>(
    result: Success<{ readonly word: Word }>,
  ) => Word;
const stateOfRuntime = (result: Success<unknown>): unknown => {
  const payload = requireSuccess(result);
  return isRecord(payload) && payload.kind === "GeneratorState"
    ? payload
    : isRecord(payload) ? payload.state : undefined;
};
export const stateOf = stateOfRuntime as {
  <const State extends GeneratorState>(result: Success<State>): State;
  <const State extends GeneratorState>(result: Success<{ readonly state: State }>): State;
};
