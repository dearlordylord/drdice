import { readdir } from "node:fs/promises";
import { dirname, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

import { MAX_ATTEMPTS, MAX_BOUND } from "../prng-semantics/oracle.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "../..");
const compiler = resolve(root, "node_modules/typescript/lib/tsc.js");
const generatedDirectory = resolve(root, "verification/generated");
const focusedQuery = resolve(here, "budget.ts");
const generatedNames = (await readdir(generatedDirectory)).filter(
  (name) => /^prng-sampling-coverage-(?:grid-\d{3}|special-\d{3})\.d\.ts$/.test(name),
).sort();
const expectedNames = [
  ...Array.from(
    { length: MAX_BOUND * (MAX_ATTEMPTS + 1) },
    (_, index) => `prng-sampling-coverage-grid-${String(index).padStart(3, "0")}.d.ts`,
  ),
  ...Array.from({ length: 3 }, (_, index) => `prng-sampling-coverage-special-${String(index).padStart(3, "0")}.d.ts`),
].sort();
if (JSON.stringify(generatedNames) !== JSON.stringify(expectedNames)) {
  throw new Error(`prng-sampling-coverage budget artifacts differ; expected ${expectedNames.length}, got ${generatedNames.length}`);
}

const artifacts = [focusedQuery, ...expectedNames.map((name) => resolve(generatedDirectory, name))];
const limits = {
  /* sampling's sampling-ceiling budget. */
  /* The final PRNG release lane uses one 750 ms median ceiling for
   * focused and exhaustive bounded-sampling evidence. */
  maximumCheckMilliseconds: 750,
  maximumSingleCheckMilliseconds: 1500,
  maximumCompilerMemoryKiB: 327680,
  maximumInstantiations: 120000,
};
const enforceOperational = process.argv.includes("--reference-runner");
const requiredScoredRuns = 5;
const scoredRuns = Number.parseInt(
  process.env.DRDICE_PRNG_BUDGET_RUNS ?? String(requiredScoredRuns),
  10,
);
if (!Number.isInteger(scoredRuns) || scoredRuns < 1) {
  throw new Error("DRDICE_PRNG_BUDGET_RUNS must be a positive integer");
}
if (enforceOperational && scoredRuns !== requiredScoredRuns) {
  throw new Error(`--reference-runner requires exactly ${requiredScoredRuns} scored runs after one warm-up`);
}

const parse = (output, label, unit = "") => {
  const match = output.match(new RegExp(`^${label}:\\s+([0-9.]+)${unit}`, "m"));
  if (!match) throw new Error(`missing ${label} in compiler diagnostics\n${output}`);
  return Number(match[1]);
};
const median = (values) => {
  const sorted = [...values].sort((left, right) => left - right);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[middle - 1] + sorted[middle]) / 2
    : sorted[middle];
};
const summarize = (samples, key) => {
  const values = samples.map((sample) => sample[key]);
  return {
    median: median(values),
    minimum: Math.min(...values),
    maximum: Math.max(...values),
  };
};

const version = spawnSync(process.execPath, [compiler, "--version"], { cwd: root, encoding: "utf8" });
if (version.status !== 0 || version.stdout.trim() !== "Version 7.0.2") {
  throw new Error(`prng-sampling-coverage budget requires TypeScript 7.0.2, got ${version.stdout.trim()}\n${version.stderr}`);
}

const results = [];
for (const checkers of [1, 4]) {
  for (const artifact of artifacts) {
    const args = [
      "--ignoreConfig",
      "--pretty",
      "false",
      "--strict",
      "--noEmit",
      "--target",
      "ES2020",
      "--module",
      "NodeNext",
      "--moduleResolution",
      "NodeNext",
      "--lib",
      "ES2020",
      "--extendedDiagnostics",
      "--checkers",
      String(checkers),
      artifact,
    ];
    const label = `${relative(root, artifact)} ${checkers}-checker`;
    const run = () => {
      const started = performance.now();
      const checked = spawnSync(process.execPath, [compiler, ...args], { cwd: root, encoding: "utf8" });
      const output = `${checked.stdout}\n${checked.stderr}`;
      if (checked.status !== 0) throw new Error(`prng-sampling-coverage ${label} query failed\n${output}`);
      return {
        checkMilliseconds: parse(output, "Check time", "s") * 1000,
        compilerMemoryKiB: parse(output, "Memory used", "K"),
        instantiations: parse(output, "Instantiations"),
        wallMilliseconds: Number((performance.now() - started).toFixed(3)),
      };
    };
    run();
    const samples = Array.from({ length: scoredRuns }, run);
    const observed = {
      artifact: relative(root, artifact),
      compiler: version.stdout.trim(),
      checkers,
      runs: scoredRuns,
      checkMilliseconds: summarize(samples, "checkMilliseconds"),
      compilerMemoryKiB: summarize(samples, "compilerMemoryKiB"),
      instantiations: summarize(samples, "instantiations"),
      wallMilliseconds: summarize(samples, "wallMilliseconds"),
    };
    if (enforceOperational && observed.checkMilliseconds.median > limits.maximumCheckMilliseconds) {
      throw new Error(`${label} median check time ${observed.checkMilliseconds.median} exceeds ${limits.maximumCheckMilliseconds} ms`);
    }
    if (enforceOperational && observed.checkMilliseconds.maximum > limits.maximumSingleCheckMilliseconds) {
      throw new Error(`${label} single check time ${observed.checkMilliseconds.maximum} exceeds ${limits.maximumSingleCheckMilliseconds} ms`);
    }
    if (observed.compilerMemoryKiB.maximum > limits.maximumCompilerMemoryKiB) {
      throw new Error(`${label} compiler memory ${observed.compilerMemoryKiB.maximum} KiB exceeds ${limits.maximumCompilerMemoryKiB} KiB`);
    }
    if (observed.instantiations.maximum > limits.maximumInstantiations) {
      throw new Error(`${label} instantiations ${observed.instantiations.maximum} exceeds ${limits.maximumInstantiations}`);
    }
    results.push(observed);
  }
}

console.log(JSON.stringify({
  schemaVersion: 1,
  suite: "prng-sampling-coverage",
  focusedQuery: relative(root, focusedQuery),
  artifacts: artifacts.map((artifact) => relative(root, artifact)),
  limits,
  results,
}, null, 2));
