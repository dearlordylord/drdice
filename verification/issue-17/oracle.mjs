/*
 * Private issue #17 correctness oracle.
 *
 * This module is intentionally a small, number-based implementation of the
 * selected sequence profile.  It does not import (or share helpers with) a
 * production implementation. This file remains independent verification
 * infrastructure and is excluded from package publication.
 */

export const SEQUENCE_PROFILE = "xoshiro128ss-1.1/warmup16-msb-chunk-rejection-2";
export const SCHEMA_VERSION = 1;
export const MAX_BOUND = 100;
export const MAX_ATTEMPTS = 5;

const WORD_COUNT = 4;
const WORD_PATTERN = /^[0-9a-f]{8}$/;

const asWord32 = (value) => value >>> 0;
const asHexWord = (value) => asWord32(value).toString(16).padStart(8, "0");
const parseWord = (value) => Number.parseInt(value, 16) >>> 0;

const failure = (code, details) => ({ ok: false, code, details });
const success = (value) => ({ ok: true, value });

const isRecord = (value) => typeof value === "object" && value !== null;

/* Return the four words from either the language-neutral array form or the
 * tagged Seed form.  The latter is useful when manually probing the domain
 * boundary; golden data always uses arrays so it stays language-neutral. */
const seedWords = (seed) => {
  if (Array.isArray(seed)) return seed;
  if (isRecord(seed) && seed.kind === "Seed") return seed.words;
  return undefined;
};

const stateWords = (state) => {
  if (!isRecord(state) || state.kind !== "GeneratorState") return undefined;
  return state.words;
};

const validWords = (words) => Array.isArray(words)
  && words.length === WORD_COUNT
  && words.every((word) => typeof word === "string" && WORD_PATTERN.test(word));

const allZero = (words) => words.every((word) => word === "00000000");

const makeState = (words) => ({
  kind: "GeneratorState",
  words: [words[0], words[1], words[2], words[3]],
});

const stateFailure = (state) => {
  const words = stateWords(state);
  if (!Array.isArray(words) || words.length !== WORD_COUNT) {
    return failure("invalid-state-shape", { state });
  }
  if (words.some((word) => typeof word !== "string" || !WORD_PATTERN.test(word))) {
    return failure("invalid-state-word", { state });
  }
  if (allZero(words)) return failure("invalid-state-zero", { state });
  return null;
};

const transitionStateWords = ([s0, s1, s2, s3]) => {
  const t = asWord32(s1 << 9);
  const next2 = asWord32(s2 ^ s0);
  const next3 = asWord32(s3 ^ s1);
  const next1 = asWord32(s1 ^ next2);
  const next0 = asWord32(s0 ^ next3);
  const next2AfterT = asWord32(next2 ^ t);
  const next3AfterRotate = asWord32((next3 << 11) | (next3 >>> 21));
  return [next0, next1, next2AfterT, next3AfterRotate];
};

/** Initialize a Generator State after sixteen state-only diffusion steps. */
export const oracleInitialize = (seed) => {
  const words = seedWords(seed);
  if (!Array.isArray(words) || words.length !== WORD_COUNT) {
    return failure("invalid-seed-shape", { seed });
  }
  if (words.some((word) => typeof word !== "string" || !WORD_PATTERN.test(word))) {
    return failure("invalid-seed-word", { seed });
  }
  if (allZero(words)) return failure("invalid-seed-zero", { seed });
  let warmed = words.map(parseWord);
  for (let transition = 0; transition < 16; transition += 1) {
    warmed = transitionStateWords(warmed);
  }
  return success(makeState(warmed.map(asHexWord)));
};

/**
 * xoshiro128** 1.1 transition.  Every operation is explicitly reduced to a
 * JavaScript unsigned Word32; bitwise operators otherwise expose signed
 * numbers, which would make the oracle's arithmetic representation unstable.
 */
export const oracleNext = (state) => {
  const invalid = stateFailure(state);
  if (invalid) return invalid;

  const [s0, s1, s2, s3] = state.words.map(parseWord);
  const s1Times5 = asWord32(Math.imul(s1, 5));
  const rotated = asWord32((s1Times5 << 7) | (s1Times5 >>> 25));
  const word = asWord32(Math.imul(rotated, 9));
  const next = transitionStateWords([s0, s1, s2, s3]);

  return success({
    word: asHexWord(word),
    state: makeState([
      asHexWord(next[0]),
      asHexWord(next[1]),
      asHexWord(next[2]),
      asHexWord(next[3]),
    ]),
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

/**
 * Sample [0, bound) by scanning complete MSB-first chunks in each output word.
 * The state is validated before bound/fuel preflight.  A valid bound-one draw
 * still consumes one transition, and every rejected attempt consumes exactly
 * one transition before fuel is decremented.
 */
export const oracleSample = (state, bound, maximumAttempts) => {
  const invalidState = stateFailure(state);
  if (invalidState) return invalidState;
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
    const step = oracleNext(current);
    if (!step.ok) return step;
    attempts += 1;
    current = step.value.state;
    if (width === 0) return success({ value: 0, state: current, attempts });
    const word = parseWord(step.value.word);
    const chunkMask = (1 << width) - 1;
    for (let offset = 0; offset + width <= 32; offset += width) {
      const candidate = (word >>> (32 - offset - width)) & chunkMask;
      if (candidate < bound) {
        return success({ value: candidate, state: current, attempts });
      }
    }
  }

  return failure("sampling-attempts-exhausted", {
    maximumAttempts,
    attempts,
    state: current,
  });
};

/** Serialize a current Generator State for resume, not restart. */
export const oracleSerializeState = (state) => {
  const invalid = stateFailure(state);
  if (invalid) return invalid;
  return success({
    schemaVersion: SCHEMA_VERSION,
    sequenceProfile: SEQUENCE_PROFILE,
    state: [...state.words],
  });
};

/** Restore a serialized current state, preserving its next-word position. */
export const oracleRestoreState = (snapshot) => {
  if (!isRecord(snapshot)
    || snapshot.schemaVersion !== SCHEMA_VERSION
    || snapshot.sequenceProfile !== SEQUENCE_PROFILE
    || !Array.isArray(snapshot.state)
    || snapshot.state.length !== WORD_COUNT) {
    return failure("invalid-state-shape", { state: snapshot });
  }
  const restored = makeState(snapshot.state);
  const invalid = stateFailure(restored);
  return invalid ?? success(restored);
};

/** Restore a Replay Token from its Seed, always restarting at the first word. */
export const oracleRestoreReplay = (token) => {
  if (!isRecord(token)
    || token.schemaVersion !== SCHEMA_VERSION
    || token.sequenceProfile !== SEQUENCE_PROFILE
    || !Object.hasOwn(token, "seed")) {
    return failure("invalid-replay-token", { token });
  }
  return oracleInitialize(token.seed);
};

/** Build a tagged state for checks that start from literal vector words. */
export const oracleStateFromWords = (words) => makeState([...words]);
