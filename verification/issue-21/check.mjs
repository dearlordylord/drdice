/* Blocking arithmetic/static parity and oracle-boundary gate for issue #21. */
import { mkdtemp, readdir, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { oracleEvaluate } from "../issue-20/oracle.mjs";
import { oracleStateFromWords } from "../issue-17/oracle.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "../..");
const utf16Boundary = resolve(here, "utf16-boundary.ts");
const utf16Adversarial = resolve(here, "utf16-adversarial.ts");
const ids = JSON.parse(await readFile(resolve(here, "cases.json"), "utf8"));
const golden = JSON.parse(await readFile(resolve(root, "verification/issue-20/golden-vectors.json"), "utf8"));
const byId = new Map(golden.cases.map((vector) => [vector.id, vector]));
const fail = (message) => { throw new Error(`[issue-21] ${message}`); };
const json = (value) => JSON.stringify(value);
const equal = (actual, expected, label) => { if (json(actual) !== json(expected)) fail(`${label}\nactual: ${json(actual)}\nexpected: ${json(expected)}`); };
const projectState = (value) => value && value.kind === "GeneratorState" && Array.isArray(value.words) ? [...value.words] : value;
const projectResult = (result) => result.ok
  ? { ok: true, value: { total: result.value.total, rollTrace: result.value.rollTrace, successorState: projectState(result.value.successorState) } }
  : { ok: false, code: result.code, details: { ...result.details, ...(Object.hasOwn(result.details, "state") ? { state: projectState(result.details.state) } : {}), ...(Object.hasOwn(result.details, "successorState") ? { successorState: projectState(result.details.successorState) } : {}) } };
const stateInput = (vector) => vector.stateWords ? oracleStateFromWords([...vector.stateWords]) : vector.stateInput;

for (const id of ids) {
  const vector = byId.get(id);
  if (!vector) fail(`required golden case ${id} is missing`);
  if (typeof vector.source !== "string") fail(`${id} is not a literal source case`);
  const actual = oracleEvaluate(vector.source, stateInput(vector), vector.maximumAttempts);
  equal(projectResult(actual), vector.expected, `${id} oracle/golden disagreement`);
  if (vector.expected.ok && vector.source.toLowerCase().includes("d")) fail(`${id} unexpectedly relies on a sampled success in the arithmetic-only slice`);
  if (!actual.ok && ["expected-expression", "expected-die-sides", "expected-closing-parenthesis", "leading-zero", "unexpected-token", "dice-count-zero", "side-count-zero"].includes(actual.code)) {
    if (Object.hasOwn(actual.details, "partialTrace") || Object.hasOwn(actual.details, "successorState")) fail(`${id} static diagnostic carries consumption context`);
  }
}

const oracleSource = await readFile(resolve(root, "verification/issue-20/oracle.mjs"), "utf8");
if (/(?:packages|src|dist)\//.test(oracleSource)) fail("Dice oracle references production package/source/dist paths");
if (oracleSource.includes("from \"@drdice/dice\"") || oracleSource.includes("from \"@drdice/prng\"")) fail("Dice oracle imports a public implementation package");

const temporary = await mkdtemp(resolve(tmpdir(), "drdice-issue21-generated-"));
try {
  const generated = spawnSync(process.execPath, [resolve(here, "generate.mjs"), "--output", temporary], { cwd: root, encoding: "utf8" });
  if (generated.status !== 0) fail(`generator failed\n${generated.stdout}\n${generated.stderr}`);
  const prefix = "dice-issue21-";
  const [committedNames, actualNames] = await Promise.all([
    readdir(resolve(root, "verification/generated")).then((names) => names.filter((name) => name.startsWith(prefix)).sort()),
    readdir(temporary).then((names) => names.sort()),
  ]);
  equal(actualNames, committedNames, "issue #21 generated fixture set is dirty");
  for (const name of committedNames) {
    const [expected, actual] = await Promise.all([readFile(resolve(root, "verification/generated", name), "utf8"), readFile(resolve(temporary, name), "utf8")]);
    equal(actual, expected, `${name} is dirty`);
  }
  const version = spawnSync("pnpm", ["exec", "tsc", "--version"], { cwd: root, encoding: "utf8" });
  if (version.status !== 0 || version.stdout.trim() !== "Version 7.0.2") fail(`expected TypeScript 7.0.2, got ${version.stdout.trim()}`);
  const files = [utf16Boundary, utf16Adversarial, ...committedNames.map((name) => resolve(root, "verification/generated", name))];
  const checked = spawnSync("pnpm", ["exec", "tsc", "--ignoreConfig", "--pretty", "false", "--strict", "--noEmit", "--target", "ES2020", "--module", "NodeNext", "--moduleResolution", "NodeNext", "--lib", "ES2020,DOM", ...files], { cwd: root, encoding: "utf8" });
  if (checked.status !== 0) fail(`exact arithmetic/static fixtures failed TypeScript 7\n${checked.stdout}\n${checked.stderr}`);
} finally {
  await rm(temporary, { recursive: true, force: true });
}
console.log(`[issue-21] ${ids.length} independent oracle-backed arithmetic/static cases and clean TypeScript 7 fixtures passed`);
