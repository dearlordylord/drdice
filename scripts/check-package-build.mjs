import { readdir, readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const expectedFiles = ["index.d.ts", "index.js"];

for (const name of ["prng", "dice"]) {
  const packageRoot = resolve(root, "packages", name);
  const source = resolve(packageRoot, "src");
  const output = resolve(packageRoot, "dist");
  const [sourceNames, outputNames] = await Promise.all([readdir(source), readdir(output)]);
  for (const [label, names] of [["src", sourceNames], ["dist", outputNames]]) {
    const actual = [...names].sort();
    if (JSON.stringify(actual) !== JSON.stringify(expectedFiles)) {
      throw new Error(`${name}/${label} contains ${actual.join(", ")}; expected ${expectedFiles.join(", ")}`);
    }
  }
  for (const file of expectedFiles) {
    const [sourceBytes, outputBytes] = await Promise.all([
      readFile(resolve(source, file)),
      readFile(resolve(output, file)),
    ]);
    if (!sourceBytes.equals(outputBytes)) {
      throw new Error(`${name}/dist/${file} is stale; run pnpm build`);
    }
  }
}

console.log("[build] package dist files exactly match tracked source files");
