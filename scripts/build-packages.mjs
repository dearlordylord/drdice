import { mkdtemp, rename, rm } from "node:fs/promises";
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

for (const name of selected) {
  const packageRoot = resolve(root, "packages", name);
  const output = resolve(packageRoot, "dist");
  const stagedOutput = await mkdtemp(resolve(packageRoot, ".dist-"));
  let staged = true;
  try {
    const result = spawnSync(
      "pnpm",
      [
        "exec", "tsc",
        "--project", resolve(packageRoot, "tsconfig.build.json"),
        "--outDir", stagedOutput,
        "--pretty", "false",
      ],
      { cwd: root, encoding: "utf8" },
    );
    if (result.status !== 0) {
      throw new Error(`TypeScript build failed for ${name}\n${result.stdout}\n${result.stderr}`);
    }
    await rm(resolve(stagedOutput, "types.js"), { force: true });
    await rm(output, { recursive: true, force: true });
    await rename(stagedOutput, output);
    staged = false;
  } finally {
    if (staged) await rm(stagedOutput, { recursive: true, force: true });
  }
  console.log(`[build] ${name}: TypeScript -> dist`);
}
