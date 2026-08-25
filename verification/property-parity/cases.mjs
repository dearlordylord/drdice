import { oracleInitialize } from "../prng-semantics/oracle.mjs";
import { oracleEvaluate } from "../dice-semantics/oracle.mjs";

export const DEFAULT_GENERATOR_SEED = 0x25d1ce5;
export const CASE_COUNT = 192;
export const CASES_PER_SHARD = 12;

const canonicalWords = ["00000001", "00000002", "00000003", "00000004"];
const word = (value) => (value >>> 0).toString(16).padStart(8, "0");

const randomSource = (random) => {
  const termCount = 1 + (random() % 3);
  const terms = [];
  for (let index = 0; index < termCount; index += 1) {
    if (random() % 4 === 0) {
      terms.push(String(random() % 51));
      continue;
    }
    const count = 1 + (random() % 2);
    const sides = 1 + (random() % 100);
    const dice = `${count === 1 && random() % 2 === 0 ? "" : count}d${sides}`;
    terms.push(random() % 5 === 0 ? `( ${dice} )` : dice);
  }
  let source = terms[0];
  for (let index = 1; index < terms.length; index += 1) {
    source += `${random() % 2 === 0 ? " + " : " - "}${terms[index]}`;
  }
  return random() % 4 === 0 ? `\t${source}\n` : source;
};

const deliberateSources = [
  "", "   ", "d", "01", "d0", "0d6", "(d6", "d6)", "d101", "999",
  "d6 +", "d6 * d4", "(((((d6)))))", "3d6+3d6+3d6", "100-1+2", "d1", "d100",
  "4d6 + 12", "((d6)) + d8", "d6-d6-d6", "2D20\t+\n3", "8d1", "d6 + 100",
];

export const generateCases = (generatorSeed = DEFAULT_GENERATOR_SEED, caseCount = CASE_COUNT) => {
  let current = generatorSeed >>> 0;
  const random = () => {
    current ^= current << 13;
    current ^= current >>> 17;
    current ^= current << 5;
    current >>>= 0;
    return current;
  };
  const cases = [];
  for (let index = 0; index < caseCount; index += 1) {
    const seedWords = index === 0
      ? [...canonicalWords]
      : [word(random()), word(random()), word(random()), word(random())];
    if (seedWords.every((item) => item === "00000000")) seedWords[3] = "00000001";
    const initialized = oracleInitialize(seedWords);
    if (!initialized.ok) throw new Error(`oracle rejected generated Seed ${JSON.stringify(seedWords)}`);
    let source = index < deliberateSources.length ? deliberateSources[index] : randomSource(random);
    let maximumAttempts = index === 20 ? 0
      : index === 21 ? 5
        : index === 22 ? 6
          : index === 23 ? 1000000
            : random() % 6;
    let state = initialized.value;
    if (index >= 24 && index <= 30) source = "d6";
    if (index === 24 || index === 30) state = null;
    if (index === 25) state = { kind: "GeneratorState", words: ["00000000", "00000000", "00000000", "00000000"] };
    if (index === 26) state = { kind: "GeneratorState", words: ["00000001"] };
    if (index === 27) state = { kind: "GeneratorState", words: ["00000001", "00000002", "00000003", "NOTAWORD"] };
    if (index === 28) maximumAttempts = -1;
    if (index === 29) maximumAttempts = 1.5;
    if (index === 30) source = "d6 +";
    const expected = oracleEvaluate(source, state, maximumAttempts);
    cases.push({
      generatorSeed,
      replayPath: String(index),
      seed: seedWords,
      source,
      state,
      maximumAttempts,
      expected,
    });
  }
  return cases;
};

export const shrinkCase = (original) => {
  const candidates = [];
  const add = (change) => {
    const candidate = { ...original, ...change };
    candidate.expected = oracleEvaluate(candidate.source, candidate.state, candidate.maximumAttempts);
    if (!candidates.some((item) => JSON.stringify(item) === JSON.stringify(candidate))) candidates.push(candidate);
  };
  for (const source of [original.source.trim(), original.source.split(/[+-]/u)[0]?.trim(), "d1", "0", ""]) {
    if (source !== undefined && source !== original.source) add({ source });
  }
  if (original.maximumAttempts !== 0) add({ maximumAttempts: 0 });
  if (original.maximumAttempts !== 5) add({ maximumAttempts: 5 });
  const canonical = oracleInitialize(canonicalWords);
  if (canonical.ok && JSON.stringify(original.state) !== JSON.stringify(canonical.value)) {
    add({ seed: [...canonicalWords], state: canonical.value });
  }
  return candidates;
};

export const selectReplay = (cases, replayPath) => {
  const selected = cases.find((item) => item.replayPath === String(replayPath));
  if (!selected) throw new Error(`replay path ${replayPath} is outside 0..${cases.length - 1}`);
  return selected;
};
