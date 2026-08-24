/*
 * Normal-change parity gate.
 *
 * The PRNG and Dice fixture suites deliberately remain owned by the issue that
 * established each contract.  This entry point is the single normal-change
 * gate: it runs every owner checker, checks the oracle boundary once more, and
 * fails closed if a suite is omitted or a child checker exits unsuccessfully.
 */

import { readdir, readFile } from "node:fs/promises";
import { dirname, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "../..");
const verification = resolve(root, "verification");

const fail = (message) => {
  throw new Error(`[issue-23 fixtures] ${message}`);
};

const run = (script) => {
  const child = spawnSync(process.execPath, [resolve(root, script)], {
    cwd: root,
    encoding: "utf8",
  });
  if (child.status !== 0) {
    fail(`${script} failed\n${child.stdout}\n${child.stderr}`);
  }
};

/* Keep the list explicit.  Adding an issue-owned parity suite without adding
 * it here must make the review diff obvious instead of silently weakening the
 * normal gate. */
const suites = [
  "verification/check-generated-fixtures.mjs",
  "verification/issue-17/check.mjs",
  "verification/issue-17/check-boundary.mjs",
  "verification/issue-18/check.mjs",
  "verification/issue-19/check.mjs",
  "verification/issue-20/check.mjs",
  "verification/issue-21/check.mjs",
  "verification/issue-22/check.mjs",
];

const oracleFiles = [];
const visit = async (directory) => {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (entry.name === "node_modules" || entry.name === ".git") continue;
    const absolute = resolve(directory, entry.name);
    if (entry.isDirectory()) await visit(absolute);
    else if (entry.name === "oracle.mjs") oracleFiles.push(absolute);
  }
};

const checkOracleBoundary = async () => {
  await visit(verification);
  if (oracleFiles.length !== 2) fail(`expected the issue #17/#20 oracle chain, found ${oracleFiles.length} oracle files`);
  for (const file of oracleFiles.sort()) {
    const source = await readFile(file, "utf8");
    const executableSource = source
      .replace(/\/\*[\s\S]*?\*\//g, "")
      .replace(/\/\/[^\r\n]*/g, "");
    const relativeFile = relative(root, file).replaceAll("\\", "/");
    if (!relativeFile.startsWith("verification/")) fail(`${relativeFile} escaped the verification directory`);
    if (/(?:^|[/'"`])(?:packages|src|dist)(?:[/'"`])/.test(source)) {
      fail(`${relativeFile} references a production package/source/dist path`);
    }
    /* The oracles have no reason to load modules dynamically.  Rejecting the
     * loader syntax itself closes the common indirection escape hatch (for
     * example import("@drdice/" + "prng") or require(specifier)); checking
     * only the final literal lets those imports evade the package-name scan. */
    if (/\b(?:import|require)\s*\(/.test(executableSource)) {
      fail(`${relativeFile} uses dynamic module loading`);
    }
    if (/\b(?:eval|Function)\s*\(/.test(executableSource)) {
      fail(`${relativeFile} uses dynamic code loading`);
    }
    if (/@drdice\b/.test(source)) {
      fail(`${relativeFile} references a public implementation package`);
    }

    const imports = [];
    const importPattern = /\b(?:from\s*|import\s*)["']([^"']+)["']/g;
    for (const match of source.matchAll(importPattern)) imports.push(match[1]);
    for (const specifier of imports) {
      if (!specifier.startsWith(".")) fail(`${relativeFile} imports non-relative module ${specifier}`);
      const target = resolve(dirname(file), specifier);
      if (!target.startsWith(`${verification}/`) || !target.endsWith("oracle.mjs")) {
        fail(`${relativeFile} imports outside the private oracle chain: ${specifier}`);
      }
    }
  }
};

const checkShardAssertions = async () => {
  const shardGroups = [
    {
      directory: resolve(verification, "generated"),
      pattern: /^(?:dice-issue21|dice-issue22)-\d{3}\.d\.ts$/,
      label: "Dice parity",
    },
    {
      directory: resolve(verification, "issue-22/generated"),
      pattern: /^dice-issue22-(?:\d{3}|side-\d{3})\.d\.ts$/,
      label: "complete Dice parity",
    },
    {
      directory: resolve(verification, "generated"),
      pattern: /^prng-issue(?:18|19)-.*\.d\.ts$/,
      label: "PRNG parity",
    },
  ];
  for (const group of shardGroups) {
    const names = (await readdir(group.directory)).filter((name) => group.pattern.test(name)).sort();
    if (names.length === 0) fail(`${group.label} has no generated shards`);
    for (const name of names) {
      const source = await readFile(resolve(group.directory, name), "utf8");
      if (!source.includes("Assert<Equal<")) fail(`${group.label} shard ${name} has no exact type-equality assertion`);
      if (group.label !== "PRNG parity" && !source.includes("type Expected =")) {
        fail(`${group.label} shard ${name} has no literal expected result`);
      }
    }
  }
};

const checkCompleteDiceCorpus = async () => {
  const golden = JSON.parse(await readFile(resolve(verification, "issue-20/golden-vectors.json"), "utf8"));
  const ids = JSON.parse(await readFile(resolve(verification, "issue-22/cases.json"), "utf8"));
  const literalIds = golden.cases.filter((vector) => typeof vector.source === "string").map((vector) => vector.id).sort();
  const selectedIds = [...ids].sort();
  if (JSON.stringify(literalIds) !== JSON.stringify(selectedIds)) {
    fail(`complete Dice parity corpus does not cover exactly every literal golden case\nexpected: ${literalIds.join(", ")}\nactual: ${selectedIds.join(", ")}`);
  }
};

await checkOracleBoundary();
await checkShardAssertions();
await checkCompleteDiceCorpus();
for (const suite of suites) run(suite);
console.log(`[issue-23 fixtures] complete deterministic parity passed (${suites.length} owner suites, ${oracleFiles.length} private oracles)`);
