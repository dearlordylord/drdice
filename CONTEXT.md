# DRDice

DRDice provides reproducible, non-cryptographic pseudorandom sampling and dice
expression evaluation through TypeScript's type system.

## Language

**Seeded PRNG**:
A deterministic generator whose explicit state produces a reproducible sequence
of pseudorandom words.
_Avoid_: DRNG, DRBG, random number generator

**Seed**:
The external value used to initialize a Seeded PRNG's first Generator State.
_Avoid_: State, random seed

**Generator State**:
The complete value needed to produce the next pseudorandom word and its next
Generator State.
_Avoid_: Seed, cursor

**Next Generator State**:
The Generator State produced by consuming a PRNG operation or Dice Evaluation
and used as the input to a later operation.
_Avoid_: Successor State, continuation state

**Replay Token**:
The algorithm identity, algorithm version, and initialization input sufficient to
reproduce a pseudorandom sequence.
_Avoid_: Seed

**Dice Expression**:
A literal program describing dice samples and integer arithmetic.
_Avoid_: Dice string, roll string

**Die Sample**:
One unbiased integer outcome in the inclusive range from one through a die's side
count.
_Avoid_: Random number, die roll

**Roll Trace**:
The ordered Die Samples consumed while evaluating a Dice Expression.
_Avoid_: History

**Dice Evaluation**:
The deterministic result containing a total, Roll Trace, and Next Generator
State for a Dice Expression and initial Generator State.
_Avoid_: Roll, result, Evaluation Result

**Evaluation Result**:
The outcome of attempting to evaluate a Dice Expression: either a Dice Evaluation
or a structured failure without a total.
_Avoid_: Dice Evaluation, result

**Package Identity**:
The published package name and version that identify a package/API release.
_Avoid_: algorithm identity, schema identity

**State Schema Identity**:
The versioned Replay Token and Serialized Generator State shape and
interpretation.
_Avoid_: package version, Sequence Profile

**PRNG Sequence Profile**:
The immutable transition, output, rejection, state-consumption, and seed-mapping
rules that define a reproducible pseudorandom sequence.
_Avoid_: package version, random number generator

**Dice Semantic Profile**:
The immutable Dice grammar, UTF-16, resource, arithmetic, evaluation, sampling,
failure, and result rules.
_Avoid_: package version, Roll Trace
