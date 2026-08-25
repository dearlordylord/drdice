#!/usr/bin/env node

import { readFile, rename, rm, writeFile } from "node:fs/promises";
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

const records = await Promise.all(manifestPaths.map(async (manifestPath) => {
  const path = resolve(root, manifestPath);
  const original = await readFile(path, "utf8");
  const manifest = JSON.parse(original);
  manifest.version = version;
  return {
    path,
    temporary: `${path}.version-${process.pid}`,
    original,
    updated: `${JSON.stringify(manifest, null, 2)}\n`,
  };
}));

try {
  await Promise.all(records.map((record) => writeFile(record.temporary, record.updated, { flag: "wx" })));
  const replaced = [];
  try {
    for (const record of records) {
      await rename(record.temporary, record.path);
      replaced.push(record);
    }
  } catch (error) {
    await Promise.all(replaced.map((record) => writeFile(record.path, record.original, "utf8")));
    throw error;
  }
} finally {
  await Promise.all(records.map((record) => rm(record.temporary, { force: true })));
}

console.log(`Set @drdice/prng and @drdice/dice to ${version}.`);
