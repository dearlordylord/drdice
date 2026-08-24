import { spawnSync } from "node:child_process";
import { readFile as readFileAsync } from "node:fs/promises";
import { resolve } from "node:path";
import {
  ROOT,
  REPORT,
  REPORT_RELATIVE,
  gitStatus,
  reportDigest,
  sourceDigest,
  validateBudgetResults,
} from "./common.mjs";

const fail = (message) => {
  throw new Error(`[issue-24 release check] ${message}`);
};
const report = JSON.parse(await readFileAsync(REPORT, "utf8"));
if (report.schemaVersion !== 1 || report.issue !== 24) fail("report schema or issue number is incorrect");
if (report.verdict?.status !== "ready") fail(`report verdict is ${report.verdict?.status ?? "missing"}`);
if (report.reportDigest !== reportDigest(report)) fail("report digest does not match its contents; evidence was edited or truncated");
if (report.source?.digestExcludes?.join("|") !== REPORT_RELATIVE) fail("report source digest exclusion is incorrect");
if (report.source?.cleanAtMeasurement !== true) fail("report was not measured from a clean source tree");

const status = gitStatus();
if (status) fail(`working tree is dirty; release evidence is not attributable to a clean checkout:\n${status}`);
if (await sourceDigest() !== report.source.sourceDigest) {
  fail("release report is stale: current tracked source digest differs from the measured evidence");
}

const budgetVerdict = validateBudgetResults(report.compilerBudget, report.budgets);
if (budgetVerdict.failures.length > 0) fail(`blocking compiler evidence no longer satisfies declared budgets:\n${budgetVerdict.failures.join("\n")}`);
if (JSON.stringify(budgetVerdict.advisories) !== JSON.stringify(report.verdict.advisories)) {
  fail("advisory compiler evidence differs from the report verdict; regenerate the report");
}

const run = (label, args) => {
  const child = spawnSync("pnpm", args, { cwd: ROOT, encoding: "utf8" });
  if (child.status !== 0) fail(`${label} failed\n${child.stdout}\n${child.stderr}`);
  return { label, command: ["pnpm", ...args].join(" "), status: child.status, stdout: child.stdout, stderr: child.stderr };
};
const gates = [
  run("TypeScript 7 project typecheck", ["typecheck"]),
  run("complete semantic and package parity", ["check:parity"]),
  run("packed clean consumers", ["check:clean-consumers"]),
  run("packed artifact allowlists", ["check:packed"]),
];

/* Keep the report's gate inventory closed: adding or removing a release gate
 * requires a new measured report rather than silently weakening this check. */
const expectedLabels = gates.map(({ label }) => label);
const reportedLabels = report.gates.map(({ label }) => label);
if (JSON.stringify(expectedLabels) !== JSON.stringify(reportedLabels)) {
  fail(`report gate inventory differs; expected ${expectedLabels.join(", ")}, got ${reportedLabels.join(", ")}`);
}

/* Avoid importing package declarations in the checker.  The semantic/package
 * details in the report are source-digested evidence; the live gates above
 * verify the current declarations and packed roots independently. */
console.log(`Issue #24 release evidence is current and blocking-ready (${report.source.sourceDigest}).`);
console.log(`Revalidated ${gates.length} semantic/package gates and ${report.compilerBudget.results.length} compiler-budget records.`);
