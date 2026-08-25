import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import {
  CASES_PER_SHARD,
  CASE_COUNT,
  DEFAULT_GENERATOR_SEED,
  generateCases,
  selectReplay,
} from "./cases.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const valueAfter = (flag) => {
  const index = process.argv.indexOf(flag);
  return index < 0 ? undefined : process.argv[index + 1];
};
const output = resolve(valueAfter("--output") ?? resolve(here, "generated"));
const parsedSeed = valueAfter("--seed");
const generatorSeed = parsedSeed === undefined ? DEFAULT_GENERATOR_SEED : Number(parsedSeed);
if (!Number.isSafeInteger(generatorSeed)) throw new Error("--seed must be a safe integer");
const parsedCount = valueAfter("--count");
const caseCount = parsedCount === undefined ? CASE_COUNT : Number(parsedCount);
if (!Number.isSafeInteger(caseCount) || caseCount < 1) throw new Error("--count must be a positive safe integer");
let cases = generateCases(generatorSeed, caseCount);
const replay = valueAfter("--replay");
if (replay !== undefined) cases = [selectReplay(cases, replay)];

const header = `/* GENERATED FILE. Run pnpm generate:property-parity; do not edit by hand. */
import { evaluate } from "@drdice/dice";

type Equal<Left, Right> =
  [Left] extends [Right] ? [Right] extends [Left] ? true : false : false;
type Assert<Value extends true> = Value;
const deepEqual = (left: unknown, right: unknown): boolean => {
  if (Object.is(left, right)) return true;
  if (typeof left !== "object" || left === null || typeof right !== "object" || right === null) return false;
  const leftRecord = left as Record<string, unknown>;
  const rightRecord = right as Record<string, unknown>;
  const leftKeys = Object.keys(leftRecord);
  const rightKeys = Object.keys(rightRecord);
  return leftKeys.length === rightKeys.length
    && leftKeys.every((key) => Object.prototype.hasOwnProperty.call(rightRecord, key) && deepEqual(leftRecord[key], rightRecord[key]));
};

`;
const render = (item, index) => {
  const descriptor = {
    generatorSeed: item.generatorSeed,
    replayPath: item.replayPath,
    seed: item.seed,
    source: item.source,
    state: item.state,
    maximumAttempts: item.maximumAttempts,
  };
  const stateLiteral = item.state === null ? "null" : `${JSON.stringify(item.state)} as const`;
  return `const expected${index} = ${JSON.stringify(item.expected)} as const;
const actual${index} = evaluate(${JSON.stringify(item.source)}, ${stateLiteral}, ${item.maximumAttempts});
type ExactParity${index} = Assert<Equal<typeof actual${index}, typeof expected${index}>>;
if (!deepEqual(actual${index}, expected${index})) {
  throw new Error("property parity failure: " + ${JSON.stringify(JSON.stringify(descriptor))} + "\\nactual=" + JSON.stringify(actual${index}) + "\\nexpected=" + JSON.stringify(expected${index}));
}

`;
};
const shards = [];
for (let offset = 0; offset < cases.length; offset += CASES_PER_SHARD) {
  shards.push(cases.slice(offset, offset + CASES_PER_SHARD));
}
await mkdir(output, { recursive: true });
for (const [shardIndex, shard] of shards.entries()) {
  const firstPath = shard[0].replayPath.padStart(3, "0");
  const name = replay === undefined ? `parity-${String(shardIndex).padStart(3, "0")}.ts` : `replay-${firstPath}.ts`;
  const body = shard.map((item, index) => render(item, index)).join("");
  await writeFile(resolve(output, name), header + body, "utf8");
}
console.log(`[property-parity] generated ${cases.length} cases in ${shards.length} shard(s); seed=${generatorSeed}${replay === undefined ? "" : ` replay=${replay}`}`);
