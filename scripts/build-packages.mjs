import { mkdtemp, rename, rm, writeFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const packageNames = ["prng", "dice"];
const requested = process.argv.slice(2);
const selected = requested.length === 0
  ? packageNames
  : requested.includes("dice") ? packageNames : requested;

for (const name of requested) {
  if (!packageNames.includes(name)) {
    throw new Error(`unknown package ${name}; expected ${packageNames.join(" or ")}`);
  }
}

const builds = [];
let promotionSucceeded = false;
try {
  for (const name of selected) {
    const packageRoot = resolve(root, "packages", name);
    const stagedOutput = await mkdtemp(resolve(packageRoot, ".dist-"));
    const build = {
      name,
      output: resolve(packageRoot, "dist"),
      stagedOutput,
      backupOutput: `${stagedOutput}-previous`,
      hadOutput: false,
      promoted: false,
    };
    builds.push(build);
    const stagedPrng = builds.find((candidate) => candidate.name === "prng")?.stagedOutput;
    const temporaryConfig = resolve(stagedOutput, "tsconfig.json");
    const compilerOptions = name === "dice" && stagedPrng
      ? {
          paths: { "@drdice/prng": [resolve(stagedPrng, "index.d.ts")] },
        }
      : {};
    await writeFile(temporaryConfig, `${JSON.stringify({
      extends: resolve(packageRoot, "tsconfig.build.json"),
      compilerOptions: { ...compilerOptions, outDir: stagedOutput },
    }, null, 2)}\n`);
    const result = spawnSync(
      "pnpm",
      [
        "exec", "tsc",
        "--project", temporaryConfig,
        "--pretty", "false",
      ],
      { cwd: root, encoding: "utf8" },
    );
    if (result.status !== 0) {
      throw new Error(`TypeScript build failed for ${name}\n${result.stdout}\n${result.stderr}`);
    }
    await rm(temporaryConfig, { force: true });
    await rm(resolve(stagedOutput, "types.js"), { force: true });
  }

  try {
    for (const build of builds) {
      try {
        await rename(build.output, build.backupOutput);
        build.hadOutput = true;
      } catch (error) {
        if (error?.code !== "ENOENT") throw error;
      }
      await rename(build.stagedOutput, build.output);
      build.promoted = true;
    }
  } catch (error) {
    const rollbackErrors = [];
    for (const build of [...builds].reverse()) {
      try {
        if (build.promoted) await rm(build.output, { recursive: true, force: true });
        if (build.hadOutput) await rename(build.backupOutput, build.output);
      } catch (rollbackError) {
        rollbackErrors.push(new Error(
          `Could not restore ${build.name}; previous output is preserved at ${build.backupOutput}`,
          { cause: rollbackError },
        ));
      }
    }
    if (rollbackErrors.length > 0) {
      throw new AggregateError([error, ...rollbackErrors], "Package promotion and rollback failed");
    }
    throw error;
  }
  promotionSucceeded = true;

  for (const build of builds) {
    console.log(`[build] ${build.name}: TypeScript -> dist`);
  }
} finally {
  await Promise.all(builds.map((build) => rm(build.stagedOutput, { recursive: true, force: true })));
  if (promotionSucceeded) {
    await Promise.all(builds.map((build) => rm(build.backupOutput, { recursive: true, force: true })));
  }
}
