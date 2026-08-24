# @drdice/prng

`@drdice/prng` is the declaration-only package for DRDice's literal-computing
Seeded PRNG. It is intended for reproducible games, tests, and TypeScript
type-system experimentation; it is not a source of cryptographic randomness,
secrets, security tokens, gambling outcomes, or unpredictable entropy.

The v1 implementation is checked by exactly `typescript@7.0.2`. The pinned
`@typescript/typescript6@6.0.2` lane is advisory migration evidence only.

Only the package root is public. Consumers use type-only imports from
`@drdice/prng`; runtime imports and deep imports are unsupported.
