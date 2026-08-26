export const PACKAGE_ARTIFACTS = Object.freeze({
  prng: Object.freeze({
    source: Object.freeze(["index.ts", "types.ts"]),
    output: Object.freeze(["index.d.ts", "index.js", "types.d.ts"]),
    packed: Object.freeze([
      "dist/index.d.ts",
      "dist/index.js",
      "dist/types.d.ts",
      "README.md",
      "LICENSE",
    ]),
  }),
  dice: Object.freeze({
    source: Object.freeze(["groups.ts", "index.ts", "types.ts"]),
    output: Object.freeze(["groups.d.ts", "groups.js", "index.d.ts", "index.js", "types.d.ts"]),
    packed: Object.freeze([
      "dist/groups.d.ts",
      "dist/groups.js",
      "dist/index.d.ts",
      "dist/index.js",
      "dist/types.d.ts",
      "README.md",
      "LICENSE",
    ]),
  }),
});
