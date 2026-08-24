import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const read = (path) => readFile(resolve(root, path), "utf8");

const [diceDeclaration, usability, release, verifyWorkflow, budgetWorkflow, rootManifestText, prngManifestText, diceManifestText] = await Promise.all([
  read("packages/dice/src/index.d.ts"),
  read("verification/usability/check.mjs"),
  read("scripts/local_release.sh"),
  read(".github/workflows/verify.yml"),
  read(".github/workflows/reference-budgets.yml"),
  read("package.json"),
  read("packages/prng/package.json"),
  read("packages/dice/package.json"),
]);
const rootManifest = JSON.parse(rootManifestText);
const packageManifests = [JSON.parse(prngManifestText), JSON.parse(diceManifestText)];

assert.doesNotMatch(diceDeclaration, /StaticPreflightOriginal/, "dead static preflight remains shipped");
assert.doesNotMatch(diceDeclaration, /continuation state|successor state/i, "declaration terminology drifted from the glossary");
assert.match(usability, /packages\/prng\/src\/index\.js/, "usability gate does not import the production PRNG runtime source");
assert.match(usability, /packages\/dice\/src\/index\.js/, "usability gate does not import the production Dice runtime source");
assert.doesNotMatch(usability, /oracle(?:Initialize|Sample|Evaluate)/, "usability gate still executes an oracle instead of production runtime");
assert.match(release, /npm publish[^\n]+--tag "\$npm_dist_tag"/, "release publication does not use its derived npm dist-tag");
assert.match(release, /pnpm build\npnpm check:build\npnpm check:release/, "release does not rebuild and synchronize package output before qualification checks");
assert.match(rootManifest.scripts.verify, /check:build/, "normal verification does not check generated package output");
for (const manifest of packageManifests) {
  assert.equal(manifest.scripts?.prepack, "pnpm run build", `${manifest.name} does not rebuild before packing`);
}
assert.match(verifyWorkflow, /pnpm install --frozen-lockfile/);
assert.match(verifyWorkflow, /pnpm verify/);
assert.match(budgetWorkflow, /self-hosted, drdice-reference/);
assert.match(budgetWorkflow, /pnpm check:prng:budget/);
assert.match(budgetWorkflow, /pnpm check:dice:budget/);
assert.match(budgetWorkflow, /pnpm check:property-parity:budget/);

console.log("[issue-26] CI, declaration, terminology, runtime-usability, and reference-budget architecture checks passed");
