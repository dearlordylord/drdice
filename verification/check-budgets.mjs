import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "..");
const baseline = JSON.parse(await readFile(resolve(here, "baseline/scaffold.json"), "utf8"));
const policyArgument = process.argv.indexOf("--policy");
const policy = policyArgument >= 0 ? process.argv[policyArgument + 1] : "all";
const policies = {
  "one-checker": { checkers: "1", key: "oneChecker" },
  "four-checker": { checkers: "4", key: "fourChecker" },
};
const selected = policy === "all"
  ? Object.entries(policies)
  : policies[policy]
    ? [[policy, policies[policy]]]
    : [];
if (selected.length === 0) {
  throw new Error("usage: node verification/check-budgets.mjs --policy all|one-checker|four-checker");
}

const parse = (output, label, unit = "") => {
  const match = output.match(new RegExp(`^${label}:\\s+([0-9.]+)${unit}`, "m"));
  if (!match) throw new Error(`missing ${label} in compiler diagnostics\n${output}`);
  return Number(match[1]);
};

const results = [];
const versionResult = spawnSync("pnpm", ["exec", "tsc", "--version"], { cwd: root, encoding: "utf8" });
if (versionResult.status !== 0) {
  throw new Error(`unable to determine TypeScript 7 version\n${versionResult.stdout}\n${versionResult.stderr}`);
}
const compilerVersion = versionResult.stdout.trim();
if (compilerVersion !== "Version 7.0.2") {
  throw new Error(`unexpected TypeScript 7 compiler identity: ${compilerVersion}`);
}
for (const [name, settings] of selected) {
  const args = [
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
    settings.checkers,
    resolve(here, "budget-scaffold.ts"),
  ];
  const started = performance.now();
  const result = spawnSync("pnpm", args, { cwd: root, encoding: "utf8" });
  const elapsedMilliseconds = Number((performance.now() - started).toFixed(3));
  const diagnostics = `${result.stdout}\n${result.stderr}`;
  if (result.status !== 0) {
    throw new Error(`${name} budget query failed\n${diagnostics}`);
  }
  const observed = {
    compiler: compilerVersion,
    checkMilliseconds: parse(diagnostics, "Check time", "s") * 1000,
    totalMilliseconds: parse(diagnostics, "Total time", "s") * 1000,
    compilerMemoryKiB: parse(diagnostics, "Memory used", "K"),
    types: parse(diagnostics, "Types"),
    instantiations: parse(diagnostics, "Instantiations"),
    wallMilliseconds: elapsedMilliseconds,
  };
  const limits = baseline.policies[settings.key].portableLimits;
  if (observed.instantiations > limits.maximumInstantiations) {
    throw new Error(`${name}: ${observed.instantiations} instantiations exceed ${limits.maximumInstantiations}`);
  }
  if (observed.checkMilliseconds > limits.maximumCheckMilliseconds) {
    throw new Error(`${name}: ${observed.checkMilliseconds} ms exceeds ${limits.maximumCheckMilliseconds} ms`);
  }
  results.push({ policy: name, ...observed });
}
console.log(JSON.stringify({ schemaVersion: 1, suite: "compiler-budgets", results }, null, 2));
