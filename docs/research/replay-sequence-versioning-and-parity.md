# Replay, sequence versioning, and runtime parity

## Question

What do established seeded-generator libraries and specifications teach about
algorithm identity, Seed expansion, state serialization, sequence
compatibility, cross-runtime integer semantics, golden vectors, and versioning
when a type-level implementation must agree exactly with an internal runtime
oracle?

## Answer

DRDice should define a **versioned sequence profile**, not merely choose a PRNG
and accept a Seed. A sequence profile must pin every deterministic choice that
can change an observable Dice Evaluation:

1. Seed syntax, width, byte order, normalization, and expansion into Generator
   State;
2. the PRNG state transition and pseudorandom-word output function;
3. word width and ordering;
4. bounded-integer sampling, including rejection behavior;
5. the order and number of samples consumed by Dice Evaluation.

The profile identity and version belong in every Replay Token and serialized
Generator State. Package versions are not replay versions. Once published, a
profile's outputs should be immutable; a value-changing correction or improved
algorithm should create a new profile rather than silently redefine the old
one.

The type-level implementation and runtime oracle should be independent
implementations of this written profile. Neither defines correctness for the
other. Both should consume the same checked-in golden vectors, including
successor states and deliberately forced rejection paths.

## Evidence from existing contracts

### A Seed does not identify a sequence

The Rust Rand project states the distinction directly: seeding does not imply
reproducibility; callers need a named generator with a fixed algorithm, such as
`ChaCha12Rng`, rather than an intentionally replaceable alias such as `StdRng`.
Its reproducibility policy also distinguishes API-breaking changes from
**value-breaking** changes: unchanged source can compile yet produce a different
deterministic sequence. Portable generators and sampling algorithms are stable
across platforms and patch releases, while minor releases may make documented
value-breaking changes. [Rust Rand seeding
guide](https://github.com/rust-random/book/blob/c8d8ca7273ceb13c35d75be4a7601681567ba207/src/guide-seeding.md),
[Rust Rand reproducibility
policy](https://github.com/rust-random/book/blob/c8d8ca7273ceb13c35d75be4a7601681567ba207/src/crate-reprod.md)

Java takes the stronger compatibility position for `java.util.Random`: it
specifies the 48-bit state update and derived operations so that equal seeds and
equal method-call sequences produce equal outputs on every conforming Java
implementation. The class identity effectively names the algorithm and
contract. Newer Java APIs expose generators by explicit algorithm name and
allow algorithms to be added or deprecated instead of changing an existing
named generator. [Java `Random`
specification](https://docs.oracle.com/en/java/javase/26/docs/api/java.base/java/util/Random.html),
[Java random-generator package
specification](https://docs.oracle.com/en/java/javase/26/docs/api/java.base/java/util/random/package-summary.html)

Python illustrates a narrower promise. It reserves the right to change most
random-module algorithms and seeders, but promises a compatible seeder and
stable `Random.random()` results for the same seed. That promise does not
automatically stabilize every higher-level sampling helper. [CPython
reproducibility
contract](https://github.com/python/cpython/blob/04242c027feeff726acb15b6463422897b489bcf/Doc/library/random.rst#notes-on-reproducibility)

These precedents imply that `seed = 42` is incomplete replay information. A
DRDice Replay Token needs an explicit profile identity. A generic name such as
`default`, `current`, or `standard` would have the same replacement risk as
Rust's `StdRng`.

### The complete sampling pipeline is sequence-significant

Rust Rand treats both PRNGs and stochastic algorithms such as distributions as
potentially value-breaking, and expects portable examples of both to carry test
vectors. It specifically notes that changing an `unbiased` sampling feature
changes reproducibility. [Rust Rand reproducibility
policy](https://github.com/rust-random/book/blob/c8d8ca7273ceb13c35d75be4a7601681567ba207/src/crate-reprod.md),
[Rust Rand package
README](https://github.com/rust-random/rand/blob/bb1262f703ca04e4ce56be78e1dc4e204cd6a998/README.md)

The Java specification provides a concrete example: `Random.nextInt(bound)`
specifies both its power-of-two fast path and its rejection loop. Consequently,
bounded sampling is part of the portable sequence contract, not an incidental
wrapper around `next()`. [Java `nextInt`
specification](https://docs.oracle.com/en/java/javase/26/docs/api/java.base/java/util/Random.html#nextInt(int))

`pure-rand` demonstrates the same boundary in TypeScript. Its pure adapter
returns `[value, nextGenerator]`, while its non-regression suites record
generator and distribution outputs independently. Its bounded integer sampler
may consume more than one generator word, so preserving raw PRNG words alone
cannot preserve later state or dice results. [`pure-rand` pure
adapter](https://github.com/dubzzz/pure-rand/blob/be10b22b05c22242eb077388b0eb97882e9bbf87/src/utils/purify.ts),
[`pure-rand` bounded sampler](https://github.com/dubzzz/pure-rand/blob/be10b22b05c22242eb077388b0eb97882e9bbf87/src/distribution/internals/uniformIntInternal.ts),
[`pure-rand` non-regression
tests](https://github.com/dubzzz/pure-rand/blob/be10b22b05c22242eb077388b0eb97882e9bbf87/src/distribution/uniformInt.noreg.spec.ts)

For DRDice, changing rejection thresholds, bit selection, traversal order,
constant folding, or evaluation order can therefore be value-breaking even if
the PRNG itself is unchanged. The sequence profile must cover those choices.

### Seed expansion is an algorithm, not input cleanup

Rust's `SeedableRng::seed_from_u64` uses a deterministic expansion algorithm to
fill a generator's complete Seed while giving nearby integers good bit
avalanche. The project separately recommends fixed-size byte-array Seeds for
portable endianness, and explicit hashing when arbitrary strings must become
Seeds. [Rust Rand seeding
guide](https://github.com/rust-random/book/blob/c8d8ca7273ceb13c35d75be4a7601681567ba207/src/guide-seeding.md),
[Rust Rand 0.5 seed-format
decision](https://github.com/rust-random/book/blob/c8d8ca7273ceb13c35d75be4a7601681567ba207/src/update-0.5.md)

The current TC39 seeded-random proposal similarly distinguishes a 32-byte Seed
from a larger current state. Its constructor specifies how short Seeds are
padded, and it names ChaCha12 so the same Seed is intended to produce the same
sequence across user agents and versions. [TC39 seeded-random proposal at
commit
`e718e1d`](https://github.com/tc39/proposal-seeded-random/blob/e718e1d6a1f32cb0c275a5f9d14a34eb72fa4f09/README.md)

DRDice must specify, with vectors:

- the accepted external Seed domain;
- whether its byte order is big- or little-endian;
- how an external Seed expands into every Generator State word;
- how forbidden states, if the chosen PRNG has any, are handled;
- whether two syntactically different Seed values can normalize to one Seed.

These rules are part of the versioned profile. “Use SplitMix,” “hash the Seed,”
or “pad it” is not precise enough without the exact variant, constants, word
order, and width-normalization points.

### A Replay Token and a state snapshot serve different jobs

The TC39 proposal uses separate factory methods and sizes for a Seed and a state
snapshot. It exposes state copying specifically so a saved generator can resume
the exact sequence from its current position. [TC39 seeded-random state
proposal](https://github.com/tc39/proposal-seeded-random/blob/e718e1d6a1f32cb0c275a5f9d14a34eb72fa4f09/README.md#serializingrestoringcloning-a-prng-the-getstate-and-setstate-methods)

Rust's named ChaCha generators can reconstruct a position from the original key
plus stream and word position. This shows that a checkpoint must capture every
fact required to identify the next word, not just the original Seed. [Rust Rand
0.10 migration
guide](https://github.com/rust-random/book/blob/c8d8ca7273ceb13c35d75be4a7601681567ba207/src/update-0.10.md#clone-and-serialization-support)

DRDice should preserve the domain distinction:

- A **Replay Token** identifies the sequence from its beginning: sequence
  profile plus initialization input.
- A serialized **Generator State** resumes from a particular point: sequence
  profile plus complete current state. If an implementation buffers words or
  bits, the buffer and position are state too.

Both serialized forms need their own schema version. Their wire encoding should
be canonical and language-neutral: fixed-width hexadecimal or bytes with a
specified byte order are safer than host integers. A state payload should be a
discriminated union keyed by profile, so state words from one algorithm cannot
be paired with another algorithm identity.

### Runtime arithmetic must implement the profile's mathematical words

ECMAScript `Number` is not a generic fixed-width integer. The language does,
however, specify exact tools for common PRNG word sizes. `Math.imul` converts
both operands to unsigned 32-bit values and returns their product modulo
2^32. BigInt represents exact mathematical integers; `BigInt.asUintN` reduces a
value modulo 2^N. [ECMAScript `Math.imul`
specification](https://tc39.es/ecma262/2024/multipage/numbers-and-dates.html#sec-math.imul),
[ECMAScript `BigInt.asUintN`
specification](https://tc39.es/ecma262/2024/multipage/numbers-and-dates.html#sec-bigint.asuintn)

The runtime oracle should therefore mirror the selected word algebra exactly:

- for a 32-bit profile, use specified 32-bit operations (`Math.imul` where
  multiplication is required) and normalize signed results with `>>> 0` at
  named boundaries;
- for a 64-bit profile, use BigInt and explicitly wrap with
  `BigInt.asUintN(64, value)` wherever the profile requires modulo-2^64
  arithmetic;
- never route a 64-bit word through `Number`, JSON numeric literals, host byte
  order, or implementation-approximated floating-point operations;
- specify logical versus arithmetic shifts and the output word's byte order.

The type-level implementation should use an unsigned fixed-width
representation with the same wrap points. Parity is a relation between those
two representations and the profile's mathematical value, not between their
incidental internal shapes.

## Required parity evidence

Rust Rand's policy explicitly requires reference vectors for PRNGs where
available and value-stability vectors for other stochastic algorithms.
`pure-rand` likewise checks known generator sequences, restoration from state,
and distribution non-regression outputs. [Rust Rand reproducibility
tests](https://github.com/rust-random/book/blob/c8d8ca7273ceb13c35d75be4a7601681567ba207/src/crate-reprod.md#testing),
[`pure-rand` generator property
tests](https://github.com/dubzzz/pure-rand/blob/be10b22b05c22242eb077388b0eb97882e9bbf87/src/generator/RandomGenerator.properties.ts)

DRDice should check in a single language-neutral vector corpus with at least:

| Layer | Vector contents |
| --- | --- |
| Seed expansion | Boundary and adjacent Seeds mapped to complete initial Generator States |
| PRNG step | Input state, output word, and successor state for consecutive steps |
| State restoration | Serialized state, decoded state, and subsequent words |
| Bounded sampling | Bound, consumed words, accepted value, and successor state |
| Rejection | Crafted inputs that reject at least once before acceptance |
| Dice Evaluation | Expression, initial state, total, ordered Roll Trace, and successor state |

Include bounds of one, powers of two, non-powers of two such as 6 and 20, and
the maximum supported bound. Dice vectors should expose consumption-order
mistakes: multiple dice, both sides of subtraction, nested parentheses, and
syntax that changes grouping without changing the intended sample order.

Each implementation must independently match the corpus:

1. compile-time equality assertions evaluate the type-level implementation;
2. runtime tests evaluate the oracle;
3. a parity test confirms both projections match the same vector artifact.

Generating expected values from the runtime oracle during the test would make
the oracle self-approving and should not count as a golden test. New vectors can
be generated by a reviewable tool, but their literal results must be committed.
Where the selected PRNG has an upstream reference vector, those entries should
retain source and version metadata.

## Versioning consequences

Sequence compatibility should be stricter than ordinary source compatibility:

- A released profile is immutable across all package releases.
- Any change to Seed expansion, PRNG transition/output, bounded sampling, or
  Dice Evaluation consumption creates a new profile identity or profile
  version, even when the public TypeScript API is unchanged.
- A new default profile is a package-level breaking change, but old explicit
  profiles and their Replay Tokens should remain decodable according to the
  documented support policy.
- A Replay Token never relies on an installed package version to infer its
  profile.
- A statistically weak but correctly implemented published sequence is not
  silently “fixed.” An improved sequence is introduced alongside it. If code
  deviated from the published profile, the profile specification and reviewed
  golden vectors decide whether to repair the implementation or mint a new
  profile; the runtime implementation alone does not decide.

The eventual public shape can be decided separately, but it should have the
logical information of:

```ts
type ReplayToken = {
  readonly schemaVersion: 1
  readonly sequenceProfile: "<named-profile>@1"
  readonly seed: "<canonical-fixed-width-encoding>"
}
```

This is deliberately a profile rather than only `{ algorithm, seed }`: dice
replay depends on more than the raw-word generator.

## Decision gist

Make replay a versioned end-to-end sequence contract: canonically encode the
profile and Seed or complete Generator State, freeze every published profile,
and require the type-level and runtime implementations to pass the same
independent golden vectors for initialization, raw steps, rejection sampling,
and Dice Evaluation.
