import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const read = (path) => readFile(resolve(root, path), "utf8");

const [diceDeclaration, usability, release, verifyWorkflow, budgetWorkflow] = await Promise.all([
  read("packages/dice/dist/index.d.ts"),
  read("verification/usability/check.mjs"),
  read("scripts/local_release.sh"),
  read(".github/workflows/verify.yml"),
  read(".github/workflows/reference-budgets.yml"),
]);

assert.doesNotMatch(diceDeclaration, /StaticPreflightOriginal/, "dead static preflight remains shipped");
assert.doesNotMatch(diceDeclaration, /continuation state|successor state/i, "declaration terminology drifted from the glossary");
assert.match(usability, /packages\/prng\/dist\/index\.js/, "usability gate does not import the production PRNG runtime");
assert.match(usability, /packages\/dice\/dist\/index\.js/, "usability gate does not import the production Dice runtime");
assert.doesNotMatch(usability, /oracle(?:Initialize|Sample|Evaluate)/, "usability gate still executes an oracle instead of production runtime");
assert.match(release, /npm publish[^\n]+--tag "\$npm_dist_tag"/, "release publication does not use its derived npm dist-tag");
assert.match(verifyWorkflow, /pnpm install --frozen-lockfile/);
assert.match(verifyWorkflow, /pnpm verify/);
assert.match(budgetWorkflow, /self-hosted, drdice-reference/);
assert.match(budgetWorkflow, /pnpm check:prng:budget/);
assert.match(budgetWorkflow, /pnpm check:dice:budget/);

console.log("[issue-26] CI, declaration, terminology, runtime-usability, and reference-budget architecture checks passed");
