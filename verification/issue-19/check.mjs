/* Blocking Issue #19 sampling corpus gate. */

import { readdir, readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import {
  MAX_ATTEMPTS,
  MAX_BOUND,
  oracleSample,
  oracleStateFromWords,
} from "../issue-17/oracle.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "../..");
const generated = resolve(root, "verification/generated");

const fail = (message) => {
  throw new Error(`[issue-19] ${message}`);
};
const assert = (condition, message) => {
  if (!condition) fail(message);
};
const tuple = (words) => `readonly [${words.map((word) => JSON.stringify(word)).join(", ")}]`;
const stateType = (words) => `GeneratorState<${tuple(words)}>`;

const resultType = (vector) => {
  const result = vector.result;
  const inputState = vector.state === null
    ? "null"
    : vector.state.kind === "GeneratorState"
      ? stateType(vector.state.words)
      : JSON.stringify(vector.state);
  if (result.ok) {
    return `Success<{ readonly value: ${result.value.value}; readonly state: ${stateType(result.value.state.words)}; readonly attempts: ${result.value.attempts} }>`;
  }
  if (result.code === "sampling-attempts-exhausted") {
    return `Failure<"sampling-attempts-exhausted", { readonly maximumAttempts: ${result.details.maximumAttempts}; readonly attempts: ${result.details.attempts}; readonly state: ${stateType(result.details.state.words)} }>`;
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
  fail(`unsupported oracle result ${JSON.stringify(result)}`);
};

const parseAssertions = (contents, prefix) => {
  const vectors = [];
  const queryPattern = new RegExp(`^type (${prefix}\\d+_\\d+) = (Sample<.+>);$`, "gm");
  for (const match of contents.matchAll(queryPattern)) {
    const [, alias, query] = match;
    const queryMatch = query.match(/^Sample<(.*), (\d+), (\d+)>$/);
    if (!queryMatch) fail(`cannot parse ${alias} query ${query}`);
    const [, input, boundText, fuelText] = queryMatch;
    const stateMatch = input.match(/^GeneratorState<readonly \[(.*)\]>$/);
    const state = stateMatch
      ? {
          kind: "GeneratorState",
          words: [...stateMatch[1].matchAll(/"([0-9a-fA-Z]{8})"/g)].map(([, word]) => word),
        }
      : input === "null" ? null : undefined;
    if (state === undefined) fail(`cannot parse ${alias} input ${input}`);
    const vector = {
      alias,
      state,
      bound: Number(boundText),
      maximumAttempts: Number(fuelText),
    };
    vector.result = oracleSample(vector.state, vector.bound, vector.maximumAttempts);
    const expected = `type _${alias} = Assert<Equal<${alias}, ${resultType(vector)}>>;`;
    assert(contents.includes(expected), `${alias} does not contain the exact oracle-backed result assertion`);
    vectors.push(vector);
  }
  return vectors;
};

const names = (await readdir(generated)).sort();
const gridNames = names.filter((name) => /^prng-issue19-grid-\d{3}\.d\.ts$/.test(name));
const specialNames = names.filter((name) => /^prng-issue19-special-\d{3}\.d\.ts$/.test(name));
const expectedGridNames = Array.from(
  { length: MAX_BOUND * (MAX_ATTEMPTS + 1) },
  (_, index) => `prng-issue19-grid-${String(index).padStart(3, "0")}.d.ts`,
);
const expectedSpecialNames = [
  "prng-issue19-special-000.d.ts",
  "prng-issue19-special-001.d.ts",
  "prng-issue19-special-002.d.ts",
];
assert(JSON.stringify(gridNames) === JSON.stringify(expectedGridNames), `grid shard set differs; expected ${expectedGridNames.length}, got ${gridNames.length}`);
assert(JSON.stringify(specialNames) === JSON.stringify(expectedSpecialNames), `special shard set differs; expected ${expectedSpecialNames.join(", ")}, got ${specialNames.join(", ")}`);

const contents = await Promise.all([...gridNames, ...specialNames].map((name) => readFile(resolve(generated, name), "utf8")));
const gridVectors = contents.slice(0, gridNames.length).flatMap((source) => parseAssertions(source, "Grid"));
const specialVectors = contents.slice(gridNames.length).flatMap((source) => parseAssertions(source, "Special"));
assert(gridVectors.length === MAX_BOUND * (MAX_ATTEMPTS + 1), `expected ${MAX_BOUND * (MAX_ATTEMPTS + 1)} grid assertions, got ${gridVectors.length}`);
assert(specialVectors.length === 9, `expected nine special assertions, got ${specialVectors.length}`);

const seen = new Set();
for (const vector of gridVectors) {
  assert(Number.isInteger(vector.bound) && vector.bound >= 1 && vector.bound <= MAX_BOUND, `grid bound ${vector.bound} is outside 1..${MAX_BOUND}`);
  assert(Number.isInteger(vector.maximumAttempts) && vector.maximumAttempts >= 0 && vector.maximumAttempts <= MAX_ATTEMPTS, `grid fuel ${vector.maximumAttempts} is outside 0..${MAX_ATTEMPTS}`);
  const key = `${vector.bound}/${vector.maximumAttempts}`;
  assert(!seen.has(key), `grid combination ${key} is duplicated`);
  seen.add(key);
}
for (let bound = 1; bound <= MAX_BOUND; bound += 1) {
  for (let maximumAttempts = 0; maximumAttempts <= MAX_ATTEMPTS; maximumAttempts += 1) {
    assert(seen.has(`${bound}/${maximumAttempts}`), `grid combination ${bound}/${maximumAttempts} is missing`);
  }
}

const bySpecialQuery = (bound, maximumAttempts) => specialVectors.find(
  (vector) => vector.bound === bound && vector.maximumAttempts === maximumAttempts,
);
const immediate = bySpecialQuery(1, 1);
assert(immediate?.result.ok && immediate.result.value.value === 0 && immediate.result.value.attempts === 1, "bound one must consume one attempt and return zero");
const rejection = specialVectors.find((vector) => vector.bound === 7 && vector.maximumAttempts === 2);
assert(rejection?.result.ok && rejection.result.value.value === 6 && rejection.result.value.attempts === 2, "forced rejection must reject then accept with exact advancement");
const exhaustedZero = bySpecialQuery(6, 0);
assert(exhaustedZero && !exhaustedZero.result.ok && exhaustedZero.result.code === "sampling-attempts-exhausted" && exhaustedZero.result.details.attempts === 0, "zero fuel must exhaust without advancement");
const exhaustedFour = bySpecialQuery(6, 4);
assert(exhaustedFour && !exhaustedFour.result.ok && exhaustedFour.result.code === "sampling-attempts-exhausted" && exhaustedFour.result.details.attempts === 4, "four rejected attempts must report exact exhaustion advancement");
assert(specialVectors.some((vector) => vector.result.code === "invalid-state-shape"), "invalid state shape precedence fixture is missing");
assert(specialVectors.some((vector) => vector.result.code === "invalid-state-word"), "invalid state word precedence fixture is missing");
assert(specialVectors.some((vector) => vector.result.code === "invalid-state-zero"), "invalid state zero precedence fixture is missing");
assert(specialVectors.some((vector) => vector.result.code === "invalid-bound"), "invalid bound precedence fixture is missing");
assert(specialVectors.some((vector) => vector.result.code === "invalid-attempt-fuel"), "invalid fuel precedence fixture is missing");

console.log(`[issue-19] exact Sample fixtures cover ${gridVectors.length} bound/fuel combinations across ${gridNames.length} grid shards plus ${specialVectors.length} boundary assertions`);
