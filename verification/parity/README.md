# Complete parity and package-boundary verification

`check.mjs` is the normal-change gate for the complete PRNG and Dice
contracts. It runs every exact fixture checker, verifies that all
private oracles stay inside `verification/` and never import production code,
then checks the rolled-up package roots, packed allowlists, clean consumers,
and blocked deep imports.

The generators remain the source of committed shards:

- `verification/generate-fixtures.mjs` owns the PRNG transition and bounded
  sampling shards;
- `verification/dice-arithmetic-parity/generate.mjs` owns arithmetic/static Dice shards;
- `verification/dice-evaluation-parity/generate.mjs` owns complete-evaluation and `d1`–`d100`
  shards;
- `verification/property-parity/generate.mjs` owns executable property shards whose
  oracle literal is both the exact inferred type witness and runtime expected
  result.

Run the complete normal lane from the repository root:

```sh
pnpm check:parity
```

The lane checks literal oracle results before compiling exact
`Equal<Input, Expected>` assertions. It also checks deterministic regeneration
and rejects missing or extra shards, so a generated diff cannot be hidden by a
partial or release-only check.
