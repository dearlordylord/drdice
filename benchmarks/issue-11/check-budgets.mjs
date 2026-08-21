import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const resultPath = process.argv[2];
if (!resultPath) {
  throw new Error("usage: node check-budgets.mjs RESULTS.json [--reference-runner]");
}

const enforceOperational = process.argv.includes("--reference-runner");
const here = import.meta.dirname;
const budgets = JSON.parse(readFileSync(resolve(here, "budgets.json"), "utf8"));
const report = JSON.parse(readFileSync(resolve(resultPath), "utf8"));
const failures = [];
const advisories = [];

const record = (seriesBudget, message) => {
  (seriesBudget.blocking ? failures : advisories).push(message);
};

for (const [seriesName, seriesBudget] of Object.entries(budgets.series)) {
  const seriesResults = report.results.filter(({ compiler }) => compiler === seriesName);
  if (seriesResults.length === 0) {
    record(seriesBudget, `${seriesName}: result series is missing`);
    continue;
  }

  if (report.compilerVersions?.[seriesName] !== seriesBudget.reportedVersion) {
    record(
      seriesBudget,
      `${seriesName}: reported version ${JSON.stringify(report.compilerVersions?.[seriesName])} does not match ${JSON.stringify(seriesBudget.reportedVersion)}`,
    );
  }
  for (const result of seriesResults) {
    if (result.package !== seriesBudget.package) {
      record(seriesBudget, `${seriesName}/${result.case}: package ${result.package} does not match ${seriesBudget.package}`);
    }
    if (result.checkerWorkers !== seriesBudget.checkerWorkers) {
      record(
        seriesBudget,
        `${seriesName}/${result.case}: ${result.checkerWorkers} checker workers do not match ${seriesBudget.checkerWorkers}`,
      );
    }
    if (result.runs !== budgets.requiredScoredRuns || result.samples.length !== budgets.requiredScoredRuns) {
      record(
        seriesBudget,
        `${seriesName}/${result.case}: expected ${budgets.requiredScoredRuns} scored runs, found ${result.runs}/${result.samples.length}`,
      );
    }
  }

  for (const [caseName, caseBudget] of Object.entries(seriesBudget.cases)) {
    const result = seriesResults.find(({ case: observedCase }) => observedCase === caseName);
    if (!result) {
      record(seriesBudget, `${seriesName}/${caseName}: result is missing`);
      continue;
    }

    if (result.instantiations.maximum > caseBudget.instantiations) {
      record(
        seriesBudget,
        `${seriesName}/${caseName}: ${result.instantiations.maximum} instantiations exceed ${caseBudget.instantiations}`,
      );
    }

    if (enforceOperational && result.checkMilliseconds.median > caseBudget.medianCheckMilliseconds) {
      record(
        seriesBudget,
        `${seriesName}/${caseName}: ${result.checkMilliseconds.median} ms median exceeds ${caseBudget.medianCheckMilliseconds} ms`,
      );
    }
    if (enforceOperational && result.peakRssKiB.maximum > caseBudget.peakRssKiB) {
      record(
        seriesBudget,
        `${seriesName}/${caseName}: ${result.peakRssKiB.maximum} KiB peak RSS exceeds ${caseBudget.peakRssKiB} KiB`,
      );
    }
  }

  if (enforceOperational && seriesBudget.maximumSingleCheckMilliseconds !== undefined) {
    const worstCheck = Math.max(...seriesResults.flatMap(({ samples }) => samples.map(({ checkMilliseconds }) => checkMilliseconds)));
    if (worstCheck > seriesBudget.maximumSingleCheckMilliseconds) {
      record(
        seriesBudget,
        `${seriesName}: ${worstCheck} ms single check exceeds ${seriesBudget.maximumSingleCheckMilliseconds} ms`,
      );
    }
  }

  if (enforceOperational && seriesBudget.combinedCompilerMemoryKiB !== undefined) {
    const combined = seriesResults.find(({ case: observedCase }) => observedCase === "accepted-prototypes");
    if (combined?.compilerMemoryKiB.maximum > seriesBudget.combinedCompilerMemoryKiB) {
      record(
        seriesBudget,
        `${seriesName}: ${combined.compilerMemoryKiB.maximum} KiB compiler memory exceeds ${seriesBudget.combinedCompilerMemoryKiB} KiB`,
      );
    }
  }
}

for (const advisory of advisories) console.warn(`ADVISORY: ${advisory}`);
if (failures.length > 0) {
  for (const failure of failures) console.error(`FAIL: ${failure}`);
  process.exitCode = 1;
} else {
  console.log(`Issue #11 budgets passed${enforceOperational ? " on the reference runner" : " (portable instantiation gates)"}.`);
}
