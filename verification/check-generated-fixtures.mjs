import { mkdtemp, readdir, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const here = dirname(fileURLToPath(import.meta.url));
const generator = resolve(here, "generate-fixtures.mjs");
const committed = resolve(here, "generated");
const temporary = await mkdtemp(resolve(tmpdir(), "drdice-generated-"));

try {
  const generated = spawnSync(process.execPath, [generator, "--output", temporary], {
    cwd: resolve(here, ".."),
    encoding: "utf8",
  });
  if (generated.status !== 0) {
    throw new Error(`fixture generator failed\n${generated.stdout}\n${generated.stderr}`);
  }

  const [expectedNames, actualNames] = await Promise.all([
    readdir(committed),
    readdir(temporary),
  ]);
  expectedNames.sort();
  actualNames.sort();
  if (JSON.stringify(expectedNames) !== JSON.stringify(actualNames)) {
    throw new Error(
      `generated fixture set differs: expected ${expectedNames.join(", ")}, got ${actualNames.join(", ")}`,
    );
  }

  for (const name of expectedNames) {
    const [expected, actual] = await Promise.all([
      readFile(resolve(committed, name), "utf8"),
      readFile(resolve(temporary, name), "utf8"),
    ]);
    if (expected !== actual) {
      throw new Error(`generated fixture ${name} is dirty; run pnpm generate:fixtures and review the diff`);
    }
  }
  console.log(`Generated fixtures are clean (${expectedNames.length} file).`);
} finally {
  await rm(temporary, { recursive: true, force: true });
}
