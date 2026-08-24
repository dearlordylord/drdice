const VERSION_PATTERN = /^(\d+)\.(\d+)\.(\d+)(?:-([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?(?:\+[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?$/;

export const npmDistTag = (version) => {
  const match = VERSION_PATTERN.exec(version);
  if (!match) throw new Error(`invalid package version: ${version}`);
  if (!match[4]) return "latest";
  const prereleaseIdentifier = match[4].split(".")[0];
  return /^[a-zA-Z]/.test(prereleaseIdentifier) ? prereleaseIdentifier : "prerelease";
};

if (process.argv[1] && import.meta.url === new URL(`file://${process.argv[1]}`).href) {
  const version = process.argv[2];
  if (!version) throw new Error("usage: node scripts/npm-dist-tag.mjs <version>");
  console.log(npmDistTag(version));
}
