import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "..");
const consumer = resolve(here, "consumers/root-import.ts");
const compilerOptions = [
  "exec",
  "tsc",
  "--ignoreConfig",
  "--pretty",
  "false",
  "--strict",
  "--noEmit",
  "--target",
  "ES2020",
  "--module",
  "NodeNext",
  "--moduleResolution",
  "NodeNext",
  "--lib",
  "ES2020",
];

const checked = spawnSync("pnpm", [...compilerOptions, consumer], {
  cwd: root,
  encoding: "utf8",
});
if (checked.status !== 0) {
  throw new Error(`root consumer failed to typecheck\n${checked.stdout}\n${checked.stderr}`);
}

const temporary = await mkdtemp(resolve(tmpdir(), "drdice-consumer-"));
try {
  const deepImport = resolve(temporary, "deep-import.ts");
  await writeFile(
    deepImport,
    'import type { PackageMetadata } from "@drdice/prng/dist/index";\nexport type Unsupported = PackageMetadata;\n',
    "utf8",
  );
  const rejected = spawnSync("pnpm", [...compilerOptions, deepImport], {
    cwd: root,
    encoding: "utf8",
  });
  if (rejected.status === 0) {
    throw new Error("an undeclared package deep import unexpectedly typechecked");
  }
  const diagnostics = `${rejected.stdout}\n${rejected.stderr}`;
  if (!/(cannot find module|package path|exports|subpath)/i.test(diagnostics)) {
    throw new Error(`deep import failed for an unexpected reason\n${diagnostics}`);
  }
} finally {
  await rm(temporary, { recursive: true, force: true });
}

const workspace = JSON.parse(await readFile(resolve(root, "package.json"), "utf8"));
if (workspace.private !== true) {
  throw new Error("the workspace root must remain private for clean-consumer checks");
}
console.log("Clean root consumers passed; undeclared deep imports are rejected.");
