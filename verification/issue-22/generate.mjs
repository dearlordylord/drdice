/* Generate independent exact type assertions for the complete Dice evaluator. */
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { oracleEvaluate, LIMITS } from "../issue-20/oracle.mjs";
import { oracleStateFromWords } from "../issue-17/oracle.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "../..");
const outputArgument = process.argv.indexOf("--output");
const output = resolve(outputArgument >= 0 && process.argv[outputArgument + 1]
  ? process.argv[outputArgument + 1]
  : resolve(here, "generated"));
const ids = JSON.parse(await readFile(resolve(here, "cases.json"), "utf8"));
const golden = JSON.parse(await readFile(resolve(root, "verification/issue-20/golden-vectors.json"), "utf8"));
const byId = new Map(golden.cases.map((vector) => [vector.id, vector]));

const fail = (message) => { throw new Error(`[issue-22] ${message}`); };
const tuple = (values, readonly = true) => `${readonly ? "readonly " : ""}[${values.map((value) => literal(value)).join(", ")}]`;
const literal = (value) => {
  if (value === null) return "null";
  if (typeof value === "string") return JSON.stringify(value);
  if (typeof value === "number") return Object.is(value, -0) ? "0" : String(value);
  if (typeof value === "boolean") return String(value);
  if (Array.isArray(value)) return tuple(value, true);
  if (typeof value === "object") {
    if (value.kind === "GeneratorState" && Array.isArray(value.words)) return stateType(value.words);
    return `{ ${Object.entries(value).map(([key, item]) => `readonly ${key}: ${literal(item)}`).join("; ")} }`;
  }
  fail(`cannot render ${typeof value} as a type literal`);
};
const stateType = (words) => `GeneratorState<${tuple(words)}>`;
const stateInputType = (vector) => vector.stateWords
  ? stateType(vector.stateWords)
  : literal(vector.stateInput);
const traceType = (trace) => `[${trace.map((sample) => `DieSample<${sample.sideCount}, ${sample.face}>`).join(", ")}]`;

const expectedType = (vector) => {
  const expected = vector.expected;
  if (expected.ok) {
    return `Success<{ readonly total: ${literal(expected.value.total)}; readonly rollTrace: ${traceType(expected.value.rollTrace)}; readonly successorState: ${stateType(expected.value.successorState)} }>`;
  }
  const details = { ...expected.details };
  if (vector.id.startsWith("invalid-state-")) details.state = vector.stateInput;
  const rendered = `{ ${Object.entries(details).map(([key, item]) => {
    if (key === "successorState" && Array.isArray(item)) return `readonly ${key}: ${stateType(item)}`;
    if (key === "partialTrace" && Array.isArray(item)) return `readonly ${key}: ${traceType(item)}`;
    return `readonly ${key}: ${literal(item)}`;
  }).join("; ")} }`;
  return `Failure<${JSON.stringify(expected.code)}, ${rendered}>`;
};

const header = `/* GENERATED FILE. Run node verification/issue-22/generate.mjs; do not edit by hand. */
import type { GeneratorState } from "@drdice/prng";
import type { DieSample, Evaluate, Failure, Success } from "@drdice/dice";

type Equal<Left, Right> =
  (<Value>() => Value extends Left ? 1 : 2) extends
  (<Value>() => Value extends Right ? 1 : 2) ? true : false;
type Assert<Value extends true> = Value;

`;

const files = [];
for (const [index, id] of ids.entries()) {
  const vector = byId.get(id);
  if (!vector) fail(`golden case ${id} is missing`);
  if (typeof vector.source !== "string") fail(`${id} is not a literal source case`);
  const state = stateInputType(vector);
  const expected = expectedType(vector);
  const name = `dice-issue22-${String(index).padStart(3, "0")}.d.ts`;
  files.push([name, `${header}type Input = Evaluate<${JSON.stringify(vector.source)}, ${state}, ${literal(vector.maximumAttempts)}>;\ntype Expected = ${expected};\nexport type ${id.replace(/[^A-Za-z0-9]/g, "_")} = Assert<Equal<Input, Expected>>;\n`]);
}

const canonicalState = ["00000001", "00000002", "00000003", "00000004"];
for (let sides = 1; sides <= LIMITS.supportedSideCount; sides += 1) {
  const source = `d${sides}`;
  const actual = oracleEvaluate(source, oracleStateFromWords([...canonicalState]), 1);
  if (!actual.ok) fail(`${source} side-grid oracle failure: ${actual.code}`);
  const expected = `Success<{ readonly total: ${actual.value.total}; readonly rollTrace: ${traceType(actual.value.rollTrace)}; readonly successorState: ${stateType(actual.value.successorState.words)} }>`;
  const name = `dice-issue22-side-${String(sides).padStart(3, "0")}.d.ts`;
  files.push([name, `${header}type Input = Evaluate<${JSON.stringify(source)}, ${stateType(canonicalState)}, 1>;\ntype Expected = ${expected};\nexport type Side${sides} = Assert<Equal<Input, Expected>>;\n`]);
}

await mkdir(output, { recursive: true });
for (const [filename, content] of files) await writeFile(resolve(output, filename), content, "utf8");
console.log(`[issue-22] generated ${files.length} complete-evaluation and side-grid shards`);
