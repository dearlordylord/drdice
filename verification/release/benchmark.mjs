import { readFile, writeFile } from "node:fs/promises";
import { readFileSync } from "node:fs";
import { spawn, spawnSync } from "node:child_process";
import { cpus, freemem, platform, release, totalmem } from "node:os";
import { performance } from "node:perf_hooks";
import { relative, resolve } from "node:path";
import { ROOT } from "./common.mjs";

const outputArgument = process.argv.indexOf("--output");
const outputPath = outputArgument >= 0 ? process.argv[outputArgument + 1] : null;
if (!outputPath) throw new Error("usage: node verification/release/benchmark.mjs --output REPORT.json");

const budget = JSON.parse(await readFile(resolve(ROOT, "verification/release/budgets.json"), "utf8"));
const cases = [
  { name: "baseline", file: "verification/budget-scaffold.ts" },
  { name: "prng", file: "verification/release/cases/prng.ts" },
  { name: "dice", file: "verification/release/cases/dice.ts" },
  { name: "combined", file: "verification/release/cases/combined.ts" },
  { name: "max-query", file: "verification/release/cases/max-query.ts" },
];
const compilers = [
  { name: "typescript-7-single-checker", package: "typescript@7.0.2", executable: "tsc", checkers: 1, blocking: true },
  { name: "typescript-7-four-checker", package: "typescript@7.0.2", executable: "tsc", checkers: 4, blocking: true },
  { name: "typescript-6-advisory", package: "@typescript/typescript6@6.0.2", executable: "tsc6", checkers: 1, blocking: false },
];
const commonOptions = [
  "--ignoreConfig", "--pretty", "false", "--strict", "--noEmit",
  "--target", "ES2020", "--module", "NodeNext", "--moduleResolution", "NodeNext",
  "--lib", "ES2020,DOM", "--extendedDiagnostics",
];
const requiredWarmupRuns = budget.requiredWarmupRuns;
const requiredScoredRuns = budget.requiredScoredRuns;

const parseMetric = (output, label, unit = "") => {
  const match = output.match(new RegExp(`^${label}:\\s+([0-9.]+)${unit}`, "m"));
  if (!match) throw new Error(`missing ${label} in compiler diagnostics\n${output}`);
  return Number(match[1]);
};

const processTreeRssKiB = (rootPid) => {
  let total = 0;
  const pending = [rootPid];
  const seen = new Set();
  while (pending.length > 0) {
    const pid = pending.pop();
    if (seen.has(pid)) continue;
    seen.add(pid);
    try {
      const status = requireStatus(pid);
      const rss = status.match(/^VmRSS:\s+(\d+)\s+kB$/m);
      if (rss) total += Number(rss[1]);
      const children = requireChildren(pid).trim();
      if (children) pending.push(...children.split(/\s+/).map(Number));
    } catch (error) {
      if (error.code !== "ENOENT" && error.code !== "ESRCH") throw error;
    }
  }
  return total;
};

/* Keeping these reads synchronous makes the sampler deterministic and avoids
 * a second asynchronous process tree walk racing process exit. */
const requireStatus = (pid) => readFileSync(`/proc/${pid}/status`, "utf8");
const requireChildren = (pid) => readFileSync(`/proc/${pid}/task/${pid}/children`, "utf8");

const compilerVersion = (compiler) => {
  const result = spawnSync("pnpm", ["exec", compiler.executable, "--version"], { cwd: ROOT, encoding: "utf8" });
  if (result.status !== 0) throw new Error(`${compiler.name} version probe failed\n${result.stdout}\n${result.stderr}`);
  return result.stdout.trim();
};

const runCompiler = (compiler, benchmarkCase) => new Promise((resolveResult, reject) => {
  const args = ["exec", compiler.executable, ...commonOptions];
  if (compiler.name.startsWith("typescript-7")) args.push("--checkers", String(compiler.checkers));
  args.push(benchmarkCase.file);
  const started = performance.now();
  const child = spawn("pnpm", args, { cwd: ROOT, detached: true, stdio: ["ignore", "pipe", "pipe"] });
  let stdout = "";
  let stderr = "";
  let peakRssKiB = 0;
  child.stdout.setEncoding("utf8");
  child.stderr.setEncoding("utf8");
  child.stdout.on("data", (chunk) => { stdout += chunk; });
  child.stderr.on("data", (chunk) => { stderr += chunk; });
  const sampler = setInterval(() => {
    peakRssKiB = Math.max(peakRssKiB, processTreeRssKiB(child.pid));
  }, 100);
  const timeout = setTimeout(() => {
    child.kill("SIGKILL");
  }, 120000);
  child.once("error", reject);
  child.once("exit", (exitCode, signal) => {
    clearInterval(sampler);
    clearTimeout(timeout);
    peakRssKiB = Math.max(peakRssKiB, processTreeRssKiB(child.pid));
    const output = `${stdout}\n${stderr}`;
    if (exitCode !== 0) {
      reject(Object.assign(new Error(`${compiler.name}/${benchmarkCase.name} failed (${exitCode ?? signal})\n${output}`), {
        code: exitCode,
        signal,
        stdout,
        stderr,
      }));
      return;
    }
    try {
      resolveResult({
        wallMilliseconds: Number((performance.now() - started).toFixed(3)),
        peakRssKiB,
        checkMilliseconds: parseMetric(output, "Check time", "s") * 1000,
        totalMilliseconds: parseMetric(output, "Total time", "s") * 1000,
        compilerMemoryKiB: parseMetric(output, "Memory used", "K"),
        types: parseMetric(output, "Types"),
        instantiations: parseMetric(output, "Instantiations"),
      });
    } catch (error) {
      reject(Object.assign(error, { stdout, stderr }));
    }
  });
});

const median = (values) => {
  const sorted = [...values].sort((left, right) => left - right);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[middle - 1] + sorted[middle]) / 2 : sorted[middle];
};
const summarize = (samples, key) => {
  const values = samples.map((sample) => sample[key]);
  return { median: median(values), minimum: Math.min(...values), maximum: Math.max(...values) };
};

const results = [];
for (const compiler of compilers) {
  const version = compilerVersion(compiler);
  for (const benchmarkCase of cases) {
    const compilerScoredRuns = compiler.blocking ? requiredScoredRuns : 1;
    const compilerWarmupRuns = compiler.blocking ? requiredWarmupRuns : 0;
    let warmup = null;
    if (compiler.blocking) {
      warmup = await runCompiler(compiler, benchmarkCase);
    }
    const samples = [];
    for (let run = 0; run < compilerScoredRuns; run += 1) {
      try {
        samples.push(await runCompiler(compiler, benchmarkCase));
      } catch (error) {
        if (compiler.blocking) throw error;
        results.push({
          compiler: compiler.name, package: compiler.package, executable: compiler.executable,
          checkerWorkers: compiler.checkers, case: benchmarkCase.name, file: benchmarkCase.file,
          warmupRuns: compilerWarmupRuns, scoredRuns: samples.length, freshProcesses: true,
          compilerVersion: version, status: "advisory-failed", warmup, samples,
          sampleError: String(error.message),
        });
        samples.length = 0;
        break;
      }
    }
    if (samples.length === 0) continue;
    results.push({
      compiler: compiler.name, package: compiler.package, executable: compiler.executable,
      checkerWorkers: compiler.checkers, case: benchmarkCase.name, file: benchmarkCase.file,
      warmupRuns: compilerWarmupRuns, scoredRuns: compilerScoredRuns, freshProcesses: true,
      compilerVersion: version, status: "passed", warmup, samples,
      checkMilliseconds: summarize(samples, "checkMilliseconds"),
      totalMilliseconds: summarize(samples, "totalMilliseconds"),
      wallMilliseconds: summarize(samples, "wallMilliseconds"),
      peakRssKiB: summarize(samples, "peakRssKiB"),
      compilerMemoryKiB: summarize(samples, "compilerMemoryKiB"),
      types: summarize(samples, "types"),
      instantiations: summarize(samples, "instantiations"),
    });
  }
}

const report = {
  schemaVersion: 1,
  generatedAt: new Date().toISOString(),
  host: {
    platform: platform(), release: release(), architecture: process.arch, node: process.version,
    cpuModel: cpus()[0]?.model ?? "unknown", logicalCpuCount: cpus().length,
    totalMemoryBytes: totalmem(), freeMemoryBytesAtReport: freemem(),
  },
  options: commonOptions,
  requiredWarmupRuns,
  requiredScoredRuns,
  cases,
  compilerVersions: Object.fromEntries(compilers.map((compiler) => [compiler.name, compilerVersion(compiler)])),
  results,
};
await writeFile(resolve(ROOT, outputPath), JSON.stringify(report, null, 2) + "\n", "utf8");
console.log(JSON.stringify(report, null, 2));
