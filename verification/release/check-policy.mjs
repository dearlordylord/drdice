import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { ROOT, validateBudgetResults } from "./common.mjs";

const budgets = JSON.parse(await readFile(resolve(ROOT, "verification/release/budgets.json"), "utf8"));
const passingRecord = (compiler, policy, caseName) => ({
  compiler,
  case: caseName,
  status: "passed",
  warmupRuns: policy.blocking ? budgets.requiredWarmupRuns : 0,
  scoredRuns: policy.blocking ? budgets.requiredScoredRuns : 1,
  freshProcesses: true,
  checkMilliseconds: { median: 1, maximum: 1 },
  compilerMemoryKiB: { maximum: 1 },
  instantiations: { maximum: 1 },
});
const benchmark = {
  results: Object.entries(budgets.policies).flatMap(([compiler, policy]) =>
    Object.keys(policy.cases).map((caseName) => passingRecord(compiler, policy, caseName))),
};

const timingOverrun = structuredClone(benchmark);
const timedRecord = timingOverrun.results.find((record) => record.compiler === "typescript-7-single-checker");
timedRecord.checkMilliseconds = { median: 10_000, maximum: 10_000 };
const timingVerdict = validateBudgetResults(timingOverrun, budgets);
assert.deepEqual(timingVerdict.failures, []);
assert.equal(timingVerdict.advisories.length, 2);
assert.match(timingVerdict.advisories[0], /median check/);
assert.match(timingVerdict.advisories[1], /single check/);

const memoryOverrun = structuredClone(benchmark);
const memoryRecord = memoryOverrun.results.find((record) => record.compiler === "typescript-7-single-checker");
memoryRecord.compilerMemoryKiB.maximum = Number.MAX_SAFE_INTEGER;
const memoryVerdict = validateBudgetResults(memoryOverrun, budgets);
assert.equal(memoryVerdict.failures.length, 1);
assert.match(memoryVerdict.failures[0], /compiler memory/);

const invalidPolicy = validateBudgetResults(benchmark, { ...budgets, compilerTimingEnforcement: "ignored" });
assert.equal(invalidPolicy.failures.length, 1);
assert.match(invalidPolicy.failures[0], /timing enforcement/);

console.log("[release policy] portable costs block and host-dependent timings advise");
