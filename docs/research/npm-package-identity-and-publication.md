# npm package identity and publication constraints

Research date: 2026-08-20

## Decision

Use the existing public repository [`dearlordylord/drdice`](https://github.com/dearlordylord/drdice) as the canonical source repository. Reserve a free public npm organization named `drdice`, then publish exactly these independently versioned packages:

- `@drdice/prng` from `packages/prng`
- `@drdice/dice` from `packages/dice`, with a one-way dependency on `@drdice/prng`

The scoped pair expresses the product and package boundary without inventing two unrelated global names. npm grants every organization a matching scope, explicitly recommends scopes for grouping related packages and avoiding name disputes, and permits free organizations that publish only public packages ([organization scopes](https://docs.npmjs.com/about-organization-scopes-and-packages/), [creating an organization](https://docs.npmjs.com/creating-an-organization/)).

The registry returned `404` for both [`@drdice/prng`](https://registry.npmjs.org/@drdice%2fprng) and [`@drdice/dice`](https://registry.npmjs.org/@drdice%2fdice) on the research date. That establishes that no package records were visible, not that the `drdice` organization name is reservable. An npm account owner must create or verify control of the `drdice` organization before these names become an implementation commitment. Do not substitute an unscoped name merely because its registry endpoint is currently empty: npm says unscoped names should also avoid confusing similarity and authorship ambiguity, while a scope supplies the ownership namespace ([package-name guidelines](https://docs.npmjs.com/package-name-guidelines/), [public package identities](https://docs.npmjs.com/about-public-packages/)).

If the `drdice` organization cannot be reserved, stop and choose a different owned scope. The unscoped `drdice-prng` and `drdice-dice` names also returned `404` on the research date, but they are fallback candidates, not the preferred contract.

## Package boundary and dependency

The repository root should be private and non-publishable. Only the two package directories should carry public versions. `@drdice/dice` should declare `@drdice/prng` as a production dependency using a `workspace:` range during development. pnpm resolves `workspace:` only to a local workspace package and rewrites it to an ordinary semver range when packing or publishing ([pnpm workspace protocol](https://pnpm.io/workspaces#workspace-protocol-workspace)). Use `workspace:^` so the packed dice package depends on a compatible public PRNG release.

Version the packages independently. A dice-only parser change should not force a PRNG release, while a PRNG release can be consumed deliberately by dice. Despite initial `0.x` versions, DRDice's stated reproducibility promise requires any change to an existing algorithm's output sequence, seed interpretation, state shape, or replay identity to be treated as breaking. Package version is release identity; it must not silently substitute for an explicit PRNG algorithm identity.

## Initial declaration-only contract

The first releases may be declaration-only because their public computation runs in the TypeScript type system. Each package should:

- set `"type": "module"`;
- point top-level `"types"` to its generated `index.d.ts`;
- expose only the package root through an `"exports"` entry containing a `"types"` condition;
- publish generated declarations, a package README, and the MIT license;
- set `"sideEffects": false`;
- document that consumers use `import type` and that a runtime import is unsupported until a runtime entry point is published.

TypeScript guarantees that `import type` and `export type` are erased from JavaScript output. In modern resolution modes it follows package `exports`, always matches the `types` condition, and blocks undeclared subpaths ([TypeScript module reference](https://www.typescriptlang.org/docs/handbook/modules/reference.html#packagejson-exports)). TypeScript also recommends retaining the top-level `types` field even when `exports` is sufficient, both as a fallback for resolution modes that do not read `exports` and so npm can identify the package as typed ([`main` and `types`](https://www.typescriptlang.org/docs/handbook/modules/reference.html#packagejson-main-and-types)).

A representative initial manifest shape is:

```json
{
  "name": "@drdice/prng",
  "version": "0.1.0",
  "type": "module",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts"
    }
  },
  "files": ["dist", "README.md", "LICENSE"],
  "sideEffects": false,
  "license": "MIT",
  "repository": {
    "type": "git",
    "url": "git+https://github.com/dearlordylord/drdice.git",
    "directory": "packages/prng"
  },
  "publishConfig": {
    "access": "public"
  }
}
```

The dice manifest uses the same shape, changes `name` and `repository.directory`, and adds:

```json
{
  "dependencies": {
    "@drdice/prng": "workspace:^"
  }
}
```

This is intentionally not a fake empty JavaScript implementation. Node's `exports` field defines runtime entry points, and unlisted paths are unavailable ([Node package entry points](https://nodejs.org/api/packages.html#package-entry-points)). A later runtime mirror can add a `default` ESM target beside the existing `types` target. Once runtime JavaScript exists, it must remain ESM-first and use explicit `"type": "module"`; Node recommends explicit package type and `exports` for new packages ([Node package modules](https://nodejs.org/api/packages.html#determining-module-system)). Adding CommonJS would create a second execution contract and should require demonstrated demand rather than being an initial obligation.

## TypeScript compatibility is a public constraint

Type-level algorithms execute inside each consumer's compiler, so compiler support and checker cost are part of the product contract rather than development-only metadata. Before the first release:

1. The algorithm and parser prototypes must determine the oldest TypeScript version that both accepts the declaration syntax and stays inside the agreed checker budget.
2. That exact minimum version must be documented in each package README and tested in CI alongside the current TypeScript release.
3. Raising the minimum TypeScript version must be treated as a breaking package change.
4. Do not promise multiple declaration dialects initially. If support for older compilers is later required, TypeScript supports versioned `types@...` export conditions. Plain `typesVersions` is not consulted when `exports` resolution is active ([versioned `types` conditions and `typesVersions`](https://www.typescriptlang.org/docs/handbook/modules/reference.html#example-versioned-types-condition)).

Do not declare TypeScript as a runtime dependency. The package contains declarations for a consumer compiler, not a compiler that must be installed and executed by DRDice. A peer dependency would force package-manager resolution behavior without accurately enforcing checker performance or compiler flags. The compatibility statement plus CI matrix is the enforceable release evidence.

No Node `engines` floor is necessary while a package is genuinely declaration-only. Add and test an engines constraint when the runtime mirror introduces JavaScript behavior.

## Licensing and package contents

Keep the repository and both packages MIT licensed. Each manifest should use the SPDX identifier `"MIT"`; npm recommends SPDX expressions in the `license` field ([npm package metadata](https://docs.npmjs.com/cli/v10/configuring-npm/package-json/#license)). pnpm copies the workspace-root license into a workspace package when publishing unless the package has its own license, so the existing root `LICENSE` can remain the canonical text ([pnpm publish](https://pnpm.io/cli/publish)). The packed artifact must nevertheless be inspected to prove that its own root contains the license, README, declarations, source maps if promised, and nothing private or unnecessary.

Use a restrictive `files` allowlist and test the exact tarballs before release. npm warns authors to review packages for secrets and unnecessary material before publishing, and pnpm provides `publish --dry-run` for inspecting what a publish would do ([npm scoped publication](https://docs.npmjs.com/creating-and-publishing-scoped-public-packages/#reviewing-package-contents-for-sensitive-or-unnecessary-information), [pnpm dry run](https://pnpm.io/cli/publish#--dry-run)).

## Publication and provenance

Every scoped release must explicitly be public. Scoped packages otherwise default to private/restricted publication, while a free public-only organization cannot publish private packages ([scoped public packages](https://docs.npmjs.com/creating-and-publishing-scoped-public-packages/#publishing-scoped-public-packages)). Encode `publishConfig.access: "public"` in both manifests and keep the registry fixed to `https://registry.npmjs.org/`.

Publish only from the public GitHub repository on a GitHub-hosted runner after clean-checkout install, build, type tests, compatibility-matrix tests, and tarball inspection succeed. Each package's `repository.url` must exactly match the public GitHub repository for npm provenance, and `repository.directory` identifies its monorepo source directory ([npm provenance prerequisites](https://docs.npmjs.com/generating-provenance-statements/#prerequisites), [npm monorepo repository metadata](https://docs.npmjs.com/cli/v10/configuring-npm/package-json/#repository)).

Prefer npm trusted publishing through GitHub Actions after bootstrap. It uses short-lived OIDC credentials, automatically emits provenance for public packages from public repositories, requires `id-token: write`, and currently requires a GitHub-hosted runner, Node 22.14 or later, and npm CLI 11.5.1 or later. Each package must be configured separately because npm permits only one trusted publisher configuration per package ([trusted publishing](https://docs.npmjs.com/trusted-publishers/)).

This creates a narrow tooling exception worth making explicit: pnpm remains the workspace package manager and performs installation, scripts, packing, and local release validation, while the release job uses the supported npm CLI solely as the OIDC-aware registry publisher. pnpm supports provenance publication but its official publish documentation does not claim npm trusted-publisher authentication; claiming tokenless OIDC through `pnpm publish` without first-party support would make the release design depend on undocumented behavior ([pnpm publish](https://pnpm.io/cli/publish#--provenance)).

The initial package publish precedes a package settings page on which trusted publishing can be configured. Bootstrap each package through an authorized maintainer with 2FA or a short-lived granular token from the GitHub-hosted release workflow, include provenance, then configure the trusted publisher and remove the write token. npm recommends trusted publishing over long-lived tokens and recommends disabling traditional token publishing after migration ([trusted-publisher migration](https://docs.npmjs.com/trusted-publishers/#recommended-restrict-token-access-when-using-trusted-publishers)).

## Release gates

The public package contract is ready to choose only when all of these checks pass:

- The `drdice` npm organization is created under an authorized maintainer account with 2FA, and both package names are controlled by that organization.
- `@drdice/prng` and `@drdice/dice` resolve locally through actual pnpm workspace links, not TypeScript `paths`; TypeScript recommends workspace package lookups because they exercise the same package resolution consumers receive ([monorepo package resolution](https://www.typescriptlang.org/docs/handbook/modules/reference.html#paths)).
- The minimum supported TypeScript version and checker budget have been established by prototypes and are enforced in CI.
- The dice tarball's dependency on PRNG has been rewritten from `workspace:^` to the intended public semver range.
- Consumer fixtures install each packed tarball and compile under supported NodeNext and bundler resolution modes using only documented exports.
- `pnpm publish --dry-run` confirms the allowlisted files, package README, MIT license, declarations, repository metadata, and public access setting for both packages.
- The release workflow publishes from a clean public commit, emits provenance, and uses no persistent write token after trusted publishing is configured.

Subject to the interactive scope reservation and compiler-feasibility gate, the identity decision is therefore: **GitHub `dearlordylord/drdice`; npm organization `@drdice`; packages `@drdice/prng` and `@drdice/dice`; declaration-only ESM-shaped releases first, with an additive ESM runtime target later.**
