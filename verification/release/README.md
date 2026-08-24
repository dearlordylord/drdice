# Release qualification

This directory owns the release-candidate qualification lane. It is private
verification infrastructure and is not part of either package's public API.

## Reproducible release evidence

The blocking compiler is exactly `typescript@7.0.2`, using the native `tsc`
executable. The budget lane runs one warm-up process followed by five fresh
scored processes for every case under both explicit TypeScript 7 checker
policies: one checker and four checkers. Every scored process records compiler
check time, total time, compiler-reported memory, process-tree peak RSS, type
count, and instantiation count. The declared blocking ceilings are in
`budgets.json`; compiler-reported memory is the enforceable memory metric, and
process-tree RSS is retained as host evidence because native checker workers
can reserve memory outside the compiler's own counter.

The pinned `@typescript/typescript6@6.0.2` / `tsc6` lane records one fresh
process per case as advisory migration evidence only; it does not repeat the
blocking warm-up/five-run matrix. Its reported executable version may be
`Version 6.0.3`; the package coordinate remains the requested `6.0.2`.

After committing source changes, run from the repository root:

```sh
pnpm install --frozen-lockfile
pnpm release:measure
git add verification/release/release-candidate.json
git commit -m "docs: record release qualification"
pnpm check:release
```

`release:measure` refuses a dirty tree, runs the complete workspace verification
once, runs the blocking warm-up plus five-run budget matrix, and writes the
committed report. It also hashes every
tracked source file except the report itself. `check:release` refuses a dirty
tree, recomputes that source digest, verifies the report's content digest,
revalidates all blocking budget ceilings without rerunning qualification. Thus a
report from an earlier declaration, script, fixture, package manifest, or
budget file cannot be presented as current evidence. Editing the report,
changing source after measurement, omitting a scored run, or changing the
release gate inventory fails closed.

`release-candidate.json` is the release evidence. It records the measured
source commit and digest, semantic corpus identities and counts, package and
declaration identities, packed/package gate outputs, the complete compiler
budget matrix, host details, warm-up/scored-run policy, advisory diagnostics,
and an explicit `ready` or failure verdict. A report is not valid until it is
committed and `pnpm check:release` passes from a clean checkout.

## Budget cases

The cases are deliberately named and closed:

- `baseline` imports the two package roots and measures package overhead;
- `prng` exercises public bounded sampling at the five-output sampling
  ceiling;
- `dice` exercises public parsing, arithmetic, and multiple bounded samples;
- `combined` imports both roots in one source and composes both public APIs;
- `max-query` evaluates the maximum eight completed samples with one attempt
  of fuel.

The exact corpora remain the semantic source of truth. These
budget queries are performance probes and never generate or replace golden
vectors.
