# drdice

DRDice is a pnpm workspace containing exactly two independently versioned,
declaration-only TypeScript packages:

- `@drdice/prng` — seeded, reproducible pseudorandom type computation;
- `@drdice/dice` — bounded Dice Expression type computation, depending one-way
  on `@drdice/prng`.

The package roots are intentionally the only public export paths. Their
computation is erased by TypeScript, so consumers use `import type`; there is
no supported runtime entry point. DRDice is for reproducible games, tests, and
type-system experimentation, not cryptographic randomness, secrets, security
tokens, gambling, or unpredictable entropy.

The supported checker is exactly `typescript@7.0.2`. The pinned
`@typescript/typescript6@6.0.2` command is advisory migration evidence only.

From a clean checkout:

```sh
pnpm install --frozen-lockfile
pnpm verify
```

The individual gates are `pnpm typecheck`, `pnpm check:fixtures`,
`pnpm check:prng`, `pnpm check:clean-consumers`, `pnpm check:packed`, and the
one-/four-checker budget commands. The PRNG artifact lane is
`pnpm check:prng:budget`; it includes the exhaustive Issue #19 Sample grid and
its TypeScript 7 focused measurements are recorded in
[`verification/issue-19/results.json`](verification/issue-19/results.json).
The earlier raw-transition measurements remain in
[`verification/issue-18/results.json`](verification/issue-18/results.json).
Baseline scaffold measurements live in
[`verification/baseline/scaffold.json`](verification/baseline/scaffold.json).
