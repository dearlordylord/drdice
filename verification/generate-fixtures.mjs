import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const defaultOutput = resolve(here, "generated");
const outputArgument = process.argv.indexOf("--output");
const output = resolve(
  outputArgument >= 0 && process.argv[outputArgument + 1]
    ? process.argv[outputArgument + 1]
    : defaultOutput,
);

const scaffold = `/* GENERATED FILE. Run pnpm generate:fixtures; do not edit by hand. */
import type { PackageMetadata as PrngPackageMetadata } from "@drdice/prng";
import type { PackageMetadata as DicePackageMetadata } from "@drdice/dice";

type Equal<Left, Right> =
  (<Value>() => Value extends Left ? 1 : 2) extends
  (<Value>() => Value extends Right ? 1 : 2) ? true : false;
type Assert<Value extends true> = Value;

export type PrngScaffoldAssertion = Assert<Equal<
  PrngPackageMetadata["name"],
  "@drdice/prng"
>>;
export type DiceScaffoldAssertion = Assert<Equal<
  DicePackageMetadata["name"],
  "@drdice/dice"
>>;
`;

await mkdir(output, { recursive: true });
await writeFile(resolve(output, "scaffold.d.ts"), scaffold, "utf8");
