import { rm } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const packageNames = ["prng", "dice"];
const requested = process.argv.slice(2);
const selected = requested.length === 0 ? packageNames : requested;

for (const name of selected) {
  if (!packageNames.includes(name)) {
    throw new Error(`unknown package ${name}; expected ${packageNames.join(" or ")}`);
  }
}

for (const name of selected) {
  const packageRoot = resolve(root, "packages", name);
  const output = resolve(packageRoot, "dist");
  await rm(output, { recursive: true, force: true });
  const result = spawnSync(
    "pnpm",
    ["exec", "tsc", "--project", resolve(packageRoot, "tsconfig.build.json"), "--pretty", "false"],
    { cwd: root, encoding: "utf8" },
  );
  if (result.status !== 0) {
    throw new Error(`TypeScript build failed for ${name}\n${result.stdout}\n${result.stderr}`);
  }
  await rm(resolve(output, "types.js"), { force: true });
  console.log(`[build] ${name}: TypeScript -> dist`);
}
