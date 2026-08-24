import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const HERE = dirname(fileURLToPath(import.meta.url));
export const ROOT = resolve(HERE, "../..");
export const REPORT_RELATIVE = "verification/release/release-candidate.json";
export const REPORT = resolve(ROOT, REPORT_RELATIVE);

export const canonicalize = (value) => {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.keys(value).sort().map((key) => [key, canonicalize(value[key])]));
  }
  return value;
};

export const digestBytes = (chunks) => {
  const hash = createHash("sha256");
  for (const chunk of chunks) hash.update(chunk);
  return hash.digest("hex");
};

export const digestJson = (value) => digestBytes([Buffer.from(JSON.stringify(canonicalize(value))) ]);

const git = (args) => {
  const result = spawnSync("git", args, { cwd: ROOT, encoding: "utf8" });
  if (result.status !== 0) throw new Error(`git ${args.join(" ")} failed\n${result.stdout}\n${result.stderr}`);
  return result.stdout;
};

export const gitStatus = () => git(["status", "--porcelain", "--untracked-files=all"]).trim();
export const gitCommit = () => git(["rev-parse", "HEAD"]).trim();

export const sourceDigest = async () => {
  const names = git(["ls-files", "-z"])
    .split("\0")
    .filter(Boolean)
    .map((name) => name.replaceAll("\\", "/"))
    .filter((name) => name !== REPORT_RELATIVE)
    .sort();
  const chunks = [];
  for (const name of names) {
    chunks.push(Buffer.from(`${name}\0`));
    chunks.push(await readFile(resolve(ROOT, name)));
    chunks.push(Buffer.from("\0"));
  }
  return digestBytes(chunks);
};

export const reportDigest = (report) => {
  const copy = structuredClone(report);
  delete copy.reportDigest;
  return digestJson(copy);
};

export const summarizeValues = (samples, key) => {
  const values = samples.map((sample) => sample[key]);
  return {
    minimum: Math.min(...values),
    maximum: Math.max(...values),
  };
};

export const validateBudgetResults = (benchmark, budgets) => {
  const failures = [];
  const advisories = [];
  if (!["blocking", "advisory"].includes(budgets.compilerTimingEnforcement)) {
    failures.push(`compiler timing enforcement must be blocking or advisory, got ${String(budgets.compilerTimingEnforcement)}`);
  }
  for (const [policyName, policy] of Object.entries(budgets.policies)) {
    const records = benchmark.results.filter((result) => result.compiler === policyName);
    const messages = policy.blocking ? failures : advisories;
    const add = (message) => messages.push(`${policyName}: ${message}`);
    const timingMessages = policy.blocking && budgets.compilerTimingEnforcement === "blocking"
      ? failures
      : advisories;
    const addTiming = (message) => timingMessages.push(`${policyName}: ${message}`);
    if (records.length !== Object.keys(policy.cases).length) {
      add(`expected ${Object.keys(policy.cases).length} case records, found ${records.length}`);
      continue;
    }
    for (const [caseName, limits] of Object.entries(policy.cases)) {
      const result = records.find((record) => record.case === caseName);
      if (!result) {
        add(`${caseName}: result missing`);
        continue;
      }
      if (policy.blocking) {
        if (result.status !== "passed") add(`${caseName}: status is ${result.status}`);
        if (result.warmupRuns !== budgets.requiredWarmupRuns) add(`${caseName}: warm-up count ${result.warmupRuns} is not ${budgets.requiredWarmupRuns}`);
        if (result.scoredRuns !== budgets.requiredScoredRuns) add(`${caseName}: scored run count ${result.scoredRuns} is not ${budgets.requiredScoredRuns}`);
        if (result.freshProcesses !== true) add(`${caseName}: scored runs were not fresh processes`);
      } else if (result.status !== "passed") {
        add(`${caseName}: advisory status is ${result.status}`);
      }
      if (result.status !== "passed") continue;
      if (result.checkMilliseconds.median > limits.maximumCheckMilliseconds) addTiming(`${caseName}: median check ${result.checkMilliseconds.median} ms exceeds ${limits.maximumCheckMilliseconds} ms`);
      if (result.checkMilliseconds.maximum > policy.maximumSingleCheckMilliseconds) addTiming(`${caseName}: single check ${result.checkMilliseconds.maximum} ms exceeds ${policy.maximumSingleCheckMilliseconds} ms`);
      if (result.compilerMemoryKiB.maximum > limits.maximumCompilerMemoryKiB) add(`${caseName}: compiler memory ${result.compilerMemoryKiB.maximum} KiB exceeds ${limits.maximumCompilerMemoryKiB} KiB`);
      if (result.instantiations.maximum > limits.maximumInstantiations) add(`${caseName}: instantiations ${result.instantiations.maximum} exceeds ${limits.maximumInstantiations}`);
    }
  }
  return { failures, advisories };
};
