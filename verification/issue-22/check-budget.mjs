import { readdir } from "node:fs/promises";
import { dirname, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "../..");
const generated = resolve(here, "generated");
const focusedQuery = resolve(here, "budget.ts");
const maximumSideQuery = resolve(here, "budget-max-side.ts");
const artifacts = [focusedQuery, maximumSideQuery, ...(await readdir(generated)).filter((name) => /^dice-issue22-(?:\d{3}|side-\d{3})\.d\.ts$/.test(name)).sort().map((name) => resolve(generated, name))];
const limits = {
  maximumCheckMilliseconds: 750,
  maximumSingleCheckMilliseconds: 1500,
  maximumCompilerMemoryKiB: 360448,
  maximumInstantiations: 230000,
};
const scoredRuns = Number.parseInt(process.env.DRDICE_DICE_BUDGET_RUNS ?? "1", 10);
const enforceOperational = process.argv.includes("--reference-runner");
if (!Number.isInteger(scoredRuns) || scoredRuns < 1) throw new Error("DRDICE_DICE_BUDGET_RUNS must be a positive integer");
const parse = (output, label, unit = "") => {
  const match = output.match(new RegExp(`^${label}:\\s+([0-9.]+)${unit}`, "m"));
  if (!match) throw new Error(`missing ${label} in compiler diagnostics\n${output}`);
  return Number(match[1]);
};
const median = (values) => { const sorted = [...values].sort((a, b) => a - b); const middle = Math.floor(sorted.length / 2); return sorted.length % 2 === 0 ? (sorted[middle - 1] + sorted[middle]) / 2 : sorted[middle]; };
const summarize = (samples, key) => { const values = samples.map((sample) => sample[key]); return { median: median(values), minimum: Math.min(...values), maximum: Math.max(...values) }; };
const version = spawnSync("pnpm", ["exec", "tsc", "--version"], { cwd: root, encoding: "utf8" });
if (version.status !== 0 || version.stdout.trim() !== "Version 7.0.2") throw new Error(`issue-22 budget requires TypeScript 7.0.2, got ${version.stdout.trim()}\n${version.stderr}`);

const results = [];
for (const checkers of [1, 4]) {
  for (const artifact of artifacts) {
    const args = ["exec", "tsc", "--ignoreConfig", "--pretty", "false", "--strict", "--noEmit", "--target", "ES2020", "--module", "NodeNext", "--moduleResolution", "NodeNext", "--lib", "ES2020,DOM", "--extendedDiagnostics", "--checkers", String(checkers), artifact];
    const label = `${relative(root, artifact)} ${checkers}-checker`;
    const run = () => {
      const started = performance.now();
      const checked = spawnSync("pnpm", args, { cwd: root, encoding: "utf8" });
      const output = `${checked.stdout}\n${checked.stderr}`;
      if (checked.status !== 0) throw new Error(`${label} query failed\n${output}`);
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
      artifact: relative(root, artifact), compiler: version.stdout.trim(), checkers, runs: scoredRuns,
      checkMilliseconds: summarize(samples, "checkMilliseconds"),
      compilerMemoryKiB: summarize(samples, "compilerMemoryKiB"),
      instantiations: summarize(samples, "instantiations"),
      wallMilliseconds: summarize(samples, "wallMilliseconds"),
    };
    if (enforceOperational && observed.checkMilliseconds.median > limits.maximumCheckMilliseconds) throw new Error(`${label} median check time ${observed.checkMilliseconds.median} exceeds ${limits.maximumCheckMilliseconds} ms`);
    if (enforceOperational && observed.checkMilliseconds.maximum > limits.maximumSingleCheckMilliseconds) throw new Error(`${label} single check time ${observed.checkMilliseconds.maximum} exceeds ${limits.maximumSingleCheckMilliseconds} ms`);
    if (observed.compilerMemoryKiB.maximum > limits.maximumCompilerMemoryKiB) throw new Error(`${label} compiler memory ${observed.compilerMemoryKiB.maximum} KiB exceeds ${limits.maximumCompilerMemoryKiB}`);
    if (observed.instantiations.maximum > limits.maximumInstantiations) throw new Error(`${label} instantiations ${observed.instantiations.maximum} exceeds ${limits.maximumInstantiations}`);
    results.push(observed);
  }
}
console.log(JSON.stringify({ schemaVersion: 1, issue: 22, focusedQuery: relative(root, focusedQuery), artifacts: artifacts.map((artifact) => relative(root, artifact)), limits, results }, null, 2));
