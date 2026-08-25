#!/usr/bin/env node

import { readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { npmDistTag } from "./npm-dist-tag.mjs";

const version = process.argv[2];
if (!version) {
  throw new Error("usage: pnpm version:set <version>");
}
npmDistTag(version);

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const manifestPaths = [
  "packages/prng/package.json",
  "packages/dice/package.json",
];

for (const manifestPath of manifestPaths) {
  const absolutePath = resolve(root, manifestPath);
  const manifest = JSON.parse(await readFile(absolutePath, "utf8"));
  manifest.version = version;
  await writeFile(absolutePath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
}

console.log(`Set @drdice/prng and @drdice/dice to ${version}.`);
