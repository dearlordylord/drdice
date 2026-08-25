import { mkdtemp, readdir, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "..");
const generator = resolve(here, "generate-fixtures.mjs");
const diceArithmeticGenerator = resolve(here, "dice-arithmetic-parity/generate.mjs");
const diceEvaluationGenerator = resolve(here, "dice-evaluation-parity/generate.mjs");
const committed = resolve(here, "generated");
const temporary = await mkdtemp(resolve(tmpdir(), "drdice-generated-"));
const temporaryDiceEvaluation = await mkdtemp(resolve(tmpdir(), "drdice-evaluation-parity-generated-"));

const fail = (message) => {
  throw new Error(`[generated fixtures] ${message}`);
};

const runGenerator = (script, output) => {
  const generated = spawnSync(process.execPath, [script, "--output", output], {
    cwd: root,
    encoding: "utf8",
  });
  if (generated.status !== 0) {
    fail(`${script} failed\n${generated.stdout}\n${generated.stderr}`);
  }
};

const compareDirectory = async (expectedDirectory, actualDirectory, label) => {
  const [expectedNames, actualNames] = await Promise.all([
    readdir(expectedDirectory),
    readdir(actualDirectory),
  ]);
  expectedNames.sort();
  actualNames.sort();
  if (JSON.stringify(expectedNames) !== JSON.stringify(actualNames)) {
    fail(`${label} set differs: expected ${expectedNames.join(", ")}, got ${actualNames.join(", ")}`);
  }

  for (const name of expectedNames) {
    const [expected, actual] = await Promise.all([
      readFile(resolve(expectedDirectory, name), "utf8"),
      readFile(resolve(actualDirectory, name), "utf8"),
    ]);
    if (expected !== actual) {
      fail(`${label} ${name} is dirty; run pnpm generate:fixtures and review the diff`);
    }
  }
};

try {
  /* All three generators are checked in fresh isolated directories.  The
   * former Dice arithmetic parity filename filter made it possible for the top-level gate to
   * overlook a dirty arithmetic shard; each owner now has an explicit output
   * directory and exact name/content comparison. */
  runGenerator(generator, temporary);
  runGenerator(diceArithmeticGenerator, temporary);
  runGenerator(diceEvaluationGenerator, temporaryDiceEvaluation);
  await compareDirectory(committed, temporary, "root generated fixture");
  await compareDirectory(resolve(root, "verification/dice-evaluation-parity/generated"), temporaryDiceEvaluation, "Dice evaluation parity generated fixture");

  const version = spawnSync("pnpm", ["exec", "tsc", "--version"], {
    cwd: root,
    encoding: "utf8",
  });
  if (version.status !== 0 || version.stdout.trim() !== "Version 7.0.2") {
    fail(`generated fixture gate requires TypeScript 7.0.2, got ${version.stdout.trim()}\n${version.stderr}`);
  }

  const checked = spawnSync(
    "pnpm",
    ["exec", "tsc", "--project", resolve(here, "tsconfig.generated.json"), "--pretty", "false"],
    { cwd: root, encoding: "utf8" },
  );
  if (checked.status !== 0) {
    fail(`generated fixtures failed the pinned TypeScript 7 assertion gate\n${checked.stdout}\n${checked.stderr}`);
  }
  console.log("All generated fixture directories are clean and root shards typecheck under TypeScript 7.");
} finally {
  await rm(temporary, { recursive: true, force: true });
  await rm(temporaryDiceEvaluation, { recursive: true, force: true });
}
