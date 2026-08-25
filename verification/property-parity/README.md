# Exact generated compile-time/runtime parity

`pnpm check:property-parity` deterministically generates 192 structurally built
Dice Expression cases with seed `0x25d1ce5`. The independent PRNG semantics/Dice semantics
oracle chain writes each complete expected result once. Every executable shard
then uses that literal for both an exact inferred-type witness and runtime deep
equality against the lowercase public `evaluate` function.

The normal gate compiles each bounded 12-case shard once with pinned TypeScript
7.0.2 and enforces the committed shard budget. Wall time is advisory on shared
hosts and blocking on the dedicated reference runner. A failure reports the corpus-generator seed, replay path, serialized input,
actual result, and expected result. Replay one case with
`node verification/property-parity/check.mjs --replay PATH`; explicit compiler-per-case
shrinking is available with `--shrink PATH`. Generated shards are committed and
clean regeneration is blocking.

Rotating or larger local corpora can be generated explicitly with `--seed` and
`--count`; they do not change the fixed blocking corpus unless regenerated into
the committed directory.
