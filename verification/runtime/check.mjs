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
  validateState,
} from "../../packages/prng/dist/index.js";
import {
  DICE_GROUP_SEMANTIC_PROFILE,
  evaluate,
  payloadOf,
  rollsOf,
  sampleDiceGroups,
  stateOf,
  valueOf,
} from "../../packages/dice/dist/index.js";
import { sampleGroupFaceInBlocks } from "../../packages/dice/dist/groups.js";
import {
  oracleInitialize,
  oracleNext,
  oracleRestoreReplay,
  oracleRestoreState,
  oracleSample,
  oracleSerializeState,
  oracleValidateState,
} from "../prng-semantics/oracle.mjs";
import { oracleEvaluate, oracleSampleDiceGroups } from "../dice-semantics/oracle.mjs";

const here = new URL(".", import.meta.url);
const golden = JSON.parse(await readFile(new URL("../dice-semantics/golden-vectors.json", here), "utf8"));
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
const validationInputs = [
  null,
  {},
  { kind: "Seed", words: seeds[0] },
  { kind: "GeneratorState", words: seeds[0].slice(0, 3) },
  { kind: "GeneratorState", words: ["0000000A", ...seeds[0].slice(1)] },
  { kind: "GeneratorState", words: [1, ...seeds[0].slice(1)] },
  { kind: "GeneratorState", words: ["00000000", "00000000", "00000000", "00000000"] },
  { kind: "GeneratorState", words: seeds[0], ignored: true },
  ...seeds.map((words) => state(words)),
  ...seeds.map((words) => state([`${words[0].slice(0, 7)}z`, ...words.slice(1)])),
];

for (const input of validationInputs) {
  equal(validateState(input), oracleValidateState(input), `validate-state parity for ${JSON.stringify(input)}`);
  prngComparisons += 1;
}

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

assert.equal(
  DICE_GROUP_SEMANTIC_PROFILE,
  "dice-groups-v1/ordered-atomic-rejection-5-blocks-x-5-attempts",
);

let groupInvariantChecks = 0;
let groupOracleComparisons = 0;
for (const seedWords of seeds) {
  const initial = initialize(seedWords);
  assert(initial.ok);
  for (let sideCount = 1; sideCount <= 100; sideCount += 1) {
    const request = [
      { count: 2, sideCount },
      { count: 1, sideCount: 101 - sideCount },
    ];
    const sampled = sampleDiceGroups(request, initial.value);
    equal(sampled, oracleSampleDiceGroups(request, initial.value), "group sampling oracle parity");
    groupOracleComparisons += 1;
    assert(sampled.ok, `group sampling should succeed for d${sideCount}`);
    equal(sampled.value.groups.map((group) => group.faces.length), [2, 1], "group boundaries");
    for (const group of sampled.value.groups) {
      assert(group.faces.every((face) => Number.isInteger(face) && face >= 1 && face <= group.sideCount));
    }
    groupInvariantChecks += 1;
  }
}

const splitInitial = initialize(seeds[0]);
assert(splitInitial.ok);
const combinedGroups = sampleDiceGroups([
  { count: 5, sideCount: 65 },
  { count: 4, sideCount: 20 },
], splitInitial.value);
const firstGroups = sampleDiceGroups([{ count: 5, sideCount: 65 }], splitInitial.value);
assert(combinedGroups.ok && firstGroups.ok);
const secondGroups = sampleDiceGroups([{ count: 4, sideCount: 20 }], firstGroups.value.nextState);
assert(secondGroups.ok);
equal(
  combinedGroups.value.groups,
  [...firstGroups.value.groups, ...secondGroups.value.groups],
  "splitting a request preserves ordered faces",
);
equal(combinedGroups.value.nextState, secondGroups.value.nextState, "splitting a request preserves next state");

const rejectionState = state(["8615d1a1", "16f6c103", "cbc1fbff", "055c3220"]);
assert.equal(sample(rejectionState, 65, 5).ok, false, "crafted state exhausts one PRNG sampling block");
const retriedGroups = sampleDiceGroups([{ count: 1, sideCount: 65 }], rejectionState);
equal(retriedGroups, oracleSampleDiceGroups([{ count: 1, sideCount: 65 }], rejectionState),
  "group sampling retry oracle parity");
groupOracleComparisons += 1;
assert.equal(retriedGroups.ok, true,
  "group sampling continues through a bounded exhausted block");

const exhaustedSuccessors = [
  state(["00000001", "00000002", "00000003", "00000004"]),
  state(["00000005", "00000006", "00000007", "00000008"]),
  state(["00000009", "0000000a", "0000000b", "0000000c"]),
  state(["0000000d", "0000000e", "0000000f", "00000010"]),
  state(["00000011", "00000012", "00000013", "00000014"]),
];
const exhaustedInputs = [];
const exhaustedFuels = [];
const terminalExhaustion = sampleGroupFaceInBlocks(
  2,
  3,
  rejectionState,
  65,
  (current, _bound, maximumAttempts) => {
    exhaustedInputs.push(current);
    exhaustedFuels.push(maximumAttempts);
    return {
      ok: false,
      code: "sampling-attempts-exhausted",
      details: {
        maximumAttempts,
        attempts: maximumAttempts,
        state: exhaustedSuccessors[exhaustedInputs.length - 1],
      },
    };
  },
);
equal(terminalExhaustion, {
  ok: false,
  code: "sampling-attempts-exhausted",
  details: { groupIndex: 2, sampleIndex: 3, attempts: 25 },
}, "five exhausted blocks fail atomically with exact attempt accounting");
equal(exhaustedFuels, [5, 5, 5, 5, 5], "each Dice Group sampling block receives five attempts");
equal(exhaustedInputs, [rejectionState, ...exhaustedSuccessors.slice(0, 4)],
  "exhausted Dice Group blocks thread their private successor states");
assert(!Object.hasOwn(terminalExhaustion.details, "state"),
  "terminal Dice Group exhaustion does not expose a committable state");

for (const invalidGroups of [
  [],
  [{ count: 0, sideCount: 6 }],
  [{ count: 1, sideCount: 0 }],
  [{ count: 1, sideCount: 101 }],
  [{ count: 10_001, sideCount: 6 }],
]) {
  const actual = sampleDiceGroups(invalidGroups, splitInitial.value);
  equal(actual, oracleSampleDiceGroups(invalidGroups, splitInitial.value), "invalid group oracle parity");
  assert.equal(actual.ok, false);
  groupOracleComparisons += 1;
}

let countReads = 0;
let sideCountReads = 0;
const getterGroup = {
  get count() {
    countReads += 1;
    return countReads === 1 ? 1 : 0;
  },
  get sideCount() {
    sideCountReads += 1;
    return sideCountReads === 1 ? 6 : 101;
  },
};
const getterSample = sampleDiceGroups([getterGroup], splitInitial.value);
assert(getterSample.ok, "validated groups are sampled from a captured numeric snapshot");
equal([countReads, sideCountReads], [1, 1], "group fields are read exactly once during validation");

const replayedGroups = sampleDiceGroups([{ count: 10_000, sideCount: 100 }], splitInitial.value);
assert(replayedGroups.ok);
equal(
  replayedGroups,
  oracleSampleDiceGroups([{ count: 10_000, sideCount: 100 }], splitInitial.value),
  "maximum-size group sampling oracle parity",
);
groupOracleComparisons += 1;
equal(
  replayedGroups,
  sampleDiceGroups([{ count: 10_000, sideCount: 100 }], splitInitial.value),
  "maximum-size sampling is deterministic and does not mutate its input state",
);

console.log(
  `[runtime] ${prngComparisons} PRNG, ${diceComparisons} Dice Expression oracle-parity, ${groupOracleComparisons} Dice Group Sampling oracle-parity, and ${groupInvariantChecks} group invariant checks passed`,
);
