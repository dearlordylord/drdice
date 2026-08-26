/*
 * Blocking Dice semantics oracle/golden gate.
 *
 * The JSON corpus is reviewed literal evidence.  This checker never writes or
 * regenerates it: every oracle result is compared with the committed data,
 * and independent anchors pin the semantic profile and boundary choices.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  DICE_SEMANTIC_PROFILE,
  DICE_SEMANTIC_VERSION,
  DICE_GROUP_LIMITS,
  DICE_GROUP_SEMANTIC_PROFILE,
  DICE_GROUP_SEMANTIC_VERSION,
  LIMITS,
  PRNG_SEQUENCE_PROFILE,
  RESOURCE_DIMENSIONS,
  STATIC_RESOURCE_TIE_ORDER,
  oracleEvaluate,
  oracleSampleDiceGroups,
} from "./oracle.mjs";
import { oracleSample, oracleStateFromWords } from "../prng-semantics/oracle.mjs";

const directory = path.dirname(fileURLToPath(import.meta.url));
const defaultGoldenFile = path.join(directory, "golden-vectors.json");
const goldenFile = process.env.DRDICE_DICE_GOLDEN_FILE ?? process.argv[2] ?? defaultGoldenFile;
const groupGoldenFile = process.env.DRDICE_DICE_GROUP_GOLDEN_FILE
  ?? path.join(directory, "group-golden-vectors.json");

const PINNED_SEMANTIC_PROFILE = "dice-v3/utf16-bounded-left-to-right-3";
const PINNED_SEMANTIC_VERSION = 3;
const PINNED_PRNG_SEQUENCE_PROFILE = "xoshiro128ss-1.1/warmup16-msb-chunk-rejection-2";
const PINNED_LIMITS = {
  sourceLength: 64,
  numericTokenLength: 3,
  nestingDepth: 4,
  astNodeCount: 15,
  diceTermCount: 4,
  dieSampleCount: 8,
  supportedSideCount: 100,
  arithmeticMagnitude: 100,
  evaluationSteps: 24,
  rejectionSamplingAttempts: 5,
};
const PINNED_TIE_ORDER = [
  "ast-node-count",
  "dice-term-count",
  "die-sample-count",
  "supported-side-count",
  "arithmetic-magnitude",
  "evaluation-steps",
];
const PINNED_CANONICAL_STATE = ["00000001", "00000002", "00000003", "00000004"];
const PINNED_FIRST_SUCCESSOR = ["00000007", "00000000", "00000402", "00003000"];
const PINNED_FORCED_STATE = ["00000000", "00000000", "ffffffff", "00000000"];
const PINNED_REJECTION_STATE = ["b0e8eac3", "f2d79146", "a51937ed", "21243868"];
const PINNED_DYNAMIC_STEP_STATE = ["f6d4d22f", "179359c2", "e89fce39", "dc482244"];
const PINNED_GROUP_SEMANTIC_PROFILE =
  "dice-groups-v1/ordered-atomic-rejection-5-blocks-x-5-attempts";
const PINNED_GROUP_SEMANTIC_VERSION = 1;
const PINNED_GROUP_LIMITS = {
  groupCount: 10_000,
  dieSampleCount: 10_000,
  supportedSideCount: 100,
  rejectionSamplingBlocks: 5,
  rejectionSamplingAttemptsPerBlock: 5,
};

const fail = (message) => {
  throw new Error(`[dice-semantics] ${message}`);
};
const assert = (condition, message) => {
  if (!condition) fail(message);
};
const json = (value) => JSON.stringify(value);
const equal = (actual, expected, label) => {
  if (json(actual) !== json(expected)) {
    fail(`${label}\n  actual:   ${json(actual)}\n  expected: ${json(expected)}`);
  }
};

const readGolden = () => {
  try {
    return JSON.parse(fs.readFileSync(goldenFile, "utf8"));
  } catch (error) {
    fail(`cannot read or parse golden corpus ${goldenFile}: ${error.message}`);
  }
};

const readGroupGolden = () => {
  try {
    return JSON.parse(fs.readFileSync(groupGoldenFile, "utf8"));
  } catch (error) {
    fail(`cannot read or parse Dice Group corpus ${groupGoldenFile}: ${error.message}`);
  }
};

const words = (value, label) => {
  assert(Array.isArray(value) && value.length === 4, `${label} must contain four Word32 values`);
  for (const [index, word] of value.entries()) {
    assert(typeof word === "string" && /^[0-9a-f]{8}$/.test(word), `${label}[${index}] is not canonical lowercase Word32`);
  }
  return value;
};

const stateInput = (vector) => vector.stateWords
  ? oracleStateFromWords([...words(vector.stateWords, `${vector.id}.stateWords`)] )
  : vector.stateInput;

const projectState = (value) => value
  && value.kind === "GeneratorState"
  && Array.isArray(value.words)
  ? [...value.words]
  : value;

const projectResult = (result) => {
  if (result.ok) {
    return {
      ok: true,
      value: {
        total: result.value.total,
        rollTrace: result.value.rollTrace,
        nextState: projectState(result.value.nextState),
      },
    };
  }
  const details = { ...result.details };
  if (Object.hasOwn(details, "state")) details.state = projectState(details.state);
  if (Object.hasOwn(details, "nextState")) details.nextState = projectState(details.nextState);
  return { ok: false, code: result.code, details };
};

const projectGroupResult = (result) => {
  if (result.ok) {
    return {
      ok: true,
      value: {
        groups: result.value.groups,
        nextState: projectState(result.value.nextState),
      },
    };
  }
  const details = { ...result.details };
  if (Object.hasOwn(details, "state")) details.state = projectState(details.state);
  return { ok: false, code: result.code, details };
};

const checkPinnedProfile = (golden) => {
  equal(DICE_SEMANTIC_PROFILE, PINNED_SEMANTIC_PROFILE, "oracle Dice semantic profile changed without reviewed vectors");
  equal(DICE_SEMANTIC_VERSION, PINNED_SEMANTIC_VERSION, "oracle Dice semantic version changed without reviewed vectors");
  equal(PRNG_SEQUENCE_PROFILE, PINNED_PRNG_SEQUENCE_PROFILE, "oracle PRNG profile anchor changed");
  equal(LIMITS, PINNED_LIMITS, "oracle resource limits changed without reviewed vectors");
  equal([...RESOURCE_DIMENSIONS], [
    "source-length",
    "numeric-token-length",
    "nesting-depth",
    "ast-node-count",
    "dice-term-count",
    "die-sample-count",
    "supported-side-count",
    "arithmetic-magnitude",
    "evaluation-steps",
    "rejection-sampling-attempts",
  ], "resource dimension identity changed");
  equal([...STATIC_RESOURCE_TIE_ORDER], PINNED_TIE_ORDER, "static resource tie-break order changed");

  equal(golden.semanticProfile, PINNED_SEMANTIC_PROFILE, "golden semantic profile changed without review");
  equal(golden.semanticVersion, PINNED_SEMANTIC_VERSION, "golden semantic version changed without review");
  equal(golden.prngSequenceProfile, PINNED_PRNG_SEQUENCE_PROFILE, "golden PRNG profile changed without review");
  equal(golden.limits, PINNED_LIMITS, "golden resource limits changed without review");
  equal(golden.staticResourceTieOrder, PINNED_TIE_ORDER, "golden tie-break order changed without review");
  equal(golden.canonicalState, PINNED_CANONICAL_STATE, "canonical state changed without review");
  equal(golden.forcedState, PINNED_FORCED_STATE, "forced state changed without review");
  equal(golden.craftedRejectionState, PINNED_REJECTION_STATE, "rejection state changed without review");
  equal(golden.dynamicStepState, PINNED_DYNAMIC_STEP_STATE, "dynamic-step state changed without review");
  words(golden.canonicalState, "canonicalState");
  words(golden.forcedState, "forcedState");
  words(golden.craftedRejectionState, "craftedRejectionState");
  words(golden.dynamicStepState, "dynamicStepState");
};

const checkTrace = (trace, label) => {
  assert(Array.isArray(trace), `${label} must be an array`);
  for (const [index, sample] of trace.entries()) {
    assert(sample && typeof sample === "object", `${label}[${index}] must be an object`);
    assert(Object.keys(sample).sort().join(",") === "face,sideCount", `${label}[${index}] has redundant fields`);
    assert(Number.isInteger(sample.sideCount) && sample.sideCount >= 1 && sample.sideCount <= 100, `${label}[${index}] sideCount is outside 1..100`);
    assert(Number.isInteger(sample.face) && sample.face >= 1 && sample.face <= sample.sideCount, `${label}[${index}] face is outside its die`);
  }
};

const checkExpectedShape = (expected, label) => {
  assert(expected && typeof expected === "object", `${label}.expected is missing`);
  assert(typeof expected.ok === "boolean", `${label}.expected.ok is not boolean`);
  if (expected.ok) {
    assert(Object.keys(expected.value).sort().join(",") === "nextState,rollTrace,total", `${label} success has the wrong fields`);
    assert(Number.isInteger(expected.value.total), `${label} total is not an integer`);
    checkTrace(expected.value.rollTrace, `${label}.rollTrace`);
    words(expected.value.nextState, `${label}.nextState`);
  } else {
    assert(typeof expected.code === "string", `${label} failure code is missing`);
    assert(expected.details && typeof expected.details === "object", `${label} failure details are missing`);
    assert(!Object.hasOwn(expected.details, "total"), `${label} failure exposes a total`);
    if (Object.hasOwn(expected.details, "partialTrace")) checkTrace(expected.details.partialTrace, `${label}.partialTrace`);
    if (Object.hasOwn(expected.details, "nextState") && expected.details.nextState !== null) {
      words(expected.details.nextState, `${label}.nextState`);
    }
  }
};

const checkAttemptPath = (vector, actual) => {
  if (!Array.isArray(vector.sampleAttempts)) return;
  const trace = actual.ok ? actual.value.rollTrace : actual.details?.partialTrace;
  assert(Array.isArray(trace), `${vector.id}.sampleAttempts has no trace to audit`);
  equal(vector.sampleAttempts.length, trace.length, `${vector.id} attempt count does not match completed trace`);
  let current = stateInput(vector);
  for (const [index, sample] of trace.entries()) {
    const sampled = oracleSample(current, sample.sideCount, vector.maximumAttempts);
    assert(sampled.ok, `${vector.id} trace sample ${index} cannot be replayed through the PRNG oracle`);
    equal(sampled.value.attempts, vector.sampleAttempts[index], `${vector.id} sample ${index} attempts disagree with the golden path`);
    equal(sampled.value.value + 1, sample.face, `${vector.id} sample ${index} face disagrees with the sampler`);
    current = sampled.value.state;
  }
};

const checkCase = (vector, byId) => {
  assert(vector && typeof vector === "object", "case is not an object");
  assert(typeof vector.id === "string" && !byId.has(vector.id), `case id is missing or duplicated: ${vector.id}`);
  byId.set(vector.id, vector);
  assert(typeof vector.source === "string" || vector.source === null, `${vector.id}.source must be a string or widened probe`);
  assert(Number.isInteger(vector.maximumAttempts) || typeof vector.maximumAttempts === "number", `${vector.id}.maximumAttempts must be numeric`);
  checkExpectedShape(vector.expected, vector.id);
  const actual = oracleEvaluate(vector.source, stateInput(vector), vector.maximumAttempts);
  equal(projectResult(actual), vector.expected, `${vector.id} oracle result disagrees with committed golden data`);
  checkAttemptPath(vector, actual);

  if (!actual.ok && actual.code === "sampling-attempts-exhausted") {
    equal(actual.details.attempts, vector.incompleteAttempts, `${vector.id} incomplete attempt count is not literal evidence`);
    assert(!actual.details.partialTrace.some((_, index) => index >= actual.details.attempts), `${vector.id} has an impossible incomplete trace`);
  }

  if (!actual.ok && ["expected-expression", "expected-die-sides", "expected-closing-parenthesis", "leading-zero", "unexpected-token", "dice-count-zero", "side-count-zero"].includes(actual.code)) {
    assert(!Object.hasOwn(actual.details, "partialTrace"), `${vector.id} static diagnostic consumed a trace`);
    assert(!Object.hasOwn(actual.details, "nextState"), `${vector.id} static diagnostic exposed a Next Generator State`);
  }
};

const checkRequiredCases = (byId) => {
  const required = [
    "integer-zero",
    "single-die-one",
    "uppercase-die",
    "multiple-dice-addition",
    "parenthesized-depth-first",
    "left-associative-subtraction",
    "negative-total",
    "all-supported-whitespace",
    "empty-input",
    "expected-die-sides",
    "expected-closing-parenthesis",
    "leading-zero-integer",
    "trailing-token",
    "zero-dice-count",
    "zero-side-count",
    "domain-beats-supported-side",
    "utf16-astral-suffix-one-beyond",
    "utf16-astral-suffix-at-limit",
    "post-consumption-sampling-exhaustion",
    "post-consumption-arithmetic-failure",
    "post-consumption-dynamic-steps",
    "sample-attempt-fuel-zero",
    "sample-attempt-fuel-two",
    "sample-attempt-fuel-three",
    "sample-attempt-fuel-four",
    "sample-attempt-fuel-five",
    "invalid-state-shape",
    "invalid-state-word",
    "invalid-state-zero",
    "invalid-fuel-negative",
    "source-length-one-beyond",
    "numeric-token-one-beyond",
    "nesting-one-beyond",
    "ast-nodes-one-beyond",
    "dice-terms-one-beyond",
    "samples-one-beyond",
    "supported-sides-one-beyond",
    "arithmetic-one-beyond",
    "evaluation-steps-one-beyond",
    "rejection-fuel-one-beyond",
    "ast-arithmetic-tie",
    "node-term-sample-eval-tie",
    "term-sample-eval-tie",
    "arithmetic-evaluation-tie",
  ];
  for (const id of required) assert(byId.has(id), `required golden case ${id} is missing`);
  for (let fuel = 0; fuel <= 5; fuel += 1) {
    const vector = byId.get(`sample-attempt-fuel-${["zero", "one", "two", "three", "four", "five"][fuel]}`)
      ?? (fuel === 1 ? byId.get("single-die-one") : undefined);
    assert(vector && vector.maximumAttempts === fuel, `literal sample-fuel coverage is missing maximumAttempts=${fuel}`);
  }

  const codes = new Set([...byId.values()].map((vector) => vector.expected?.code).filter(Boolean));
  for (const code of [
    "expected-expression",
    "expected-die-sides",
    "expected-closing-parenthesis",
    "leading-zero",
    "unexpected-token",
    "dice-count-zero",
    "side-count-zero",
    "resource-limit-exceeded",
    "sampling-attempts-exhausted",
    "invalid-state-shape",
    "invalid-state-word",
    "invalid-state-zero",
    "invalid-attempt-fuel",
  ]) assert(codes.has(code), `public failure variant ${code} has no golden case`);
};

const checkBoundaries = (byId) => {
  const expectations = [
    ["source-length-one-beyond", "source-length", 64, 65],
    ["numeric-token-one-beyond", "numeric-token-length", 3, 4],
    ["nesting-one-beyond", "nesting-depth", 4, 5],
    ["ast-nodes-one-beyond", "ast-node-count", 15, 16],
    ["dice-terms-one-beyond", "dice-term-count", 4, 5],
    ["samples-one-beyond", "die-sample-count", 8, 9],
    ["supported-sides-one-beyond", "supported-side-count", 100, 101],
    ["arithmetic-one-beyond", "arithmetic-magnitude", 100, 101],
    ["evaluation-steps-one-beyond", "evaluation-steps", 24, 25],
    ["rejection-fuel-one-beyond", "rejection-sampling-attempts", 5, 6],
  ];
  for (const [id, dimension, limit, actual] of expectations) {
    const vector = byId.get(id);
    assert(vector.expected.ok === false && vector.expected.code === "resource-limit-exceeded", `${id} is not a resource failure`);
    equal(vector.expected.details.dimension, dimension, `${id} dimension changed`);
    equal(vector.expected.details.limit, limit, `${id} limit changed`);
    equal(vector.expected.details.actual, actual, `${id} one-beyond actual changed`);
  }
  const exactSuccesses = [
    ["source-length-at-limit", undefined],
    ["numeric-token-at-limit", 100],
    ["nesting-at-limit", undefined],
    ["ast-nodes-at-limit", undefined],
    ["dice-terms-at-limit", undefined],
    ["samples-at-limit", undefined],
    ["supported-sides-at-limit", undefined],
    ["arithmetic-at-limit", 100],
    ["evaluation-steps-at-limit", undefined],
  ];
  for (const [id, total] of exactSuccesses) {
    const vector = byId.get(id);
    assert(vector.expected.ok === true, `${id} must succeed exactly at its limit`);
    if (total !== undefined) equal(vector.expected.value.total, total, `${id} exact boundary total changed`);
  }
  equal(byId.get("source-length-at-limit").source.length, 64, "source-length at-limit case is not 64 UTF-16 code units");
  equal(byId.get("source-length-one-beyond").source.length, 65, "source-length one-beyond case is not 65 UTF-16 code units");
  equal(byId.get("utf16-astral-suffix-at-limit").source.length, 64, "UTF-16 astral at-limit case is not 64 code units");
  equal([...byId.get("utf16-astral-suffix-at-limit").source].length, 63, "UTF-16 astral at-limit case lost its code-point distinction");
  equal(byId.get("utf16-astral-suffix-one-beyond").source.length, 65, "UTF-16 astral one-beyond case is not 65 code units");
  equal([...byId.get("utf16-astral-suffix-one-beyond").source].length, 64, "UTF-16 astral one-beyond case does not distinguish code points");
  assert(byId.get("utf16-astral-suffix-one-beyond").expected.details.dimension === "source-length", "UTF-16 astral suffix did not trigger the source-length guard");
  equal(byId.get("numeric-token-at-limit").source.length, 3, "numeric-token at-limit case is not three digits");
  equal(byId.get("numeric-token-one-beyond").source.length, 4, "numeric-token one-beyond case is not four digits");
  assert(byId.get("term-sample-tie").expected.details.dimension === "dice-term-count", "same-offset term/sample tie must prefer dice-term-count");
  assert(byId.get("static-term-before-side").expected.details.dimension === "dice-term-count", "earlier term excess must beat later supported-side excess");
  const collisions = [
    ["ast-arithmetic-tie", 15, "ast-node-count"],
    ["node-term-sample-eval-tie", 26, "ast-node-count"],
    ["term-sample-eval-tie", 16, "dice-term-count"],
    ["arithmetic-evaluation-tie", 12, "arithmetic-magnitude"],
  ];
  for (const [id, offset, dimension] of collisions) {
    const details = byId.get(id).expected.details;
    equal(details.offset, offset, `${id} collision offset changed`);
    equal(details.dimension, dimension, `${id} collision winner changed`);
  }
};

const checkSideGrid = (golden) => {
  const grid = golden.sideGrid;
  assert(grid && Array.isArray(grid.sides), "side grid is missing");
  equal(grid.sides, Array.from({ length: 100 }, (_, index) => index + 1), "side grid does not cover every supported side");
  equal(grid.expectedFace, 1, "canonical side-grid face changed without review");
  equal(grid.attempts, 1, "canonical side-grid attempt count changed without review");
  equal(grid.nextState, PINNED_FIRST_SUCCESSOR, "canonical side-grid successor changed without review");
  for (const sides of grid.sides) {
    const actual = oracleEvaluate(`d${sides}`, oracleStateFromWords(PINNED_CANONICAL_STATE), 1);
    assert(actual.ok, `d${sides} did not succeed in the supported side grid`);
    const sampled = oracleSample(oracleStateFromWords(PINNED_CANONICAL_STATE), sides, 1);
    assert(sampled.ok, `d${sides} sampler path unexpectedly failed`);
    equal(sampled.value.attempts, grid.attempts, `d${sides} attempt count disagrees with the side-grid literal`);
    equal(actual.value.total, grid.expectedFace, `d${sides} total disagrees with the side-grid literal`);
    equal(actual.value.rollTrace, [{ sideCount: sides, face: grid.expectedFace }], `d${sides} trace disagrees with the side-grid literal`);
    equal(actual.value.nextState.words, grid.nextState, `d${sides} successor disagrees with the side-grid literal`);
  }
};

const checkNoConsumption = (byId) => {
  for (const vector of byId.values()) {
    if (!vector.stateWords || vector.expected.ok) continue;
    const staticCode = [
      "expected-expression",
      "expected-die-sides",
      "expected-closing-parenthesis",
      "leading-zero",
      "unexpected-token",
      "dice-count-zero",
      "side-count-zero",
      "resource-limit-exceeded",
    ];
    if (!staticCode.includes(vector.expected.code)) continue;
    const before = [...vector.stateWords];
    const input = stateInput(vector);
    oracleEvaluate(vector.source, input, vector.maximumAttempts);
    equal(input.words, before, `${vector.id} pre-consumption failure mutated input state`);
  }
};

const checkPrivateBoundary = () => {
  const source = fs.readFileSync(path.join(directory, "oracle.mjs"), "utf8");
  const imports = [...source.matchAll(/\bimport\s+(?:[^"']+\s+from\s+)?["']([^"']+)["']/g)].map((match) => match[1]);
  equal(imports, ["../prng-semantics/oracle.mjs"], "Dice oracle imports anything beyond the prng-semantics public oracle boundary");
  assert(!/(?:packages|src|dist)\//.test(source), "Dice oracle references production package/source/dist paths");
  assert(path.join(directory, "oracle.mjs").includes(`${path.sep}verification${path.sep}dice-semantics${path.sep}`), "Dice oracle escaped its private verification directory");
};

const checkGroupGolden = (groupGolden) => {
  equal(DICE_GROUP_SEMANTIC_PROFILE, PINNED_GROUP_SEMANTIC_PROFILE,
    "oracle Dice Group Semantic Profile changed without reviewed vectors");
  equal(DICE_GROUP_SEMANTIC_VERSION, PINNED_GROUP_SEMANTIC_VERSION,
    "oracle Dice Group semantic version changed without reviewed vectors");
  equal(DICE_GROUP_LIMITS, PINNED_GROUP_LIMITS, "oracle Dice Group limits changed without reviewed vectors");
  equal(groupGolden.semanticProfile, PINNED_GROUP_SEMANTIC_PROFILE,
    "Dice Group golden profile changed without review");
  equal(groupGolden.semanticVersion, PINNED_GROUP_SEMANTIC_VERSION,
    "Dice Group golden version changed without review");
  equal(groupGolden.prngSequenceProfile, PINNED_PRNG_SEQUENCE_PROFILE,
    "Dice Group golden PRNG profile changed without review");
  equal(groupGolden.limits, PINNED_GROUP_LIMITS, "Dice Group golden limits changed without review");
  assert(Array.isArray(groupGolden.cases), "Dice Group golden cases are missing");

  const ids = new Set();
  for (const vector of groupGolden.cases) {
    assert(typeof vector.id === "string" && !ids.has(vector.id), `Dice Group case id is missing or duplicated: ${vector.id}`);
    ids.add(vector.id);
    const inputState = vector.stateWords
      ? oracleStateFromWords([...words(vector.stateWords, `${vector.id}.stateWords`)])
      : vector.stateInput;
    const actual = oracleSampleDiceGroups(vector.groups, inputState);
    equal(projectGroupResult(actual), vector.expected, `${vector.id} Dice Group oracle result disagrees with golden data`);
    if (!actual.ok) {
      assert(!Object.hasOwn(actual.details, "nextState"), `${vector.id} failure exposes a Next Generator State`);
      if (actual.code === "sampling-attempts-exhausted") {
        assert(!Object.hasOwn(actual.details, "state"), `${vector.id} exhaustion exposes a committable state`);
        equal(actual.details.attempts, 25, `${vector.id} terminal exhaustion did not consume exactly five blocks`);
      }
    }
  }
  for (const id of [
    "ordered-success",
    "retry-after-one-block",
    "empty-request",
    "invalid-count",
    "side-count-one-beyond",
    "sample-count-one-beyond",
    "invalid-state-shape",
  ]) assert(ids.has(id), `required Dice Group golden case ${id} is missing`);

  const tooManyGroups = Array.from(
    { length: DICE_GROUP_LIMITS.groupCount + 1 },
    () => ({ count: 1, sideCount: 6 }),
  );
  equal(
    oracleSampleDiceGroups(tooManyGroups, oracleStateFromWords(PINNED_CANONICAL_STATE)),
    {
      ok: false,
      code: "resource-limit-exceeded",
      details: {
        dimension: "group-count",
        limit: DICE_GROUP_LIMITS.groupCount,
        actual: DICE_GROUP_LIMITS.groupCount + 1,
      },
    },
    "Dice Group count one-beyond boundary changed",
  );
};

const golden = readGolden();
const groupGolden = readGroupGolden();
checkPinnedProfile(golden);
assert(Array.isArray(golden.cases) && golden.cases.length >= 60, "golden case corpus is unexpectedly small");
const byId = new Map();
for (const vector of golden.cases) checkCase(vector, byId);
checkRequiredCases(byId);
checkBoundaries(byId);
checkSideGrid(golden);
checkNoConsumption(byId);
checkPrivateBoundary();
checkGroupGolden(groupGolden);
console.log(`[dice-semantics] Dice Expression and Dice Group semantic profiles, independent oracle, ${golden.cases.length + groupGolden.cases.length} literal cases, all-side grid, and private-boundary checks passed`);
