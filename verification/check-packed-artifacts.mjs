import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "..");
const temporary = await mkdtemp(resolve(tmpdir(), "drdice-packed-"));
const packages = [
  { directory: "packages/prng", name: "@drdice/prng", dependency: false },
  { directory: "packages/dice", name: "@drdice/dice", dependency: true },
];
const expectedMembers = new Set([
  "package/LICENSE",
  "package/README.md",
  "package/dist/index.d.ts",
  "package/package.json",
]);

const run = (command, args, cwd) => {
  const result = spawnSync(command, args, { cwd, encoding: "utf8" });
  if (result.status !== 0) {
    throw new Error(`${command} ${args.join(" ")} failed\n${result.stdout}\n${result.stderr}`);
  }
  return result.stdout;
};

try {
  for (const packageInfo of packages) {
    const directory = resolve(root, packageInfo.directory);
    const output = run("pnpm", ["pack", "--pack-destination", temporary], directory);
    const archiveName = output.trim().split(/\r?\n/).at(-1);
    if (!archiveName) throw new Error(`pnpm pack returned no archive for ${packageInfo.name}`);
    const archive = resolve(directory, archiveName);
    const members = run("tar", ["-tzf", archive], root)
      .split(/\r?\n/)
      .filter(Boolean)
      .map((member) => member.replace(/\/$/, ""));
    const actualMembers = new Set(members);
    if (actualMembers.size !== expectedMembers.size || [...expectedMembers].some((member) => !actualMembers.has(member))) {
      throw new Error(`${packageInfo.name} tarball members differ: ${members.join(", ")}`);
    }
    if (members.some((member) => {
      const privateDirectory = /(?:^|\/)(?:src|fixtures?|generators?|benchmarks?|oracles?)(?:\/|$)/.test(member);
      const runtimeFile = /\.(?:js|mjs|cjs|ts|map)$/.test(member) && !member.endsWith(".d.ts");
      return privateDirectory || runtimeFile;
    })) {
      throw new Error(`${packageInfo.name} tarball contains a private or runtime file: ${members.join(", ")}`);
    }

    const manifestText = run("tar", ["-xOf", archive, "package/package.json"], root);
    const manifest = JSON.parse(manifestText);
    if (manifest.name !== packageInfo.name || manifest.version !== "0.1.0") {
      throw new Error(`${packageInfo.name} packed identity is incorrect`);
    }
    if (JSON.stringify(Object.keys(manifest.exports ?? {})) !== JSON.stringify(["."])) {
      throw new Error(`${packageInfo.name} must expose exactly its package root`);
    }
    if (manifest.exports["."]?.types !== "./dist/index.d.ts" || manifest.types !== "./dist/index.d.ts") {
      throw new Error(`${packageInfo.name} must expose its rolled-up declaration root`);
    }
    if (manifest.dependencies?.["@drdice/prng"]?.startsWith("workspace:")) {
      throw new Error("packed Dice dependency still contains the workspace protocol");
    }
    if (packageInfo.dependency && manifest.dependencies?.["@drdice/prng"] !== "^0.1.0") {
      throw new Error(`packed Dice dependency is not ^0.1.0: ${manifest.dependencies?.["@drdice/prng"]}`);
    }
    if (manifest.exports["."].default !== undefined || manifest.main !== undefined) {
      throw new Error(`${packageInfo.name} exposes an unsupported runtime entry point`);
    }
  }
  console.log("Packed artifacts contain only the two root declaration allowlists.");
} finally {
  await rm(temporary, { recursive: true, force: true });
}
