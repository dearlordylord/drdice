import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "../..");
const query = resolve(here, "budget.ts");
const limits = {
  maximumCheckMilliseconds: 500,
  maximumCompilerMemoryKiB: 327680,
  maximumInstantiations: 90000,
};

const parse = (output, label, unit = "") => {
  const match = output.match(new RegExp(`^${label}:\\s+([0-9.]+)${unit}`, "m"));
  if (!match) throw new Error(`missing ${label} in compiler diagnostics\n${output}`);
  return Number(match[1]);
};

const version = spawnSync("pnpm", ["exec", "tsc", "--version"], { cwd: root, encoding: "utf8" });
if (version.status !== 0 || version.stdout.trim() !== "Version 7.0.2") {
  throw new Error(`issue-18 budget requires TypeScript 7.0.2, got ${version.stdout.trim()}\n${version.stderr}`);
}

const results = [];
for (const checkers of [1, 4]) {
  const started = performance.now();
  const checked = spawnSync("pnpm", [
    "exec",
    "tsc",
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
    "ES2020,DOM",
    "--extendedDiagnostics",
    "--checkers",
    String(checkers),
    query,
  ], { cwd: root, encoding: "utf8" });
  const output = `${checked.stdout}\n${checked.stderr}`;
  if (checked.status !== 0) throw new Error(`issue-18 ${checkers}-checker query failed\n${output}`);
  const observed = {
    compiler: version.stdout.trim(),
    checkers,
    checkMilliseconds: parse(output, "Check time", "s") * 1000,
    compilerMemoryKiB: parse(output, "Memory used", "K"),
    instantiations: parse(output, "Instantiations"),
    wallMilliseconds: Number((performance.now() - started).toFixed(3)),
  };
  if (observed.checkMilliseconds > limits.maximumCheckMilliseconds) {
    throw new Error(`${checkers}-checker check time ${observed.checkMilliseconds} exceeds ${limits.maximumCheckMilliseconds} ms`);
  }
  if (observed.compilerMemoryKiB > limits.maximumCompilerMemoryKiB) {
    throw new Error(`${checkers}-checker compiler memory ${observed.compilerMemoryKiB} KiB exceeds ${limits.maximumCompilerMemoryKiB} KiB`);
  }
  if (observed.instantiations > limits.maximumInstantiations) {
    throw new Error(`${checkers}-checker instantiations ${observed.instantiations} exceeds ${limits.maximumInstantiations}`);
  }
  results.push(observed);
}

console.log(JSON.stringify({
  schemaVersion: 1,
  issue: 18,
  query: "verification/issue-18/budget.ts",
  limits,
  results,
}, null, 2));
