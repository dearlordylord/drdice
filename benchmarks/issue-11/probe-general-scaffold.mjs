import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

const root = resolve(import.meta.dirname, "../..");
const sourcePath = join(root, "prototypes/dice-evaluation-type-api.ts");
const marker = "/* The public sketch deliberately materializes a bounded literal corpus";
const probe = `
type Issue11GeneralD6 = EvaluateScaffold<
  "d6",
  GeneratorState<typeof GOLDEN_STATES[0]>,
  1
>;
type Issue11ProbeExpect<T extends true> = T;
type Issue11GeneralD6MustSucceed = Issue11ProbeExpect<
  Issue11GeneralD6 extends Success<unknown> ? true : false
>;

`;

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
];

const parseMetric = (output, label, unit = "") => {
  const match = output.match(new RegExp(`^${label}:\\s+([0-9.]+)${unit}`, "m"));
  if (!match) throw new Error(`Missing ${label} in compiler diagnostics`);
  return Number(match[1]);
};

const temporaryDirectory = mkdtempSync(join(tmpdir(), "drdice-issue-11-"));
try {
  const source = readFileSync(sourcePath, "utf8");
  if (!source.includes(marker)) throw new Error("Prototype probe marker moved");
  const probePath = join(temporaryDirectory, "general-d6-probe.ts");
  writeFileSync(probePath, source.replace(marker, `${probe}${marker}`));

  const results = compilers.map((compiler) => {
    const run = spawnSync(
      "npm",
      [
        "exec", "--yes", `--package=${compiler.package}`, "--",
        compiler.executable,
        "--ignoreConfig",
        "--pretty", "false",
        "--strict",
        "--noEmit",
        "--target", "es2020",
        "--module", "commonjs",
        "--lib", "es2020,dom",
        "--extendedDiagnostics",
        ...compiler.extra,
        probePath,
      ],
      { cwd: root, encoding: "utf8" },
    );
    const output = `${run.stdout}\n${run.stderr}`;
    if (run.status === 0 || !output.includes("TS2589")) {
      throw new Error(`${compiler.name} no longer reproduces the expected TS2589\n${output}`);
    }
    return {
      compiler: compiler.name,
      package: compiler.package,
      expectedDiagnostic: "TS2589",
      types: parseMetric(output, "Types"),
      instantiations: parseMetric(output, "Instantiations"),
      compilerMemoryKiB: parseMetric(output, "Memory used", "K"),
      checkMilliseconds: parseMetric(output, "Check time", "s") * 1000,
    };
  });

  console.log(JSON.stringify({
    schemaVersion: 1,
    question: "Can the accepted Dice prototype's private general scaffold evaluate d6?",
    expectedAnswer: "No; both pinned compilers must reproduce TS2589.",
    results,
  }, null, 2));
} finally {
  rmSync(temporaryDirectory, { recursive: true, force: true });
}
