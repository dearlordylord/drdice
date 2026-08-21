# PRNG type API prototype

This directory is a throwaway issue #9 artifact on branch
`prototype/prng-type-api`. It is intentionally not a package implementation.

Issue #9 asks: what is the smallest rough type-level API artifact that makes
initialization, stepping, bounded sampling, explicit state threading, invalid
states, failures, and the runtime-oracle relationship concrete enough to accept
or revise?

## Open the logic walkthrough

Open [prng-type-api.html](./prng-type-api.html) directly in a browser. The page
contains the proposed generic aliases and a materialized literal result, then
drives a pure in-memory model through:

- initialization, raw stepping, d6 bounded sampling, and explicit successor
  state;
- high-bit rejection and attempt-fuel exhaustion;
- all-zero Seed and Generator State failures, invalid bounds, and bound-one
  consumption;
- invalid attempt-fuel values;
- deterministic reset and free-play controls;
- ordered one-button guided transitions, plus Replay Token (restart) versus
  Serialized Generator State (resume); and
- the internal runtime-oracle boundary.

## Check the type artifact

From the repository root:

```sh
npx --yes -p typescript@5.9.3 tsc --pretty false --strict \
  --target es2020 --module commonjs --noEmit \
  prototypes/prng-type-api.ts
```

This compiles the fixed-width type operations and compile-time probes. To run the
independent runtime oracle and its literal golden vectors:

```sh
outdir=$(mktemp -d)
npx --yes -p typescript@5.9.3 tsc --pretty false --strict \
  --target es2020 --module commonjs --outDir "$outdir" \
  prototypes/prng-type-api.ts
node "$outdir/prng-type-api.js"
```

Expected output:

```
PRNG prototype vectors passed; type-level assertions compiled.
```

The HTML's model and the TypeScript oracle both use specified 32-bit operations,
but they are separate from the type-level aliases. The checked-in expected
vectors are literals rather than values generated from one implementation.

## Decision suggested

The smallest acceptable public shape is:

```ts
Initialize<SeedWords>
  -> Success<GeneratorState> | InvalidSeedFailure

Next<GeneratorState>
  -> Success<{ word: Word32; state: GeneratorState }> | InvalidStateFailure

Sample<GeneratorState, Bound, MaximumAttempts>
  -> Success<{ value: number; state: GeneratorState; attempts: number }>
   | InvalidStateFailure
   | InvalidBoundFailure
   | InvalidAttemptFuelFailure
   | SamplingAttemptsExhausted<{
       maximumAttempts: number; attempts: number; state: GeneratorState
     }>
```

The prototype suggests keeping Seed and Generator State as distinct tagged
domain types, representing words canonically as lowercase eight-digit hex at the
boundary, and making all state advancement visible in every success or
exhaustion result. It also suggests that the release implementation should retain
the fixed-width bit-tuple arithmetic used here while moving the oracle and vectors
to internal test modules. Preflight order is state validity, bound validity,
maximumAttempts validity, then stepping/rejection; this order is shared by the
type-level sampler, HTML model, and runtime oracle.

`ReplayToken<W>` and `SerializedGeneratorState<W>` only materialize for a literal
four-word tuple that passes the lowercase eight-hex validation; arbitrary string
tuples and all-zero tuples resolve to `never` in this prototype. Runtime restore
probes check the profile and schema version before restoring. The runtime
serializer and restorer return structured success/invalid-state results rather
than emitting or accepting a malformed snapshot.

This does not choose final package exports, checker budgets, compiler support, or
dice integration; those remain implementation/release decisions for later issues.
