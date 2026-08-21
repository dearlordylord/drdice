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
The complete value needed to produce the next pseudorandom word and its successor
Generator State.
_Avoid_: Seed, cursor

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
_Avoid_: Rolls, history

**Dice Evaluation**:
The deterministic result containing a total, Roll Trace, and successor Generator
State for a Dice Expression and initial Generator State.
_Avoid_: Roll, result
