/* Complete normal-change verification gate for issue #23. */

import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "../..");

const fail = (message) => {
  throw new Error(`[parity] ${message}`);
};

const run = (script) => {
  const child = spawnSync(process.execPath, [resolve(root, script)], {
    cwd: root,
    encoding: "utf8",
  });
  if (child.status !== 0) fail(`${script} failed\n${child.stdout}\n${child.stderr}`);
};

/* This is intentionally the normal lane.  Budget/reference-runner commands
 * are release/performance evidence and are not used as a substitute for the
 * exact fixture, boundary, or packed-consumer assertions below. */
run("verification/parity/check-fixtures.mjs");
run("verification/check-clean-consumers.mjs");
run("verification/check-packed-artifacts.mjs");
console.log("[parity] complete semantic, package-boundary, packed-artifact, and clean-consumer gates passed");
