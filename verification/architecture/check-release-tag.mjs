import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { npmDistTag } from "../../scripts/npm-dist-tag.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");

assert.equal(npmDistTag("1.2.3"), "latest");
assert.equal(npmDistTag("1.2.3+build.4"), "latest");
assert.equal(npmDistTag("1.2.3-dev.4"), "dev");
assert.equal(npmDistTag("1.2.3-beta.2"), "beta");
assert.equal(npmDistTag("1.2.3-0.4"), "prerelease");
assert.throws(() => npmDistTag("not-a-version"), /invalid package version/);

const releaseTag = (version) => {
  const child = spawnSync("bash", [resolve(root, "scripts/local_release.sh"), "--dist-tag-dry-run", version], {
    cwd: root,
    encoding: "utf8",
  });
  assert.equal(child.status, 0, child.stderr);
  return child.stdout.trim();
};

assert.equal(releaseTag("1.2.3"), "latest");
assert.equal(releaseTag("1.2.3-rc.1"), "rc");
console.log("[architecture] stable and prerelease npm dist-tag dry runs passed");
