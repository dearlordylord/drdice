# Issue #18: declaration-only PRNG implementation checks

The production PRNG root in `packages/prng/dist/index.d.ts` exposes only the
literal type API. Its private fixed-width arithmetic and validation aliases are
not exported, and no runtime implementation is shipped. The public operations
are `Initialize`, `Next`, `ReplayToken`, `RestoreReplay`,
`SerializedGeneratorState`, `RestoreState`, and `SerializeState`.

Replay restoration restarts by initializing the token's Seed. Serialized-state
restoration resumes the supplied current Generator State without consuming a
word. Both schemas carry `schemaVersion: 1` and the immutable
`xoshiro128ss-1.1/warmup16-msb-chunk-rejection-2` Sequence Profile. Shape, canonical
lowercase Word32 text, and all-zero checks return structured failures before a
transition is evaluated.

`pnpm generate:fixtures` produces exact assertions from the independent
Issue #17 golden corpus. Each of the ten raw transitions is a separate
generated artifact, and replay/serialized-state assertions are kept in an
additional artifact. This keeps every checker artifact within the accepted
Issue #11 PRNG instantiation ceiling; the corpus is not treated as one budget
artifact. `pnpm check:fixtures` checks that this generated set is clean and
typechecks every shard under TypeScript 7.

`pnpm check:prng:budget` requires TypeScript 7.0.2 and enumerates the focused
query plus all eleven generated #18 artifacts under both checker policies. It
always enforces the deterministic 320 MiB compiler-memory and
90,000-instantiation ceilings. The blocking package command performs one
unscored warm-up and five fresh scored processes per artifact/policy and passes
`--reference-runner` to enforce the 750 ms median check ceiling and 1,500 ms
single-run ceiling. `budget.ts` remains a small focused probe, while the
blocking artifact list is the generated corpus. The recorded per-artifact run
is [`results.json`](./results.json):

| checker policy | maximum check | maximum memory | maximum instantiations |
| --- | ---: | ---: | ---: |
| `--checkers 1` | 408 ms | 73,379 KiB | 66,850 |
| `--checkers 4` | 452 ms | 77,340 KiB | 70,427 |

TypeScript 6 remains advisory migration evidence under the workspace policy;
the Issue #18 blocking lane is pinned to TypeScript 7.0.2.
