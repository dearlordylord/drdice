/* Generate exact arithmetic/static parity shards from reviewed issue #20 data. */
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "../..");
const outputArgument = process.argv.indexOf("--output");
const output = resolve(outputArgument >= 0 && process.argv[outputArgument + 1] ? process.argv[outputArgument + 1] : resolve(root, "verification/generated"));
const ids = JSON.parse(await readFile(resolve(here, "cases.json"), "utf8"));
const golden = JSON.parse(await readFile(resolve(root, "verification/issue-20/golden-vectors.json"), "utf8"));
const byId = new Map(golden.cases.map((vector) => [vector.id, vector]));

const fail = (message) => { throw new Error(`[issue-21] ${message}`); };
const tuple = (values) => `readonly [${values.map((value) => JSON.stringify(value)).join(", ")}]`;
const literal = (value) => {
  if (value === null) return "null";
  if (typeof value === "string") return JSON.stringify(value);
  if (typeof value === "number") return Object.is(value, -0) ? "0" : String(value);
  if (typeof value === "boolean") return String(value);
  if (Array.isArray(value)) return value.length === 0 ? "[]" : `readonly [${value.map(literal).join(", ")}]`;
  if (typeof value === "object") {
    return `{ ${Object.entries(value).map(([key, item]) => `readonly ${key}: ${literal(item)}`).join("; ")} }`;
  }
  fail(`cannot render ${typeof value} as a type literal`);
};
const stateTypeFromWords = (words) => `GeneratorState<${tuple(words)}>`;
const stateType = (vector) => vector.stateWords ? stateTypeFromWords(vector.stateWords) : literal(vector.stateInput);
const expectedType = (vector) => {
  const expected = vector.expected;
  if (expected.ok) {
    return `Success<{ readonly total: ${literal(expected.value.total)}; readonly rollTrace: []; readonly nextState: ${stateTypeFromWords(expected.value.nextState)} }>`;
  }
  const details = { ...expected.details };
  if (vector.id.startsWith("invalid-state-")) details.state = vector.stateInput;
  const rendered = `{ ${Object.entries(details).map(([key, item]) => {
    if (key === "nextState" && Array.isArray(item)) return `readonly ${key}: ${stateTypeFromWords(item)}`;
    return `readonly ${key}: ${literal(item)}`;
  }).join("; ")} }`;
  return `Failure<${JSON.stringify(expected.code)}, ${rendered}>`;
};

const header = `/* GENERATED FILE. Run node verification/issue-21/generate.mjs; do not edit by hand. */\nimport type { GeneratorState } from "@drdice/prng";\nimport type { Evaluate, Failure, Success } from "@drdice/dice";\n\ntype Equal<Left, Right> =\n  (<Value>() => Value extends Left ? 1 : 2) extends\n  (<Value>() => Value extends Right ? 1 : 2) ? true : false;\ntype Assert<Value extends true> = Value;\n\n`;

const files = [];
for (const [index, id] of ids.entries()) {
  const vector = byId.get(id);
  if (!vector) fail(`golden case ${id} is missing`);
  if (typeof vector.source !== "string") fail(`${id} is not a literal source case`);
  const state = stateType(vector);
  const expected = expectedType(vector);
  const content = `${header}type Input = Evaluate<${JSON.stringify(vector.source)}, ${state}, ${literal(vector.maximumAttempts)}>;\ntype Expected = ${expected};\nexport type ${id.replace(/[^A-Za-z0-9]/g, "_")} = Assert<Equal<Input, Expected>>;\n`;
  files.push([`dice-issue21-${String(index).padStart(3, "0")}.d.ts`, content]);
}

await mkdir(output, { recursive: true });
for (const [filename, content] of files) await writeFile(resolve(output, filename), content, "utf8");
console.log(`[issue-21] generated ${files.length} exact arithmetic/static parity shards`);
