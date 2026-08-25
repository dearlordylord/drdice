/*
 * Package-boundary companion to check.mjs.
 *
 * PRNG semantics's branch predates the package scaffold, so this gate is tolerant
 * of absent package roots and reports the deferred check.  Once workspace scaffold supplies
 * packages/prng and packages/dice, an invocation from the repository root
 * checks both manifests and declaration roots for accidental oracle exposure.
 * It accepts an explicit, path-delimited DRDICE_PACKAGE_DIRS value so a
 * workspace can place the two package roots elsewhere without changing this
 * private verification module.
 */

import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const directory = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(directory, "../..");
const defaultPackageDirs = ["packages/prng", "packages/dice"];
const configured = process.env.DRDICE_PACKAGE_DIRS
  ?.split(path.delimiter)
  .filter(Boolean)
  .map((entry) => path.resolve(process.cwd(), entry));
const packageDirs = configured ?? defaultPackageDirs.map((entry) => path.join(repositoryRoot, entry));

const fail = (message) => {
  throw new Error(`[prng-semantics boundary] ${message}`);
};

const assert = (condition, message) => {
  if (!condition) fail(message);
};

const files = (root) => {
  const output = [];
  const visit = (current) => {
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      if (entry.name === "node_modules" || entry.name === ".git") continue;
      const absolute = path.join(current, entry.name);
      if (entry.isDirectory()) visit(absolute);
      else output.push(absolute);
    }
  };
  visit(root);
  return output;
};

const checkPackage = (packageRoot) => {
  const manifestPath = path.join(packageRoot, "package.json");
  assert(fs.existsSync(manifestPath), `${packageRoot} has no package.json`);
  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  assert(Array.isArray(manifest.files), `${manifest.name ?? packageRoot} must declare an explicit files allowlist`);
  const allowlist = manifest.files.map(String).join(" ").toLowerCase();
  assert(!/(verification|oracle|fixture|generator|benchmark)/.test(allowlist), `${manifest.name ?? packageRoot} allowlist mentions private verification material`);
  assert(manifest.exports && typeof manifest.exports === "object" && !Array.isArray(manifest.exports), `${manifest.name ?? packageRoot} must declare root-only exports`);
  const exportKeys = Object.keys(manifest.exports);
  assert(exportKeys.length === 1 && exportKeys[0] === ".", `${manifest.name ?? packageRoot} exports a non-root public path`);
  const exportValues = JSON.stringify(manifest.exports).toLowerCase();
  assert(!/(verification|oracle|fixture|generator|benchmark)/.test(exportValues), `${manifest.name ?? packageRoot} exports private verification material`);

  for (const file of files(packageRoot)) {
    const relative = path.relative(packageRoot, file).replaceAll(path.sep, "/").toLowerCase();
    assert(!/(^|\/)(verification|oracle|fixtures?|generators?|benchmarks?)(\/|\.|$)/.test(relative), `${manifest.name ?? packageRoot} contains private verification file ${relative}`);
    if (relative.endsWith(".d.ts")) {
      const source = fs.readFileSync(file, "utf8");
      assert(!/(verification\/prng-semantics|golden-vectors|oracle\.mjs|oracle\.js)/i.test(source), `${manifest.name ?? packageRoot} declaration imports the private oracle`);
    }
  }

  const packed = spawnSync("npm", ["pack", "--dry-run", "--json", "--ignore-scripts"], {
    cwd: packageRoot,
    encoding: "utf8",
  });
  assert(packed.status === 0, `${manifest.name ?? packageRoot} npm pack --dry-run failed: ${packed.stderr.trim()}`);
  let packReport;
  try {
    packReport = JSON.parse(packed.stdout);
  } catch (error) {
    fail(`${manifest.name ?? packageRoot} npm pack --dry-run returned invalid JSON: ${error.message}`);
  }
  const packedFiles = packReport?.[0]?.files;
  assert(Array.isArray(packedFiles), `${manifest.name ?? packageRoot} npm pack report has no file list`);
  for (const entry of packedFiles) {
    const packedPath = String(entry.path ?? entry).toLowerCase();
    assert(!/(verification|oracle|fixture|generator|benchmark)/.test(packedPath), `${manifest.name ?? packageRoot} tarball contains private verification file ${packedPath}`);
  }
};

const present = packageDirs.filter((directoryPath) => fs.existsSync(directoryPath));
if (present.length === 0) {
  console.log("[prng-semantics boundary] package roots are not present yet; boundary check deferred to the workspace scaffold scaffold");
} else {
  assert(present.length === packageDirs.length, "only one package root is present; expected both publishable boundaries");
  for (const packageRoot of present) checkPackage(packageRoot);
  console.log(`[prng-semantics boundary] checked ${present.length} package roots; private oracle is not exposed`);
}
