export const SEQUENCE_PROFILE = "xoshiro128ss-1.1/warmup16-msb-chunk-rejection-2";
export const SCHEMA_VERSION = 1;

const MAX_BOUND = 100;
const MAX_ATTEMPTS = 5;
const WORD_PATTERN = /^[0-9a-f]{8}$/;

const success = (value) => ({ ok: true, value });
const failure = (code, details) => ({ ok: false, code, details });
const isRecord = (value) => typeof value === "object" && value !== null;
const uint32 = (value) => value >>> 0;
const toWord = (value) => uint32(value).toString(16).padStart(8, "0");
const fromWord = (value) => Number.parseInt(value, 16) >>> 0;

const wordsFromSeed = (seed) => {
  if (Array.isArray(seed)) return seed;
  if (isRecord(seed) && seed.kind === "Seed") return seed.words;
  return undefined;
};

const wordsFromState = (state) => isRecord(state) && state.kind === "GeneratorState"
  ? state.words
  : undefined;

const validWords = (words) => Array.isArray(words)
  && words.length === 4
  && words.every((word) => typeof word === "string" && WORD_PATTERN.test(word));
const allZero = (words) => words.every((word) => word === "00000000");
const generatorState = (words) => ({
  kind: "GeneratorState",
  words: [words[0], words[1], words[2], words[3]],
});

const validateState = (state) => {
  const words = wordsFromState(state);
  if (!Array.isArray(words) || words.length !== 4) {
    return failure("invalid-state-shape", { state });
  }
  if (!validWords(words)) return failure("invalid-state-word", { state });
  if (allZero(words)) return failure("invalid-state-zero", { state });
  return null;
};

const transition = ([s0, s1, s2, s3]) => {
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

export const randomSeed = () => {
  const words = new Uint32Array(4);
  globalThis.crypto.getRandomValues(words);
  if (words.every((word) => word === 0)) words[3] = 1;
  return [...words].map(toWord);
};

export const initialize = (seed) => {
  const words = wordsFromSeed(seed);
  if (!Array.isArray(words) || words.length !== 4) {
    return failure("invalid-seed-shape", { seed });
  }
  if (!validWords(words)) return failure("invalid-seed-word", { seed });
  if (allZero(words)) return failure("invalid-seed-zero", { seed });

  let warmed = words.map(fromWord);
  for (let index = 0; index < 16; index += 1) warmed = transition(warmed);
  return success(generatorState(warmed.map(toWord)));
};

export const next = (state) => {
  const invalid = validateState(state);
  if (invalid) return invalid;
  const words = state.words.map(fromWord);
  const timesFive = uint32(Math.imul(words[1], 5));
  const rotated = uint32((timesFive << 7) | (timesFive >>> 25));
  const word = uint32(Math.imul(rotated, 9));
  return success({
    word: toWord(word),
    state: generatorState(transition(words).map(toWord)),
  });
};

const widthForBound = (bound) => {
  let width = 0;
  let range = 1;
  while (range < bound) {
    width += 1;
    range *= 2;
  }
  return width;
};

export const sample = (state, bound, maximumAttempts = MAX_ATTEMPTS) => {
  const invalid = validateState(state);
  if (invalid) return invalid;
  if (!Number.isInteger(bound) || bound < 1 || bound > MAX_BOUND) {
    return failure("invalid-bound", { bound });
  }
  if (!Number.isInteger(maximumAttempts) || maximumAttempts < 0 || maximumAttempts > MAX_ATTEMPTS) {
    return failure("invalid-attempt-fuel", { maximumAttempts });
  }

  const width = widthForBound(bound);
  let current = state;
  let attempts = 0;
  while (attempts < maximumAttempts) {
    const stepped = next(current);
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

export const serializeState = (state) => {
  const invalid = validateState(state);
  if (invalid) return invalid;
  return success({
    schemaVersion: SCHEMA_VERSION,
    sequenceProfile: SEQUENCE_PROFILE,
    state: [...state.words],
  });
};

export const restoreState = (snapshot) => {
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

export const restoreReplay = (token) => {
  if (!isRecord(token)
    || token.schemaVersion !== SCHEMA_VERSION
    || token.sequenceProfile !== SEQUENCE_PROFILE
    || !Object.hasOwn(token, "seed")) {
    return failure("invalid-replay-token", { token });
  }
  return initialize(token.seed);
};

const requireSuccess = (result) => {
  if (!result?.ok) throw new TypeError("Cannot extract a value from a failed PRNG result");
  return result.value;
};

export const payloadOf = (result) => requireSuccess(result);
export const valueOf = (result) => requireSuccess(result).value;
export const wordOf = (result) => requireSuccess(result).word;
export const stateOf = (result) => {
  const payload = requireSuccess(result);
  return payload?.kind === "GeneratorState" ? payload : payload.state;
};
