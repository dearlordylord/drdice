# Issue #12: correctness and runtime parity

Decision date: 2026-08-21

This directory records the verification obligations accepted for GitHub issue
#12. They are release criteria for the eventual production implementation, not
evidence that the issue #9 and #10 planning prototypes are release-ready.
Issue #13 owns package, export, clean-consumer, and CI wiring.

The machine-readable summary is [`gates.json`](./gates.json).

## Claims

DRDice may describe bounded sampling as unbiased when the implementation uses
the accepted high-bit rejection algorithm and passes the deterministic gates
below. The claim rests on the simple construction: choose the smallest `k`
such that `2^k >= bound`, take a uniformly distributed `k`-bit candidate, and
reject candidates outside `[0, bound)`. Every accepted face is therefore
represented by exactly one candidate. Rejected words advance Generator State.

This rationale, implementation review, and deterministic boundary/property
tests are sufficient for v1. A statistical suite is optional, non-blocking
smoke evidence; it is neither a proof of unbiasedness nor release evidence.

Stable reproducibility means exact agreement when the algorithm profile,
initial Seed or Generator State, Dice Expression, and operation options match.
Agreement covers sampled values, attempt counts, Roll Trace order, totals,
successor state, failure variant, diagnostic code, and structured diagnostic
details. Diagnostic prose and performance are not sequence identity.

Any change to PRNG stepping, Seed initialization, bounded sampling, rejected
state consumption, parsing, evaluation order, arithmetic semantics, or failure
selection requires a new profile identity. Refactoring and checker-performance
work may retain an identity only when every exact gate remains unchanged.

The accepted PRNG profile remains
`xoshiro128ss-1.1/direct128-msb-rejection-1`. A future production design must
also version the Dice grammar and evaluation semantics; issue #13 may choose
the final token shape, but it must make the complete identity available to
replay callers.

## Independent oracle and parity bridge

The JavaScript PRNG, parser, and evaluator are internal test oracles rather
than a promised runtime API. Their control flow must remain independent of the
type implementation. Sharing language-neutral vector data and public result
shapes is allowed; sharing the arithmetic, parser, evaluator, or sampling
implementation defeats the oracle boundary.

TypeScript types are erased, so a type-level result cannot be passed directly
to JavaScript. Exact parity is nevertheless mechanical:

1. Run the pinned JavaScript oracle over a deterministic, versioned input
   corpus.
2. Generate TypeScript containing literal inputs, oracle-produced literal
   expected results, and exact type-equality assertions.
3. Check the generated shards with the supported `typescript@7.0.2` compiler
   and `--noEmit`.
4. Fail if generation is dirty, a shard does not check, the oracle disagrees
   with a committed vector, or any exact result field differs.

The generated file is the compile/runtime bridge; the TypeScript Compiler API
is not needed. Exact closed records and tuples use a guarded `Equal`/`Assert`
check or bidirectional assignability. `@ts-expect-error` is reserved for
negative public API calls because it proves only that some compiler diagnostic
occurred, not a stable code or message.

A small committed, language-neutral golden corpus is reviewed separately from
generated cases. It prevents coordinated changes to both implementations from
silently blessing new behavior.

## Blocking suites

### Canonical vectors

The committed corpus must include:

- the authors' xoshiro128** 1.1 transition and the established direct-Seed
  vector for words `1, 2, 3, 4`, encoded by DRDice as
  `00000001/00000002/00000003/00000004`;
- at least the first ten output words from that Seed—`11520`, `0`, `5927040`,
  `70819200`, `2031721883`, `1637235492`, `1287239034`, `3734860849`,
  `3729100597`, and `4258142804`—plus the exact first three successor states;
- bound 1 consumption, bounds 2 and 100, a power-of-two bound, and bounds on
  both sides of a power of two;
- immediate acceptance, forced rejection followed by acceptance, and exact
  exhaustion after zero through four attempts;
- Replay Token restart and Serialized Generator State resume behavior;
- representative successful expressions with exact totals, ordered traces,
  attempt counts, and successor states; and
- one canonical example for every public failure variant and every specified
  failure-precedence collision.

Golden expectations must be literal data, not values imported from or
calculated by either implementation during the test.

### Exhaustive bounded checks

Exhaustive means the finite public dimensions, not all 128-bit states or all
Dice Expressions:

- every sampling bound and Die side count from 1 through 100;
- every `maximumAttempts` value from 0 through 4;
- each resource dimension at its accepted limit and one beyond it;
- every grammar production in valid and invalid positions;
- every supported whitespace code point and representative rejected Unicode
  whitespace;
- every diagnostic/failure variant; and
- every documented precedence pair or tie-break class.

The bound/attempt grid must include deterministic states that exercise
immediate acceptance, rejection where the bound permits it, exact exhaustion,
and state advancement. It need not form a Cartesian product with the complete
Dice resource envelope.

### Deterministic properties

Runtime property tests use fixed seeds and a recorded corpus version. They
must check:

- `0 <= sample < bound` and `1 <= face <= sideCount`;
- accepted and rejected draws advance the state exactly once per attempt;
- invalid preflight input consumes no state;
- exhaustion reports the exact consumed attempt count and advanced state;
- replay restarts and serialized state resumes at the next word;
- evaluation is deterministic, depth-first, and left-to-right;
- Roll Trace order equals Generator State-consumption order;
- a success total agrees with its parsed AST and trace;
- failure selection is independent of checker evaluation accidents; and
- serialize/restore and parse/print fixtures round-trip where defined.

The generated type-parity corpus covers representative seeds, expressions,
successes, failures, precedence collisions, and resource boundaries. It is
deterministic, sharded, and capped by the issue #11 checker budgets. Corpus
growth may be split between change and release lanes; it may not weaken the
canonical or exhaustive finite checks.

### Parser and type assertions

Parser cases cover complete-input consumption, ASCII SP/TAB/LF/CR whitespace,
case handling for `d`, numeric-token boundaries, nesting, source length in
UTF-16 code units, invalid tokens, unexpected EOF, source offsets, full-AST
domain validation, static-resource precedence, and post-consumption dynamic
failure.

Type assertions compare the complete discriminated result. Success assertions
include total, every Die Sample in order, and successor state. Failure
assertions include the exact variant, code, structured details, and any
specified attempts, partial trace, or retained state. Comparing only totals,
assignability to a broad result union, or duplicated handwritten expectations
does not satisfy parity.

## Compatibility and cadence

All blocking semantic suites run with the exact TypeScript support baseline
accepted by issue #11: `typescript@7.0.2`. TypeScript 6 remains advisory. A
new compiler version is unsupported until the complete parity suite and the
issue #11 performance matrix pass and are recorded.

Normal changes block on committed golden vectors, exhaustive finite checks,
parser/type assertions, and checker-budgeted parity shards. Release candidates
also block on the complete deterministic generated corpus. Larger scheduled
runs may improve diagnosis but cannot replace either blocking lane.

Release acceptance requires all blocking suites to pass from a clean checkout,
no unexplained generated diff, the exact supported compiler identity, the
accepted profile identity, and the issue #11 resource/performance gates. Any
golden-vector or profile change requires separately reviewed old/new evidence.

## Primary references

- Blackman and Vigna's public-domain
  [xoshiro128** 1.1 reference implementation](https://prng.di.unimi.it/xoshiro128starstar.c)
  fixes the transition/output algorithm. Its note distinguishing the erroneous
  1.0 scrambler is why the DRDice identity includes `1.1`.
- The [xoshiro family reference page](https://prng.di.unimi.it/) records the
  authors' algorithms and usage guidance. It does not define DRDice's direct
  four-word initialization; that remains an explicit part of the profile.
- The Rust Random project's independent
  [xoshiro128** tests](https://github.com/rust-random/rngs/blob/master/rand_xoshiro/src/xoshiro128starstar.rs#L1083-L1105)
  publish the ten-word direct-Seed vector used above.
- TypeScript documents [`--noEmit` project checking](https://www.typescriptlang.org/docs/handbook/compiler-options.html),
  [`as const` literal preservation](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-4.html),
  [`@ts-expect-error`](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-9.html),
  and [type erasure](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html).

Alternative bounded-random algorithms, including threshold/modulo rejection
and multiply-high rejection, are established elsewhere. They are not silently
substitutable for the accepted MSB-rejection profile: adopting one changes
sequence identity and requires a new profile plus new golden vectors.
