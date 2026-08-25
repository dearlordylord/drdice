import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import { resolve } from "node:path";
import {
  ROOT,
  REPORT,
  REPORT_RELATIVE,
  digestJson,
  gitCommit,
  gitStatus,
  reportDigest,
  sourceDigest,
  validateBudgetResults,
} from "./common.mjs";

const mode = process.argv[2] ?? "--measure";
if (mode !== "--measure") throw new Error("usage: node verification/release/release.mjs --measure");

const fail = (message) => {
  throw new Error(`[release qualification] ${message}`);
};

const run = (command, args) => {
  const child = spawnSync(command, args, { cwd: ROOT, encoding: "utf8" });
  return {
    command: [command, ...args].join(" "),
    status: child.status,
    stdout: child.stdout ?? "",
    stderr: child.stderr ?? "",
  };
};

const runRequiredGate = (label, command, args) => {
  const result = run(command, args);
  if (result.status !== 0) fail(`${label} failed\n${result.stdout}\n${result.stderr}`);
  return { label, command: result.command, status: result.status };
};

const extract = (source, pattern, label) => {
  const match = source.match(pattern);
  if (!match) fail(`could not read ${label} from a package declaration`);
  return match[1];
};

const packageEvidence = async () => {
  const records = [];
  for (const name of ["prng", "dice"]) {
    const directory = resolve(ROOT, "packages", name);
    const manifest = JSON.parse(await readFile(resolve(directory, "package.json"), "utf8"));
    const declaration = await readFile(resolve(directory, "dist/index.d.ts"), "utf8");
    records.push({
      name: manifest.name,
      version: manifest.version,
      types: manifest.types,
      exports: manifest.exports,
      files: manifest.files,
      dependencies: manifest.dependencies ?? {},
      sideEffects: manifest.sideEffects,
      declarationOnly: /declaration-only/i.test(await readFile(resolve(directory, "README.md"), "utf8")),
      declarationBytes: Buffer.byteLength(declaration),
      identities: name === "prng"
        ? {
            schemaVersion: Number(extract(declaration, /export const SCHEMA_VERSION: (\d+)/, "PRNG schema version")),
            sequenceProfile: extract(declaration, /export const SEQUENCE_PROFILE: "([^"]+)"/, "PRNG Sequence Profile"),
          }
        : {
            semanticVersion: Number(extract(declaration, /export const DICE_SEMANTIC_VERSION: (\d+)/, "Dice semantic version")),
            semanticProfile: extract(declaration, /export const DICE_SEMANTIC_PROFILE: "([^"]+)"/, "Dice semantic profile"),
          },
    });
  }
  return records;
};

const semanticEvidence = async () => {
  const prng = JSON.parse(await readFile(resolve(ROOT, "verification/prng-semantics/golden-vectors.json"), "utf8"));
  const dice = JSON.parse(await readFile(resolve(ROOT, "verification/dice-semantics/golden-vectors.json"), "utf8"));
  const cases = JSON.parse(await readFile(resolve(ROOT, "verification/dice-evaluation-parity/cases.json"), "utf8"));
  return {
    prng: {
      schemaVersion: prng.schemaVersion,
      corpus: prng.corpus,
      sequenceProfile: prng.sequenceProfile,
      transitionCount: prng.rawWordVector.transitions.length,
      boundedResultCount: prng.sampling.length,
    },
    dice: {
      semanticProfile: dice.semanticProfile,
      semanticVersion: dice.semanticVersion,
      prngSequenceProfile: dice.prngSequenceProfile,
      limits: dice.limits,
      tieOrder: dice.staticResourceTieOrder,
      goldenCaseCount: dice.cases.length,
      completeParityCaseCount: cases.length,
    },
  };
};

const budgetFile = resolve(ROOT, "verification/release/budgets.json");
const budgets = JSON.parse(await readFile(budgetFile, "utf8"));
const initialStatus = gitStatus();
if (initialStatus) {
  fail(`working tree is dirty; commit source changes before measuring release evidence:\n${initialStatus}`);
}

const measuredCommit = gitCommit();
const measuredSourceDigest = await sourceDigest();
const gates = [
  runRequiredGate("workspace release verification", "pnpm", ["verify"]),
];
const packages = await packageEvidence();
const semantic = await semanticEvidence();

const temporary = await mkdtemp(resolve("/tmp", "drdice-release-"));
const benchmarkPath = resolve(temporary, "compiler-budget.json");
let benchmark;
try {
  const measured = run(process.execPath, [resolve(ROOT, "verification/release/benchmark.mjs"), "--output", benchmarkPath]);
  if (measured.status !== 0) fail(`compiler benchmark failed\n${measured.stdout}\n${measured.stderr}`);
  benchmark = JSON.parse(await readFile(benchmarkPath, "utf8"));
} finally {
  await rm(temporary, { recursive: true, force: true });
}

const currentSourceDigest = await sourceDigest();
if (currentSourceDigest !== measuredSourceDigest) fail("source tree changed while qualification was running; discard the measurements and retry");
const budgetVerdict = validateBudgetResults(benchmark, budgets);
if (budgetVerdict.failures.length > 0) fail(`blocking compiler budgets failed:\n${budgetVerdict.failures.join("\n")}`);

const report = {
  schemaVersion: 2,
  qualification: "release",
  verdict: {
    status: "ready",
    blockingFailures: budgetVerdict.failures,
    advisories: budgetVerdict.advisories,
    statement: "Release candidate meets the declared TypeScript 7.0.2 semantic, usability, package, packed-boundary, and compiler-budget gates.",
  },
  source: {
    qualifiedCommit: measuredCommit,
    sourceDigest: measuredSourceDigest,
    cleanAtQualification: true,
    digestExcludes: [REPORT_RELATIVE],
  },
  compilerEvidence: {
    measuredCommit,
    statement: "Compiler-budget evidence was measured from the qualified source.",
  },
  semantic,
  packages,
  gates,
  budgets,
  compilerBudget: benchmark,
};
report.reportDigest = reportDigest(report);
await writeFile(REPORT, JSON.stringify(report, null, 2) + "\n", "utf8");
console.log(`Release candidate measured at ${REPORT_RELATIVE}`);
console.log(`Source digest: ${digestJson({ source: measuredSourceDigest })}`);
console.log(`Blocking verdict: ${report.verdict.status}`);
if (budgetVerdict.advisories.length > 0) {
  console.warn(`Advisories:\n${budgetVerdict.advisories.join("\n")}`);
}
