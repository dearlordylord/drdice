# drdice

DRDice is a pnpm workspace containing exactly two independently versioned,
declaration-only TypeScript packages:

- `@drdice/prng` — seeded, reproducible pseudorandom type computation;
- `@drdice/dice` — bounded Dice Expression type computation, depending one-way
  on `@drdice/prng`.

The package roots are intentionally the only public export paths. Their
computation is erased by TypeScript, so consumers use `import type`; there is
no supported runtime entry point.

DRDice is non-cryptographic. Appropriate uses include reproducible board- or
role-playing-game simulations, deterministic tests, teaching examples, and
type-system experiments. It must not be used for cryptographic keys, secrets,
passwords, authentication or reset tokens, security decisions, gambling or
wagering outcomes, or any application that requires unpredictable entropy.

The supported checker is exactly `typescript@7.0.2`. The pinned
`@typescript/typescript6@6.0.2` command is advisory migration evidence only.

From a clean checkout, the normal deterministic lane is:

```sh
pnpm install --frozen-lockfile
pnpm verify
```

The individual gates are `pnpm typecheck`, `pnpm check:fixtures`,
`pnpm check:prng`, `pnpm check:clean-consumers`, `pnpm check:packed`, and the
one-/four-checker budget commands. The exhaustive PRNG artifact lane is
`pnpm check:prng:budget`; it includes the exhaustive Issue #19 Sample grid and
its TypeScript 7 focused measurements are recorded in
[`verification/issue-19/results.json`](verification/issue-19/results.json).
The earlier raw-transition measurements remain in
[`verification/issue-18/results.json`](verification/issue-18/results.json).
Baseline scaffold measurements live in
[`verification/baseline/scaffold.json`](verification/baseline/scaffold.json).
The release-only warm-up/five-run matrix for every public PRNG, Dice, combined,
and maximum query is `pnpm release:measure`; commit its report and run
`pnpm check:release` as described in
[`verification/release/README.md`](verification/release/README.md).

## Release

From a clean `master` checkout that matches `origin/master`, authenticate with
npm and GitHub, then run one command:

```sh
pnpm local-release
```

The command installs the exact lockfile, revalidates the source-bound release
report, creates and checks both packed artifacts, publishes `@drdice/prng`
before `@drdice/dice`, verifies both registry versions, pushes the tag matching
their shared package version, attaches the exact tarballs to the GitHub release, and publishes an
existing draft release. It is safe to rerun after a partial registry publish:
an exact package version that already exists is skipped. Maintainers can check
the complete path without registry or GitHub mutations with
`DRDICE_RELEASE_DRY_RUN=1 pnpm local-release`.

## Compatibility identities

Package release versions, serialized-schema versions, algorithm sequence
profiles, and Dice semantic profiles are separate identities:

| Identity | Current value | Change that requires a new identity and reviewed vectors |
| --- | --- | --- |
| package release | `@drdice/prng@0.2.0`, `@drdice/dice@0.2.0` | A published package/API compatibility change |
| PRNG schema | `SCHEMA_VERSION = 1` | Changing Replay Token or Serialized Generator State shape or interpretation |
| PRNG Sequence Profile | `xoshiro128ss-1.1/warmup16-msb-chunk-rejection-2` | Changing transition, output conversion, bounds, rejection, state consumption, seed mapping, or replay semantics |
| Dice semantic profile | `dice-v2/utf16-bounded-left-to-right-2`, version `2` | Changing grammar, UTF-16 offsets, limits, parsing, arithmetic/evaluation order, sampling, failure selection, or result values |

Documentation, checker-performance work, and private refactors may retain an
identity only when all exact oracle, golden-vector, package-boundary, and
release-budget gates remain unchanged. The release-candidate qualification
and stale-evidence checks are documented in
[`verification/release/README.md`](verification/release/README.md).
