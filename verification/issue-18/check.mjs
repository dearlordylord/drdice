import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "../..");
const declaration = await readFile(resolve(root, "packages/prng/src/index.d.ts"), "utf8");
const generatedNames = [
  "prng-issue18-transitions-0.d.ts",
  "prng-issue18-transitions-1.d.ts",
  "prng-issue18-transitions-2.d.ts",
  "prng-issue18-transitions-3.d.ts",
  "prng-issue18-transitions-4.d.ts",
  "prng-issue18-transitions-5.d.ts",
  "prng-issue18-transitions-6.d.ts",
  "prng-issue18-transitions-7.d.ts",
  "prng-issue18-transitions-8.d.ts",
  "prng-issue18-transitions-9.d.ts",
  "prng-issue18-replay.d.ts",
];
const generated = (await Promise.all(generatedNames.map((name) =>
  readFile(resolve(root, "verification/generated", name), "utf8")
))).join("\n");
const golden = JSON.parse(await readFile(resolve(root, "verification/issue-17/golden-vectors.json"), "utf8"));

const fail = (message) => {
  throw new Error(`[issue-18] ${message}`);
};
const assert = (condition, message) => {
  if (!condition) fail(message);
};

const expectedExports = [
  "SEQUENCE_PROFILE",
  "SCHEMA_VERSION",
  "SequenceProfile",
  "SchemaVersion",
  "Word32Text",
  "SeedWords",
  "StateWords",
  "Seed",
  "GeneratorState",
  "FailureCode",
  "Failure",
  "Success",
  "PayloadOf",
  "ValueOf",
  "WordOf",
  "StateOf",
  "InvalidSeedFailure",
  "InvalidStateFailure",
  "InvalidReplayFailure",
  "StepSuccess",
  "StepResult",
  "BoundedSuccess",
  "InvalidBoundFailure",
  "InvalidAttemptFuelFailure",
  "SamplingExhausted",
  "BoundedResult",
  "Initialize",
  "InitializeResult",
  "Next",
  "ReplayToken",
  "SerializedGeneratorState",
  "RestoreReplay",
  "RestoreReplayResult",
  "RestoreState",
  "RestoreStateResult",
  "SerializeState",
  "SerializeStateResult",
  "Sample",
  "randomSeed",
  "initialize",
  "next",
  "sample",
  "serializeState",
  "restoreState",
  "restoreReplay",
  "payloadOf",
  "valueOf",
  "wordOf",
  "stateOf",
  "PackageMetadata",
];
const actualExports = [...new Set(
  [...declaration.matchAll(/^export (?:const|type|function) (\w+)/gm)]
    .map(([, name]) => name),
)];
assert(
  JSON.stringify([...actualExports].sort()) === JSON.stringify([...expectedExports].sort()),
  `curated root exports differ; expected ${expectedExports.join(", ")}, got ${actualExports.join(", ")}`,
);
assert(!/export\s+(?:class|const\s+\w+\s*=)/.test(declaration), "PRNG declaration root contains an inline runtime implementation");
assert(!/\bDebug(?:Step|Text|Bits|Shift|Mul|Rotate)|\bOracle/.test(declaration), "debug or oracle surface leaked into the PRNG root");
assert(generated.includes("type _Step9"), "exact golden fixture shards do not assert all ten raw words");
for (const transition of golden.rawWordVector.transitions) {
  assert(generated.includes(JSON.stringify(transition.word)), `generated fixture omitted word ${transition.word}`);
  for (const word of transition.nextState) {
    assert(generated.includes(JSON.stringify(word)), `generated fixture omitted successor word ${word}`);
  }
}
assert(generated.includes("type _Restarted"), "Replay Token restart assertion is missing");
assert(generated.includes("type _Resumed"), "Serialized Generator State resume assertion is missing");
assert(generated.includes("type _RoundTrip"), "serialized-state round-trip assertion is missing");

console.log("[issue-18] curated root and exact PRNG fixture checks passed");
