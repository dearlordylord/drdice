import { access, mkdtemp, mkdir, readdir, readFile, realpath, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { basename, dirname, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "..");
const temporary = await mkdtemp(resolve(tmpdir(), "drdice-consumer-"));
const canonicalTemporary = await realpath(temporary);
const archives = resolve(temporary, "archives");
const consumerRoot = resolve(temporary, "consumer");
const packageRecords = [
  { directory: "packages/prng", name: "@drdice/prng", archiveKey: "prng" },
  { directory: "packages/dice", name: "@drdice/dice", archiveKey: "dice" },
];
const expectedMembers = new Set([
  "package/LICENSE",
  "package/README.md",
  "package/dist/index.d.ts",
  "package/package.json",
]);
const isWithin = (candidate, directory) => (
  candidate === directory || candidate.startsWith(`${directory}${sep}`)
);

const run = (command, args, cwd) => {
  const result = spawnSync(command, args, { cwd, encoding: "utf8" });
  if (result.status !== 0) {
    throw new Error(`${command} ${args.join(" ")} failed\n${result.stdout}\n${result.stderr}`);
  }
  return result.stdout;
};

const pack = async (record) => {
  const packageRoot = resolve(root, record.directory);
  const before = new Set(await readdir(archives));
  const result = spawnSync("pnpm", ["pack", "--pack-destination", archives], {
    cwd: packageRoot,
    encoding: "utf8",
  });
  if (result.status !== 0) {
    throw new Error(`packing ${record.name} failed\n${result.stdout}\n${result.stderr}`);
  }
  const candidates = (await readdir(archives)).filter((name) => name.endsWith(".tgz") && !before.has(name));
  if (candidates.length !== 1) {
    throw new Error(`expected exactly one new ${record.name} archive, found ${candidates.join(", ")}`);
  }
  return resolve(archives, candidates[0]);
};

const inspectArchive = (record, archive) => {
  const members = run("tar", ["-tzf", archive], root)
    .split(/\r?\n/)
    .filter(Boolean)
    .map((member) => member.replace(/\/$/, ""));
  const actualMembers = new Set(members);
  if (actualMembers.size !== expectedMembers.size || [...expectedMembers].some((member) => !actualMembers.has(member))) {
    throw new Error(`${record.name} packed members differ: ${members.join(", ")}`);
  }
  const manifest = JSON.parse(run("tar", ["-xOf", archive, "package/package.json"], root));
  if (manifest.name !== record.name || manifest.version !== "0.2.0") {
    throw new Error(`${record.name} packed identity is incorrect`);
  }
  if (JSON.stringify(Object.keys(manifest.exports ?? {})) !== JSON.stringify(["."])) {
    throw new Error(`${record.name} does not have a root-only export map`);
  }
  if (manifest.types !== "./dist/index.d.ts" || manifest.exports["."]?.types !== "./dist/index.d.ts") {
    throw new Error(`${record.name} does not expose its declaration root`);
  }
  const declaredMembers = new Set((manifest.files ?? []).map((entry) => `package/${String(entry).replaceAll("\\", "/")}`));
  if (declaredMembers.size !== 3 || !declaredMembers.has("package/dist/index.d.ts")
    || !declaredMembers.has("package/README.md") || !declaredMembers.has("package/LICENSE")) {
    throw new Error(`${record.name} does not declare the curated declaration/documentation allowlist`);
  }
  if (manifest.exports["."].default !== undefined || manifest.main !== undefined) {
    throw new Error(`${record.name} unexpectedly exposes a runtime entry point`);
  }
};

try {
  await mkdir(archives, { recursive: true });
  const archiveByKey = {};
  for (const record of packageRecords) {
    archiveByKey[record.archiveKey] = await pack(record);
  }
  for (const record of packageRecords) inspectArchive(record, archiveByKey[record.archiveKey]);

  await mkdir(resolve(consumerRoot, "src"), { recursive: true });
  const prngSpecifier = `file:../archives/${basename(archiveByKey.prng)}`;
  const diceSpecifier = `file:../archives/${basename(archiveByKey.dice)}`;
  await writeFile(
    resolve(consumerRoot, "package.json"),
    JSON.stringify({
      name: "drdice-clean-consumer",
      version: "1.0.0",
      private: true,
      type: "module",
      dependencies: {
        "@drdice/prng": prngSpecifier,
        "@drdice/dice": diceSpecifier,
      },
      pnpm: {
        overrides: {
          "@drdice/prng": prngSpecifier,
        },
      },
    }, null, 2) + "\n",
    "utf8",
  );
  await writeFile(
    resolve(consumerRoot, "src/root-import.ts"),
    `import type {
  GeneratorState as PrngGeneratorState,
  PackageMetadata as PrngPackageMetadata,
  Sample,
  Success as PrngSuccess,
} from "@drdice/prng";
import type {
  DieSample,
  Evaluate,
  PackageMetadata as DicePackageMetadata,
  Success as DiceSuccess,
} from "@drdice/dice";

type Assert<Value extends true> = Value;
type Equal<Left, Right> =
  (<Value>() => Value extends Left ? 1 : 2) extends
  (<Value>() => Value extends Right ? 1 : 2) ? true : false;

export type PrngRootAssertion = Assert<Equal<PrngPackageMetadata["name"], "@drdice/prng">>;
export type DiceRootAssertion = Assert<Equal<DicePackageMetadata["name"], "@drdice/dice">>;

type ConsumerState = PrngGeneratorState<readonly [
  "00000001",
  "00000002",
  "00000003",
  "00000004",
]>;
type ExpectedSample = PrngSuccess<{
  readonly value: 0;
  readonly state: PrngGeneratorState<readonly [
    "00000007",
    "00000000",
    "00000402",
    "00003000",
  ]>;
  readonly attempts: 1;
}>;
export type PrngRootTypeAssertion = Assert<Equal<Sample<ConsumerState, 1, 1>, ExpectedSample>>;

type ExpectedDiceEvaluation = DiceSuccess<{
  readonly total: 1;
  readonly rollTrace: [DieSample<1, 1>];
  readonly successorState: PrngGeneratorState<readonly [
    "00000007",
    "00000000",
    "00000402",
    "00003000",
  ]>;
}>;
export type DiceReferencesPrngState = Assert<Equal<
  Evaluate<"d1", ConsumerState, 1>,
  ExpectedDiceEvaluation
>>;
`,
    "utf8",
  );
  await writeFile(
    resolve(consumerRoot, "src/deep-import-prng.ts"),
    'import type { PackageMetadata } from "@drdice/prng/dist/index";\nexport type Unsupported = PackageMetadata;\n',
    "utf8",
  );
  await writeFile(
    resolve(consumerRoot, "src/deep-import-dice.ts"),
    'import type { PackageMetadata } from "@drdice/dice/dist/index";\nexport type Unsupported = PackageMetadata;\n',
    "utf8",
  );
  await writeFile(
    resolve(consumerRoot, "src/dice-reexport.ts"),
    'import type { GeneratorState } from "@drdice/dice";\nexport type Unsupported = GeneratorState;\n',
    "utf8",
  );

  run("pnpm", ["install", "--ignore-scripts", "--offline", "--lockfile-only"], consumerRoot);
  run("pnpm", ["install", "--ignore-scripts", "--offline", "--frozen-lockfile"], consumerRoot);

  const installedPrng = await realpath(resolve(consumerRoot, "node_modules/@drdice/prng"));
  const installedDice = await realpath(resolve(consumerRoot, "node_modules/@drdice/dice"));
  if (!isWithin(installedPrng, canonicalTemporary) || !isWithin(installedDice, canonicalTemporary)) {
    throw new Error(`consumer resolved outside its isolated install: ${installedPrng}; ${installedDice}`);
  }
  const workspacePackageRoots = await Promise.all(packageRecords.map(async (record) => realpath(resolve(root, record.directory))));
  const isWorkspacePackage = (candidate) => workspacePackageRoots.some((workspacePackageRoot) => (
    isWithin(candidate, workspacePackageRoot)
  ));
  if (isWorkspacePackage(installedPrng) || isWorkspacePackage(installedDice)) {
    throw new Error("consumer unexpectedly resolved a workspace package instead of a packed artifact");
  }
  await access(resolve(installedPrng, "dist/index.d.ts"));
  await access(resolve(installedDice, "dist/index.d.ts"));

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
  const rootImport = resolve(consumerRoot, "src/root-import.ts");
  const checked = spawnSync("pnpm", [...compilerOptions, rootImport], {
    cwd: root,
    encoding: "utf8",
  });
  if (checked.status !== 0) {
    throw new Error(`packed root consumer failed to typecheck\n${checked.stdout}\n${checked.stderr}`);
  }

  for (const packageName of ["prng", "dice"]) {
    const deepImport = resolve(consumerRoot, `src/deep-import-${packageName}.ts`);
    const rejected = spawnSync("pnpm", [...compilerOptions, "--traceResolution", deepImport], {
      cwd: root,
      encoding: "utf8",
    });
    if (rejected.status === 0) {
      throw new Error(`an undeclared packed @drdice/${packageName} deep import unexpectedly typechecked`);
    }
    const diagnostics = `${rejected.stdout}\n${rejected.stderr}`;
    if (!/(package path|exports|export specifier|package\.json scope|subpath|not exported)/i.test(diagnostics)) {
      throw new Error(`@drdice/${packageName} deep import did not fail because of the package exports map\n${diagnostics}`);
    }

    const runtimeProbe = spawnSync(
      process.execPath,
      ["--input-type=module", "--eval", `await import('@drdice/${packageName}/dist/index')`],
      { cwd: consumerRoot, encoding: "utf8" },
    );
    if (runtimeProbe.status === 0 || !/ERR_PACKAGE_PATH_NOT_EXPORTED|not defined by exports/i.test(runtimeProbe.stderr)) {
      throw new Error(`Node did not prove that @drdice/${packageName} deep path is blocked by exports\n${runtimeProbe.stdout}\n${runtimeProbe.stderr}`);
    }
  }

  const diceReexport = resolve(consumerRoot, "src/dice-reexport.ts");
  const reexportRejected = spawnSync("pnpm", [...compilerOptions, diceReexport], {
    cwd: root,
    encoding: "utf8",
  });
  if (reexportRejected.status === 0) {
    throw new Error("Dice unexpectedly re-exported the PRNG-owned GeneratorState type");
  }
  if (!/has no exported member ['"]?GeneratorState/i.test(`${reexportRejected.stdout}\n${reexportRejected.stderr}`)) {
    throw new Error(`Dice PRNG re-export rejection was not an explicit curated-root diagnostic\n${reexportRejected.stdout}\n${reexportRejected.stderr}`);
  }

  const workspace = JSON.parse(await readFile(resolve(root, "package.json"), "utf8"));
  if (workspace.private !== true) {
    throw new Error("the workspace root must remain private for clean-consumer checks");
  }
  console.log("Packed clean consumers pass root imports; exports block deep imports in TypeScript and Node.");
} finally {
  await rm(temporary, { recursive: true, force: true });
}
