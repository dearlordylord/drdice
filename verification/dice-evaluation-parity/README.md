# Dice evaluation parity verification

This lane checks the complete `@drdice/dice` evaluator against the private,
independent Dice semantics JavaScript oracle. It materializes exact TypeScript
assertions for the reviewed Dice corpus and every supported side count from
`d1` through `d100`.

The evaluator is required to consume each die through the public PRNG `Sample`
boundary. The corpus includes every fuel value, depth-first ordering,
rejection and exhaustion paths, post-consumption resource failures, static
phase precedence, and the UTF-16/resource boundaries inherited from Dice semantics.
