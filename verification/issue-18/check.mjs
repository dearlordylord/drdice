import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "../..");
const declaration = await readFile(resolve(root, "packages/prng/dist/index.d.ts"), "utf8");
const generatedNames = [
  "prng-issue18-transitions-0.d.ts",
  "prng-issue18-transitions-1.d.ts",
  "prng-issue18-transitions-2.d.ts",
  "prng-issue18-transitions-3.d.ts",
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

for (const exportName of [
  "SEQUENCE_PROFILE",
  "SCHEMA_VERSION",
  "SequenceProfile",
  "SchemaVersion",
  "Seed",
  "GeneratorState",
  "Success",
  "Failure",
  "Initialize",
  "Next",
  "ReplayToken",
  "SerializedGeneratorState",
  "RestoreReplay",
  "RestoreState",
  "SerializeState",
]) {
  assert(new RegExp(`\\bexport (?:const|type) ${exportName}\\b`).test(declaration), `curated root is missing ${exportName}`);
}
assert(!/export\s+(?:function|class|const\s+\w+\s*=)/.test(declaration), "PRNG root contains a runtime implementation");
assert(!/\bDebug(?:Step|Text|Bits|Shift|Mul|Rotate)|\bOracle/.test(declaration), "debug or oracle surface leaked into the PRNG root");
assert(generated.includes("type _Step9"), "exact golden fixture shards do not assert all ten raw words");
for (const transition of golden.rawWordVector.transitions) {
  assert(generated.includes(JSON.stringify(transition.word)), `generated fixture omitted word ${transition.word}`);
  for (const word of transition.successorState) {
    assert(generated.includes(JSON.stringify(word)), `generated fixture omitted successor word ${word}`);
  }
}
assert(generated.includes("type _Restarted"), "Replay Token restart assertion is missing");
assert(generated.includes("type _Resumed"), "Serialized Generator State resume assertion is missing");
assert(generated.includes("type _RoundTrip"), "serialized-state round-trip assertion is missing");

console.log("[issue-18] curated root and exact PRNG fixture checks passed");
