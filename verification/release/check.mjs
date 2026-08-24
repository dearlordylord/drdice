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
  throw new Error(`[release qualification] ${message}`);
};
const isReleaseInfrastructure = (path) => (
  path === "README.md"
  || path === "package.json"
  || path === "scripts/local_release.sh"
  || path === "verification/baseline/README.md"
  || path === "verification/check-clean-consumers.mjs"
  || path === "verification/issue-18/check-budget.mjs"
  || path === "verification/issue-19/README.md"
  || path === "verification/issue-19/check-budget.mjs"
  || path.startsWith("verification/parity/")
  || path.startsWith("verification/release/")
);
const changedPathsSince = (commit) => {
  if (!/^[0-9a-f]{40}$/.test(commit ?? "")) fail("report measured commit is invalid");
  const child = spawnSync(
    "git",
    ["diff", "--name-only", "--diff-filter=ACDMRTUXB", `${commit}..HEAD`],
    { cwd: ROOT, encoding: "utf8" },
  );
  if (child.status !== 0) fail(`could not compare current source with measured commit\n${child.stderr}`);
  return child.stdout.split(/\r?\n/).filter(Boolean);
};
const report = JSON.parse(await readFileAsync(REPORT, "utf8"));
if (report.schemaVersion !== 2 || report.qualification !== "v1-release") {
  fail("report schema or qualification identity is incorrect");
}
if (report.verdict?.status !== "ready") fail(`report verdict is ${report.verdict?.status ?? "missing"}`);
if (report.reportDigest !== reportDigest(report)) fail("report digest does not match its contents; evidence was edited or truncated");
if (report.source?.digestExcludes?.join("|") !== REPORT_RELATIVE) fail("report source digest exclusion is incorrect");
if (report.source?.cleanAtMeasurement !== true) fail("report was not measured from a clean source tree");

const status = gitStatus();
if (status) fail(`working tree is dirty; release evidence is not attributable to a clean checkout:\n${status}`);
const currentSourceDigest = await sourceDigest();
let reusedCompilerEvidence = false;
if (currentSourceDigest !== report.source.sourceDigest) {
  const changedPaths = changedPathsSince(report.source.measuredCommit)
    .filter((path) => path !== REPORT_RELATIVE);
  const compilerRelevantPaths = changedPaths.filter((path) => !isReleaseInfrastructure(path));
  if (compilerRelevantPaths.length > 0) {
    fail(`release report is stale: compiler-relevant source changed since measurement:\n${compilerRelevantPaths.join("\n")}`);
  }
  reusedCompilerEvidence = true;
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
const gates = [run("workspace release verification", ["verify"])];

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
console.log(`Release evidence is current and blocking-ready (${report.source.sourceDigest}).`);
if (reusedCompilerEvidence) {
  console.log("Reused compiler evidence because only closed, live-revalidated release infrastructure changed.");
}
console.log(`Revalidated ${gates.length} semantic/package gates and ${report.compilerBudget.results.length} compiler-budget records.`);
