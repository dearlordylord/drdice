# Issue #19: unbiased bounded PRNG sampling

`Sample<GeneratorState, Bound, MaximumAttempts>` is the declaration-only PRNG
operation for exact unbiased integers in `[0, Bound)`. The public envelope is
every bound `1..100` and explicit attempt fuel `0..4`.

Sampling validates the Generator State before preflight. Invalid bounds and
fuel do not consume state. Each candidate consumes exactly one xoshiro output;
the most-significant `BoundWidth<Bound>` bits are accepted only when below the
bound. Bound one still consumes one output. Exhaustion reports the configured
fuel, exact attempts consumed, and the state after those attempts.

The private numeric oracle is [`issue-17/oracle.mjs`](../issue-17/oracle.mjs).
`pnpm generate:fixtures` uses it to emit literal exact assertions: 500 grid
shards cover all 500 bound/fuel pairs, and three special shards cover immediate
acceptance, forced rejection, exact exhaustion, state advancement, and invalid
state/bound/fuel precedence. `pnpm check:fixtures` fails if any generated file
is dirty and checks every shard under TypeScript 7.

The blocking budget lane is `pnpm check:prng:budget`. The Issue #19 half of the
lane enumerates every committed grid and special shard under one- and
four-checker TypeScript 7.0.2 policies. It checks the focused maximum-width,
four-attempt query and enforces the Issue #24 PRNG release ceiling of 750 ms
median check time, 1,500 ms single check time, 320 MiB compiler memory, and
120,000 instantiations. The blocking command performs one unscored warm-up and
five fresh scored processes for every artifact under each checker policy, and
passes `--reference-runner` so the operational ceilings are active. Its
standard library set is the pinned `ES2020` surface; no library-checking
shortcut is used. The checker rejects a reference run configured with fewer
than the required five scored processes.

The operation is deterministic and non-cryptographic. It must not be used for
secrets, security tokens, gambling, or unpredictable entropy.
