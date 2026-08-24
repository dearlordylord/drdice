/* Blocking oracle, corpus, and exact-type gate for issue #22. */
import { mkdtemp, readdir, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { LIMITS, oracleEvaluate } from "../issue-20/oracle.mjs";
import { oracleStateFromWords } from "../issue-17/oracle.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "../..");
const generated = resolve(here, "generated");
const ids = JSON.parse(await readFile(resolve(here, "cases.json"), "utf8"));
const golden = JSON.parse(await readFile(resolve(root, "verification/issue-20/golden-vectors.json"), "utf8"));
const byId = new Map(golden.cases.map((vector) => [vector.id, vector]));
const fail = (message) => { throw new Error(`[issue-22] ${message}`); };
const json = (value) => JSON.stringify(value);
const equal = (actual, expected, label) => { if (json(actual) !== json(expected)) fail(`${label}\nactual: ${json(actual)}\nexpected: ${json(expected)}`); };
const projectState = (value) => value && value.kind === "GeneratorState" && Array.isArray(value.words) ? [...value.words] : value;
const projectResult = (result) => result.ok
  ? { ok: true, value: { total: result.value.total, rollTrace: result.value.rollTrace, successorState: projectState(result.value.successorState) } }
  : { ok: false, code: result.code, details: { ...result.details, ...(Object.hasOwn(result.details, "state") ? { state: projectState(result.details.state) } : {}), ...(Object.hasOwn(result.details, "successorState") ? { successorState: projectState(result.details.successorState) } : {}) } };
const stateInput = (vector) => vector.stateWords ? oracleStateFromWords([...vector.stateWords]) : vector.stateInput;

if (ids.length < 70) fail(`complete corpus unexpectedly small: ${ids.length}`);
const vectors = ids.map((id) => {
  const vector = byId.get(id);
  if (!vector) fail(`required golden case ${id} is missing`);
  if (typeof vector.source !== "string") fail(`${id} must be a literal source case`);
  return vector;
});

for (const vector of vectors) {
  const actual = oracleEvaluate(vector.source, stateInput(vector), vector.maximumAttempts);
  equal(projectResult(actual), vector.expected, `${vector.id} oracle/golden disagreement`);
  if (vector.source.toLowerCase().includes("d")) {
    const trace = actual.ok ? actual.value.rollTrace : actual.details?.partialTrace;
    if (actual.ok && (!Array.isArray(trace) || trace.length === 0)) fail(`${vector.id} sampled success has no completed trace`);
    if (!actual.ok && Object.hasOwn(actual.details, "partialTrace") && !Array.isArray(trace)) fail(`${vector.id} partial trace is not auditable`);
  }
}

for (const fuel of [0, 1, 2, 3, 4]) {
  const covered = vectors.some((vector) => vector.maximumAttempts === fuel && vector.source.toLowerCase().includes("d"));
  if (!covered) fail(`no sampled case covers maximumAttempts=${fuel}`);
}
for (const id of [
  "single-die-one", "multiple-dice-addition", "parenthesized-depth-first",
  "forced-rejection-then-acceptance", "post-consumption-sampling-exhaustion",
  "post-consumption-arithmetic-failure", "post-consumption-dynamic-steps",
]) if (!ids.includes(id)) fail(`required full-evaluation case ${id} is missing`);

const names = (await readdir(generated)).filter((name) => /^dice-issue22-(?:\d{3}|side-\d{3})\.d\.ts$/.test(name)).sort();
const expectedNames = [
  ...ids.map((_, index) => `dice-issue22-${String(index).padStart(3, "0")}.d.ts`),
  ...Array.from({ length: LIMITS.supportedSideCount }, (_, index) => `dice-issue22-side-${String(index + 1).padStart(3, "0")}.d.ts`),
].sort();
equal(names, expectedNames, "issue #22 generated shard set is incomplete or dirty");

const temporary = await mkdtemp(resolve(tmpdir(), "drdice-issue22-generated-"));
try {
  const generatedRun = spawnSync(process.execPath, [resolve(here, "generate.mjs"), "--output", temporary], { cwd: root, encoding: "utf8" });
  if (generatedRun.status !== 0) fail(`generator failed\n${generatedRun.stdout}\n${generatedRun.stderr}`);
  const actualNames = (await readdir(temporary)).sort();
  equal(actualNames, names, "issue #22 generated shard set is not reproducible");
  for (const name of names) {
    const [committed, fresh] = await Promise.all([
      readFile(resolve(generated, name), "utf8"),
      readFile(resolve(temporary, name), "utf8"),
    ]);
    equal(fresh, committed, `${name} is dirty`);
  }
} finally {
  await rm(temporary, { recursive: true, force: true });
}

const version = spawnSync("pnpm", ["exec", "tsc", "--version"], { cwd: root, encoding: "utf8" });
if (version.status !== 0 || version.stdout.trim() !== "Version 7.0.2") fail(`expected TypeScript 7.0.2, got ${version.stdout.trim()}`);
const checked = spawnSync("pnpm", [
  "exec", "tsc", "--ignoreConfig", "--pretty", "false", "--strict", "--noEmit",
  "--target", "ES2020", "--module", "NodeNext", "--moduleResolution", "NodeNext",
  "--lib", "ES2020,DOM", ...names.map((name) => resolve(generated, name)),
], { cwd: root, encoding: "utf8" });
if (checked.status !== 0) fail(`exact complete-evaluation fixtures failed TypeScript 7\n${checked.stdout}\n${checked.stderr}`);

const oracleSource = await readFile(resolve(root, "verification/issue-20/oracle.mjs"), "utf8");
if (/(?:packages|src|dist)\//.test(oracleSource)) fail("Issue #20 oracle references production paths");
if (oracleSource.includes("from \"@drdice/dice\"") || oracleSource.includes("from \"@drdice/prng\"")) fail("Dice oracle imports a production implementation");
console.log(`[issue-22] ${vectors.length} oracle-backed full-evaluation cases, every side d1..d100, and ${names.length} exact TypeScript 7 fixtures passed`);
