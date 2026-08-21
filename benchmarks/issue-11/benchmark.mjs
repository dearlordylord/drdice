import { readFileSync } from "node:fs";
import { spawn, spawnSync } from "node:child_process";
import { performance } from "node:perf_hooks";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { cpus, freemem, platform, release, totalmem } from "node:os";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "../..");
const scoredRuns = Number.parseInt(process.env.DRDICE_BENCHMARK_RUNS ?? "5", 10);

if (!Number.isInteger(scoredRuns) || scoredRuns < 1) {
  throw new Error("DRDICE_BENCHMARK_RUNS must be a positive integer");
}

const compilers = [
  {
    name: "typescript-6",
    package: "@typescript/typescript6@6.0.2",
    executable: "tsc6",
    extra: [],
  },
  {
    name: "typescript-7",
    package: "typescript@7.0.2",
    executable: "tsc",
    extra: ["--checkers", "4"],
  },
  {
    name: "typescript-7-single-checker",
    package: "typescript@7.0.2",
    executable: "tsc",
    extra: ["--checkers", "1"],
  },
];

const cases = [
  { name: "empty", files: ["benchmarks/issue-11/cases/empty.ts"] },
  { name: "prng-prototype", files: ["prototypes/prng-type-api.ts"] },
  { name: "dice-prototype", files: ["prototypes/dice-evaluation-type-api.ts"] },
  {
    name: "accepted-prototypes",
    files: ["prototypes/prng-type-api.ts", "prototypes/dice-evaluation-type-api.ts"],
  },
  {
    name: "sampling-ceiling",
    files: ["benchmarks/issue-11/cases/sampling-ceiling.ts"],
  },
];

const commonOptions = [
  "--ignoreConfig",
  "--pretty", "false",
  "--strict",
  "--noEmit",
  "--target", "es2020",
  "--module", "commonjs",
  "--lib", "es2020,dom",
  "--extendedDiagnostics",
];

const requestedCompilers = new Set(
  (process.env.DRDICE_BENCHMARK_COMPILERS ?? compilers.map(({ name }) => name).join(","))
    .split(",")
    .filter(Boolean),
);
const selectedCompilers = compilers.filter(({ name }) => requestedCompilers.has(name));
if (selectedCompilers.length !== requestedCompilers.size) {
  throw new Error(`Unknown DRDICE_BENCHMARK_COMPILERS value: ${[...requestedCompilers].join(",")}`);
}

const compilerVersions = Object.fromEntries(selectedCompilers.map((compiler) => {
  const version = spawnSync(
    "npm",
    ["exec", "--yes", `--package=${compiler.package}`, "--", compiler.executable, "--version"],
    { cwd: root, encoding: "utf8" },
  );
  if (version.status !== 0) throw new Error(version.stderr);
  return [compiler.name, version.stdout.trim()];
}));

const median = (values) => {
  const sorted = [...values].sort((left, right) => left - right);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[middle - 1] + sorted[middle]) / 2
    : sorted[middle];
};

const summarize = (samples, key) => {
  const values = samples.map((sample) => sample[key]);
  return { median: median(values), minimum: Math.min(...values), maximum: Math.max(...values) };
};

const parseMetric = (output, label, unit = "") => {
  const match = output.match(new RegExp(`^${label}:\\s+([0-9.]+)${unit}`, "m"));
  if (!match) throw new Error(`Missing ${label} in compiler diagnostics`);
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
      const status = readFileSync(`/proc/${pid}/status`, "utf8");
      const rss = status.match(/^VmRSS:\s+(\d+)\s+kB$/m);
      if (rss) total += Number(rss[1]);
      const children = readFileSync(`/proc/${pid}/task/${pid}/children`, "utf8").trim();
      if (children) pending.push(...children.split(/\s+/).map(Number));
    } catch (error) {
      if (error.code !== "ENOENT" && error.code !== "ESRCH") throw error;
    }
  }
  return total;
};

const runCompiler = async (compiler, benchmarkCase) => {
  const args = [
    "exec", "--yes", `--package=${compiler.package}`, "--",
    compiler.executable,
    ...commonOptions,
    ...compiler.extra,
    ...benchmarkCase.files,
  ];
  const start = performance.now();
  const child = spawn("npm", args, { cwd: root, detached: true, stdio: ["ignore", "pipe", "pipe"] });
  let stdout = "";
  let stderr = "";
  let peakRssKiB = 0;
  child.stdout.setEncoding("utf8");
  child.stderr.setEncoding("utf8");
  child.stdout.on("data", (chunk) => { stdout += chunk; });
  child.stderr.on("data", (chunk) => { stderr += chunk; });

  const sampler = setInterval(() => {
    peakRssKiB = Math.max(peakRssKiB, processTreeRssKiB(child.pid));
  }, 10);

  const exitCode = await new Promise((resolveExit, reject) => {
    child.once("error", reject);
    child.once("exit", resolveExit);
  });
  clearInterval(sampler);
  peakRssKiB = Math.max(peakRssKiB, processTreeRssKiB(child.pid));

  if (exitCode !== 0) {
    throw new Error(`${compiler.name}/${benchmarkCase.name} failed (${exitCode})\n${stdout}\n${stderr}`);
  }

  return {
    wallMilliseconds: Number((performance.now() - start).toFixed(3)),
    peakRssKiB,
    checkMilliseconds: parseMetric(stdout, "Check time", "s") * 1000,
    totalMilliseconds: parseMetric(stdout, "Total time", "s") * 1000,
    compilerMemoryKiB: parseMetric(stdout, "Memory used", "K"),
    types: parseMetric(stdout, "Types"),
    instantiations: parseMetric(stdout, "Instantiations"),
  };
};

const results = [];
for (const compiler of selectedCompilers) {
  for (const benchmarkCase of cases) {
    await runCompiler(compiler, benchmarkCase); // unscored warm-up
    const samples = [];
    for (let run = 0; run < scoredRuns; run += 1) {
      samples.push(await runCompiler(compiler, benchmarkCase));
    }
    results.push({
      compiler: compiler.name,
      package: compiler.package,
      executable: compiler.executable,
      checkerWorkers: compiler.name === "typescript-7" ? 4 : 1,
      case: benchmarkCase.name,
      files: benchmarkCase.files,
      runs: scoredRuns,
      checkMilliseconds: summarize(samples, "checkMilliseconds"),
      totalMilliseconds: summarize(samples, "totalMilliseconds"),
      wallMilliseconds: summarize(samples, "wallMilliseconds"),
      peakRssKiB: summarize(samples, "peakRssKiB"),
      compilerMemoryKiB: summarize(samples, "compilerMemoryKiB"),
      types: summarize(samples, "types"),
      instantiations: summarize(samples, "instantiations"),
      samples,
    });
  }
}

console.log(JSON.stringify({
  schemaVersion: 1,
  measuredAt: new Date().toISOString(),
  host: {
    platform: platform(),
    release: release(),
    architecture: process.arch,
    node: process.version,
    cpuModel: cpus()[0]?.model ?? "unknown",
    logicalCpuCount: cpus().length,
    totalMemoryBytes: totalmem(),
    freeMemoryBytesAtReport: freemem(),
  },
  compilerVersions,
  options: commonOptions,
  results,
}, null, 2));
