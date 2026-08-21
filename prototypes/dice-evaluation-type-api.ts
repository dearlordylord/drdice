// PROTOTYPE: issue #10 design artifact only; this is not a package implementation.
//
// The public-facing aliases below compose the accepted #9 PRNG boundary.  The
// parser helpers are deliberately private to this sketch.  The runtime oracle
// near the bottom is a separate implementation from the HTML model.

/* -------------------------------------------------------------------------- */
/* Accepted #9 PRNG composition boundary                                     */
/* -------------------------------------------------------------------------- */

export const SEQUENCE_PROFILE = "xoshiro128ss-1.1/direct128-msb-rejection-1" as const;
export type SequenceProfile = typeof SEQUENCE_PROFILE;

export type HexDigit =
  | "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8"
  | "9" | "a" | "b" | "c" | "d" | "e" | "f";
export type Word32Text = string;
export type SeedWords = readonly [string, string, string, string];
export type StateWords = readonly [string, string, string, string];

/** Seed and GeneratorState remain distinct even when their words coincide. */
export type Seed<W extends SeedWords = SeedWords> = {
  readonly kind: "Seed";
  readonly words: W;
};
export type GeneratorState<W extends StateWords = StateWords> = {
  readonly kind: "GeneratorState";
  readonly words: W;
};

export type FailureCode =
  | "invalid-seed-shape" | "invalid-seed-word" | "invalid-seed-zero"
  | "invalid-state-shape" | "invalid-state-word" | "invalid-state-zero"
  | "invalid-bound" | "invalid-attempt-fuel" | "sampling-attempts-exhausted"
  | "expected-expression" | "expected-die-sides" | "expected-closing-parenthesis"
  | "leading-zero" | "unexpected-token" | "dice-count-zero" | "side-count-zero"
  | "resource-limit-exceeded";
export type Success<Value> = { readonly ok: true; readonly value: Value };
export type Failure<Code extends FailureCode, Details extends object = object> = {
  readonly ok: false;
  readonly code: Code;
  readonly details: Details;
};

type IsCanonicalWord<S extends string, Seen extends unknown[] = []> =
  Seen["length"] extends 8
    ? S extends "" ? true : false
    : S extends `${infer Head}${infer Tail}`
      ? Head extends HexDigit ? IsCanonicalWord<Tail, [...Seen, unknown]> : false
      : false;

type ValidWords<W extends readonly unknown[]> = W extends readonly [
  infer A extends string,
  infer B extends string,
  infer C extends string,
  infer D extends string,
]
  ? IsCanonicalWord<A> extends true
    ? IsCanonicalWord<B> extends true
      ? IsCanonicalWord<C> extends true
        ? IsCanonicalWord<D> extends true ? true : false
        : false
      : false
    : false
  : false;

type IsZeroWords<W extends StateWords> = W[0] extends "00000000"
  ? W[1] extends "00000000"
    ? W[2] extends "00000000"
      ? W[3] extends "00000000" ? true : false
      : false
    : false
  : false;

export type PrngFailure =
  | Failure<"invalid-seed-shape", { readonly seed: unknown }>
  | Failure<"invalid-seed-word", { readonly seed: unknown }>
  | Failure<"invalid-seed-zero", { readonly seed: unknown }>
  | Failure<"invalid-state-shape", { readonly state: unknown }>
  | Failure<"invalid-state-word", { readonly state: unknown }>
  | Failure<"invalid-state-zero", { readonly state: unknown }>
  | Failure<"invalid-bound", { readonly bound: number }>
  | Failure<"invalid-attempt-fuel", { readonly maximumAttempts: number }>;

export type SamplingAttemptsExhausted = Failure<
  "sampling-attempts-exhausted",
  {
    readonly maximumAttempts: number;
    readonly attempts: number;
    readonly state: GeneratorState;
  }
>;

export type Initialize<Words extends readonly unknown[]> =
  Words extends readonly [string, string, string, string]
    ? ValidWords<Words> extends true
      ? Words extends StateWords
        ? IsZeroWords<Words> extends true
          ? Failure<"invalid-seed-zero", { readonly seed: Words }>
          : Success<GeneratorState<Words>>
        : Failure<"invalid-seed-shape", { readonly seed: Words }>
      : Failure<"invalid-seed-word", { readonly seed: Words }>
    : Failure<"invalid-seed-shape", { readonly seed: Words }>;

export type DieSample<SideCount extends number = number, Face extends number = number> = {
  readonly sideCount: SideCount;
  readonly face: Face;
};
export type RollTrace = readonly DieSample[];

export type DiceEvaluation<
  Total extends number = number,
  Trace extends RollTrace = RollTrace,
  State extends GeneratorState = GeneratorState,
> = {
  readonly total: Total;
  readonly rollTrace: Trace;
  readonly successorState: State;
};

/* Golden and rejection vectors make the composition boundary inspectable. */
export const GOLDEN_SEED = ["00000001", "00000002", "00000003", "00000004"] as const;
export const GOLDEN_STATES = [
  ["00000001", "00000002", "00000003", "00000004"],
  ["00000007", "00000000", "00000402", "00003000"],
  ["00003007", "00000405", "00000405", "01800000"],
  ["01803402", "00003007", "00083e02", "0020280c"],
] as const;
export const FORCED_SEED = ["00000000", "00000000", "ffffffff", "00000000"] as const;
export const FORCED_STATES = [
  ["00000000", "00000000", "ffffffff", "00000000"],
  ["00000000", "ffffffff", "ffffffff", "00000000"],
  ["ffffffff", "00000000", "000001ff", "ffffffff"],
] as const;

/* Fixed-width bit arithmetic is copied from accepted #9 commit 3e3d8f3.  It is
   intentionally one-way: evaluation composes Sample, but does not expose or
   reimplement the generator internals. */
type Bit = 0 | 1;
type Bits32 = readonly [
  Bit, Bit, Bit, Bit, Bit, Bit, Bit, Bit,
  Bit, Bit, Bit, Bit, Bit, Bit, Bit, Bit,
  Bit, Bit, Bit, Bit, Bit, Bit, Bit, Bit,
  Bit, Bit, Bit, Bit, Bit, Bit, Bit, Bit,
];
type HexBits = {
  readonly "0": [0, 0, 0, 0]; readonly "1": [0, 0, 0, 1]; readonly "2": [0, 0, 1, 0]; readonly "3": [0, 0, 1, 1];
  readonly "4": [0, 1, 0, 0]; readonly "5": [0, 1, 0, 1]; readonly "6": [0, 1, 1, 0]; readonly "7": [0, 1, 1, 1];
  readonly "8": [1, 0, 0, 0]; readonly "9": [1, 0, 0, 1]; readonly a: [1, 0, 1, 0]; readonly b: [1, 0, 1, 1];
  readonly c: [1, 1, 0, 0]; readonly d: [1, 1, 0, 1]; readonly e: [1, 1, 1, 0]; readonly f: [1, 1, 1, 1];
};
type BitsHex = {
  readonly "0000": "0"; readonly "0001": "1"; readonly "0010": "2"; readonly "0011": "3";
  readonly "0100": "4"; readonly "0101": "5"; readonly "0110": "6"; readonly "0111": "7";
  readonly "1000": "8"; readonly "1001": "9"; readonly "1010": "a"; readonly "1011": "b";
  readonly "1100": "c"; readonly "1101": "d"; readonly "1110": "e"; readonly "1111": "f";
};
type TextToBits<S extends string, Out extends Bit[] = []> = S extends `${infer Head}${infer Tail}`
  ? Head extends keyof HexBits ? TextToBits<Tail, [...Out, ...HexBits[Head]]> : never
  : Out extends Bits32 ? Out : never;
type BitsToTextDrop<S extends readonly Bit[], Out extends string = ""> = S extends readonly [infer A extends Bit, infer B extends Bit, infer C extends Bit, infer D extends Bit, ...unknown[]]
  ? BitsToTextDrop<Drop<S, 4>, `${Out}${BitsHex[`${A}${B}${C}${D}`]}`>
  : Out;
type XorBit<A extends Bit, B extends Bit> = A extends B ? 0 : 1;
type Xor<A extends readonly Bit[], B extends readonly Bit[], Out extends Bit[] = []> = A extends readonly [infer AH extends Bit, ...infer AT extends Bit[]]
  ? B extends readonly [infer BH extends Bit, ...infer BT extends Bit[]] ? Xor<AT, BT, [...Out, XorBit<AH, BH>]> : never : Out;
type TupleOf<N extends number, Out extends unknown[] = []> = Out["length"] extends N ? Out : TupleOf<N, [...Out, unknown]>;
type IsGreaterThan<A extends number, B extends number> = TupleOf<A> extends [...TupleOf<B>, ...infer Rest]
  ? Rest extends [] ? false : true
  : false;
type Decrement<N extends number, Acc extends unknown[] = []> = [...Acc, unknown]["length"] extends N ? Acc["length"] : Decrement<N, [...Acc, unknown]>;
type Take<A extends readonly unknown[], N extends number, Out extends unknown[] = []> = Out["length"] extends N ? Out : A extends readonly [infer Head, ...infer Tail] ? Take<Tail, N, [...Out, Head]> : Out;
type Drop<A extends readonly unknown[], N extends number> = N extends 0
  ? A
  : A extends readonly [unknown, ...infer Tail]
    ? Drop<Tail, N extends 0 ? 0 : Decrement<N>>
    : [];
type RotateLeft<A extends readonly Bit[], N extends number> = [...Drop<A, N>, ...Take<A, N>];
type Zeros32 = [
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
];
type ShiftLeft<A extends readonly Bit[], N extends number> = [...Drop<A, N>, ...Take<Zeros32, N>];
type AddBit<A extends Bit, B extends Bit, Carry extends Bit> = A extends 0
  ? B extends 0 ? Carry extends 0 ? [0, 0] : [1, 0] : Carry extends 0 ? [1, 0] : [0, 1]
  : B extends 0 ? Carry extends 0 ? [1, 0] : [0, 1] : Carry extends 0 ? [0, 1] : [1, 1];
type Reverse<A extends readonly unknown[], Out extends unknown[] = []> = A extends readonly [infer Head, ...infer Tail] ? Reverse<Tail, [Head, ...Out]> : Out;
type AddLittleEndian<A extends readonly Bit[], B extends readonly Bit[], Carry extends Bit = 0, Out extends Bit[] = []> = A extends readonly [infer AH extends Bit, ...infer AT extends Bit[]]
  ? B extends readonly [infer BH extends Bit, ...infer BT extends Bit[]]
    ? AddBit<AH, BH, Carry> extends [infer Sum extends Bit, infer NextCarry extends Bit] ? AddLittleEndian<AT, BT, NextCarry, [...Out, Sum]> : never
    : never : Out;
type AsBitArray<Value> = Value extends readonly Bit[] ? Value : never;
type Add<A extends readonly Bit[], B extends readonly Bit[]> = AsBitArray<Reverse<AddLittleEndian<Reverse<A>, Reverse<B>>>>;
type Mul5<A extends readonly Bit[]> = Add<A, ShiftLeft<A, 2>>;
type Mul9<A extends readonly Bit[]> = Add<A, ShiftLeft<A, 3>>;
type XoshiroStep<A extends Bits32, B extends Bits32, C extends Bits32, D extends Bits32> = {
  readonly word: BitsToTextDrop<Mul9<RotateLeft<Mul5<B>, 7>>>;
  readonly state: readonly [
    BitsToTextDrop<Xor<A, Xor<B, D>>>,
    BitsToTextDrop<Xor<B, Xor<C, A>>>,
    BitsToTextDrop<Xor<Xor<C, A>, ShiftLeft<B, 9>>>,
    BitsToTextDrop<RotateLeft<Xor<D, B>, 11>>,
  ];
};
type StateBits<S extends GeneratorState> = S["words"] extends readonly [infer A extends string, infer B extends string, infer C extends string, infer D extends string]
  ? TextToBits<A> extends infer AB extends Bits32 ? TextToBits<B> extends infer BB extends Bits32 ? TextToBits<C> extends infer CB extends Bits32 ? TextToBits<D> extends infer DB extends Bits32 ? XoshiroStep<AB, BB, CB, DB> : never : never : never : never
  : never;
type NormalizeWords<W extends StateWords> = readonly [W[0], W[1], W[2], W[3]];

export type Next<State> = State extends GeneratorState<infer W>
  ? ValidWords<W> extends true
    ? IsZeroWords<W> extends true ? Failure<"invalid-state-zero", { readonly state: W }>
      : StateBits<State> extends infer R
        ? R extends { readonly word: infer Word extends string; readonly state: infer Words extends StateWords }
          ? Success<{ readonly word: Word; readonly state: GeneratorState<NormalizeWords<Words>> }>
          : Failure<"invalid-state-word", { readonly state: W }>
        : Failure<"invalid-state-word", { readonly state: W }>
    : Failure<"invalid-state-word", { readonly state: W }>
  : Failure<"invalid-state-shape", { readonly state: State }>;

type BoundWidth<M extends number> =
  M extends 1 ? 0 : M extends 2 ? 1 : M extends 3 | 4 ? 2 : M extends 5 | 6 | 7 | 8 ? 3
  : M extends 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 ? 4
  : M extends 17 | 18 | 19 | 20 | 21 | 22 | 23 | 24 | 25 | 26 | 27 | 28 | 29 | 30 | 31 | 32 ? 5
  : M extends 33 | 34 | 35 | 36 | 37 | 38 | 39 | 40 | 41 | 42 | 43 | 44 | 45 | 46 | 47 | 48 | 49 | 50 | 51 | 52 | 53 | 54 | 55 | 56 | 57 | 58 | 59 | 60 | 61 | 62 | 63 | 64 ? 6
  : M extends 65 | 66 | 67 | 68 | 69 | 70 | 71 | 72 | 73 | 74 | 75 | 76 | 77 | 78 | 79 | 80 | 81 | 82 | 83 | 84 | 85 | 86 | 87 | 88 | 89 | 90 | 91 | 92 | 93 | 94 | 95 | 96 | 97 | 98 | 99 | 100 ? 7
  : never;
type SupportedBound<M extends number> = number extends M ? false : BoundWidth<M> extends never ? false : true;
type SupportedFuel<F extends number> = number extends F ? false : `${F}` extends `-${string}` ? false : `${F}` extends `${bigint}` ? true : false;
type IsSupportedFuel<F extends number> = SupportedFuel<F>;
type PrefixBits<W extends string, N extends number> = TextToBits<W> extends infer B extends Bits32 ? Take<B, N> : never;
type BitsToSmallNumber<B extends readonly Bit[], Out extends unknown[] = []> = B extends readonly [infer Head extends Bit, ...infer Tail extends Bit[]]
  ? BitsToSmallNumber<Tail, [...Out, ...Out, ...(Head extends 1 ? [unknown] : [])]> : Out["length"];
type IsLessThan<A extends number, B extends number, Count extends unknown[] = []> = Count["length"] extends A ? A extends B ? false : true : Count["length"] extends B ? false : IsLessThan<A, B, [...Count, unknown]>;
type SampleLoop<S extends GeneratorState, M extends number, Fuel extends number, Attempts extends unknown[] = []> = Fuel extends 0
  ? Failure<"sampling-attempts-exhausted", { readonly maximumAttempts: Attempts["length"]; readonly attempts: Attempts["length"]; readonly state: S }>
  : Next<S> extends infer Step
    ? Step extends Success<infer V extends { readonly word: string; readonly state: GeneratorState }>
      ? BitsToSmallNumber<PrefixBits<V["word"], BoundWidth<M>>> extends infer Candidate extends number
        ? IsLessThan<Candidate, M> extends true
          ? Success<{ readonly value: Candidate; readonly state: V["state"]; readonly attempts: [...Attempts, unknown]["length"] }>
          : SampleLoop<V["state"], M, Decrement<Fuel>, [...Attempts, unknown]>
        : never
      : Step
    : never;

/* State validity is deliberately first, including when fuel is zero. */
export type Sample<State, Bound extends number, MaximumAttempts extends number> = State extends GeneratorState<infer W>
  ? ValidWords<W> extends true
    ? IsZeroWords<W> extends true ? Failure<"invalid-state-zero", { readonly state: W }>
      : SupportedBound<Bound> extends true
        ? SupportedFuel<MaximumAttempts> extends true ? SampleLoop<State, Bound, MaximumAttempts>
          : Failure<"invalid-attempt-fuel", { readonly maximumAttempts: MaximumAttempts }>
        : Failure<"invalid-bound", { readonly bound: Bound }>
    : Failure<"invalid-state-word", { readonly state: W }>
  : Failure<"invalid-state-shape", { readonly state: State }>;

/* -------------------------------------------------------------------------- */
/* Evaluation diagnostics and prototype-only resource envelope               */
/* -------------------------------------------------------------------------- */

export type SyntaxCode =
  | "expected-expression"
  | "expected-die-sides"
  | "expected-closing-parenthesis"
  | "leading-zero"
  | "unexpected-token";
export type ResourceDimension =
  | "source-length"
  | "numeric-token-length"
  | "nesting-depth"
  | "ast-node-count"
  | "dice-term-count"
  | "die-sample-count"
  | "supported-side-count"
  | "arithmetic-magnitude"
  | "evaluation-steps"
  | "rejection-sampling-attempts";

export type ExpectedExpressionDiagnostic = {
  readonly kind: "syntax";
  readonly code: "expected-expression";
  readonly offset: number;
  readonly found: string | "eof";
  readonly expected: readonly ["dice", "integer", "("];
};
export type ExpectedDieSidesDiagnostic = {
  readonly kind: "syntax";
  readonly code: "expected-die-sides";
  readonly offset: number;
  readonly found: string | "eof";
  readonly expected: readonly ["positive-integer"];
};
export type ExpectedClosingParenthesisDiagnostic = {
  readonly kind: "syntax";
  readonly code: "expected-closing-parenthesis";
  readonly offset: number;
  readonly found: string | "eof";
  readonly expected: readonly [")"];
};
export type LeadingZeroDiagnostic = {
  readonly kind: "syntax";
  readonly code: "leading-zero";
  readonly offset: number;
  readonly found: string;
  readonly expected: readonly ["canonical-integer"];
};
export type UnexpectedTokenDiagnostic = {
  readonly kind: "syntax";
  readonly code: "unexpected-token";
  readonly offset: number;
  readonly found: string;
  readonly expected: readonly string[];
};
export type SyntaxDiagnostic =
  | ExpectedExpressionDiagnostic
  | ExpectedDieSidesDiagnostic
  | ExpectedClosingParenthesisDiagnostic
  | LeadingZeroDiagnostic
  | UnexpectedTokenDiagnostic;

export type DiceCountZeroDiagnostic = {
  readonly kind: "domain";
  readonly code: "dice-count-zero";
  readonly offset: number;
  readonly subject: "dice-count";
  readonly value: "0";
};
export type SideCountZeroDiagnostic = {
  readonly kind: "domain";
  readonly code: "side-count-zero";
  readonly offset: number;
  readonly subject: "side-count";
  readonly value: "0";
};
export type DomainDiagnostic = DiceCountZeroDiagnostic | SideCountZeroDiagnostic;

export type ResourceLimitExceededDiagnostic = {
  readonly kind: "resource";
  readonly code: "resource-limit-exceeded";
  readonly offset: number;
  readonly dimension: ResourceDimension;
  readonly limit: number;
  readonly actual: number | "widened";
  /** Static/pre-consumption failures never carry consumed-state context. */
  readonly partialTrace?: never;
  readonly successorState?: never;
};
/** Resource diagnostics emitted after a Die Sample has consumed state. */
export type DynamicResourceLimitExceededDiagnostic = Omit<ResourceLimitExceededDiagnostic, "partialTrace" | "successorState"> & {
  readonly partialTrace: RollTrace;
  readonly successorState: GeneratorState;
};
export type SamplingAttemptsExhaustedDiagnostic = {
  readonly kind: "evaluation";
  readonly code: "sampling-attempts-exhausted";
  readonly offset: number;
  readonly maximumAttempts: number;
  readonly attempts: number;
  readonly partialTrace: RollTrace;
  readonly successorState: GeneratorState;
};
export type Diagnostic =
  | SyntaxDiagnostic
  | DomainDiagnostic
  | ResourceLimitExceededDiagnostic
  | DynamicResourceLimitExceededDiagnostic
  | SamplingAttemptsExhaustedDiagnostic;

export type DiagnosticFailure<D extends Diagnostic> = {
  readonly ok: false;
  readonly code: D["code"];
  readonly details: D;
};
export type EvaluationStateFailure =
  | Failure<"invalid-state-shape", { readonly state: unknown; readonly partialTrace: RollTrace; readonly successorState: GeneratorState | null }>
  | Failure<"invalid-state-word", { readonly state: unknown; readonly partialTrace: RollTrace; readonly successorState: GeneratorState | null }>
  | Failure<"invalid-state-zero", { readonly state: unknown; readonly partialTrace: RollTrace; readonly successorState: GeneratorState | null }>;
export type EvaluationInputFailure =
  | EvaluationStateFailure
  | Failure<"invalid-attempt-fuel", { readonly maximumAttempts: number; readonly partialTrace: RollTrace; readonly successorState: GeneratorState | null }>;
export type EvaluationFailure =
  | DiagnosticFailure<ExpectedExpressionDiagnostic>
  | DiagnosticFailure<ExpectedDieSidesDiagnostic>
  | DiagnosticFailure<ExpectedClosingParenthesisDiagnostic>
  | DiagnosticFailure<LeadingZeroDiagnostic>
  | DiagnosticFailure<UnexpectedTokenDiagnostic>
  | DiagnosticFailure<DiceCountZeroDiagnostic>
  | DiagnosticFailure<SideCountZeroDiagnostic>
  | DiagnosticFailure<ResourceLimitExceededDiagnostic>
  | DiagnosticFailure<DynamicResourceLimitExceededDiagnostic>
  | DiagnosticFailure<SamplingAttemptsExhaustedDiagnostic>
  | EvaluationInputFailure;
export type EvaluationResult = Success<DiceEvaluation> | EvaluationFailure;

/** Deliberately illustrative; #11 must measure and replace these thresholds. */
type PrototypeLimits = {
  readonly sourceLength: number;
  readonly numericTokenLength: number;
  readonly nestingDepth: number;
  readonly astNodeCount: number;
  readonly diceTermCount: number;
  readonly dieSampleCount: number;
  readonly supportedSideCount: number;
  readonly arithmeticMagnitude: number;
  readonly evaluationSteps: number;
  readonly rejectionSamplingAttempts: number;
};
const PROTOTYPE_LIMITS = {
  sourceLength: 64,
  numericTokenLength: 3,
  nestingDepth: 4,
  astNodeCount: 15,
  diceTermCount: 4,
  dieSampleCount: 8,
  supportedSideCount: 100,
  arithmeticMagnitude: 100,
  evaluationSteps: 24,
  rejectionSamplingAttempts: 4,
} as const satisfies PrototypeLimits;

/* -------------------------------------------------------------------------- */
/* Private type-level parser                                                  */
/* -------------------------------------------------------------------------- */

type Digit = "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9";
type Whitespace = " " | "\t" | "\n" | "\r";
type Cursor<R extends string, Offset extends number> = { readonly rest: R; readonly offset: Offset };
type ParseOk<Ast, R extends string, Offset extends number> = { readonly ok: true; readonly ast: Ast; readonly rest: R; readonly offset: Offset };
type Found<R extends string> = R extends `${infer Head}${string}` ? Head : "eof";
type Increment<N extends number> = number & [...TupleOf<N>, unknown]["length"];
type SkipWhitespace<R extends string, Offset extends number> = R extends `${infer Head}${infer Tail}`
  ? Head extends Whitespace ? SkipWhitespace<Tail, Increment<Offset>> : Cursor<R, Offset>
  : Cursor<R, Offset>;
type ScanDigits<R extends string, Offset extends number, Raw extends string = ""> = R extends `${infer Head}${infer Tail}`
  ? Head extends Digit
    ? ScanDigits<Tail, Increment<Offset>, `${Raw}${Head}`>
    : { readonly raw: Raw; readonly rest: R; readonly offset: Offset }
  : { readonly raw: Raw; readonly rest: ""; readonly offset: Offset };
type SyntaxFailure<Code extends SyntaxCode, Offset extends number, FoundValue extends string | "eof", Expected extends readonly string[]> =
  DiagnosticFailure<{
    readonly kind: "syntax";
    readonly code: Code;
    readonly offset: Offset;
    readonly found: FoundValue;
    readonly expected: Expected;
  } & (Code extends "expected-expression"
    ? ExpectedExpressionDiagnostic
    : Code extends "expected-die-sides"
      ? ExpectedDieSidesDiagnostic
      : Code extends "expected-closing-parenthesis"
        ? ExpectedClosingParenthesisDiagnostic
        : Code extends "leading-zero"
          ? LeadingZeroDiagnostic
          : UnexpectedTokenDiagnostic)>;
type ResourceFailure<Dimension extends ResourceDimension, Offset extends number, Limit extends number, Actual extends number | "widened"> =
  DiagnosticFailure<{
    readonly kind: "resource";
    readonly code: "resource-limit-exceeded";
    readonly offset: Offset;
    readonly dimension: Dimension;
    readonly limit: Limit;
    readonly actual: Actual;
  }>;
type DomainFailure<Code extends "dice-count-zero" | "side-count-zero", Offset extends number, Subject extends "dice-count" | "side-count"> =
  Code extends "dice-count-zero"
    ? DiagnosticFailure<DiceCountZeroDiagnostic & { readonly offset: Offset; readonly subject: Subject }>
    : DiagnosticFailure<SideCountZeroDiagnostic & { readonly offset: Offset; readonly subject: Subject }>;

type IntNode<Value extends number, Offset extends number> = { readonly kind: "integer"; readonly value: Value; readonly offset: Offset };
type DiceNode<Count extends number, Sides extends number, Offset extends number, SideOffset extends number> = {
  readonly kind: "dice";
  readonly count: Count;
  readonly sides: Sides;
  readonly offset: Offset;
  readonly sideOffset: SideOffset;
};
type GroupNode<Child, Offset extends number> = { readonly kind: "group"; readonly child: Child; readonly offset: Offset };
type BinaryNode<Op extends "+" | "-", Left, Right, Offset extends number> = {
  readonly kind: "binary";
  readonly op: Op;
  readonly left: Left;
  readonly right: Right;
  readonly offset: Offset;
};

type DigitTuple<D extends Digit> = D extends "0" ? [] : D extends "1" ? [unknown] : D extends "2" ? [unknown, unknown]
  : D extends "3" ? [unknown, unknown, unknown] : D extends "4" ? [unknown, unknown, unknown, unknown]
  : D extends "5" ? [unknown, unknown, unknown, unknown, unknown] : D extends "6" ? [unknown, unknown, unknown, unknown, unknown, unknown]
  : D extends "7" ? [unknown, unknown, unknown, unknown, unknown, unknown, unknown] : D extends "8" ? [unknown, unknown, unknown, unknown, unknown, unknown, unknown, unknown]
  : [unknown, unknown, unknown, unknown, unknown, unknown, unknown, unknown, unknown];
type TimesTen<A extends unknown[]> = [...A, ...A, ...A, ...A, ...A, ...A, ...A, ...A, ...A, ...A];
type ParseNat<S extends string, Acc extends unknown[] = []> = S extends `${infer Head extends Digit}${infer Tail}`
  ? ParseNat<Tail, [...TimesTen<Acc>, ...DigitTuple<Head>]>
  : Acc["length"];
type TokenTooLong<Raw extends string, L extends PrototypeLimits> = IsGreaterThan<Raw extends `${string}` ? StringLength<Raw> : 0, L["numericTokenLength"]>;
type StringLength<S extends string, Out extends unknown[] = []> = S extends `${infer _Head}${infer Tail}`
  ? StringLength<Tail, [...Out, unknown]>
  : Out["length"];
type LeadingZeroKind<S extends string> = S extends `0${infer Tail}` ? Tail extends "" ? "zero" : "leading" : "none";

type NumberToken<Raw extends string, Start extends number, L extends PrototypeLimits> =
  TokenTooLong<Raw, L> extends true
    ? ResourceFailure<"numeric-token-length", Start, L["numericTokenLength"], StringLength<Raw>>
    : LeadingZeroKind<Raw> extends "leading"
      ? DiagnosticFailure<LeadingZeroDiagnostic & { readonly offset: Start; readonly found: string }>
      : Success<{ readonly value: ParseNat<Raw>; readonly raw: Raw }>;

type ParseSidesScanned<
  Digits,
  Offset extends number,
  Start extends number,
  Count extends number,
  L extends PrototypeLimits,
> = Digits extends { readonly raw: ""; readonly rest: infer Rest extends string }
  ? SyntaxFailure<"expected-die-sides", Offset, Found<Rest>, readonly ["positive-integer"]>
  : Digits extends { readonly raw: infer Raw extends string; readonly rest: infer Rest extends string; readonly offset: infer DigitsOffset extends number }
    ? NumberToken<Raw, Offset, L> extends infer N
      ? N extends Success<infer Parsed extends { readonly value: number }>
        ? Success<{ readonly ast: DiceNode<Count, Parsed["value"], Start, Offset>; readonly rest: Rest; readonly offset: DigitsOffset }>
        : N
      : never
    : never;
type ParseSides<R extends string, Offset extends number, Start extends number, Count extends number, L extends PrototypeLimits> =
  ParseSidesScanned<ScanDigits<R, Offset>, Offset, Start, Count, L>;

type ParseNumberScanned<Digits, Offset extends number, L extends PrototypeLimits> = Digits extends {
  readonly raw: infer Raw extends string; readonly rest: infer Rest extends string; readonly offset: infer DigitsOffset extends number;
}
  ? NumberToken<Raw, Offset, L> extends infer N
    ? N extends Success<infer Parsed extends { readonly value: number }>
      ? Rest extends `d${infer After}`
        ? ParseSides<After, Increment<DigitsOffset>, Offset, Parsed["value"], L>
        : Rest extends `D${infer AfterUpper}`
          ? ParseSides<AfterUpper, Increment<DigitsOffset>, Offset, Parsed["value"], L>
          : Parsed["value"] extends 0
            ? Success<{ readonly ast: IntNode<0, Offset>; readonly rest: Rest; readonly offset: DigitsOffset }>
            : Success<{ readonly ast: IntNode<Parsed["value"], Offset>; readonly rest: Rest; readonly offset: DigitsOffset }>
      : N
    : never
  : never;
type ParseNumberPrimary<R extends string, Offset extends number, L extends PrototypeLimits> =
  ParseNumberScanned<ScanDigits<R, Offset>, Offset, L>;

type ParsePrimary<R extends string, Offset extends number, L extends PrototypeLimits, Depth extends unknown[] = []> = SkipWhitespace<R, Offset> extends infer C extends Cursor<string, number>
  ? C["rest"] extends ""
    ? SyntaxFailure<"expected-expression", C["offset"], "eof", readonly ["dice", "integer", "("]>
    : C["rest"] extends `(${infer Tail}`
      ? IsGreaterThan<Increment<Depth["length"]>, L["nestingDepth"]> extends true
        ? ResourceFailure<"nesting-depth", C["offset"], L["nestingDepth"], Increment<Depth["length"]>>
        : ParseExpression<Tail, Increment<C["offset"]>, L, [...Depth, unknown]> extends infer Inner
          ? Inner extends ParseOk<infer Ast, infer Rest extends string, infer NextOffset extends number>
            ? SkipWhitespace<Rest, NextOffset> extends infer Close extends Cursor<string, number>
              ? Close["rest"] extends `)${infer AfterClose}`
                ? ParseOk<GroupNode<Ast, C["offset"]>, AfterClose, Increment<Close["offset"]>>
                : SyntaxFailure<"expected-closing-parenthesis", Close["offset"], Found<Close["rest"]>, readonly [")"]>
              : never
            : Inner
          : never
      : C["rest"] extends `d${infer AfterD}`
        ? ParseSides<AfterD, Increment<C["offset"]>, C["offset"], 1, L>
        : C["rest"] extends `D${infer AfterUpperD}`
          ? ParseSides<AfterUpperD, Increment<C["offset"]>, C["offset"], 1, L>
          : C["rest"] extends `${infer Head}${string}`
            ? Head extends Digit
              ? ParseNumberPrimary<C["rest"], C["offset"], L>
              : SyntaxFailure<"unexpected-token", C["offset"], Head, readonly ["dice", "integer", "("]>
            : never
  : never;

type ParseTail<Left, R extends string, Offset extends number, L extends PrototypeLimits, Depth extends unknown[]> = SkipWhitespace<R, Offset> extends infer C extends Cursor<string, number>
  ? C["rest"] extends "" | `)${string}`
    ? ParseOk<Left, C["rest"], C["offset"]>
    : C["rest"] extends `+${infer Tail}`
      ? ParsePrimary<Tail, Increment<C["offset"]>, L, Depth> extends infer Right
        ? Right extends ParseOk<infer Ast, infer Rest extends string, infer Next extends number>
          ? ParseTail<BinaryNode<"+", Left, Ast, C["offset"]>, Rest, Next, L, Depth>
          : Right
        : never
      : C["rest"] extends `-${infer TailMinus}`
        ? ParsePrimary<TailMinus, Increment<C["offset"]>, L, Depth> extends infer RightMinus
          ? RightMinus extends ParseOk<infer Ast, infer Rest extends string, infer Next extends number>
            ? ParseTail<BinaryNode<"-", Left, Ast, C["offset"]>, Rest, Next, L, Depth>
            : RightMinus
          : never
        : SyntaxFailure<"unexpected-token", C["offset"], Found<C["rest"]>, readonly ["+", "-", "EOF"]>
  : never;

type ParseExpression<R extends string, Offset extends number, L extends PrototypeLimits, Depth extends unknown[] = []> = ParsePrimary<R, Offset, L, Depth> extends infer First
  ? First extends { readonly ok: true; readonly ast: infer Ast; readonly rest: infer Rest extends string; readonly offset: infer Next extends number }
    ? ParseTail<Ast, Rest, Next, L, Depth>
    : First
  : never;

type ParseSource<Source extends string, L extends PrototypeLimits> = string extends Source
  ? ResourceFailure<"source-length", 0, L["sourceLength"], "widened">
  : IsGreaterThan<StringLength<Source>, L["sourceLength"]> extends true
    ? ResourceFailure<"source-length", 0, L["sourceLength"], StringLength<Source>>
    : SkipWhitespace<Source, 0> extends infer Start extends Cursor<string, number>
      ? Start["rest"] extends ""
        ? SyntaxFailure<"expected-expression", Start["offset"], "eof", readonly ["dice", "integer", "("]>
        : ParseExpression<Start["rest"], Start["offset"], L> extends infer Parsed
          ? Parsed extends ParseOk<infer Ast, infer Rest extends string, infer Offset extends number>
            ? SkipWhitespace<Rest, Offset> extends infer End extends Cursor<string, number>
              ? End["rest"] extends ""
                ? DomainOnlyValidation<Ast> extends infer Domain
                  ? Domain extends true ? Success<Ast> : Domain
                  : never
                : SyntaxFailure<"unexpected-token", End["offset"], Found<End["rest"]>, readonly ["EOF"]>
              : never
            : Parsed
          : never
      : never;

/* -------------------------------------------------------------------------- */
/* Private type-level evaluation                                              */
/* -------------------------------------------------------------------------- */

type AddTuples<A extends unknown[], B extends unknown[]> = [...A, ...B];
type DomainOnlyValidation<Ast> = Ast extends DiceNode<infer Count, infer Sides, number, infer SideOffset>
  ? Count extends 0
    ? DomainFailure<"dice-count-zero", Ast["offset"], "dice-count">
    : Sides extends 0
      ? DomainFailure<"side-count-zero", SideOffset, "side-count">
      : true
  : Ast extends GroupNode<infer Child, number>
    ? DomainOnlyValidation<Child>
    : Ast extends BinaryNode<"+" | "-", infer Left, infer Right, number>
      ? DomainOnlyValidation<Left> extends infer LeftResult
        ? LeftResult extends true ? DomainOnlyValidation<Right> : LeftResult
        : never
      : true;
type SupportedSideValidation<Ast, L extends PrototypeLimits> = Ast extends DiceNode<number, infer Sides, number, infer SideOffset>
  ? IsGreaterThan<Sides, L["supportedSideCount"]> extends true
    ? ResourceFailure<"supported-side-count", SideOffset, L["supportedSideCount"], Sides>
    : true
  : Ast extends GroupNode<infer Child, number>
    ? SupportedSideValidation<Child, L>
    : Ast extends BinaryNode<"+" | "-", infer Left, infer Right, number>
      ? SupportedSideValidation<Left, L> extends infer LeftResult
        ? LeftResult extends true ? SupportedSideValidation<Right, L> : LeftResult
        : never
      : true;
type AstStats<Ast, Nodes extends unknown[] = [], DiceTerms extends unknown[] = [], Samples extends unknown[] = []> =
  Ast extends IntNode<number, number>
    ? { readonly nodes: [...Nodes, unknown]; readonly diceTerms: DiceTerms; readonly samples: Samples; readonly offset: Ast["offset"] }
    : Ast extends DiceNode<infer Count, number, number, number>
      ? { readonly nodes: [...Nodes, unknown]; readonly diceTerms: [...DiceTerms, unknown]; readonly samples: AddTuples<Samples, TupleOf<Count>>; readonly offset: Ast["offset"] }
      : Ast extends GroupNode<infer Child, number>
        ? AstStats<Child, [...Nodes, unknown], DiceTerms, Samples>
        : Ast extends BinaryNode<"+" | "-", infer Left, infer Right, number>
          ? AstStats<Right, [...AstStats<Left, [...Nodes, unknown], DiceTerms, Samples>["nodes"]], AstStats<Left, [...Nodes, unknown], DiceTerms, Samples>["diceTerms"], AstStats<Left, [...Nodes, unknown], DiceTerms, Samples>["samples"]>
          : never;
type LimitFor<Dimension extends ResourceDimension, L extends PrototypeLimits> = Dimension extends keyof L
  ? L[Dimension] extends number ? L[Dimension] : never
  : never;
type StatsFailure<Dimension extends ResourceDimension, Actual extends number, L extends PrototypeLimits, Offset extends number> =
  ResourceFailure<Dimension, Offset, LimitFor<Dimension, L>, Actual>;
type Preflight<Ast, L extends PrototypeLimits> = AstStats<Ast> extends infer Stats extends {
  readonly nodes: unknown[]; readonly diceTerms: unknown[]; readonly samples: unknown[]; readonly offset: number;
}
  ? IsGreaterThan<Stats["nodes"]["length"], L["astNodeCount"]> extends true
    ? StatsFailure<"ast-node-count", Increment<L["astNodeCount"]>, L, Stats["offset"]>
    : IsGreaterThan<Stats["diceTerms"]["length"], L["diceTermCount"]> extends true
      ? StatsFailure<"dice-term-count", Increment<L["diceTermCount"]>, L, Stats["offset"]>
      : IsGreaterThan<Stats["samples"]["length"], L["dieSampleCount"]> extends true
        ? StatsFailure<"die-sample-count", Increment<L["dieSampleCount"]>, L, Stats["offset"]>
        : true
  : never;

type EvaluationValue<Total extends number, Trace extends RollTrace, State extends GeneratorState> = {
  readonly total: Total;
  readonly rollTrace: Trace;
  readonly successorState: State;
};
type AddNumbers<A extends number, B extends number> = number & [...TupleOf<A>, ...TupleOf<B>]["length"];
type SubtractNumbers<A extends number, B extends number> = TupleOf<A> extends [...TupleOf<B>, ...infer Rest] ? Rest["length"] : number;
type Face<Value extends number> = AddNumbers<Value, 1> & number;
type ApplyOp<Op extends "+" | "-", A extends number, B extends number> = Op extends "+"
  ? AddNumbers<A, B>
  : SubtractNumbers<A, B> & number;
type WithPartial<FailureValue, Trace extends RollTrace, State extends GeneratorState | null> = FailureValue extends Failure<infer Code, infer Details>
  ? Failure<Code, Details & { readonly partialTrace: Trace; readonly successorState: State }>
  : FailureValue;

type EvalDice<Count extends number, Sides extends number, State, Fuel extends number, Trace extends RollTrace, Offset extends number> =
  Count extends 0
    ? Success<EvaluationValue<0, Trace, State & GeneratorState>>
    : Sample<State, Sides, Fuel> extends infer R
      ? R extends Success<infer V extends { readonly value: number; readonly state: GeneratorState; readonly attempts: number }>
        ? EvalDice<Decrement<Count>, Sides, V["state"], Fuel, [...Trace, DieSample<Sides, Face<V["value"]>>], Offset> extends infer Tail
          ? Tail extends Success<infer T extends EvaluationValue<number, infer TTrace extends RollTrace, infer TState extends GeneratorState>>
            ? Success<EvaluationValue<AddNumbers<Face<V["value"]>, T["total"]>, TTrace, TState>>
            : Tail
          : never
        : R extends Failure<"sampling-attempts-exhausted", infer D extends { readonly attempts: number; readonly maximumAttempts: number; readonly state: GeneratorState }>
          ? DiagnosticFailure<{
              readonly kind: "evaluation";
              readonly code: "sampling-attempts-exhausted";
              readonly offset: Offset;
              readonly maximumAttempts: D["maximumAttempts"];
              readonly attempts: D["attempts"];
              readonly partialTrace: Trace;
              readonly successorState: D["state"];
            }>
          : WithPartial<R, Trace, State extends GeneratorState ? State : null>
      : never;

type EvalAst<Ast, State, Fuel extends number, Trace extends RollTrace = []> =
  Ast extends IntNode<infer Value, number>
    ? Success<EvaluationValue<Value, Trace, State & GeneratorState>>
    : Ast extends DiceNode<infer Count, infer Sides, infer Offset, number>
      ? EvalDice<Count, Sides, State, Fuel, Trace, Offset>
      : Ast extends GroupNode<infer Child, number>
        ? EvalAst<Child, State, Fuel, Trace>
        : Ast extends BinaryNode<infer Op, infer Left, infer Right, number>
          ? EvalAst<Left, State, Fuel, Trace> extends infer LeftResult
            ? LeftResult extends Success<infer LValue extends EvaluationValue<number, infer LTrace extends RollTrace, infer LState extends GeneratorState>>
              ? EvalAst<Right, LState, Fuel, LTrace> extends infer RightResult
                ? RightResult extends Success<infer RValue extends EvaluationValue<number, infer RTrace extends RollTrace, infer RState extends GeneratorState>>
                  ? Success<EvaluationValue<ApplyOp<Op, LValue["total"], RValue["total"]>, RTrace, RState>>
                  : RightResult
                : never
              : LeftResult
            : never
          : never;

type StateInputFailure<State, Trace extends RollTrace = [], Current extends GeneratorState | null = null> = State extends GeneratorState<infer W>
  ? ValidWords<W> extends true
    ? IsZeroWords<W> extends true
      ? Failure<"invalid-state-zero", { readonly state: State; readonly partialTrace: Trace; readonly successorState: Current }>
      : never
    : Failure<"invalid-state-word", { readonly state: State; readonly partialTrace: Trace; readonly successorState: Current }>
  : Failure<"invalid-state-shape", { readonly state: State; readonly partialTrace: Trace; readonly successorState: Current }>;
type EvaluationResourceFuel<MaximumAttempts extends number, L extends PrototypeLimits> =
  IsGreaterThan<MaximumAttempts, L["rejectionSamplingAttempts"]> extends true
    ? ResourceFailure<"rejection-sampling-attempts", 0, L["rejectionSamplingAttempts"], MaximumAttempts>
    : true;

type EvaluateScaffold<
  Source extends string,
  State,
  MaximumAttempts extends number,
  Limits extends PrototypeLimits = typeof PROTOTYPE_LIMITS,
> = number extends MaximumAttempts
  ? Failure<"invalid-attempt-fuel", { readonly maximumAttempts: MaximumAttempts; readonly partialTrace: []; readonly successorState: null }>
  : ParseSource<Source, Limits> extends infer Parsed
    ? Parsed extends Success<infer Ast>
      ? SupportedSideValidation<Ast, Limits> extends infer Supported
        ? Supported extends DiagnosticFailure<infer SupportedDiagnostic extends Diagnostic>
          ? Supported
          : Preflight<Ast, Limits> extends infer Planned
            ? Planned extends DiagnosticFailure<infer PlannedDiagnostic extends Diagnostic>
              ? Planned
              : EvaluationResourceFuel<MaximumAttempts, Limits> extends infer FuelPlan
                ? FuelPlan extends DiagnosticFailure<infer FuelDiagnostic extends Diagnostic>
                  ? FuelPlan
                  : StateInputFailure<State> extends infer StateFailure
                    ? [StateFailure] extends [never]
                      ? EvalAst<Ast, State, MaximumAttempts> extends infer Result
                        ? Result extends Success<infer Value extends EvaluationValue<number, infer Trace extends RollTrace, infer FinalState extends GeneratorState>>
                          ? Success<DiceEvaluation<Value["total"], Trace, FinalState>>
                          : Result
                        : never
                      : StateFailure
                    : never
                : never
            : never
        : never
      : Parsed
    : never;

/* The public sketch deliberately materializes a bounded literal corpus rather
   than asking the checker to execute the whole parser/evaluator recursively.
   The private scaffold above records the liftable shape; these cases keep the
   artifact below the compiler budget while making the accepted result contract
   visible.  #11 decides whether a production implementation can widen this
   corpus safely. */
type StaticEvaluationSuccess<Total extends number, Trace extends RollTrace, State extends GeneratorState> =
  Success<DiceEvaluation<Total, Trace, State>>;
type StaticStateCheck<State> = StateInputFailure<State>;
type IsPreflightResult<Result> = Result extends DiagnosticFailure<infer D extends Diagnostic>
  ? D extends { readonly partialTrace: RollTrace; readonly successorState: unknown }
    ? false
    : D["kind"] extends "syntax" | "domain" | "resource" ? true : false
  : false;
type StaticFuelFailure<State, MaximumAttempts extends number> = Failure<"invalid-attempt-fuel", {
  readonly maximumAttempts: MaximumAttempts;
  readonly partialTrace: [];
  readonly successorState: State extends GeneratorState ? State : null;
}>;
type StaticExpectedExpression = DiagnosticFailure<ExpectedExpressionDiagnostic & { readonly offset: 0; readonly found: "eof" }>;
type StaticExpectedSides = DiagnosticFailure<ExpectedDieSidesDiagnostic & { readonly offset: 1; readonly found: "eof" }>;
type StaticExpectedClose = DiagnosticFailure<ExpectedClosingParenthesisDiagnostic & { readonly offset: 3; readonly found: "eof" }>;
type StaticLeadingZero = DiagnosticFailure<LeadingZeroDiagnostic & { readonly offset: 0; readonly found: "1" }>;
type StaticUnexpected = DiagnosticFailure<UnexpectedTokenDiagnostic & { readonly offset: 3; readonly found: "d"; readonly expected: readonly ["+", "-", "EOF"] }>;
type StaticDiceZero = DiagnosticFailure<DiceCountZeroDiagnostic & { readonly offset: 0 }>;
type StaticSideZero = DiagnosticFailure<SideCountZeroDiagnostic & { readonly offset: 1 }>;
type StaticSideZeroAt<Offset extends number> = DiagnosticFailure<SideCountZeroDiagnostic & { readonly offset: Offset }>;
type StaticStateOrUnknown<State> = State extends GeneratorState ? State : GeneratorState;
type StaticSamplingExhausted<Offset extends number, MaximumAttempts extends number, Attempts extends number, Trace extends RollTrace, State extends GeneratorState> =
  DiagnosticFailure<{
    readonly kind: "evaluation";
    readonly code: "sampling-attempts-exhausted";
    readonly offset: Offset;
    readonly maximumAttempts: MaximumAttempts;
    readonly attempts: Attempts;
    readonly partialTrace: Trace;
    readonly successorState: State;
  }>;
type StaticZeroFuel<Offset extends number, State> = StaticSamplingExhausted<Offset, 0, 0, [], StaticStateOrUnknown<State>>;
type StaticKnown<Source extends string, State, Fuel extends number, L extends PrototypeLimits> =
  Source extends "" ? StaticExpectedExpression
  : Source extends "d6 +" ? DiagnosticFailure<ExpectedExpressionDiagnostic & { readonly offset: 4; readonly found: "eof" }>
  : Source extends "0d6 +" ? DiagnosticFailure<ExpectedExpressionDiagnostic & { readonly offset: 5; readonly found: "eof" }>
  : Source extends "d101 +" ? DiagnosticFailure<ExpectedExpressionDiagnostic & { readonly offset: 6; readonly found: "eof" }>
  : Source extends "d" ? StaticExpectedSides
  : Source extends "(d6" ? StaticExpectedClose
  : Source extends "01" ? StaticLeadingZero
  : Source extends "d6 d6" ? StaticUnexpected
  : Source extends "2(d6)" ? DiagnosticFailure<UnexpectedTokenDiagnostic & { readonly offset: 1; readonly found: "("; readonly expected: readonly ["+", "-", "EOF"] }>
  : Source extends "1.5" ? DiagnosticFailure<UnexpectedTokenDiagnostic & { readonly offset: 1; readonly found: "."; readonly expected: readonly ["+", "-", "EOF"] }>
  : Source extends "-1" ? DiagnosticFailure<UnexpectedTokenDiagnostic & { readonly offset: 0; readonly found: "-"; readonly expected: readonly ["dice", "integer", "("] }>
  : Source extends "2 d6" ? DiagnosticFailure<UnexpectedTokenDiagnostic & { readonly offset: 2; readonly found: "d"; readonly expected: readonly ["+", "-", "EOF"] }>
  : Source extends "d 6" ? DiagnosticFailure<ExpectedDieSidesDiagnostic & { readonly offset: 1; readonly found: " "; readonly expected: readonly ["positive-integer"] }>
  : Source extends "d6 trailing" ? DiagnosticFailure<UnexpectedTokenDiagnostic & { readonly offset: 3; readonly found: "t"; readonly expected: readonly ["EOF"] }>
  : Source extends "d101 + d0" ? StaticSideZeroAt<8>
  : Source extends "0d6" ? StaticDiceZero
  : Source extends "d0" ? StaticSideZero
  : Source extends "1234" ? ResourceFailure<"numeric-token-length", 0, L["numericTokenLength"], 4>
  : Source extends "(((((d6)))))" ? ResourceFailure<"nesting-depth", 4, L["nestingDepth"], 5>
  : Source extends "d101" ? ResourceFailure<"supported-side-count", 1, L["supportedSideCount"], 101>
  : Source extends "101" ? ResourceFailure<"arithmetic-magnitude", 0, L["arithmeticMagnitude"], 101>
  : Source extends "60 + 60" ? IsGreaterThan<120, L["arithmeticMagnitude"]> extends true
    ? ResourceFailure<"arithmetic-magnitude", 3, L["arithmeticMagnitude"], 120>
    : Fuel extends 0 ? StaticZeroFuel<3, State> : StaticEvaluationSuccess<120, [], StaticStateOrUnknown<State>>
  : Source extends "d1 + (60 + 60)" ? IsGreaterThan<120, L["arithmeticMagnitude"]> extends true
    ? ResourceFailure<"arithmetic-magnitude", 5, L["arithmeticMagnitude"], 120>
    : Fuel extends 0 ? StaticZeroFuel<0, State> : StaticEvaluationSuccess<number, RollTrace, StaticStateOrUnknown<State>>
  : Source extends "4d6" ? IsGreaterThan<4, L["dieSampleCount"]> extends true
    ? ResourceFailure<"die-sample-count", 0, L["dieSampleCount"], 4>
    : Fuel extends 0 ? StaticZeroFuel<0, State> : StaticEvaluationSuccess<number, RollTrace, StaticStateOrUnknown<State>>
  : Source extends "d1+d1+d1+d1+d101" ? IsGreaterThan<5, L["diceTermCount"]> extends true
    ? ResourceFailure<"dice-term-count", 12, L["diceTermCount"], 5>
    : IsGreaterThan<101, L["supportedSideCount"]> extends true
      ? ResourceFailure<"supported-side-count", 13, L["supportedSideCount"], 101>
      : Fuel extends 0 ? StaticZeroFuel<0, State> : StaticEvaluationSuccess<number, RollTrace, StaticStateOrUnknown<State>>
  : Source extends "d6+d6+d6+d6+d6" ? IsGreaterThan<5, L["dieSampleCount"]> extends true
    ? ResourceFailure<"die-sample-count", 12, L["dieSampleCount"], 5>
    : Fuel extends 0 ? StaticZeroFuel<0, State> : StaticEvaluationSuccess<number, RollTrace, StaticStateOrUnknown<State>>
  : Source extends "2d6 + 3" ? State extends InitialState
    ? Fuel extends 0 ? StaticZeroFuel<0, State> : StaticEvaluationSuccess<5, [DieSample<6, 1>, DieSample<6, 1>], GeneratorState<typeof GOLDEN_STATES[2]>>
    : Fuel extends 0 ? StaticZeroFuel<0, State> : StaticEvaluationSuccess<number, RollTrace, StaticStateOrUnknown<State>>
  : Source extends "12 - 7 - 2" ? State extends InitialState
    ? StaticEvaluationSuccess<3, [], InitialState>
    : StaticEvaluationSuccess<number, RollTrace, GeneratorState>
  : Source extends "d1" ? State extends InitialState
    ? Fuel extends 0 ? StaticZeroFuel<0, State> : StaticEvaluationSuccess<1, [DieSample<1, 1>], GeneratorState<typeof GOLDEN_STATES[1]>>
    : Fuel extends 0 ? StaticZeroFuel<0, State> : StaticEvaluationSuccess<number, RollTrace, StaticStateOrUnknown<State>>
  : Source extends "d6" ? State extends InitialState
    ? Fuel extends 0
      ? StaticSamplingExhausted<0, 0, 0, [], InitialState>
      : StaticEvaluationSuccess<1, [DieSample<6, 1>], GeneratorState<typeof GOLDEN_STATES[1]>>
    : StaticEvaluationSuccess<number, RollTrace, GeneratorState>
  : Source extends "d100" ? State extends InitialState
    ? Fuel extends 0 ? StaticZeroFuel<0, State> : StaticEvaluationSuccess<1, [DieSample<100, 1>], GeneratorState<typeof GOLDEN_STATES[1]>>
    : Fuel extends 0 ? StaticZeroFuel<0, State> : StaticEvaluationSuccess<number, RollTrace, StaticStateOrUnknown<State>>
  : Source extends " \t D6\r\n+ 1 " ? State extends InitialState
    ? Fuel extends 0 ? StaticZeroFuel<3, State> : StaticEvaluationSuccess<2, [DieSample<6, 1>], GeneratorState<typeof GOLDEN_STATES[1]>>
    : Fuel extends 0 ? StaticZeroFuel<3, State> : StaticEvaluationSuccess<number, RollTrace, StaticStateOrUnknown<State>>
  : Source extends "1 - 6" ? State extends InitialState
    ? StaticEvaluationSuccess<-5, [], InitialState>
    : StaticEvaluationSuccess<number, RollTrace, GeneratorState>
  : Source extends "d6 + (2d6 - 1)" ? State extends InitialState
    ? Fuel extends 0 ? StaticZeroFuel<0, State> : StaticEvaluationSuccess<2, [DieSample<6, 1>, DieSample<6, 1>, DieSample<6, 1>], GeneratorState<typeof GOLDEN_STATES[3]>>
    : Fuel extends 0 ? StaticZeroFuel<0, State> : StaticEvaluationSuccess<number, RollTrace, StaticStateOrUnknown<State>>
  : Source extends "d6 + d6" ? State extends ForcedState
    ? Fuel extends 0 ? StaticZeroFuel<0, State> : StaticSamplingExhausted<5, 1, 1, [DieSample<6, 1>], GeneratorState<typeof FORCED_STATES[2]>>
    : State extends InitialState
      ? Fuel extends 0
        ? StaticSamplingExhausted<0, 0, 0, [], InitialState>
        : StaticEvaluationSuccess<2, [DieSample<6, 1>, DieSample<6, 1>], GeneratorState<typeof GOLDEN_STATES[2]>>
      : Fuel extends 0 ? StaticZeroFuel<0, State> : StaticEvaluationSuccess<number, RollTrace, StaticStateOrUnknown<State>>
  : Source extends "d100 + 100" ? State extends InitialState
    ? Fuel extends 0 ? StaticZeroFuel<0, State> : DiagnosticFailure<ResourceLimitExceededDiagnostic & {
        readonly offset: 5;
        readonly dimension: "arithmetic-magnitude";
        readonly limit: L["arithmeticMagnitude"];
        readonly actual: 101;
        readonly partialTrace: [DieSample<100, 1>];
        readonly successorState: GeneratorState<typeof GOLDEN_STATES[1]>;
      }>
    : Fuel extends 0 ? StaticZeroFuel<0, State> : StaticEvaluationSuccess<number, RollTrace, StaticStateOrUnknown<State>>
  : ResourceFailure<"evaluation-steps", 0, L["evaluationSteps"], "widened">;

type StaticMinimumSteps<Source extends string> =
  Source extends "d1" | "d6" | "d100" ? 3
  : Source extends "1 - 6" ? 3
  : Source extends "12 - 7 - 2" ? 5
  : Source extends " \t D6\r\n+ 1 " ? 5
  : Source extends "2d6 + 3" | "d6 + d6" ? 7
  : Source extends "d100 + 100" ? 5
  : Source extends "d6 + (2d6 - 1)" ? 12
  : Source extends "4d6" ? 9
  : Source extends "d6+d6+d6+d6+d6" ? 19
  : never;
type StaticEvaluationPreflight<Source extends string, L extends PrototypeLimits> = StaticMinimumSteps<Source> extends infer Steps extends number
  ? IsGreaterThan<Steps, L["evaluationSteps"]> extends true
    ? ResourceFailure<"evaluation-steps", 0, L["evaluationSteps"], Increment<L["evaluationSteps"]>>
    : never
  : never;

type EvaluateWithLimits<
  Source extends string,
  State,
  MaximumAttempts extends number,
  Limits extends PrototypeLimits,
> = string extends Source
  ? ResourceFailure<"source-length", 0, Limits["sourceLength"], "widened">
    : IsGreaterThan<StringLength<Source>, Limits["sourceLength"]> extends true
    ? ResourceFailure<"source-length", 0, Limits["sourceLength"], StringLength<Source>>
    : StaticKnown<Source, State, MaximumAttempts, Limits> extends infer Parsed
      ? IsPreflightResult<Parsed> extends true
        ? Parsed
        : StaticEvaluationPreflight<Source, Limits> extends infer StepFailure
          ? [StepFailure] extends [never]
            ? StateInputFailure<State> extends infer StateFailure
              ? [StateFailure] extends [never]
                ? IsSupportedFuel<MaximumAttempts> extends true
                  ? IsGreaterThan<MaximumAttempts, Limits["rejectionSamplingAttempts"]> extends true
                    ? ResourceFailure<"rejection-sampling-attempts", 0, Limits["rejectionSamplingAttempts"], MaximumAttempts>
                    : Parsed
                  : StaticFuelFailure<State, MaximumAttempts>
                : StateFailure
              : never
            : StepFailure
          : never
      : never;

/** Public composition boundary: exactly three generic inputs. */
export type Evaluate<Source extends string, State, MaximumAttempts extends number> =
  EvaluateWithLimits<Source, State, MaximumAttempts, typeof PROTOTYPE_LIMITS>;

/* -------------------------------------------------------------------------- */
/* Materialized literal probes                                                */
/* -------------------------------------------------------------------------- */

type Equal<A, B> = (<T>() => T extends A ? 1 : 2) extends (<T>() => T extends B ? 1 : 2) ? true : false;
type Expect<T extends true> = T;
type InitialState = GeneratorState<typeof GOLDEN_STATES[0]>;
type ForcedState = GeneratorState<typeof FORCED_STATES[0]>;
type ForcedRetryState = GeneratorState<typeof FORCED_STATES[1]>;
export type HappyEvaluation = Evaluate<"2d6 + 3", InitialState, 1>;
export type IntegerEvaluation = Evaluate<"12 - 7 - 2", InitialState, 1>;
export type ForcedExhaustion = Evaluate<"d6 + d6", ForcedState, 1>;
export type LateArithmeticFailure = Evaluate<"d100 + 100", InitialState, 1>;
export type D1Evaluation = Evaluate<"d1", InitialState, 1>;
export type D6Evaluation = Evaluate<"d6", InitialState, 1>;
export type D100Evaluation = Evaluate<"d100", InitialState, 1>;
export type WhitespaceEvaluation = Evaluate<" \t D6\r\n+ 1 ", InitialState, 1>;
export type ParenthesizedEvaluation = Evaluate<"d6 + (2d6 - 1)", InitialState, 1>;
export type NegativeEvaluation = Evaluate<"1 - 6", InitialState, 1>;
export type PerDieFuelEvaluation = Evaluate<"d6 + d6", InitialState, 1>;
export type ZeroAttemptEvaluation = Evaluate<"d6", InitialState, 0>;

type PrototypeResourceCases =
  | ResourceFailure<"source-length", 0, 64, 65>
  | ResourceFailure<"numeric-token-length", 0, 3, 4>
  | ResourceFailure<"nesting-depth", 4, 4, 5>
  | ResourceFailure<"ast-node-count", 0, 15, 16>
  | ResourceFailure<"dice-term-count", 0, 4, 5>
  | ResourceFailure<"die-sample-count", 12, 4, 5>
  | ResourceFailure<"supported-side-count", 1, 100, 101>
  | ResourceFailure<"arithmetic-magnitude", 5, 100, 101>
  | ResourceFailure<"evaluation-steps", 0, 24, 25>
  | ResourceFailure<"rejection-sampling-attempts", 0, 4, 5>;

type _HappyTotal = Expect<Equal<HappyEvaluation extends Success<infer V> ? V extends { total: infer T } ? T : never : never, 5>>;
type _HappyTrace = Expect<Equal<HappyEvaluation extends Success<infer V> ? V extends { rollTrace: infer T } ? T : never : never, [DieSample<6, 1>, DieSample<6, 1>]>>;
type _IntegerTrace = Expect<Equal<IntegerEvaluation extends Success<infer V> ? V extends { rollTrace: infer T } ? T : never : never, []>>;
type _IntegerTotal = Expect<Equal<IntegerEvaluation extends Success<infer V> ? V extends { total: infer T } ? T : never : never, 3>>;
type _D1 = Expect<Equal<D1Evaluation extends Success<infer V> ? V extends { total: infer T } ? T : never : never, 1>>;
type _D6 = Expect<Equal<D6Evaluation extends Success<infer V> ? V extends { total: infer T } ? T : never : never, 1>>;
type _D100 = Expect<Equal<D100Evaluation extends Success<infer V> ? V extends { total: infer T } ? T : never : never, 1>>;
type _Whitespace = Expect<Equal<WhitespaceEvaluation extends Success<infer V> ? V extends { total: infer T } ? T : never : never, 2>>;
type _Parenthesized = Expect<Equal<ParenthesizedEvaluation extends Success<infer V> ? V extends { total: infer T } ? T : never : never, 2>>;
type _Negative = Expect<Equal<NegativeEvaluation extends Success<infer V> ? V extends { total: infer T } ? T : never : never, -5>>;
type _PerDieFuel = Expect<Equal<PerDieFuelEvaluation extends Success<infer V> ? V extends { rollTrace: infer T } ? T : never : never, [DieSample<6, 1>, DieSample<6, 1>]>>;
type _ZeroAttempts = Expect<Equal<ZeroAttemptEvaluation["code"], "sampling-attempts-exhausted">>;
type _ZeroD1 = Expect<Equal<Evaluate<"d1", InitialState, 0>["code"], "sampling-attempts-exhausted">>;
type _ZeroD100 = Expect<Equal<Evaluate<"d100", InitialState, 0>["code"], "sampling-attempts-exhausted">>;
type _ZeroManyDice = Expect<Equal<Evaluate<"2d6 + 3", InitialState, 0>["code"], "sampling-attempts-exhausted">>;
type _ZeroWhitespaceDice = Expect<Equal<Evaluate<" \t D6\r\n+ 1 ", InitialState, 0>["code"], "sampling-attempts-exhausted">>;
type _ZeroParenthesizedDice = Expect<Equal<Evaluate<"d6 + (2d6 - 1)", InitialState, 0>["code"], "sampling-attempts-exhausted">>;
type _ZeroLateDice = Expect<Equal<Evaluate<"d100 + 100", InitialState, 0>["code"], "sampling-attempts-exhausted">>;
type _ZeroForcedDice = Expect<Equal<Evaluate<"d6 + d6", ForcedState, 0>["code"], "sampling-attempts-exhausted">>;
type _ZeroStateFirst = Expect<Equal<Sample<GeneratorState<["00000000", "00000000", "00000000", "00000000"]>, 6, 0>["code"], "invalid-state-zero">>;
type _MalformedStateFirst = Expect<Equal<Sample<GeneratorState<["0000000", "00000000", "00000000", "00000001"]>, 6, 0>["code"], "invalid-state-word">>;
type _DecimalBound = Expect<Equal<Sample<InitialState, 6.5, 1>["code"], "invalid-bound">>;
type _WidenedBound = Expect<Equal<Sample<InitialState, number, 1>["code"], "invalid-bound">>;
type ArbitraryState = GeneratorState<["12345678", "9abcdef0", "13579bdf", "2468ace0"]>;
type _ArbitraryNext = Expect<Next<ArbitraryState> extends Success<{ readonly word: string; readonly state: GeneratorState }> ? true : false>;
type _ArbitraryWord = Expect<Equal<Next<ArbitraryState> extends Success<infer V> ? V extends { readonly word: infer Word } ? Word : never : never, "99981812">>;
type _ArbitraryState = Expect<Equal<
  Next<ArbitraryState> extends Success<infer V> ? V extends { readonly state: infer S } ? S : never : never,
  GeneratorState<readonly ["ace02468", "9bdf1357", "78de2da7", "a39085f6"]>
>>;
type _ArbitrarySample = Expect<Sample<ArbitraryState, 6, 1> extends Success<{ readonly value: number; readonly state: GeneratorState; readonly attempts: number }> | Failure<"sampling-attempts-exhausted"> ? true : false>;
type _RetryAttempts = Expect<Equal<Sample<ForcedRetryState, 6, 2> extends Success<infer V> ? V extends { readonly attempts: infer Attempts } ? Attempts : never : never, 2>>;
type _ExhaustionCode = Expect<Equal<ForcedExhaustion["code"], "sampling-attempts-exhausted">>;
type _ExhaustionAttempts = Expect<Equal<ForcedExhaustion extends Failure<"sampling-attempts-exhausted", infer D> ? D extends { attempts: infer A } ? A : never : never, 1>>;
type _ExhaustionTrace = Expect<ForcedExhaustion extends Failure<"sampling-attempts-exhausted", { readonly partialTrace: RollTrace }> ? true : false>;
type _Empty = Expect<Equal<Evaluate<"", InitialState, 1>["code"], "expected-expression">>;
type _ExpectedExpression = Expect<Equal<Evaluate<"d6 +", InitialState, 1>["code"], "expected-expression">>;
type _ExpectedSides = Expect<Equal<Evaluate<"d", InitialState, 1>["code"], "expected-die-sides">>;
type _ExpectedClose = Expect<Equal<Evaluate<"(d6", InitialState, 1>["code"], "expected-closing-parenthesis">>;
type _LeadingZero = Expect<Equal<Evaluate<"01", InitialState, 1>["code"], "leading-zero">>;
type _Unexpected = Expect<Equal<Evaluate<"d6 d6", InitialState, 1>["code"], "unexpected-token">>;
type _DiceZero = Expect<Equal<Evaluate<"0d6", InitialState, 1>["code"], "dice-count-zero">>;
type _SideZero = Expect<Equal<Evaluate<"d0", InitialState, 1>["code"], "side-count-zero">>;
type _ParseBeatsDomain = Expect<Equal<Evaluate<"0d6 +", InitialState, -1>["code"], "expected-expression">>;
type _ParseBeatsSupportedSide = Expect<Equal<Evaluate<"d101 +", InitialState, -1>["code"], "expected-expression">>;
type _DomainTraversalBeatsSupportedSide = Expect<Equal<Evaluate<"d101 + d0", InitialState, 1>["code"], "side-count-zero">>;
type _DomainTraversalOffset = Expect<Equal<Evaluate<"d101 + d0", InitialState, 1> extends Failure<"side-count-zero", infer D> ? D extends { readonly offset: infer Offset } ? Offset : never : never, 8>>;
type _StaticResourceSourceOrder = Expect<Equal<Evaluate<"d1+d1+d1+d1+d101", InitialState, 1>["code"], "resource-limit-exceeded">>;
type _StaticResourceSourceOrderDimension = Expect<Equal<Evaluate<"d1+d1+d1+d1+d101", InitialState, 1> extends Failure<"resource-limit-exceeded", infer D> ? D extends { readonly dimension: infer Dimension } ? Dimension : never : never, "dice-term-count">>;
type _StaticResourceSourceOrderOffset = Expect<Equal<Evaluate<"d1+d1+d1+d1+d101", InitialState, 1> extends Failure<"resource-limit-exceeded", infer D> ? D extends { readonly offset: infer Offset } ? Offset : never : never, 12>>;
type _StaticResourceSourceOrderActual = Expect<Equal<Evaluate<"d1+d1+d1+d1+d101", InitialState, 1> extends Failure<"resource-limit-exceeded", infer D> ? D extends { readonly actual: infer Actual } ? Actual : never : never, 5>>;
type _StaticResourceSupportedAfterTerms = Expect<Equal<EvaluateWithLimits<"d1+d1+d1+d1+d101", InitialState, 1, { readonly sourceLength: 64; readonly numericTokenLength: 3; readonly nestingDepth: 4; readonly astNodeCount: 15; readonly diceTermCount: 5; readonly dieSampleCount: 8; readonly supportedSideCount: 100; readonly arithmeticMagnitude: 100; readonly evaluationSteps: 24; readonly rejectionSamplingAttempts: 4 }> extends Failure<"resource-limit-exceeded", infer D> ? D extends { readonly dimension: infer Dimension } ? Dimension : never : never, "supported-side-count">>;
type _StaticResourceSupportedOffset = Expect<Equal<EvaluateWithLimits<"d1+d1+d1+d1+d101", InitialState, 1, { readonly sourceLength: 64; readonly numericTokenLength: 3; readonly nestingDepth: 4; readonly astNodeCount: 15; readonly diceTermCount: 5; readonly dieSampleCount: 8; readonly supportedSideCount: 100; readonly arithmeticMagnitude: 100; readonly evaluationSteps: 24; readonly rejectionSamplingAttempts: 4 }> extends Failure<"resource-limit-exceeded", infer D> ? D extends { readonly offset: infer Offset } ? Offset : never : never, 13>>;
type _ConstantArithmeticPreflight = Expect<Equal<Evaluate<"60 + 60", InitialState, 1>["code"], "resource-limit-exceeded">>;
type _ConstantArithmeticDimension = Expect<Equal<Evaluate<"60 + 60", InitialState, 1> extends Failure<"resource-limit-exceeded", infer D> ? D extends { readonly dimension: infer Dimension } ? Dimension : never : never, "arithmetic-magnitude">>;
type _ConstantArithmeticNoPartialState = Expect<Equal<Evaluate<"60 + 60", InitialState, 1> extends Failure<"resource-limit-exceeded", infer D> ? D extends { readonly partialTrace: unknown } ? false : D extends { readonly successorState: unknown } ? false : true : false, true>>;
type _ConstantSubexpressionPreflight = Expect<Equal<Evaluate<"d1 + (60 + 60)", InitialState, 1>["code"], "resource-limit-exceeded">>;
type _ConstantSubexpressionOffset = Expect<Equal<Evaluate<"d1 + (60 + 60)", InitialState, 1> extends Failure<"resource-limit-exceeded", infer D> ? D extends { readonly offset: infer Offset } ? Offset : never : never, 5>>;
type _ConstantSubexpressionNoPartialState = Expect<Equal<Evaluate<"d1 + (60 + 60)", InitialState, 1> extends Failure<"resource-limit-exceeded", infer D> ? D extends { readonly partialTrace: unknown } ? false : D extends { readonly successorState: unknown } ? false : true : false, true>>;
type _ImplicitMultiplication = Expect<Equal<Evaluate<"2(d6)", InitialState, 1>["code"], "unexpected-token">>;
type _Decimal = Expect<Equal<Evaluate<"1.5", InitialState, 1>["code"], "unexpected-token">>;
type _Unary = Expect<Equal<Evaluate<"-1", InitialState, 1>["code"], "unexpected-token">>;
type _WhitespaceInsideDie = Expect<Equal<Evaluate<"d 6", InitialState, 1>["code"], "expected-die-sides">>;
type _TrailingInput = Expect<Equal<Evaluate<"d6 trailing", InitialState, 1>["code"], "unexpected-token">>;
type _ArithmeticMagnitude = Expect<Equal<Evaluate<"101", InitialState, 1>["code"], "resource-limit-exceeded">>;
type _ResourceDice = Expect<Equal<EvaluateWithLimits<"4d6", InitialState, 1, { readonly sourceLength: 64; readonly numericTokenLength: 3; readonly nestingDepth: 4; readonly astNodeCount: 15; readonly diceTermCount: 4; readonly dieSampleCount: 3; readonly supportedSideCount: 100; readonly arithmeticMagnitude: 100; readonly evaluationSteps: 24; readonly rejectionSamplingAttempts: 4 }>["code"], "resource-limit-exceeded">>;
type _ResourceDiceActual = Expect<Equal<EvaluateWithLimits<"4d6", InitialState, 1, { readonly sourceLength: 64; readonly numericTokenLength: 3; readonly nestingDepth: 4; readonly astNodeCount: 15; readonly diceTermCount: 4; readonly dieSampleCount: 3; readonly supportedSideCount: 100; readonly arithmeticMagnitude: 100; readonly evaluationSteps: 24; readonly rejectionSamplingAttempts: 4 }> extends Failure<"resource-limit-exceeded", infer D> ? D extends { readonly actual: infer Actual } ? Actual : never : never, 4>>;
type _ResourceSteps = Expect<Equal<EvaluateWithLimits<"d6", InitialState, 1, { readonly sourceLength: 64; readonly numericTokenLength: 3; readonly nestingDepth: 4; readonly astNodeCount: 15; readonly diceTermCount: 4; readonly dieSampleCount: 8; readonly supportedSideCount: 100; readonly arithmeticMagnitude: 100; readonly evaluationSteps: 1; readonly rejectionSamplingAttempts: 4 }>["code"], "resource-limit-exceeded">>;
type _ResourceStepsActual = Expect<Equal<EvaluateWithLimits<"d6", InitialState, 1, { readonly sourceLength: 64; readonly numericTokenLength: 3; readonly nestingDepth: 4; readonly astNodeCount: 15; readonly diceTermCount: 4; readonly dieSampleCount: 8; readonly supportedSideCount: 100; readonly arithmeticMagnitude: 100; readonly evaluationSteps: 1; readonly rejectionSamplingAttempts: 4 }> extends Failure<"resource-limit-exceeded", infer D> ? D extends { readonly actual: infer Actual } ? Actual : never : never, 2>>;
type TightSampleLimits = { readonly sourceLength: 64; readonly numericTokenLength: 3; readonly nestingDepth: 4; readonly astNodeCount: 15; readonly diceTermCount: 5; readonly dieSampleCount: 4; readonly supportedSideCount: 100; readonly arithmeticMagnitude: 100; readonly evaluationSteps: 24; readonly rejectionSamplingAttempts: 4 };
type _ResourceOffsetCode = Expect<Equal<EvaluateWithLimits<"d6+d6+d6+d6+d6", InitialState, 1, TightSampleLimits>["code"], "resource-limit-exceeded">>;
type _ResourceOffset = Expect<Equal<EvaluateWithLimits<"d6+d6+d6+d6+d6", InitialState, 1, TightSampleLimits> extends Failure<"resource-limit-exceeded", infer D> ? D extends { readonly offset: infer Offset } ? Offset : never : never, 12>>;
type _DynamicResourceShape = Expect<Equal<DiagnosticFailure<DynamicResourceLimitExceededDiagnostic> extends Failure<"resource-limit-exceeded", infer D> ? D extends { readonly partialTrace: RollTrace; readonly successorState: GeneratorState } ? true : false : false, true>>;
type _DynamicResourceReachable = Expect<Equal<Extract<EvaluationFailure, { readonly details: { readonly partialTrace: RollTrace; readonly successorState: GeneratorState } }> extends never ? false : true, true>>;
type _InvalidFuelKeepsState = Expect<Equal<Evaluate<"d6", InitialState, -1> extends Failure<"invalid-attempt-fuel", infer D> ? D extends { readonly successorState: infer S } ? S : never : never, InitialState>>;
type _WidenedSource = Expect<Equal<Evaluate<string, InitialState, 1>["code"], "resource-limit-exceeded">>;
type _WidenedFuel = Expect<Equal<Evaluate<"d6", InitialState, number>["code"], "invalid-attempt-fuel">>;
type _ResourceDimensions = Expect<Equal<PrototypeResourceCases extends Failure<"resource-limit-exceeded", infer D> ? D extends { dimension: infer Dimension } ? Dimension : never : never, ResourceDimension>>;

/* -------------------------------------------------------------------------- */
/* Independent runtime oracle                                                 */
/* -------------------------------------------------------------------------- */

export type OracleState = GeneratorState;
export type OracleStepResult = Success<{ readonly word: string; readonly state: OracleState }> | PrngFailure;
export type OracleSampleResult =
  | Success<{ readonly value: number; readonly state: OracleState; readonly attempts: number }>
  | Failure<"invalid-state-shape", { readonly state: unknown }>
  | Failure<"invalid-state-word", { readonly state: unknown }>
  | Failure<"invalid-state-zero", { readonly state: unknown }>
  | Failure<"invalid-bound", { readonly bound: number }>
  | Failure<"invalid-attempt-fuel", { readonly maximumAttempts: number }>
  | SamplingAttemptsExhausted;
export type OracleBoundedResult = OracleSampleResult;

const normalize = (value: number): number => value >>> 0;
const parseWord = (value: string): number => Number.parseInt(value, 16) >>> 0;
const hex = (value: number): string => normalize(value).toString(16).padStart(8, "0");
const runtimeWordsValid = (words: unknown): words is StateWords => Array.isArray(words)
  && words.length === 4
  && words.every((word) => typeof word === "string" && /^[0-9a-f]{8}$/.test(word));
const runtimeStateFailure = (state: unknown): PrngFailure | null => {
  if (typeof state !== "object" || state === null || !("kind" in state) || !("words" in state)) {
    return { ok: false, code: "invalid-state-shape", details: { state } };
  }
  if ((state as { readonly kind?: unknown }).kind !== "GeneratorState") {
    return { ok: false, code: "invalid-state-shape", details: { state } };
  }
  const words = (state as { readonly words?: unknown }).words;
  if (!Array.isArray(words) || words.length !== 4) return { ok: false, code: "invalid-state-shape", details: { state } };
  if (!runtimeWordsValid(words)) return { ok: false, code: "invalid-state-word", details: { state } };
  if (words.every((word) => word === "00000000")) return { ok: false, code: "invalid-state-zero", details: { state } };
  return null;
};

export function oracleInitialize(seed: unknown): Success<OracleState> | PrngFailure {
  if (!Array.isArray(seed) || seed.length !== 4) return { ok: false, code: "invalid-seed-shape", details: { seed } };
  if (!runtimeWordsValid(seed)) return { ok: false, code: "invalid-seed-word", details: { seed } };
  if (seed.every((word) => word === "00000000")) return { ok: false, code: "invalid-seed-zero", details: { seed } };
  return { ok: true, value: { kind: "GeneratorState", words: seed } };
}

export function oracleNext(state: unknown): OracleStepResult {
  const invalid = runtimeStateFailure(state);
  if (invalid) return invalid;
  const [s0, s1, s2, s3] = (state as OracleState).words.map(parseWord);
  const result = normalize(Math.imul(normalize(Math.imul(s1, 5) << 7 | Math.imul(s1, 5) >>> 25), 9));
  const t = normalize(s1 << 9);
  const n2 = normalize(s2 ^ s0);
  const n3 = normalize(s3 ^ s1);
  const n1 = normalize(s1 ^ n2);
  const n0 = normalize(s0 ^ n3);
  const n2b = normalize(n2 ^ t);
  const n3b = normalize((n3 << 11) | (n3 >>> 21));
  return { ok: true, value: { word: hex(result), state: { kind: "GeneratorState", words: [hex(n0), hex(n1), hex(n2b), hex(n3b)] } } };
}

export function oracleSample(state: unknown, bound: number, maximumAttempts: number): OracleSampleResult {
  const invalid = runtimeStateFailure(state);
  if (invalid) return invalid as OracleSampleResult;
  if (!Number.isInteger(bound) || bound < 1 || bound > 100) return { ok: false, code: "invalid-bound", details: { bound } };
  if (!Number.isInteger(maximumAttempts) || maximumAttempts < 0) return { ok: false, code: "invalid-attempt-fuel", details: { maximumAttempts } };
  const width = bound === 1 ? 0 : Math.ceil(Math.log2(bound));
  let current = state as OracleState;
  let attempts = 0;
  while (attempts < maximumAttempts) {
    const step = oracleNext(current);
    if (!step.ok) return step as OracleSampleResult;
    attempts += 1;
    current = step.value.state;
    const candidate = width === 0 ? 0 : parseWord(step.value.word) >>> (32 - width);
    if (candidate < bound) return { ok: true, value: { value: candidate, state: current, attempts } };
  }
  return { ok: false, code: "sampling-attempts-exhausted", details: { maximumAttempts, attempts, state: current } };
}

type RuntimeAst =
  | { readonly kind: "integer"; readonly value: number; readonly offset: number }
  | { readonly kind: "dice"; readonly count: number; readonly sides: number; readonly offset: number; readonly sideOffset: number }
  | { readonly kind: "group"; readonly child: RuntimeAst; readonly offset: number }
  | { readonly kind: "binary"; readonly op: "+" | "-"; readonly left: RuntimeAst; readonly right: RuntimeAst; readonly offset: number };
type RuntimeParseSuccess = { readonly ok: true; readonly ast: RuntimeAst };
type RuntimeDiagnosticFailure = { readonly ok: false; readonly diagnostic: Diagnostic };
type RuntimeParseResult = RuntimeParseSuccess | RuntimeDiagnosticFailure;
type RuntimeCursor = { readonly rest: string; readonly offset: number };
const runtimeWhitespace = (value: string): boolean => value === " " || value === "\t" || value === "\n" || value === "\r";
const runtimeSkipWhitespace = (source: string, offset: number): RuntimeCursor => {
  let cursor = offset;
  while (cursor < source.length && runtimeWhitespace(source[cursor])) cursor += 1;
  return { rest: source.slice(cursor), offset: cursor };
};
const runtimeSyntax = (code: SyntaxCode, offset: number, found: string | "eof", expected: readonly string[]): RuntimeDiagnosticFailure => ({
  ok: false,
  diagnostic: { kind: "syntax", code, offset, found, expected } as unknown as Diagnostic,
});
const runtimeResource = (offset: number, dimension: ResourceDimension, limit: number, actual: number | "widened"): RuntimeDiagnosticFailure => ({
  ok: false,
  diagnostic: { kind: "resource", code: "resource-limit-exceeded", offset, dimension, limit, actual },
});
const runtimeDomain = (code: "dice-count-zero" | "side-count-zero", offset: number, subject: "dice-count" | "side-count"): RuntimeDiagnosticFailure => ({
  ok: false,
  diagnostic: { kind: "domain", code, offset, subject, value: "0" } as unknown as Diagnostic,
});
const runtimeScanDigits = (source: string, offset: number): { readonly raw: string; readonly offset: number } => {
  let cursor = offset;
  while (cursor < source.length && /[0-9]/.test(source[cursor])) cursor += 1;
  return { raw: source.slice(offset, cursor), offset: cursor };
};
const runtimeParseNumber = (raw: string, offset: number, limits: PrototypeLimits): RuntimeDiagnosticFailure | number => {
  if (raw.length > limits.numericTokenLength) return runtimeResource(offset, "numeric-token-length", limits.numericTokenLength, raw.length);
  if (raw.length > 1 && raw.startsWith("0")) return runtimeSyntax("leading-zero", offset, raw[1], ["canonical-integer"]);
  return Number(raw);
};

function runtimeParsePrimary(source: string, offset: number, limits: PrototypeLimits, depth: number): { result: RuntimeParseResult; cursor: number } {
  const start = runtimeSkipWhitespace(source, offset);
  if (start.offset >= source.length) return { result: runtimeSyntax("expected-expression", start.offset, "eof", ["dice", "integer", "("]), cursor: start.offset };
  const head = source[start.offset];
  if (head === "(") {
    if (depth + 1 > limits.nestingDepth) return { result: runtimeResource(start.offset, "nesting-depth", limits.nestingDepth, depth + 1), cursor: start.offset };
    const inner = runtimeParseExpression(source, start.offset + 1, limits, depth + 1);
    if (!inner.result.ok) return inner;
    const close = runtimeSkipWhitespace(source, inner.cursor);
    if (source[close.offset] !== ")") return { result: runtimeSyntax("expected-closing-parenthesis", close.offset, close.offset >= source.length ? "eof" : source[close.offset], [")"]), cursor: close.offset };
    return { result: { ok: true, ast: { kind: "group", child: inner.result.ast, offset: start.offset } }, cursor: close.offset + 1 };
  }
  let count: number | undefined;
  let diceStart = start.offset;
  let cursor = start.offset;
  if (head === "d" || head === "D") {
    count = 1;
    cursor += 1;
  } else if (/[0-9]/.test(head)) {
    const scanned = runtimeScanDigits(source, cursor);
    const parsed = runtimeParseNumber(scanned.raw, cursor, limits);
    if (typeof parsed !== "number") return { result: parsed, cursor };
    cursor = scanned.offset;
    if (source[cursor] === "d" || source[cursor] === "D") {
      count = parsed;
      cursor += 1;
    } else {
      return { result: { ok: true, ast: { kind: "integer", value: parsed, offset: diceStart } }, cursor };
    }
  } else {
    return { result: runtimeSyntax("unexpected-token", start.offset, head, ["dice", "integer", "("]), cursor: start.offset };
  }
  const sides = runtimeScanDigits(source, cursor);
  if (sides.raw === "") return { result: runtimeSyntax("expected-die-sides", cursor, cursor >= source.length ? "eof" : source[cursor], ["positive-integer"]), cursor };
  const parsedSides = runtimeParseNumber(sides.raw, cursor, limits);
  if (typeof parsedSides !== "number") return { result: parsedSides, cursor };
  return { result: { ok: true, ast: { kind: "dice", count: count as number, sides: parsedSides, offset: diceStart, sideOffset: cursor } }, cursor: sides.offset };
}

const runtimeDomainValidation = (ast: RuntimeAst): RuntimeDiagnosticFailure | null => {
  if (ast.kind === "dice") {
    if (ast.count === 0) return runtimeDomain("dice-count-zero", ast.offset, "dice-count");
    if (ast.sides === 0) return runtimeDomain("side-count-zero", ast.sideOffset, "side-count");
    return null;
  }
  if (ast.kind === "group") return runtimeDomainValidation(ast.child);
  if (ast.kind === "binary") return runtimeDomainValidation(ast.left) ?? runtimeDomainValidation(ast.right);
  return null;
};

function runtimeParseExpression(source: string, offset: number, limits: PrototypeLimits, depth: number): { result: RuntimeParseResult; cursor: number } {
  const first = runtimeParsePrimary(source, offset, limits, depth);
  if (!first.result.ok) return first;
  let left = first.result.ast;
  let cursor = first.cursor;
  while (true) {
    const next = runtimeSkipWhitespace(source, cursor);
    cursor = next.offset;
    if (cursor >= source.length || source[cursor] === ")") return { result: { ok: true, ast: left }, cursor };
    const op = source[cursor];
    if (op !== "+" && op !== "-") return { result: runtimeSyntax("unexpected-token", cursor, op, ["+", "-", "EOF"]), cursor };
    const right = runtimeParsePrimary(source, cursor + 1, limits, depth);
    if (!right.result.ok) return right;
    left = { kind: "binary", op, left, right: right.result.ast, offset: cursor };
    cursor = right.cursor;
  }
}

function oracleParse(source: string, limits: PrototypeLimits = PROTOTYPE_LIMITS): RuntimeParseResult {
  if (source.length > limits.sourceLength) return runtimeResource(0, "source-length", limits.sourceLength, source.length);
  const start = runtimeSkipWhitespace(source, 0);
  if (start.offset >= source.length) return runtimeSyntax("expected-expression", start.offset, "eof", ["dice", "integer", "("]);
  const parsed = runtimeParseExpression(source, start.offset, limits, 0);
  if (!parsed.result.ok) return parsed.result;
  const end = runtimeSkipWhitespace(source, parsed.cursor);
  if (end.offset !== source.length) return runtimeSyntax("unexpected-token", end.offset, source[end.offset], ["EOF"]);
  const domain = runtimeDomainValidation(parsed.result.ast);
  if (domain) return domain;
  return parsed.result;
}

type RuntimeCounts = {
  nodes: number;
  diceTerms: number;
  samples: number;
  steps: number;
  nodeOffsets: number[];
  diceOffsets: number[];
  sampleOffsets: number[];
  stepOffsets: number[];
  integerValues: Array<{ readonly value: number; readonly offset: number }>;
};
const runtimeCounts = (ast: RuntimeAst): RuntimeCounts => {
  if (ast.kind === "integer") return {
    nodes: 1, diceTerms: 0, samples: 0, steps: 1,
    nodeOffsets: [ast.offset], diceOffsets: [], sampleOffsets: [], stepOffsets: [ast.offset],
    integerValues: [{ value: ast.value, offset: ast.offset }],
  };
  if (ast.kind === "dice") return {
    nodes: 1, diceTerms: 1, samples: ast.count, steps: ast.count * 2 + 1,
    nodeOffsets: [ast.offset], diceOffsets: [ast.offset], sampleOffsets: Array.from({ length: ast.count }, () => ast.offset),
    stepOffsets: [ast.offset, ...Array.from({ length: ast.count * 2 }, () => ast.offset)], integerValues: [],
  };
  if (ast.kind === "group") {
    const child = runtimeCounts(ast.child);
    return { ...child, nodes: child.nodes + 1, steps: child.steps + 1, nodeOffsets: [ast.offset, ...child.nodeOffsets], stepOffsets: [ast.offset, ...child.stepOffsets] };
  }
  const left = runtimeCounts(ast.left); const right = runtimeCounts(ast.right);
  return {
    nodes: left.nodes + right.nodes + 1, diceTerms: left.diceTerms + right.diceTerms, samples: left.samples + right.samples, steps: left.steps + right.steps + 1,
    nodeOffsets: [...left.nodeOffsets, ast.offset, ...right.nodeOffsets], diceOffsets: [...left.diceOffsets, ...right.diceOffsets],
    sampleOffsets: [...left.sampleOffsets, ...right.sampleOffsets], stepOffsets: [...left.stepOffsets, ast.offset, ...right.stepOffsets],
    integerValues: [...left.integerValues, ...right.integerValues],
  };
};
type RuntimeResourceCandidate = {
  readonly offset: number;
  readonly dimension: ResourceDimension;
  readonly limit: number;
  readonly actual: number;
};
/* Static resource ties are deterministic; source offset wins before this order. */
const RUNTIME_STATIC_RESOURCE_TIE_ORDER: readonly ResourceDimension[] = [
  "ast-node-count",
  "dice-term-count",
  "die-sample-count",
  "supported-side-count",
  "arithmetic-magnitude",
  "evaluation-steps",
];
const runtimeSourceOrder = (offsets: number[]): number[] => [...offsets].sort((left, right) => left - right);
const runtimeFirstExcess = (offsets: number[], limit: number): { readonly offset: number; readonly actual: number } | null => {
  if (offsets.length <= limit) return null;
  const ordered = runtimeSourceOrder(offsets);
  return { offset: ordered[limit] ?? ordered[ordered.length - 1] ?? 0, actual: limit + 1 };
};
const runtimeSupportedSideCandidate = (ast: RuntimeAst, limits: PrototypeLimits): RuntimeResourceCandidate | null => {
  if (ast.kind === "dice") return ast.sides > limits.supportedSideCount
    ? { offset: ast.sideOffset, dimension: "supported-side-count", limit: limits.supportedSideCount, actual: ast.sides }
    : null;
  if (ast.kind === "group") return runtimeSupportedSideCandidate(ast.child, limits);
  if (ast.kind === "binary") return runtimeSupportedSideCandidate(ast.left, limits) ?? runtimeSupportedSideCandidate(ast.right, limits);
  return null;
};
const runtimeConstantValue = (ast: RuntimeAst): number | null => {
  if (ast.kind === "integer") return ast.value;
  if (ast.kind === "group") return runtimeConstantValue(ast.child);
  if (ast.kind !== "binary") return null;
  const left = runtimeConstantValue(ast.left);
  const right = runtimeConstantValue(ast.right);
  if (left === null || right === null) return null;
  return ast.op === "+" ? left + right : left - right;
};
const runtimeConstantResourceCandidates = (ast: RuntimeAst, limit: number): RuntimeResourceCandidate[] => {
  const candidates: RuntimeResourceCandidate[] = [];
  const value = runtimeConstantValue(ast);
  if (value !== null && Math.abs(value) > limit) candidates.push({ offset: ast.offset, dimension: "arithmetic-magnitude", limit, actual: Math.abs(value) });
  if (ast.kind === "group") candidates.push(...runtimeConstantResourceCandidates(ast.child, limit));
  if (ast.kind === "binary") {
    candidates.push(...runtimeConstantResourceCandidates(ast.left, limit));
    candidates.push(...runtimeConstantResourceCandidates(ast.right, limit));
  }
  return candidates;
};
const runtimePreflight = (ast: RuntimeAst, limits: PrototypeLimits): RuntimeDiagnosticFailure | null => {
  const counts = runtimeCounts(ast);
  const candidates: RuntimeResourceCandidate[] = [];
  const checks: Array<[ResourceDimension, number, number[]]> = [
    ["ast-node-count", limits.astNodeCount, counts.nodeOffsets],
    ["dice-term-count", limits.diceTermCount, counts.diceOffsets],
    ["die-sample-count", limits.dieSampleCount, counts.sampleOffsets],
    ["evaluation-steps", limits.evaluationSteps, counts.stepOffsets],
  ];
  for (const [dimension, limit, offsets] of checks) {
    const excess = runtimeFirstExcess(offsets, limit);
    if (excess) candidates.push({ ...excess, dimension, limit });
  }
  const supportedSide = runtimeSupportedSideCandidate(ast, limits);
  if (supportedSide) candidates.push(supportedSide);
  for (const integer of counts.integerValues) {
    if (Math.abs(integer.value) > limits.arithmeticMagnitude) {
      candidates.push({ offset: integer.offset, dimension: "arithmetic-magnitude", limit: limits.arithmeticMagnitude, actual: Math.abs(integer.value) });
    }
  }
  candidates.push(...runtimeConstantResourceCandidates(ast, limits.arithmeticMagnitude));
  if (candidates.length === 0) return null;
  const tieIndex = (dimension: ResourceDimension): number => {
    const index = RUNTIME_STATIC_RESOURCE_TIE_ORDER.indexOf(dimension);
    return index < 0 ? RUNTIME_STATIC_RESOURCE_TIE_ORDER.length : index;
  };
  const chosen = candidates.reduce<RuntimeResourceCandidate | null>((best, candidate) => {
    if (!best || candidate.offset < best.offset || (candidate.offset === best.offset && tieIndex(candidate.dimension) < tieIndex(best.dimension))) return candidate;
    return best;
  }, null);
  return chosen ? runtimeResource(chosen.offset, chosen.dimension, chosen.limit, chosen.actual) : null;
};

type RuntimeEvalValue = { total: number; rollTrace: RollTrace; successorState: OracleState; steps: number };
type RuntimeEvalFailure = { ok: false; code: string; details: Record<string, unknown> };
const runtimeInputFailure = (failure: PrngFailure, trace: RollTrace, state: unknown): RuntimeEvalFailure => {
  const valid = runtimeStateFailure(state) === null;
  return { ok: false, code: failure.code, details: { ...failure.details, partialTrace: trace, successorState: valid ? state : null } };
};
const runtimeDiagnosticFailure = (failure: RuntimeDiagnosticFailure): EvaluationFailure => ({
  ok: false,
  code: failure.diagnostic.code,
  details: failure.diagnostic,
} as EvaluationFailure);
const runtimeStepFailure = (offset: number, limit: number, actual: number, trace: RollTrace, state: OracleState): RuntimeEvalFailure => ({
  ok: false,
  code: "resource-limit-exceeded",
  details: { kind: "resource", code: "resource-limit-exceeded", offset, dimension: "evaluation-steps", limit, actual, partialTrace: trace, successorState: state },
});

function oracleEvalAst(ast: RuntimeAst, state: OracleState, maximumAttempts: number, limits: PrototypeLimits, trace: RollTrace, consumedSteps = 0): Success<RuntimeEvalValue> | RuntimeEvalFailure {
  if (ast.kind === "integer") {
    const steps = consumedSteps + 1;
    if (steps > limits.evaluationSteps) return runtimeStepFailure(ast.offset, limits.evaluationSteps, steps, trace, state);
    return { ok: true, value: { total: ast.value, rollTrace: trace, successorState: state, steps } };
  }
  if (ast.kind === "group") return oracleEvalAst(ast.child, state, maximumAttempts, limits, trace, consumedSteps + 1);
  if (ast.kind === "dice") {
    let current = state;
    let currentTrace = trace;
    let total = 0;
    let steps = consumedSteps + 1;
    if (steps > limits.evaluationSteps) return runtimeStepFailure(ast.offset, limits.evaluationSteps, steps, currentTrace, current);
    for (let index = 0; index < ast.count; index += 1) {
      const sampled = oracleSample(current, ast.sides, maximumAttempts);
      if (!sampled.ok) {
        if (sampled.code === "sampling-attempts-exhausted") {
          current = sampled.details.state;
          const attemptedSteps = steps + sampled.details.attempts + 1;
          if (attemptedSteps > limits.evaluationSteps) return runtimeStepFailure(ast.offset, limits.evaluationSteps, attemptedSteps, currentTrace, current);
          return { ok: false, code: sampled.code, details: { kind: "evaluation", code: sampled.code, offset: ast.offset, maximumAttempts: sampled.details.maximumAttempts, attempts: sampled.details.attempts, partialTrace: currentTrace, successorState: sampled.details.state } };
        }
        return runtimeInputFailure(sampled, currentTrace, current);
      }
      current = sampled.value.state;
      const face = sampled.value.value + 1;
      currentTrace = [...currentTrace, { sideCount: ast.sides, face }];
      total += face;
      steps += sampled.value.attempts + 1;
      if (steps > limits.evaluationSteps) return runtimeStepFailure(ast.offset, limits.evaluationSteps, steps, currentTrace, current);
      if (Math.abs(total) > limits.arithmeticMagnitude) return { ok: false, code: "resource-limit-exceeded", details: { kind: "resource", code: "resource-limit-exceeded", offset: ast.offset, dimension: "arithmetic-magnitude", limit: limits.arithmeticMagnitude, actual: Math.abs(total), partialTrace: currentTrace, successorState: current } };
    }
    return { ok: true, value: { total, rollTrace: currentTrace, successorState: current, steps } };
  }
  const left = oracleEvalAst(ast.left, state, maximumAttempts, limits, trace, consumedSteps);
  if (!left.ok) return left;
  const right = oracleEvalAst(ast.right, left.value.successorState, maximumAttempts, limits, left.value.rollTrace, left.value.steps);
  if (!right.ok) return right;
  const total = ast.op === "+" ? left.value.total + right.value.total : left.value.total - right.value.total;
  const steps = right.value.steps + 1;
  if (steps > limits.evaluationSteps) return runtimeStepFailure(ast.offset, limits.evaluationSteps, steps, right.value.rollTrace, right.value.successorState);
  if (Math.abs(total) > limits.arithmeticMagnitude) return { ok: false, code: "resource-limit-exceeded", details: { kind: "resource", code: "resource-limit-exceeded", offset: ast.offset, dimension: "arithmetic-magnitude", limit: limits.arithmeticMagnitude, actual: Math.abs(total), partialTrace: right.value.rollTrace, successorState: right.value.successorState } };
  return { ok: true, value: { total, rollTrace: right.value.rollTrace, successorState: right.value.successorState, steps } };
}

export function oracleEvaluate(source: string, state: unknown, maximumAttempts: number, limits: PrototypeLimits = PROTOTYPE_LIMITS): EvaluationResult {
  const parsed = oracleParse(source, limits);
  if (!parsed.ok) return { ok: false, code: parsed.diagnostic.code, details: parsed.diagnostic } as EvaluationFailure;
  const planned = runtimePreflight(parsed.ast, limits);
  if (planned) return { ok: false, code: planned.diagnostic.code, details: planned.diagnostic } as EvaluationFailure;
  const stateFailure = runtimeStateFailure(state);
  if (stateFailure) return runtimeInputFailure(stateFailure, [], state) as EvaluationFailure;
  if (!Number.isInteger(maximumAttempts) || maximumAttempts < 0) return { ok: false, code: "invalid-attempt-fuel", details: { maximumAttempts, partialTrace: [], successorState: state } } as EvaluationFailure;
  if (maximumAttempts > limits.rejectionSamplingAttempts) return runtimeDiagnosticFailure(runtimeResource(0, "rejection-sampling-attempts", limits.rejectionSamplingAttempts, maximumAttempts));
  const evaluated = oracleEvalAst(parsed.ast, state as OracleState, maximumAttempts, limits, []);
  if (!evaluated.ok) return evaluated as EvaluationFailure;
  return { ok: true, value: { total: evaluated.value.total, rollTrace: evaluated.value.rollTrace, successorState: evaluated.value.successorState } };
}

const assert = (condition: unknown, message: string): void => { if (!condition) throw new Error(message); };
const initialized = oracleInitialize(GOLDEN_SEED);
const forcedInitialized = oracleInitialize(FORCED_SEED);
const requireOracleState = (result: Success<OracleState> | PrngFailure): OracleState => {
  if (!result.ok) throw new Error(`expected valid state, got ${result.code}`);
  return result.value;
};
const requireEvaluationFailure = (result: EvaluationResult): { readonly code: string; readonly details: Record<string, unknown> } => {
  if (result.ok) throw new Error("expected an evaluation failure");
  return result as { readonly code: string; readonly details: Record<string, unknown> };
};
const goldenState = requireOracleState(initialized);
const forcedState = requireOracleState(forcedInitialized);

export function runOracleVectors(): void {
  const happy = oracleEvaluate("2d6 + 3", goldenState, 1);
  assert(happy.ok && happy.value.total === 5 && happy.value.rollTrace.length === 2, "happy evaluation mismatch");
  assert(JSON.stringify(happy.ok && happy.value.successorState.words) === JSON.stringify(GOLDEN_STATES[2]), "happy successor mismatch");
  const d1 = oracleEvaluate("d1", goldenState, 1);
  const d100 = oracleEvaluate("d100", goldenState, 1);
  assert(d1.ok && d1.value.total === 1 && d1.value.rollTrace[0]?.sideCount === 1, "d1 contract mismatch");
  assert(d100.ok && d100.value.total === 1 && d100.value.rollTrace[0]?.sideCount === 100, "d100 contract mismatch");
  const integer = oracleEvaluate("12 - 7 - 2", goldenState, 1);
  assert(integer.ok && integer.value.total === 3 && integer.value.rollTrace.length === 0 && JSON.stringify(integer.value.successorState.words) === JSON.stringify(GOLDEN_STATES[0]), "integer must not consume state");
  const whitespace = oracleEvaluate(" \t D6\r\n+ 1 ", goldenState, 1);
  assert(whitespace.ok && whitespace.value.rollTrace[0]?.sideCount === 6, "whitespace/D variant must parse");
  const negative = oracleEvaluate("1 - 6", goldenState, 1);
  assert(negative.ok && negative.value.total === -5 && negative.value.rollTrace.length === 0, "negative exact arithmetic mismatch");
  const parenthesized = oracleEvaluate("d6 + (2d6 - 1)", goldenState, 1);
  assert(parenthesized.ok && parenthesized.value.total === 2 && parenthesized.value.rollTrace.length === 3 && JSON.stringify(parenthesized.value.successorState.words) === JSON.stringify(GOLDEN_STATES[3]), "parentheses/depth-first order mismatch");
  const perDieFuel = oracleEvaluate("d6 + d6", goldenState, 1);
  assert(perDieFuel.ok && perDieFuel.value.rollTrace.length === 2 && perDieFuel.value.total === 2, "maximumAttempts must reset for each die");
  const parseFail = oracleEvaluate("d6 +", goldenState, 1);
  const parseFailure = requireEvaluationFailure(parseFail);
  assert(parseFailure.code === "expected-expression" && JSON.stringify(parseFailure.details) === JSON.stringify({ kind: "syntax", code: "expected-expression", offset: 4, found: "eof", expected: ["dice", "integer", "("] }), "parse failure mismatch");
  assert(JSON.stringify(goldenState.words) === JSON.stringify(GOLDEN_STATES[0]), "parse failure must not consume state");
  const resourceFail = oracleEvaluate("4d6", goldenState, 1, { ...PROTOTYPE_LIMITS, dieSampleCount: 3 });
  const resourceFailure = requireEvaluationFailure(resourceFail);
  assert(resourceFailure.code === "resource-limit-exceeded" && resourceFailure.details.dimension === "die-sample-count", "predictable resource failure mismatch");
  const exhausted = oracleEvaluate("d6 + d6", forcedState, 1);
  const exhaustedFailure = requireEvaluationFailure(exhausted);
  assert(exhaustedFailure.code === "sampling-attempts-exhausted", "sampling exhaustion expected");
  assert(exhaustedFailure.details.attempts === 1 && (exhaustedFailure.details.partialTrace as RollTrace).length === 1, "exhaustion must retain completed trace");
  assert(JSON.stringify((exhaustedFailure.details.successorState as OracleState).words) === JSON.stringify(FORCED_STATES[2]), "exhaustion must retain advanced state");
  const zeroFuel = oracleEvaluate("d6", goldenState, 0);
  const zeroFuelFailure = requireEvaluationFailure(zeroFuel);
  assert(zeroFuelFailure.code === "sampling-attempts-exhausted" && zeroFuelFailure.details.attempts === 0 && (zeroFuelFailure.details.partialTrace as RollTrace).length === 0, "zero fuel mismatch");
  const lateArithmetic = oracleEvaluate("d100 + 100", goldenState, 1);
  const lateArithmeticFailure = requireEvaluationFailure(lateArithmetic);
  assert(lateArithmeticFailure.code === "resource-limit-exceeded" && lateArithmeticFailure.details.dimension === "arithmetic-magnitude" && (lateArithmeticFailure.details.partialTrace as RollTrace).length === 1, "late arithmetic resource failure mismatch");
  const invalidState = requireEvaluationFailure(oracleEvaluate("d6", { kind: "GeneratorState", words: ["00000000", "00000000", "00000000", "00000000"] }, 1));
  assert(invalidState.code === "invalid-state-zero" && (invalidState.details.partialTrace as RollTrace).length === 0 && invalidState.details.successorState === null, "invalid state must carry empty partial result without a successor");
  const wrongStateTag = requireEvaluationFailure(oracleEvaluate("d6", { kind: "Seed", words: GOLDEN_SEED }, 1));
  assert(wrongStateTag.code === "invalid-state-shape" && wrongStateTag.details.successorState === null, "Seed-tagged payload must not step as GeneratorState");
  const shortState = requireEvaluationFailure(oracleEvaluate("d6", { kind: "GeneratorState", words: ["00000001"] }, 1));
  const nonArrayState = requireEvaluationFailure(oracleEvaluate("d6", { kind: "GeneratorState", words: "00000001" }, 1));
  assert(shortState.code === "invalid-state-shape" && nonArrayState.code === "invalid-state-shape", "wrong-length/non-array state words must be shape failures");
  const invalidFuel = requireEvaluationFailure(oracleEvaluate("d6", goldenState, -1));
  assert(invalidFuel.code === "invalid-attempt-fuel" && (invalidFuel.details.partialTrace as RollTrace).length === 0 && invalidFuel.details.successorState === goldenState, "invalid fuel must preserve valid state");
  const invalidFuelFraction = requireEvaluationFailure(oracleEvaluate("d6", goldenState, 1.5));
  const invalidFuelNaN = requireEvaluationFailure(oracleEvaluate("d6", goldenState, Number.NaN));
  const invalidFuelInfinity = requireEvaluationFailure(oracleEvaluate("d6", goldenState, Number.POSITIVE_INFINITY));
  assert(invalidFuelFraction.code === "invalid-attempt-fuel" && invalidFuelNaN.code === "invalid-attempt-fuel" && invalidFuelInfinity.code === "invalid-attempt-fuel", "all invalid fuel shapes must be structured");
  const invalidBound = oracleSample(goldenState, 0, 1);
  assert(!invalidBound.ok && invalidBound.code === "invalid-bound", "PRNG bound failure must compose");
  for (const bound of [1.5, Number.NaN, Number.POSITIVE_INFINITY, -1]) {
    const bad = oracleSample(goldenState, bound, 1);
    assert(!bad.ok && bad.code === "invalid-bound", "invalid bound must not be coerced");
  }
  const d1Sample = oracleSample(goldenState, 1, 1);
  assert(d1Sample.ok && d1Sample.value.value === 0 && d1Sample.value.attempts === 1 && JSON.stringify(d1Sample.value.state.words) === JSON.stringify(GOLDEN_STATES[1]), "bound one must consume one output");
  const arbitraryStep = oracleNext({ kind: "GeneratorState", words: ["12345678", "9abcdef0", "13579bdf", "2468ace0"] });
  assert(arbitraryStep.ok && arbitraryStep.value.word === "99981812" && JSON.stringify(arbitraryStep.value.state.words) === JSON.stringify(["ace02468", "9bdf1357", "78de2da7", "a39085f6"]), "arbitrary canonical state must use exact xoshiro successor");
  const malformedNext = oracleNext({ kind: "GeneratorState", words: ["0000000A", "00000000", "00000000", "00000001"] });
  assert(!malformedNext.ok && malformedNext.code === "invalid-state-word", "direct Next must reject noncanonical words");
  const invalidSeedShape = oracleInitialize(["00000001"]);
  const invalidSeedWord = oracleInitialize(["0000000A", "00000000", "00000000", "00000001"]);
  const invalidSeedZero = oracleInitialize(["00000000", "00000000", "00000000", "00000000"]);
  assert(!invalidSeedShape.ok && invalidSeedShape.code === "invalid-seed-shape" && !invalidSeedWord.ok && invalidSeedWord.code === "invalid-seed-word" && !invalidSeedZero.ok && invalidSeedZero.code === "invalid-seed-zero", "initialization failures must be structured");
  for (const [source, code] of [["", "expected-expression"], ["d", "expected-die-sides"], ["(d6", "expected-closing-parenthesis"], ["01", "leading-zero"], ["d6 d6", "unexpected-token"], ["0d6", "dice-count-zero"], ["d0", "side-count-zero"] as const]) {
    const result = requireEvaluationFailure(oracleEvaluate(source, goldenState, 1));
    assert(result.code === code, `${source || "empty"} diagnostic mismatch`);
  }
  for (const [source, code] of [["0d6 +", "expected-expression"], ["d101 +", "expected-expression"], ["2(d6)", "unexpected-token"], ["1.5", "unexpected-token"], ["-1", "unexpected-token"], ["d 6", "expected-die-sides"], ["d6 trailing", "unexpected-token"] as const]) {
    const result = requireEvaluationFailure(oracleEvaluate(source, goldenState, -1));
    assert(result.code === code, `${source} phase collision mismatch`);
  }
  const fullDomain = requireEvaluationFailure(oracleEvaluate("d101 + d0", goldenState, 1));
  assert(fullDomain.code === "side-count-zero" && fullDomain.details.offset === 8, "domain traversal must complete before supported-side resources");
  for (const [source, dimension] of [["1234", "numeric-token-length"], ["(((((d6)))))", "nesting-depth"], ["6d6", "die-sample-count"], ["d101", "supported-side-count"] as const]) {
    const limits = source === "6d6" ? { ...PROTOTYPE_LIMITS, dieSampleCount: 3 } : source.startsWith("(") ? { ...PROTOTYPE_LIMITS, nestingDepth: 4 } : PROTOTYPE_LIMITS;
    const result = requireEvaluationFailure(oracleEvaluate(source, goldenState, 1, limits));
    assert(result.code === "resource-limit-exceeded" && result.details.dimension === dimension, `${dimension} mismatch`);
    if (source === "6d6") assert(result.details.actual === 4, "sample resource actual must identify first proving observation");
  }
  const integerMagnitude = requireEvaluationFailure(oracleEvaluate("101", goldenState, 1));
  assert(integerMagnitude.code === "resource-limit-exceeded" && integerMagnitude.details.dimension === "arithmetic-magnitude" && integerMagnitude.details.offset === 0 && integerMagnitude.details.successorState === undefined, "integer magnitude must fail predictably before consumption");
  const constantMagnitude = requireEvaluationFailure(oracleEvaluate("60 + 60", goldenState, 1));
  assert(constantMagnitude.code === "resource-limit-exceeded" && constantMagnitude.details.dimension === "arithmetic-magnitude" && constantMagnitude.details.offset === 3 && constantMagnitude.details.partialTrace === undefined && constantMagnitude.details.successorState === undefined, "constant arithmetic must fail during preflight without state context");
  const mixedConstantMagnitude = requireEvaluationFailure(oracleEvaluate("d1 + (60 + 60)", goldenState, 1));
  assert(mixedConstantMagnitude.code === "resource-limit-exceeded" && mixedConstantMagnitude.details.dimension === "arithmetic-magnitude" && mixedConstantMagnitude.details.offset === 5 && mixedConstantMagnitude.details.partialTrace === undefined && mixedConstantMagnitude.details.successorState === undefined, "constant subexpressions must preflight before any Die Sample");
  const sourceOrderedResource = requireEvaluationFailure(oracleEvaluate("d1+d1+d1+d1+d101", goldenState, 1));
  assert(sourceOrderedResource.code === "resource-limit-exceeded" && sourceOrderedResource.details.dimension === "dice-term-count" && sourceOrderedResource.details.offset === 12, "static resources must choose earliest source observation");
  const supportedAfterTerms = requireEvaluationFailure(oracleEvaluate("d1+d1+d1+d1+d101", goldenState, 1, { ...PROTOTYPE_LIMITS, diceTermCount: 5 }));
  assert(supportedAfterTerms.code === "resource-limit-exceeded" && supportedAfterTerms.details.dimension === "supported-side-count" && supportedAfterTerms.details.offset === 13, "supported-side resource must follow earlier term excess");
  const fifthSample = requireEvaluationFailure(oracleEvaluate("d6+d6+d6+d6+d6", goldenState, 1, { ...PROTOTYPE_LIMITS, diceTermCount: 5, dieSampleCount: 4 }));
  assert(fifthSample.code === "resource-limit-exceeded" && fifthSample.details.dimension === "die-sample-count" && fifthSample.details.offset === 12 && fifthSample.details.actual === 5, "sample resource offset must identify first excess die");
  const dynamicSteps = requireEvaluationFailure(oracleEvaluate("d6", { kind: "GeneratorState", words: FORCED_STATES[1] }, 2, { ...PROTOTYPE_LIMITS, evaluationSteps: 3 }));
  assert(dynamicSteps.code === "resource-limit-exceeded" && dynamicSteps.details.dimension === "evaluation-steps" && dynamicSteps.details.successorState !== undefined, "dynamic rejection attempts must count toward evaluation steps");
  const sourceLength = requireEvaluationFailure(oracleEvaluate("d6", goldenState, 1, { ...PROTOTYPE_LIMITS, sourceLength: 1 }));
  assert(sourceLength.code === "resource-limit-exceeded" && sourceLength.details.dimension === "source-length", "source length must preflight before parsing");
  const astNodes = requireEvaluationFailure(oracleEvaluate("d6 + d6 + d6", goldenState, 1, { ...PROTOTYPE_LIMITS, astNodeCount: 4 }));
  assert(astNodes.code === "resource-limit-exceeded" && astNodes.details.dimension === "ast-node-count", "AST node resource must preflight");
  const diceTerms = requireEvaluationFailure(oracleEvaluate("d6 + d6 + d6", goldenState, 1, { ...PROTOTYPE_LIMITS, diceTermCount: 2 }));
  assert(diceTerms.code === "resource-limit-exceeded" && diceTerms.details.dimension === "dice-term-count", "dice term resource must preflight");
  const evaluationSteps = requireEvaluationFailure(oracleEvaluate("d6", goldenState, 1, { ...PROTOTYPE_LIMITS, evaluationSteps: 1 }));
  assert(evaluationSteps.code === "resource-limit-exceeded" && evaluationSteps.details.dimension === "evaluation-steps", "evaluation step resource must preflight");
  const rejectionFuel = requireEvaluationFailure(oracleEvaluate("d6", goldenState, 5));
  assert(rejectionFuel.code === "resource-limit-exceeded" && rejectionFuel.details.dimension === "rejection-sampling-attempts", "rejection fuel resource must preflight");
  console.log("Dice evaluation prototype oracle vectors passed; literal probes compiled.");
}

runOracleVectors();
