import { copyFile, mkdir, rm } from "node:fs/promises";
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
  const source = resolve(packageRoot, "src");
  const output = resolve(packageRoot, "dist");
  await rm(output, { recursive: true, force: true });
  await mkdir(output, { recursive: true });
  await Promise.all([
    copyFile(resolve(source, "index.js"), resolve(output, "index.js")),
    copyFile(resolve(source, "index.d.ts"), resolve(output, "index.d.ts")),
  ]);
  console.log(`[build] ${name}: src -> dist`);
}
