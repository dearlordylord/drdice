import { readFile as readFileAsync } from "node:fs/promises";
import {
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
const report = JSON.parse(await readFileAsync(REPORT, "utf8"));
if (report.schemaVersion !== 3 || report.qualification !== "release") {
  fail("report schema or qualification identity is incorrect");
}
if (report.verdict?.status !== "ready") fail(`report verdict is ${report.verdict?.status ?? "missing"}`);
if (report.reportDigest !== reportDigest(report)) fail("report digest does not match its contents; evidence was edited or truncated");
if (report.source?.digestExcludes?.join("|") !== REPORT_RELATIVE) fail("report source digest exclusion is incorrect");
if (report.source?.cleanAtQualification !== true) fail("report was not qualified from a clean source tree");
if (!/^[0-9a-f]{40}$/.test(report.source?.qualifiedCommit ?? "")) fail("qualified source commit is invalid");
if (!/^[0-9a-f]{40}$/.test(report.compilerEvidence?.measuredCommit ?? "")) fail("compiler evidence commit is invalid");

const status = gitStatus();
if (status) fail(`working tree is dirty; release evidence is not attributable to a clean checkout:\n${status}`);
const currentSourceDigest = await sourceDigest();
if (currentSourceDigest !== report.source.sourceDigest) {
  fail("release report is stale: qualified source digest differs from the current checkout");
}

const budgetVerdict = validateBudgetResults(report.compilerBudget, report.budgets);
if (budgetVerdict.failures.length > 0) fail(`blocking compiler evidence no longer satisfies declared budgets:\n${budgetVerdict.failures.join("\n")}`);
if (JSON.stringify(budgetVerdict.advisories) !== JSON.stringify(report.verdict.advisories)) {
  fail("advisory compiler evidence differs from the report verdict; regenerate the report");
}

/* Keep the report's gate inventory closed: adding or removing a release gate
 * requires a new measured report rather than silently weakening this check. */
const expectedLabels = ["workspace release verification"];
const reportedLabels = report.gates.map(({ label }) => label);
if (JSON.stringify(expectedLabels) !== JSON.stringify(reportedLabels)) {
  fail(`report gate inventory differs; expected ${expectedLabels.join(", ")}, got ${reportedLabels.join(", ")}`);
}

/* Deployment validates committed qualification evidence. Development and new
 * qualification changes run `pnpm verify`; publish retries do not repeat it. */
console.log(`Release evidence is current and blocking-ready (${report.source.sourceDigest}).`);
console.log(`Validated ${reportedLabels.length} recorded workspace gate and ${report.compilerBudget.results.length} compiler-budget records.`);
