import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import {
  initialize,
  next,
  randomSeed,
  restoreReplay,
  restoreState,
  sample,
  serializeState,
} from "../../packages/prng/src/index.js";
import { evaluate, payloadOf, rollsOf, stateOf, valueOf } from "../../packages/dice/src/index.js";
import {
  oracleInitialize,
  oracleNext,
  oracleRestoreReplay,
  oracleRestoreState,
  oracleSample,
  oracleSerializeState,
} from "../issue-17/oracle.mjs";
import { oracleEvaluate } from "../issue-20/oracle.mjs";

const here = new URL(".", import.meta.url);
const golden = JSON.parse(await readFile(new URL("../issue-20/golden-vectors.json", here), "utf8"));
const equal = (actual, expected, label) => assert.deepStrictEqual(actual, expected, label);
const state = (words) => ({ kind: "GeneratorState", words: [...words] });

let entropySeed = randomSeed();
assert.equal(entropySeed.length, 4);
assert(entropySeed.every((word) => /^[0-9a-f]{8}$/.test(word)));
assert(entropySeed.some((word) => word !== "00000000"));

let entropy = 0x6d2b79f5;
const randomWord = () => {
  entropy = (Math.imul(entropy ^ (entropy >>> 15), 1 | entropy)
    + Math.imul(entropy ^ (entropy >>> 7), 61 | entropy)) ^ entropy;
  entropy = (entropy ^ (entropy >>> 14)) >>> 0;
  return entropy.toString(16).padStart(8, "0");
};

const seeds = Array.from({ length: 32 }, () => {
  const words = [randomWord(), randomWord(), randomWord(), randomWord()];
  if (words.every((word) => word === "00000000")) words[3] = "00000001";
  return words;
});
seeds.unshift(["00000001", "00000002", "00000003", "00000004"]);

let prngComparisons = 0;
for (const seed of seeds) {
  const runtimeInitial = initialize(seed);
  const oracleInitial = oracleInitialize(seed);
  equal(runtimeInitial, oracleInitial, `initialize parity for ${seed.join("/")}`);
  prngComparisons += 1;
  if (!runtimeInitial.ok) continue;

  let currentRuntime = runtimeInitial.value;
  let currentOracle = oracleInitial.value;
  for (let stepIndex = 0; stepIndex < 8; stepIndex += 1) {
    const runtimeStep = next(currentRuntime);
    const oracleStep = oracleNext(currentOracle);
    equal(runtimeStep, oracleStep, `next parity at step ${stepIndex}`);
    prngComparisons += 1;
    currentRuntime = runtimeStep.value.state;
    currentOracle = oracleStep.value.state;
  }

  for (let bound = 1; bound <= 100; bound += 1) {
    for (let fuel = 0; fuel <= 5; fuel += 1) {
      equal(
        sample(runtimeInitial.value, bound, fuel),
        oracleSample(oracleInitial.value, bound, fuel),
        `sample parity for bound ${bound}, fuel ${fuel}`,
      );
      prngComparisons += 1;
    }
  }

  const snapshot = serializeState(currentRuntime);
  equal(snapshot, oracleSerializeState(currentOracle), "serialize parity");
  equal(restoreState(snapshot.value), oracleRestoreState(snapshot.value), "restore-state parity");
  const token = {
    schemaVersion: 1,
    sequenceProfile: "xoshiro128ss-1.1/warmup16-msb-chunk-rejection-2",
    seed,
  };
  equal(restoreReplay(token), oracleRestoreReplay(token), "replay parity");
  prngComparisons += 3;
}

const vectorState = (vector) => vector.stateWords ? state(vector.stateWords) : vector.stateInput;
let diceComparisons = 0;
for (const vector of golden.cases) {
  equal(
    evaluate(vector.source, vectorState(vector), vector.maximumAttempts),
    oracleEvaluate(vector.source, vectorState(vector), vector.maximumAttempts),
    `golden dice parity for ${vector.id}`,
  );
  diceComparisons += 1;
}

for (let index = 0; index < 256; index += 1) {
  const firstCount = (entropy % 3) + 1;
  const firstSides = (entropy % 100) + 1;
  randomWord();
  const secondCount = (entropy % 3) + 1;
  const secondSides = (entropy % 100) + 1;
  randomWord();
  const constant = entropy % 21;
  const operator = entropy & 1 ? "+" : "-";
  randomWord();
  const expression = `${firstCount}d${firstSides} ${operator} ${secondCount}d${secondSides} + ${constant}`;
  const initial = initialize(seeds[index % seeds.length]);
  assert(initial.ok);
  equal(
    evaluate(expression, initial.value),
    oracleEvaluate(expression, initial.value, 5),
    `generated dice parity for ${expression}`,
  );
  diceComparisons += 1;
}

const canonical = initialize(["00000001", "00000002", "00000003", "00000004"]);
assert(canonical.ok);
const first = evaluate("d20", canonical.value);
assert(first.ok);
equal(valueOf(first), 12, "runtime value extraction");
equal(rollsOf(first), first.value.rollTrace, "runtime rolls extraction");
equal(stateOf(first), first.value.nextState, "runtime state extraction");
equal(payloadOf(first), first.value, "runtime payload extraction");
equal(
  evaluate("4d6 + 12", stateOf(first)),
  oracleEvaluate("4d6 + 12", first.value.nextState, 5),
  "ordinary evaluation state threading",
);

console.log(`[runtime] ${prngComparisons} PRNG and ${diceComparisons} Dice oracle-parity comparisons passed`);
