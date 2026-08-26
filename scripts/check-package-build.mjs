import { mkdtemp, readFile, readdir, rm } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { PACKAGE_ARTIFACTS } from "../verification/package-artifacts.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const temporary = await mkdtemp(resolve(tmpdir(), "drdice-build-check-"));
try {
  for (const name of ["prng", "dice"]) {
    const sourceFiles = PACKAGE_ARTIFACTS[name].source;
    const outputFiles = PACKAGE_ARTIFACTS[name].output;
    const packageRoot = resolve(root, "packages", name);
    const source = resolve(packageRoot, "src");
    const output = resolve(packageRoot, "dist");
    const freshOutput = resolve(temporary, name);
    const actualSourceFiles = (await readdir(source)).sort();
    if (JSON.stringify(actualSourceFiles) !== JSON.stringify(sourceFiles)) {
      throw new Error(`${name}/src contains ${actualSourceFiles.join(", ")}; expected ${sourceFiles.join(", ")}`);
    }
    const result = spawnSync(
      "pnpm",
      [
        "exec", "tsc",
        "--project", resolve(packageRoot, "tsconfig.build.json"),
        "--outDir", freshOutput,
        "--pretty", "false",
      ],
      { cwd: root, encoding: "utf8" },
    );
    if (result.status !== 0) {
      throw new Error(`fresh TypeScript build failed for ${name}\n${result.stdout}\n${result.stderr}`);
    }
    await rm(resolve(freshOutput, "types.js"), { force: true });
    const actualOutputFiles = (await readdir(output)).sort();
    const freshOutputFiles = (await readdir(freshOutput)).sort();
    for (const [label, files] of [["dist", actualOutputFiles], ["fresh build", freshOutputFiles]]) {
      if (JSON.stringify(files) !== JSON.stringify(outputFiles)) {
        throw new Error(`${name}/${label} contains ${files.join(", ")}; expected ${outputFiles.join(", ")}`);
      }
    }
    for (const file of outputFiles) {
      const [actual, fresh] = await Promise.all([
        readFile(resolve(output, file)),
        readFile(resolve(freshOutput, file)),
      ]);
      if (!actual.equals(fresh)) {
        throw new Error(`${name}/dist/${file} is stale; run pnpm build`);
      }
    }
  }
  console.log("[build] package output exactly matches a fresh TypeScript build");
} finally {
  await rm(temporary, { recursive: true, force: true });
}
