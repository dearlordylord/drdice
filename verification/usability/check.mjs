import assert from "node:assert/strict";

import {
  initialize as runtimeInitialize,
  sample as runtimeSample,
} from "../../packages/prng/src/index.js";
import { evaluate } from "../../packages/dice/src/index.js";

const GAMEPLAY_OUTPUT_FUEL = 5;
const MAX_EXHAUSTION_PROBABILITY = 1e-6;
const DEMO_SEED = ["00000001", "00000002", "00000003", "00000004"];

const fail = (message) => {
  throw new Error(`[usability] ${message}`);
};

const word = (value) => (value >>> 0).toString(16).padStart(8, "0");
const initialize = (seed) => {
  const initialized = runtimeInitialize(seed);
  if (!initialized.ok) fail(`valid usability seed was rejected: ${JSON.stringify(initialized)}`);
  return initialized.value;
};

const roll = (state, sides) => {
  const sampled = runtimeSample(state, sides, GAMEPLAY_OUTPUT_FUEL);
  if (!sampled.ok) fail(`d${sides} exhausted during deterministic usability corpus: ${JSON.stringify(sampled)}`);
  return {
    face: sampled.value.value + 1,
    state: sampled.value.state,
  };
};

const rollFaces = (seed, sides, count) => {
  let state = initialize(seed);
  const faces = [];
  for (let index = 0; index < count; index += 1) {
    const result = roll(state, sides);
    faces.push(result.face);
    state = result.state;
  }
  return { faces, state };
};

const leadingOnes = (faces) => {
  const firstNonOne = faces.findIndex((face) => face !== 1);
  return firstNonOne < 0 ? faces.length : firstNonOne;
};

/* This is a mathematical bound, not a statistical test. Each output supplies
 * every complete fixed-width candidate before another state transition is
 * consumed. The first in-range candidate is exactly uniform. */
let worstReliability;
for (let bound = 1; bound <= 100; bound += 1) {
  const width = Math.ceil(Math.log2(bound));
  const candidatesPerOutput = width === 0 ? 1 : Math.floor(32 / width);
  const rejectionPerCandidate = width === 0 ? 0 : ((2 ** width) - bound) / (2 ** width);
  const exhaustionProbability = rejectionPerCandidate ** (candidatesPerOutput * GAMEPLAY_OUTPUT_FUEL);
  if (!worstReliability || exhaustionProbability > worstReliability.probability) {
    worstReliability = { bound, probability: exhaustionProbability };
  }
  assert.ok(
    exhaustionProbability <= MAX_EXHAUSTION_PROBABILITY,
    `d${bound} exhaustion probability ${exhaustionProbability} exceeds ${MAX_EXHAUSTION_PROBABILITY}`,
  );
}

const demo = rollFaces(DEMO_SEED, 6, 8).faces;
assert.ok(new Set(demo).size >= 3, `demo seed lacks early variety: ${demo.join(",")}`);
assert.ok(leadingOnes(demo) <= 2, `demo seed retains a conspicuous minimum-face prefix: ${demo.join(",")}`);

const humanSeeds = [
  DEMO_SEED,
  ["00000000", "00000000", "00000000", "00000001"],
  ["00000000", "00000000", "00000000", "0000002a"],
  ["0000002a", "0000002a", "0000002a", "0000002a"],
  ["00000064", "00000065", "00000066", "00000067"],
  ["000004d2", "000004d3", "000004d4", "000004d5"],
];
const initializedStates = new Set();
for (const seed of humanSeeds) {
  const state = initialize(seed);
  initializedStates.add(state.words.join(":"));
  const faces = rollFaces(seed, 6, 4).faces;
  assert.notDeepEqual(faces, [1, 1, 1, 1], `human seed opens with four minimum faces: ${seed.join(":")}`);
}
assert.equal(initializedStates.size, humanSeeds.length, "curated human seeds collide after initialization");

const distributionCheck = (sides, tolerancePercent, minimumMean, maximumMean) => {
  const counts = Array(sides).fill(0);
  let maximumMinimumPrefix = 0;
  for (let seedNumber = 1; seedNumber <= 256; seedNumber += 1) {
    const seed = [word(seedNumber), word(seedNumber + 1), word(seedNumber + 2), word(seedNumber + 3)];
    const faces = rollFaces(seed, sides, 64).faces;
    maximumMinimumPrefix = Math.max(maximumMinimumPrefix, leadingOnes(faces));
    for (const face of faces) counts[face - 1] += 1;
  }

  const total = counts.reduce((sum, count) => sum + count, 0);
  const expected = total / sides;
  const maximumDeviationPercent = Math.max(
    ...counts.map((count) => Math.abs(count - expected) / expected * 100),
  );
  const mean = counts.reduce((sum, count, index) => sum + count * (index + 1), 0) / total;
  assert.ok(maximumDeviationPercent <= tolerancePercent, `d${sides} corpus deviation ${maximumDeviationPercent.toFixed(2)}% exceeds ${tolerancePercent}%: ${counts.join(",")}`);
  assert.ok(mean >= minimumMean && mean <= maximumMean, `d${sides} corpus mean ${mean} is outside [${minimumMean}, ${maximumMean}]`);
  assert.ok(maximumMinimumPrefix <= 3, `d${sides} corpus contains a minimum-face prefix of ${maximumMinimumPrefix}`);
  return { counts, mean, maximumDeviationPercent };
};

const d6Distribution = distributionCheck(6, 10, 3.4, 3.6);
const d20Distribution = distributionCheck(20, 15, 10.3, 10.7);

const encounter = (seed) => {
  let state = initialize(seed);
  const transcript = [];
  for (const [label, expression] of [
    ["initiative", "d20+3"],
    ["hero attack", "d20+5"],
    ["hero damage", "2d6+3"],
    ["monster attack", "d20+4"],
    ["monster damage", "d8+2"],
    ["healing", "2d4+2"],
  ]) {
    const result = evaluate(expression, state, GAMEPLAY_OUTPUT_FUEL);
    if (!result.ok) fail(`${label} (${expression}) failed: ${JSON.stringify(result)}`);
    transcript.push({
      label,
      expression,
      total: result.value.total,
      faces: result.value.rollTrace.map(({ face }) => face),
    });
    state = result.value.nextState;
  }
  return transcript;
};

const firstEncounter = encounter(DEMO_SEED);
assert.deepEqual(encounter(DEMO_SEED), firstEncounter, "replaying a game seed changed its encounter");
assert.notDeepEqual(
  encounter(["00000005", "00000006", "00000007", "00000008"]),
  firstEncounter,
  "different game seeds produced the same encounter",
);
assert.ok(new Set(firstEncounter.flatMap(({ faces }) => faces)).size >= 4, `game encounter lacks varied faces: ${JSON.stringify(firstEncounter)}`);

console.log(`[usability] demo d6 sequence: ${demo.join(", ")}`);
console.log(`[usability] d6 mean ${d6Distribution.mean.toFixed(4)}, max face-count deviation ${d6Distribution.maximumDeviationPercent.toFixed(2)}%`);
console.log(`[usability] d20 mean ${d20Distribution.mean.toFixed(4)}, max face-count deviation ${d20Distribution.maximumDeviationPercent.toFixed(2)}%`);
console.log(`[usability] worst per-die exhaustion probability: d${worstReliability.bound} ${worstReliability.probability}`);
console.log(`[usability] deterministic encounter: ${firstEncounter.map(({ label, total, faces }) => `${label}=${total}[${faces.join(",")}]`).join("; ")}`);
