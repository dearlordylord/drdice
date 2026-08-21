# TypeScript 6/7 benchmark tooling research

Research date: 2026-08-21

## Decision-ready summary

Benchmark the accepted prototypes against these exact stable compilers:

| Line | Exact package | Executable |
| --- | --- | --- |
| TypeScript 6 | `@typescript/typescript6@6.0.2` | `tsc6` |
| TypeScript 7 | `typescript@7.0.2` | `tsc` |

TypeScript 7.0.2 is the npm registry's current `latest` release and publishes the `tsc` binary ([npm registry metadata](https://registry.npmjs.org/typescript/latest)). The TypeScript team explicitly introduced `@typescript/typescript6` for running the maintained 6.0 compiler beside 7.0; it publishes `tsc6`, and the team's side-by-side example pins the two lines at `^6.0.2` and `^7.0.2` ([TypeScript 7.0 announcement](https://devblogs.microsoft.com/typescript/announcing-typescript-7-0/#running-side-by-side-with-typescript-60)). For reproducible benchmark evidence, use exact versions rather than those ranges.

Suggested isolated invocations, without changing the repository manifest:

```sh
npm exec --yes --package=@typescript/typescript6@6.0.2 -- tsc6 --version
npm exec --yes --package=typescript@7.0.2 -- tsc --version
```

Do not use `@typescript/native-preview` for the accepted TypeScript 7 result. It was the pre-release vehicle. Stable 7 is now the ordinary `typescript` package, while future nightlies move through `typescript@next` ([TypeScript 7.0 announcement](https://devblogs.microsoft.com/typescript/announcing-typescript-7-0/#nightly-builds-and-typescriptnative-preview)). As of the research date, `next` is a moving 7.1 development build, so it answers a different question from stable 7.0 support.

## Measurement invocation

Use an explicit, identical option set and input list for both compilers. In TypeScript 6, passing source filenames in a directory that contains a `tsconfig.json` requires `--ignoreConfig`; the flag makes the intended command-line-only configuration explicit ([TypeScript 6.0 announcement](https://devblogs.microsoft.com/typescript/announcing-typescript-6-0/#notable-behavioral-changes)). A suitable common shape is:

```sh
npm exec --yes --package=@typescript/typescript6@6.0.2 -- \
  tsc6 --ignoreConfig --strict --noEmit --extendedDiagnostics PROTOTYPE.ts

npm exec --yes --package=typescript@7.0.2 -- \
  tsc --ignoreConfig --strict --noEmit --extendedDiagnostics \
  --checkers 4 PROTOTYPE.ts
```

`--extendedDiagnostics` is the primary compiler report: the TypeScript performance guidance recommends it to show where compilation time is spent and includes it in the evidence requested for compiler performance reports ([TypeScript Performance wiki](https://github.com/microsoft/TypeScript/wiki/Performance#extendeddiagnostics)). Capture the full output, especially `Check time`, `Total time`, `Memory used`, `Types`, and `Instantiations` when present.

For investigation of a surprising threshold or hot spot, make a separate, unscored trace run:

```sh
npm exec --yes --package=typescript@7.0.2 -- \
  tsc --ignoreConfig --strict --noEmit --checkers 4 \
  --generateTrace TRACE_DIRECTORY PROTOTYPE.ts
```

`--generateTrace` produces event and type data that can be inspected in Chromium tooling or with `@typescript/analyze-trace` ([TypeScript Performance wiki](https://github.com/microsoft/TypeScript/wiki/Performance#performance-tracing)). Do not time the trace-producing invocation as the benchmark sample: trace generation adds instrumentation and output work. The trace format is explicitly unstable across versions, so trace files are diagnostic artifacts, not a cross-version numeric contract ([TypeScript Performance Tracing wiki](https://github.com/microsoft/TypeScript/wiki/Performance-Tracing)).

Also record compiler version, Node version, operating system, CPU model/count, and available memory with every result. Run repeated fresh processes, include a warm-up, and report a robust aggregate such as median plus the observed range. These controls are recommendations inferred from the compilers' different runtimes and execution models, not TypeScript compatibility guarantees.

## Comparability caveats

### Parallelism must be fixed

TypeScript 6 is the final JavaScript-based compiler; TypeScript 7 is a native Go port with shared-memory parallelism ([TypeScript 6.0 announcement](https://devblogs.microsoft.com/typescript/announcing-typescript-6-0/), [TypeScript 7.0 announcement](https://devblogs.microsoft.com/typescript/announcing-typescript-7-0/)). TypeScript 7 defaults to four checker workers. More workers can reduce time while increasing memory, and workers can duplicate common checking work; the team therefore exposes `--checkers`, with `--checkers 1` effectively single-threading checking, plus `--singleThreaded` to disable parallelism entirely ([TypeScript 7.0 announcement](https://devblogs.microsoft.com/typescript/announcing-typescript-7-0/#custom-scaling-parallelization-and-controls)).

For product-realistic supported budgets, score TypeScript 7 with its default behavior made explicit as `--checkers 4`. Optionally publish a second `--singleThreaded` diagnostic result to distinguish native-code gains from parallel gains. Never mix checker counts within a result series. On constrained CI, a fixed `--checkers 1` policy is defensible, but it is a different supported environment and needs its own limits.

### Type-checking compatibility is close, not metric identity

TypeScript 6's `--stableTypeOrdering` makes its ordering behavior closer to 7, but the TypeScript team warns it can slow checking by up to 25% and says it is a migration diagnostic rather than a long-term option ([TypeScript 6.0 announcement](https://devblogs.microsoft.com/typescript/announcing-typescript-6-0/#the-stabletypeordering-flag)). Therefore:

- use ordinary TypeScript 6.0.2 for the scored 6.x support budget;
- run `--stableTypeOrdering` separately only to investigate a 6/7 semantic discrepancy;
- do not compare a stable-ordering TypeScript 6 timing directly with an ordinary TypeScript 7 timing.

Because TypeScript 7 partitions work across checker workers and may duplicate common work, `Types`, `Symbols`, `Instantiations`, and compiler-reported memory are implementation-sensitive counters. This is an inference from the official worker design, not a claim that the counters have a documented shared meaning. Set and enforce per-compiler ceilings; do not require TypeScript 6 and 7 to report identical counts for the same source. Use process-level peak resident memory as the primary operational memory ceiling if available, retaining `Memory used` as compiler-specific supporting evidence.

### Configuration must be explicit

TypeScript 6 changed defaults including `strict: true`, `module: esnext`, `target: es2025`, and `types: []`; TypeScript 7 adopts the 6.0 defaults and turns 6.0-deprecated options into hard errors ([TypeScript 6.0 announcement](https://devblogs.microsoft.com/typescript/announcing-typescript-6-0/#simple-default-changes), [TypeScript 7.0 announcement](https://devblogs.microsoft.com/typescript/announcing-typescript-7-0/#updates-since-5x-and-new-behaviors-from-60)). Even when current defaults happen to agree, specify all benchmark-relevant options so future patch or minor releases do not silently change the corpus.

`skipLibCheck` materially changes the workload and should not be toggled between runs. Likewise, pin the selected `lib` and `types` inputs if the benchmark is meant to become a durable CI budget; otherwise standard-library changes can alter counts independently of prototype changes. These are benchmark-design inferences based on the official warning that included declaration files affect compiler work ([TypeScript Performance wiki](https://github.com/microsoft/TypeScript/wiki/Performance#configuring-tsconfigjson-or-jsconfigjson)).

### The API boundary differs

TypeScript 7.0 does not provide a stable programmatic compiler API; 6.0 remains available for tools that depend on that API ([TypeScript 7.0 announcement](https://devblogs.microsoft.com/typescript/announcing-typescript-7-0/#running-side-by-side-with-typescript-60)). These prototypes are suitable for CLI `tsc` comparison. A passing TypeScript 7 CLI benchmark does not establish compatibility for tooling that embeds the compiler.

## Implications for issue #11

The supported-bound decision should contain four independent assertions for each prototype and compiler line:

1. the largest accepted type-level input bound that still type-checks;
2. a checker-time ceiling measured under a named checker policy;
3. a process peak-memory ceiling, with compiler `Memory used` retained as context;
4. a compiler-specific instantiation ceiling with headroom above the repeated-run observation.

Pin the baseline to TypeScript 6.0.2 and 7.0.2. Re-benchmark before widening either supported version range. Treat `typescript@next` as an optional forward-compatibility signal, never as evidence for the stable 7.0 budget.
