import { mkdtemp, readdir, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

import { CASE_COUNT, DEFAULT_GENERATOR_SEED, generateCases, selectReplay, shrinkCase } from "./cases.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "../..");
const committed = resolve(here, "generated");
const valueAfter = (flag) => {
  const index = process.argv.indexOf(flag);
  return index < 0 ? undefined : process.argv[index + 1];
};
const replay = valueAfter("--replay");
const shrink = valueAfter("--shrink");
const referenceRunner = process.argv.includes("--reference-runner");
const parsedSeed = valueAfter("--seed");
const seed = parsedSeed === undefined ? DEFAULT_GENERATOR_SEED : Number(parsedSeed);
const fail = (message) => { throw new Error(`[property-parity] ${message}`); };
const budget = JSON.parse(await readFile(resolve(here, "budget.json"), "utf8"));
const version = spawnSync("pnpm", ["exec", "tsc", "--version"], { cwd: root, encoding: "utf8" });
if (version.status !== 0 || version.stdout.trim() !== budget.compiler) {
  fail(`property parity requires ${budget.compiler}, got ${version.stdout.trim() || version.stderr.trim()}`);
}

const runGenerator = (output, replayPath) => {
  const args = [resolve(here, "generate.mjs"), "--output", output, "--seed", String(seed)];
  if (replayPath !== undefined) args.push("--replay", String(replayPath));
  const child = spawnSync(process.execPath, args, { cwd: root, encoding: "utf8" });
  if (child.status !== 0) fail(`generation failed\n${child.stdout}\n${child.stderr}`);
};

const compileAndRun = async (sourceDirectory) => {
  const names = (await readdir(sourceDirectory)).filter((name) => name.endsWith(".ts")).sort();
  const emit = await mkdtemp(resolve(here, ".emit-"));
  try {
    for (const name of names) {
      const source = resolve(sourceDirectory, name);
      const compiled = spawnSync("pnpm", [
        "exec", "tsc", "--ignoreConfig", "--pretty", "false", "--strict", "--target", "ES2022",
        "--module", "NodeNext", "--moduleResolution", "NodeNext", "--noEmitOnError",
        "--rootDir", sourceDirectory, "--outDir", emit, source,
      ], { cwd: root, encoding: "utf8" });
      if (compiled.status !== 0) return { ok: false, stage: "compile", name, output: `${compiled.stdout}\n${compiled.stderr}` };
      const executed = spawnSync(process.execPath, [resolve(emit, name.replace(/\.ts$/, ".js"))], { cwd: root, encoding: "utf8" });
      if (executed.status !== 0) return { ok: false, stage: "runtime", name, output: `${executed.stdout}\n${executed.stderr}` };
    }
    return { ok: true, shards: names.length };
  } finally {
    await rm(emit, { recursive: true, force: true });
  }
};

const temporary = await mkdtemp(replay === undefined
  ? resolve(tmpdir(), "drdice-property-parity-")
  : resolve(here, ".replay-"));
try {
  if (shrink !== undefined) {
    const original = selectReplay(generateCases(seed), shrink);
    const candidates = [original, ...shrinkCase(original)];
    let smallestFailure;
    for (const candidate of candidates) {
      const directory = await mkdtemp(resolve(here, ".shrink-"));
      try {
        const stateLiteral = candidate.state === null ? "null" : `${JSON.stringify(candidate.state)} as const`;
        const fixture = `/* failure-replay candidate */\nimport { evaluate } from "@drdice/dice";\nconst expected = ${JSON.stringify(candidate.expected)} as const;\nconst actual = evaluate(${JSON.stringify(candidate.source)}, ${stateLiteral}, ${candidate.maximumAttempts});\ntype Equal<A, B> = [A] extends [B] ? [B] extends [A] ? true : false : false;\ntype IsAny<Value> = 0 extends (1 & Value) ? true : false;\ntype ContainsAny<Value> =\n  IsAny<Value> extends true ? true\n    : Value extends readonly unknown[] ? ContainsAny<Value[number]>\n      : Value extends object\n        ? true extends { [Key in keyof Value]: ContainsAny<Value[Key]> }[keyof Value] ? true : false\n        : false;\ntype Assert<T extends true> = T;\ntype Exact = Assert<Equal<typeof actual, typeof expected>>;\ntype NoAny = Assert<Equal<ContainsAny<typeof actual>, false>>;\nif (JSON.stringify(actual) !== JSON.stringify(expected)) throw new Error(JSON.stringify({ actual, expected }));\n`;
        await import("node:fs/promises").then(({ writeFile }) => writeFile(resolve(directory, "candidate.ts"), fixture));
        const result = await compileAndRun(directory);
        if (!result.ok) smallestFailure = { candidate, result };
      } finally {
        await rm(directory, { recursive: true, force: true });
      }
    }
    if (!smallestFailure) fail(`replay ${shrink} no longer fails; no shrink was needed`);
    fail(`minimized replay candidate:\n${JSON.stringify(smallestFailure, null, 2)}`);
  }

  if (replay !== undefined) {
    runGenerator(temporary, replay);
    const result = await compileAndRun(temporary);
    if (!result.ok) fail(`seed=${seed} replay=${replay} ${result.stage} failure in ${result.name}\n${result.output}`);
    console.log(`[property-parity] replay passed; seed=${seed} path=${replay}`);
  } else {
    runGenerator(temporary);
    const [expectedNames, actualNames] = await Promise.all([readdir(committed), readdir(temporary)]);
    expectedNames.sort(); actualNames.sort();
    if (JSON.stringify(expectedNames) !== JSON.stringify(actualNames)) fail("committed shard set is dirty; run pnpm generate:property-parity");
    for (const name of expectedNames) {
      const [expected, actual] = await Promise.all([readFile(resolve(committed, name), "utf8"), readFile(resolve(temporary, name), "utf8")]);
      if (expected !== actual) fail(`${name} is dirty; run pnpm generate:property-parity`);
      const caseCount = [...expected.matchAll(/type ExactParity\d+ =/g)].length;
      if (caseCount < 1 || caseCount > budget.maximumCasesPerShard) {
        fail(`${name} has ${caseCount} cases; shard budget is 1..${budget.maximumCasesPerShard}`);
      }
    }
    if (expectedNames.length > budget.maximumBlockingShards) {
      fail(`${expectedNames.length} shards exceed blocking budget ${budget.maximumBlockingShards}`);
    }
    const started = performance.now();
    const result = await compileAndRun(committed);
    const elapsed = Math.round(performance.now() - started);
    if (!result.ok) fail(`seed=${seed} ${result.stage} failure in ${result.name}; replay one of that shard's embedded paths\n${result.output}`);
    if (elapsed > budget.maximumWallMilliseconds) {
      const message = `${elapsed} ms exceeds property parity wall budget ${budget.maximumWallMilliseconds} ms`;
      if (referenceRunner) fail(message);
      console.warn(`[property-parity] timing advisory: ${message}`);
    }
    console.log(`[property-parity] ${CASE_COUNT} exact oracle/type/runtime cases passed in ${result.shards} bounded shards (${elapsed} ms); seed=${seed}`);
  }
} finally {
  await rm(temporary, { recursive: true, force: true });
}
