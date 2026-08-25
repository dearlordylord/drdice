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
  "package/dist/index.js",
  "package/dist/types.d.ts",
  "package/package.json",
]);
const prngSourceManifest = JSON.parse(
  await readFile(resolve(root, "packages/prng/package.json"), "utf8"),
);

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
    const sourceManifest = JSON.parse(await readFile(resolve(directory, "package.json"), "utf8"));
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
      const unsupportedRuntimeFile = /\.(?:js|mjs|cjs|ts|map)$/.test(member)
        && !member.endsWith(".d.ts")
        && member !== "package/dist/index.js";
      return privateDirectory || unsupportedRuntimeFile;
    })) {
      throw new Error(`${packageInfo.name} tarball contains a private or runtime file: ${members.join(", ")}`);
    }

    const manifestText = run("tar", ["-xOf", archive, "package/package.json"], root);
    const manifest = JSON.parse(manifestText);
    if (manifest.name !== packageInfo.name || manifest.version !== sourceManifest.version) {
      throw new Error(`${packageInfo.name} packed identity is incorrect`);
    }
    if (JSON.stringify(Object.keys(manifest.exports ?? {})) !== JSON.stringify(["."])) {
      throw new Error(`${packageInfo.name} must expose exactly its package root`);
    }
    if (manifest.exports["."]?.types !== "./dist/index.d.ts" || manifest.types !== "./dist/index.d.ts") {
      throw new Error(`${packageInfo.name} must expose its generated declaration root`);
    }
    if (manifest.dependencies?.["@drdice/prng"]?.startsWith("workspace:")) {
      throw new Error("packed Dice dependency still contains the workspace protocol");
    }
    const expectedPrngRange = `^${prngSourceManifest.version}`;
    if (packageInfo.dependency && manifest.dependencies?.["@drdice/prng"] !== expectedPrngRange) {
      throw new Error(
        `packed Dice dependency is not ${expectedPrngRange}: ${manifest.dependencies?.["@drdice/prng"]}`,
      );
    }
    if (manifest.exports["."].default !== "./dist/index.js" || manifest.main !== "./dist/index.js") {
      throw new Error(`${packageInfo.name} does not expose its runtime entry point`);
    }
    const declaredFiles = new Set((manifest.files ?? []).map((entry) => String(entry).replaceAll("\\", "/")));
    const expectedAllowlist = new Set(["dist/index.d.ts", "dist/index.js", "dist/types.d.ts", "README.md", "LICENSE"]);
    if (declaredFiles.size !== expectedAllowlist.size || [...expectedAllowlist].some((entry) => !declaredFiles.has(entry))) {
      throw new Error(`${packageInfo.name} does not declare exactly its packed allowlist: ${JSON.stringify(manifest.files)}`);
    }

    const declaration = [
      await readFile(resolve(directory, "dist/index.d.ts"), "utf8"),
      await readFile(resolve(directory, "dist/types.d.ts"), "utf8"),
    ].join("\n");
    if (packageInfo.name === "@drdice/dice") {
      const prngDeclaration = [
        await readFile(resolve(root, "packages/prng/dist/index.d.ts"), "utf8"),
        await readFile(resolve(root, "packages/prng/dist/types.d.ts"), "utf8"),
      ].join("\n");
      const prngExports = new Set([...prngDeclaration.matchAll(/^export\s+(?:const|type)\s+(\w+)/gm)].map(([, name]) => name));
      if (/\bexport\s+\*\s+from\s+["']@drdice\/prng["']/.test(declaration)) {
        throw new Error("@drdice/dice re-exports the PRNG declaration root");
      }
      for (const match of declaration.matchAll(/\bexport\s+(?:type\s+)?\{([^}]*)\}\s+from\s+["']@drdice\/prng["']/g)) {
        const names = match[1].split(",").map((entry) => entry.trim().split(/\s+as\s+/i)[0]).filter(Boolean);
        if (names.some((name) => prngExports.has(name))) {
          throw new Error(`@drdice/dice re-exports PRNG-owned type(s): ${names.join(", ")}`);
        }
      }
      const importedPrngLocals = [...declaration.matchAll(
        /\bimport\s+type\s+\{([^}]*)\}\s+from\s+["']@drdice\/prng["']/g,
      )].flatMap((match) => match[1].split(",").map((entry) => {
        const names = entry.trim().split(/\s+as\s+/i).map((name) => name.trim());
        return names.at(-1);
      })).filter(Boolean);
      if (importedPrngLocals.length > 0) {
        const localNames = importedPrngLocals.map((name) => name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|");
        const directAlias = new RegExp(
          `\\bexport\\s+type\\s+\\w+(?:<[^\\n;]*>)?\\s*=\\s*(?:${localNames})(?:\\s*<[^\\n;]*>)?\\s*;`,
          "g",
        );
        if (directAlias.test(declaration)) {
          throw new Error("@drdice/dice exports a direct alias of an imported PRNG type");
        }
      }
      if (/\bexport\s+type\s+\w+(?:<[^\n;]*>)?\s*=\s*import\s*\(\s*["']@drdice\/prng["']\s*\)/.test(declaration)) {
        throw new Error("@drdice/dice exports a type-query alias of the PRNG declaration root");
      }
      if (!/import type\s+\{[^}]*\b(?:GeneratorState|Sample)\b[^}]*\}\s+from\s+["']@drdice\/prng["']/s.test(declaration)) {
        throw new Error("@drdice/dice declaration root no longer records its PRNG type dependency");
      }
    }
  }
  console.log("Packed artifacts contain generated runtime roots, supporting declarations, and documentation allowlists.");
} finally {
  await rm(temporary, { recursive: true, force: true });
}
