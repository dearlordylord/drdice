# Issue #18: declaration-only PRNG implementation checks

The production PRNG root in `packages/prng/dist/index.d.ts` exposes only the
literal type API. Its private fixed-width arithmetic and validation aliases are
not exported, and no runtime implementation is shipped. The public operations
are `Initialize`, `Next`, `ReplayToken`, `RestoreReplay`,
`SerializedGeneratorState`, `RestoreState`, and `SerializeState`.

Replay restoration restarts by initializing the token's Seed. Serialized-state
restoration resumes the supplied current Generator State without consuming a
word. Both schemas carry `schemaVersion: 1` and the immutable
`xoshiro128ss-1.1/direct128-msb-rejection-1` Sequence Profile. Shape, canonical
lowercase Word32 text, and all-zero checks return structured failures before a
transition is evaluated.

`pnpm generate:fixtures` produces exact assertions from the independent
Issue #17 golden corpus. The ten raw transitions are split into four generated
shards so each checker artifact stays within the accepted Issue #11 PRNG
instantiation ceiling; the replay and serialized-state assertions are kept in a
separate shard. `pnpm check:fixtures` checks that this generated set is clean
and typechecks every shard under TypeScript 7.

The focused budget query is `budget.ts`. `pnpm check:prng:budget` requires
TypeScript 7.0.2 and enforces the accepted Issue #11 ceilings of 500 ms check
time, 320 MiB compiler memory, and 90,000 instantiations for both checker
policies. The recorded run is [`results.json`](./results.json):

| checker policy | check time | memory | instantiations |
| --- | ---: | ---: | ---: |
| `--checkers 1` | 249 ms | 80,979 KiB | 84,075 |
| `--checkers 4` | 251 ms | 83,352 KiB | 87,392 |

TypeScript 6 remains advisory migration evidence under the workspace policy;
the Issue #18 blocking lane is pinned to TypeScript 7.0.2.
