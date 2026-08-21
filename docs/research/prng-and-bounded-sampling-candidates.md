# Type-level PRNG and bounded-sampling candidates

## Decision

Prototype **xoshiro128\*\* 1.1** as DRDice's first generator and pair it with
**high-bit bitmask rejection** for bounded integers. Do not yet call the
algorithm selected for release: first prove the type-level implementation fits
the checker budget and agrees bit-for-bit with a runtime mirror. If it does,
the public reproducibility identity should name both the generator and sampler,
for example `xoshiro128ss-1.1/high-bit-rejection-1`.

This pair best balances credible non-cryptographic output with operations that
can be represented as fixed-size bit tuples in TypeScript:

- the generator transition uses 32-bit XOR, fixed shifts, and rotation;
- its output scrambler's multiplication by 5 and 9 can be implemented modulo
  2^32 as `x + (x << 2)` and `x + (x << 3)`, so it needs two fixed-width
  additions rather than a general multiplier;
- the sampler needs bit-width selection, high-bit extraction, unsigned
  comparison, and recursion, but neither division nor multiplication;
- generator state is four 32-bit words, with the all-zero tuple excluded;
- every attempt consumes exactly one generator output, including an attempt for
  a bound of one. Rejections therefore advance state and are part of replay.

This is a non-cryptographic choice. The algorithm authors describe the
xoshiro family on their [PRNG shootout](https://prng.di.unimi.it/) and explicitly
identify xoshiro128\*\* as a 32-bit all-purpose generator; they report that their
32-bit `**` variant passes all tests known to them. It is not suitable for
security, gambling, secrets, or adversarial unpredictability.

## Why xoshiro128\*\* 1.1 leads

The authors' [public-domain reference implementation](https://prng.di.unimi.it/xoshiro128starstar.c)
is a compact normative definition. Version 1.1 produces a 32-bit word from four
32-bit state words as follows:

```text
output = rotl32(s1 * 5, 7) * 9
t = s1 << 9
s2 ^= s0
s3 ^= s1
s1 ^= s2
s0 ^= s3
s2 ^= t
s3 = rotl32(s3, 11)
```

The retrieved reference source's SHA-256 was
`2e3e540e15e1b1edf6144509ba3a71bc4611e3676d52e03d567a0f230a141a67`
on 2026-08-20. The implementation should vendor or otherwise pin the normative
source rather than assume the mutable URL will never change.

Every operation is modulo or constrained to 32 bits. The reference source also
records an important precedent for versioning: version 1.0 accidentally fed
`s0`, rather than `s1`, to the scrambler. DRDice must pin **1.1**, not merely
the family name. The same source requires a state that is not everywhere zero,
so the public state constructor must parse and reject `[0, 0, 0, 0]`; typed
internals should accept only the resulting nonzero-state type.

The authors report a period of 2^128 - 1 for the 128-bit xoroshiro/xoshiro
family and describe the `**` scrambler as maximally equidistributed for its
state/output size in their [published assessment](https://prng.di.unimi.it/).
Their paper, [*Scrambled Linear Pseudorandom Number Generators*](https://arxiv.org/abs/1805.01407),
describes the linear engines and nonlinear scramblers, including their proved
properties and statistical testing. These are substantially stronger grounds
than inventing a small type-checker-friendly recurrence.

The reference implementation does not publish a test-vector table. These first
six outputs were obtained by compiling the retrieved 1.1 reference C and
starting it at state
`[0x00000001, 0x00000002, 0x00000003, 0x00000004]`; they should become
conformance fixtures:

```text
00002d00 00000000 005a7080 04389d80 79199d9b 61963b24
```

Release conformance fixtures must cover outputs **and successor states**, and
must run against both the type-level and runtime implementations. Copying only
the output values would miss state-transition disagreement that appears later.

## Candidate comparison

| Candidate | Statistical and specification basis | Type-level cost | Decision |
| --- | --- | --- | --- |
| **xoshiro128\*\* 1.1** | Authors call it a 32-bit all-purpose generator and publish exact versioned reference C; 128-bit nonzero state | Four 32-bit words; XOR/shift/rotate plus two 32-bit adds after reducing `*5` and `*9` | **Prototype** |
| [xoshiro128++](https://prng.di.unimi.it/xoshiro128plusplus.c) | Same 128-bit engine and reported all-purpose quality; output uses rotate and two additions | Essentially the same fixed-width cost, but the authors report one dimension less equidistribution for `++` than `**` | Keep as fallback if the `**` scrambler unexpectedly checks worse |
| [xoshiro128+](https://prng.di.unimi.it/xoshiro128plus.c) | Cheaper one-add output | Authors reserve it for floating-point generation and report low-bit linearity failures in 32-bit variants | Reject for general integer dice |
| [xoroshiro64\*\*](https://prng.di.unimi.it/xoroshiro64starstar.c) | Only two 32-bit state words | Reference scrambler uses multiplication by the large constant `0x9E3779BB`, requiring a general fixed-width multiply; smaller period/state | Reject: less state does not yield a cheaper useful type encoding |
| Plain xorshift32 | One word and three XOR-shifts; period 2^32 - 1 for a valid parameter triple | Cheapest credible implementation exercise | Reject as the product generator: Panneton and L'Ecuyer report that most three-shift xorshift generators fail simple statistical tests in [their analysis](https://doi.org/10.1145/1113316.1113319) |
| PCG32 XSH-RR | Published algorithm, streams, repeatability, and demo vectors | Its [minimal reference implementation](https://www.pcg-random.org/download.html) advances a 64-bit LCG with multiplication by `6364136223846793005`, addition, variable shifts, and rotation | Reject for the first type-level generator: general 64-bit multiplication dominates checker work |
| [SplitMix64](https://prng.di.unimi.it/splitmix64.c) | Authors of xoshiro recommend it for expanding a 64-bit seed into state | 64-bit additions, XOR-shifts, and two general 64-bit multiplications | Reserve for a later ergonomic seeding boundary, not the initial generator or type-level hot path |
| [Mersenne Twister](https://www.math.sci.hiroshima-u.ac.jp/m-mat/MT/emt.html) | Published reference implementation and period of 2^19937 - 1 | 19,937-bit state and indexed state recurrence | Reject as categorically mismatched to type-level cost |

The recommendation is deliberately not xorshift32 merely because it is easy.
The goal is a credible dice generator whose implementation happens to run in
the type system, not a demonstration that recursive conditional types are
Turing-complete.

## Bounded sampling

For a positive bound `m`, define `k = ceil(log2(m))`. Each attempt:

1. advances xoshiro128\*\* exactly once;
2. takes the most-significant `k` bits of that 32-bit output;
3. accepts the candidate when it is less than `m`;
4. otherwise recurs with the successor state and one less unit of fuel.

The accepted result lies in `[0, m)`. Dice convert it to `[1, m]` only at the
dice boundary. Selecting high bits is an intentional part of sampler version 1,
not an implementation detail.

Bitmask rejection is unbiased because the `2^k` equally sized bit patterns
contain each accepted value exactly once; the surplus patterns are discarded.
The [PCG bounded-range comparison](https://www.pcg-random.org/posts/bounded-rands.html)
describes and implements the equivalent mask-and-reject method, and contrasts
it with biased modulo, debiased modulo, and Lemire's multiplication method.

| Sampler | Correctness | Type-level implications | Decision |
| --- | --- | --- | --- |
| `output % m` | Biased unless `m` divides 2^32 | Requires general remainder and is still wrong | Reject |
| Threshold/debiased modulo | Unbiased | Requires remainder/division to calculate the threshold and result | Reject initially |
| Lemire multiply-high with rejection | Unbiased; supported by [Lemire's published analysis](https://arxiv.org/abs/1805.10941) | Requires a 32-by-32-to-64-bit multiply and threshold remainder | Reject initially; attractive for runtime-only systems, not this shared algorithm |
| **High-bit bitmask rejection** | Unbiased | Bit slicing, comparison, and bounded recursion only | **Adopt for the prototype** |

For ordinary dice the acceptance probabilities are straightforward: d6 accepts
6/8 outputs, d20 accepts 20/32, and d100 accepts 100/128. For every positive
bound, acceptance is greater than one half unless the bound is a power of two,
when it is one. Consequently, under an ideal uniform-output model, exhausting
`F` attempts has probability less than `2^-F`. That probability does **not**
justify hiding exhaustion: this is deterministic software, and a seed producing
`F` consecutive rejections can exist.

The type-level operation should therefore be total and explicit:

```text
sample(state, bound, fuel) ->
  success(value, successorState, attempts)
  | exhausted(successorState, attempts)
  | invalidBound
```

`fuel = 0` exhausts without consuming state. Positive fuel consumes one state
per attempt. Bound one still consumes one output and returns zero. No fallback
to modulo, clamping, or reuse of a rejected word is allowed. Runtime mirroring
must use the identical fuel and consumption rules when exact replay with the
type-level evaluator is requested.

Do not add a bit reservoir in version 1. Although reusing unused output bits can
reduce generator calls, it enlarges public replay state and creates order and
packing semantics that both implementations must preserve forever.

## Checker-cost boundary

Represent each word as a fixed 32-element bit tuple rather than a TypeScript
numeric literal. The reusable primitive layer should contain only operations
whose cost is bounded by word width: XOR, shift, rotate, add-with-carry,
high-bit extraction, bit length, and unsigned comparison. State transition
should not recurse over the number of generated outputs; orchestration and
rejection do, with explicit fuel.

This constraint is architectural, not just an optimization. TypeScript's own
[recursive conditional type documentation](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-1.html#recursive-conditional-types)
warns that recursive types increase checking time, can reach internal recursion
limits, and are unsuitable for shipping when realistic inputs fail. TypeScript
4.5 added [tail-recursion elimination for conditional types](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-5.html#tail-recursion-elimination-on-conditional-types),
but still retains heuristics and limits. The implementation prototype must set
an evidence-based dice/fuel budget using compiler diagnostics and wall-clock
tests; this research cannot responsibly invent that number.

## Reproducibility contract implied by the choice

A replay token is incomplete unless it fixes all of:

- generator identity and exact version (`xoshiro128** 1.1`);
- four-word nonzero starting state and canonical word/bit order;
- sampler identity and version (`high-bit rejection 1`);
- bound interpretation (`[0, m)`, then dice adds one);
- fuel and exhaustion semantics;
- state consumption for rejection and bound one.

Changing any item can change later rolls from the same seed and is therefore a
breaking sequence change. Runtime integer operators must be normalized to
unsigned 32-bit results at every step rather than relying on JavaScript's signed
display of bitwise values.

## Prototype acceptance gates

Promote this pair from candidate to release algorithm only when a focused
prototype demonstrates all of the following:

1. Type-level and runtime results agree on reference outputs and successor
   states, including carry-heavy and rotation-heavy fixtures.
2. The all-zero state is rejected at the boundary and cannot reach `next`.
3. Exhaustion, rejection, powers of two, d1, d6, d20, and the largest supported
   bound have exact cross-implementation fixtures.
4. Exhaustive tests over a reduced-width model establish bounded-sampler
   uniformity and state consumption; statistical tests of the full generator
   validate the port rather than claim to re-prove the published algorithm.
5. Compiler diagnostics establish supported expression and fuel budgets on the
   minimum supported TypeScript version.

If xoshiro128\*\* fails the checker-cost gate, prototype xoshiro128++ next. Do
not silently retreat to plain xorshift32; failure of both credible 128-bit
candidates should reopen the product tradeoff between statistical quality and
type-level ambition.
