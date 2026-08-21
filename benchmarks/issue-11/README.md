# Issue #11: TypeScript compiler budgets

Decision date: 2026-08-21

This directory captures the benchmark and decision for GitHub issue #11. The
accepted issue #9 and #10 prototypes remain planning artifacts; these limits
are the implementation envelope that production code must meet, not evidence
that the prototypes themselves are release-ready.

## Decision

The v1 supported compiler baseline is exactly `typescript@7.0.2`, invoked by
its `tsc` compatibility command. The reproducible CI budget lane uses one
checker; the default four-checker behavior is a separate user-realistic gate.
A later 7.x patch or minor is not added to the support set until both series
pass and their results are recorded. Issue #13 owns the eventual package
metadata expression of this decision.

`@typescript/typescript6@6.0.2` and `tsc6` remain a non-blocking migration and
comparison lane. The pinned npm package reported `Version 6.0.3` during this
run; both the package coordinate and executable-reported version are therefore
recorded. Passing that lane is useful evidence, but v1 does not promise support
for TypeScript 6 or its programmatic compiler API.

The v1 public release target is:

| Dimension | Supported bound |
| --- | ---: |
| PRNG sampling bound | integer 1 through 100 |
| Rejection attempts | integer 0 through 4 per Die Sample |
| Dice Expression source length | 64 UTF-16 code units |
| Numeric token length | 3 decimal digits |
| Parenthesis nesting depth | 4 |
| AST node count | 15 |
| Dice terms | 4 |
| Die Samples | 8 |
| Die side count | integer 1 through 100 |
| Absolute arithmetic magnitude | 100 |
| Evaluation steps | 24 |

These are independent resource ceilings, not a Cartesian promise that every
combination reaches a total. For example, a structurally valid expression can
still exceed arithmetic magnitude or dynamic evaluation steps after consuming
state. The envelope preserves the useful d1–d100 floor from issues #7 and #8,
supports common bounded forms such as `8d6` and grouped four-term arithmetic,
keeps source recursion below TypeScript's internal depth guard, and avoids
claiming larger arithmetic or grammar workloads that no prototype has executed.

Zero rejection fuel is valid and deterministically exhausts without consuming
state. A limit violation must materialize the structured failure selected by
the accepted APIs; it must not escape as a compiler recursion or instantiation
failure. Widened strings and numbers remain outside the literal-computing
contract.

The accepted Dice Evaluation prototype materializes a bounded corpus instead
of executing its private general scaffold for every literal. A direct `d6`
probe through that scaffold fails with `TS2589` on both pinned compilers. The
target above is therefore a release acceptance constraint, not a claim that
the prototype already implements the envelope. Production Dice Evaluation
must use a more checker-efficient parser/evaluator and add boundary plus
one-beyond-bound queries for every row without raising these budgets.

## Blocking TypeScript 7 budgets

These are cold, non-incremental budgets on the reference runner with
`--checkers 1`. Time gates use the median of five fresh processes after one
unscored warm-up. Peak RSS covers the complete npm/compiler process tree.
Instantiations are compiler-reported totals and include the pinned standard
libraries.

| Case | Median check | Peak RSS | Instantiations |
| --- | ---: | ---: | ---: |
| PRNG artifact | at most 500 ms | at most 320 MiB | at most 90,000 |
| Dice artifact | at most 750 ms | at most 352 MiB | at most 165,000 |
| Both accepted artifacts | at most 1,000 ms | at most 384 MiB | at most 220,000 |
| Four-attempt Sample query | at most 600 ms | at most 320 MiB | at most 120,000 |

No individual scored TypeScript 7 run may exceed 1,500 ms. The same time,
memory, and instantiation ceilings apply to both worker policies. The combined
compiler-reported memory supporting ceiling is 160 MiB.

The portable single-query budget is at most 32,000 additional instantiations
over the relevant import-only artifact for either `Sample` or `Evaluate`; the
forced four-attempt Sample added 19,601 with one checker and 24,090 with four.

Absolute time and RSS gates only apply on a runner matching the recorded
reference class. Instantiation ceilings and successful type checking apply on
every runner. Editor behavior is represented conservatively by a cold process:
the supported Sample ceiling checked in a 504 ms single-checker median and a
234 ms default-worker median, including its imported prototype. An eventual
language-service benchmark may tighten, but not loosen, these limits.

Repeated series showed that host scheduling can reverse which worker policy is
faster. Narrower single-checker thresholds were therefore rejected after the
canonical run breached them while deterministic instantiation counts remained
unchanged. The shared operational envelope covers the worst observed series
with headroom; it is not adjusted merely to whichever policy won one run.

## Advisory TypeScript 6 budgets

The comparison lane uses the same 90,000 / 165,000 / 220,000 / 120,000
instantiation ceilings. Its median checker ceilings are 3,500 ms for either
single artifact, 3,000 ms combined, and 2,500 ms for the sampling-ceiling case.
Its corresponding peak-RSS ceilings are 384, 416, 448, and 384 MiB. These gates
diagnose migration regressions but do not block a v1 release.

## Observations

The scored options were `--ignoreConfig --pretty false --strict --noEmit
--target es2020 --module commonjs --lib es2020,dom --extendedDiagnostics`, plus
the named checker count on TypeScript 7. Each row is median with the observed
range in parentheses.

| Compiler | Case | Check ms | Peak RSS MiB | Compiler memory MiB | Instantiations |
| --- | --- | ---: | ---: | ---: | ---: |
| TS 6 package | empty | 710 (670–1,410) | 274.8 (272.3–275.0) | 107.9 | 26,941 |
| TS 6 package | PRNG | 1,030 (800–2,030) | 306.3 (304.1–307.7) | 142.0 | 74,098 |
| TS 6 package | Dice | 1,080 (890–1,270) | 352.9 (352.3–354.0) | 188.4 | 136,885 |
| TS 6 package | combined | 1,080 (1,020–1,150) | 376.0 (375.4–378.4) | 189.9 | 181,714 |
| TS 6 package | four attempts | 750 (740–770) | 319.4 (317.8–320.4) | 149.6 | 93,699 |
| TS 7.0.2, four checkers | empty | 163 (154–283) | 218.2 (213.7–234.7) | 58.5 | 27,661 |
| TS 7.0.2, four checkers | PRNG | 179 (163–302) | 253.0 (241.2–257.9) | 79.2 | 75,316 |
| TS 7.0.2, four checkers | Dice | 222 (205–250) | 285.4 (267.2–289.9) | 106.8 | 137,964 |
| TS 7.0.2, four checkers | combined | 367 (351–390) | 296.1 (287.1–308.1) | 126.7 | 185,619 |
| TS 7.0.2, four checkers | four attempts | 234 (203–429) | 250.1 (247.6–252.0) | 91.4 | 99,406 |

TypeScript 7 single-checker observations were:

| Case | Check ms | Peak RSS MiB | Compiler memory MiB | Instantiations |
| --- | ---: | ---: | ---: | ---: |
| empty | 327 (242–476) | 212.2 (208.9–215.3) | 56.3 | 26,941 |
| PRNG | 402 (346–475) | 235.9 (232.0–255.0) | 75.8 | 74,470 |
| Dice | 522 (387–745) | 264.9 (262.3–265.9) | 103.9 | 137,232 |
| combined | 658 (526–790) | 294.7 (287.8–308.4) | 124.0 | 182,433 |
| four attempts | 504 (393–729) | 249.5 (248.8–251.9) | 86.5 | 94,071 |

The reference host was Linux 7.0.14 under OrbStack, arm64, 12 logical Apple CPU
cores (the container did not expose a model string), 58.8 GiB RAM, and Node
20.20.1. The canonical complete run finished at
`2026-08-21T12:55:19.675Z`. Its raw samples are checked in as
[`results.json`](./results.json).

## General evaluator negative probe

`probe-general-scaffold.mjs` copies the accepted Dice prototype to a temporary
directory, materializes `EvaluateScaffold<"d6", InitialState, 1>`, and requires
both compilers to reproduce `TS2589`. Two consecutive probes reported stable
type and instantiation counts; operational measurements varied within these
ranges:

| Compiler | Types | Instantiations | Compiler memory | Check time |
| --- | ---: | ---: | ---: | ---: |
| TS 6 package | 546,926 | 637,251 | 565.6–571.8 MiB | 1,960–2,990 ms |
| TS 7.0.2, four checkers | 550,783 | 638,330 | 420.0 MiB | 905–1,021 ms |

This is a rejection of that private scaffold as an implementation strategy,
not a relaxation of the release target. It also demonstrates why TypeScript's
internal failure ceiling is not a product budget.

## Regression protocol

1. Run this matrix for changes to type sources, benchmark cases, compiler
   configuration, or pinned compiler artifacts.
2. Require exact type-check success and all TypeScript 7 blocking ceilings.
   Run both one- and four-checker TS7 series. Report TypeScript 6 failures
   without expanding the v1 support promise.
3. Keep the warm-up and five fresh scored processes. Do not score trace runs.
4. Diagnose a breached threshold before changing it. A budget increase requires
   a separately reviewed decision with the old and new measurements.
5. Any public-bound increase requires an at-bound success case, a one-beyond
   structured-failure case, a worst-case rejection state where relevant, and a
   complete rebaseline on every supported compiler.

Run the benchmark from the repository root:

```sh
node benchmarks/issue-11/benchmark.mjs > issue-11-results.json
node benchmarks/issue-11/check-budgets.mjs benchmarks/issue-11/results.json
node benchmarks/issue-11/check-budgets.mjs benchmarks/issue-11/results.json --reference-runner
node benchmarks/issue-11/probe-general-scaffold.mjs
```

Set `DRDICE_BENCHMARK_RUNS` only for local investigation; decision evidence and
CI use five scored runs. `DRDICE_BENCHMARK_COMPILERS` can select a comma-separated
subset for investigation. Compiler selection, parallelism, and diagnostic
caveats are sourced in
[`research/typescript-6-7-benchmarking.md`](../../research/typescript-6-7-benchmarking.md).
The portable validator always enforces compiler-specific instantiation gates;
`--reference-runner` additionally enforces time, process RSS, and compiler
memory against the recorded runner class. Issue #13 owns wiring these commands
into release CI.
