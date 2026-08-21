# DRDice design prototypes

These files are captured planning artifacts, not package implementations or
release-readiness evidence. They preserve the reviewed answers to GitHub issues
#9 and #10 on the default branch.

## PRNG type API

- [Interactive walkthrough](./prng-type-api.html)
- [Type-level artifact and runtime-oracle probe](./prng-type-api.ts)
- Reviewed source: `prototype/prng-type-api` at `3e3d8f3`

The prototype covers Seed initialization, raw stepping, bounded sampling,
explicit Generator State threading, structured failures, Replay Token versus
Serialized Generator State, and the internal runtime-oracle boundary.

Check it with:

```sh
npx --yes -p typescript@5.9.3 tsc --pretty false --strict \
  --target es2020 --module commonjs --noEmit \
  prototypes/prng-type-api.ts

outdir=$(mktemp -d)
npx --yes -p typescript@5.9.3 tsc --pretty false --strict \
  --target es2020 --module commonjs --outDir "$outdir" \
  prototypes/prng-type-api.ts
node "$outdir/prng-type-api.js"
```

## Dice Evaluation type API

- [Interactive walkthrough](./dice-evaluation-type-api.html)
- [Type-level artifact and runtime-oracle probe](./dice-evaluation-type-api.ts)
- Reviewed source: `prototype/dice-evaluation-type-api` at `89fceca`

The prototype covers the three-input `Evaluate` boundary, exact Dice Evaluation
success shape, structured diagnostics, deterministic phase and offset rules,
partial failure state retention, Roll Trace ordering, and one-way composition
through the PRNG sampler.

Check it with:

```sh
npx --yes -p typescript@5.9.3 tsc --pretty false --strict \
  --target es2020 --module commonjs --noEmit \
  prototypes/dice-evaluation-type-api.ts

outdir=$(mktemp -d)
npx --yes -p typescript@5.9.3 tsc --pretty false --strict \
  --target es2020 --module commonjs --outDir "$outdir" \
  prototypes/dice-evaluation-type-api.ts
node "$outdir/dice-evaluation-type-api.js"
```

Both HTML files are self-contained and open directly in a browser. The numeric
limits and bounded literal corpus remain illustrative; issues #11–#13 own the
compiler budgets, verification gates, and release contract.
