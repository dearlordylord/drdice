/**
 * @drdice/prng is a declaration-only implementation of the
 * `xoshiro128ss-1.1/direct128-msb-rejection-1` Sequence Profile.
 *
 * The aliases in this file are intentionally the package's complete public
 * root. Arithmetic and validation helpers are private implementation detail;
 * they remain in the rolled-up declaration because the checker evaluates the
 * types, but they are not exported or supported as an API.
 */

/** Immutable PRNG identity. Changing a sequence-affecting rule requires a new profile. */
export const SEQUENCE_PROFILE: "xoshiro128ss-1.1/direct128-msb-rejection-1";
export type SequenceProfile = typeof SEQUENCE_PROFILE;

/** Version of Replay Token and Serialized Generator State schemas. */
export const SCHEMA_VERSION: 1;
export type SchemaVersion = typeof SCHEMA_VERSION;

/** The package release identity is deliberately separate from schema/profile identity. */
export type PackageVersion = "0.1.0";

type HexDigit =
  | "0"
  | "1"
  | "2"
  | "3"
  | "4"
  | "5"
  | "6"
  | "7"
  | "8"
  | "9"
  | "a"
  | "b"
  | "c"
  | "d"
  | "e"
  | "f";

/** A Word32 is represented by exactly eight lowercase hexadecimal characters. */
export type Word32Text = string;
export type SeedWords = readonly [string, string, string, string];
export type StateWords = readonly [string, string, string, string];

/** A Seed and Generator State are distinct tagged domain values. */
export type Seed<W extends SeedWords = SeedWords> = {
  readonly kind: "Seed";
  readonly words: W;
};

export type GeneratorState<W extends StateWords = StateWords> = {
  readonly kind: "GeneratorState";
  readonly words: W;
};

export type FailureCode =
  | "invalid-seed-shape"
  | "invalid-seed-word"
  | "invalid-seed-zero"
  | "invalid-state-shape"
  | "invalid-state-word"
  | "invalid-state-zero"
  | "invalid-bound"
  | "invalid-attempt-fuel"
  | "sampling-attempts-exhausted"
  | "invalid-replay-token";

export type Failure<Code extends FailureCode, Details extends object = object> = {
  readonly ok: false;
  readonly code: Code;
  readonly details: Details;
};

export type Success<Value> = {
  readonly ok: true;
  readonly value: Value;
};

export type InvalidSeedFailure =
  | Failure<"invalid-seed-shape", { readonly seed: unknown }>
  | Failure<"invalid-seed-word", { readonly seed: unknown }>
  | Failure<"invalid-seed-zero", { readonly seed: unknown }>;

export type InvalidStateFailure =
  | Failure<"invalid-state-shape", { readonly state: unknown }>
  | Failure<"invalid-state-word", { readonly state: unknown }>
  | Failure<"invalid-state-zero", { readonly state: unknown }>;

export type InvalidReplayFailure = Failure<"invalid-replay-token", { readonly token: unknown }>;

/** Exact successful raw transition: one word and its explicit successor state. */
export type StepSuccess<
  Word extends Word32Text = Word32Text,
  State extends GeneratorState = GeneratorState,
> = Success<{
  readonly word: Word;
  readonly state: State;
}>;

export type StepResult = StepSuccess | InvalidStateFailure;

/** A successful unbiased bounded sample and the state after its attempts. */
export type BoundedSuccess<
  Value extends number = number,
  State extends GeneratorState = GeneratorState,
  Attempts extends number = number,
> = Success<{
  readonly value: Value;
  readonly state: State;
  readonly attempts: Attempts;
}>;

export type InvalidBoundFailure<Bound extends number = number> = Failure<
  "invalid-bound",
  { readonly bound: Bound }
>;

export type InvalidAttemptFuelFailure<MaximumAttempts extends number = number> = Failure<
  "invalid-attempt-fuel",
  { readonly maximumAttempts: MaximumAttempts }
>;

export type SamplingExhausted<State extends GeneratorState = GeneratorState> = Failure<
  "sampling-attempts-exhausted",
  {
    readonly maximumAttempts: number;
    readonly attempts: number;
    readonly state: State;
  }
>;

export type BoundedResult =
  | BoundedSuccess
  | InvalidStateFailure
  | InvalidBoundFailure
  | InvalidAttemptFuelFailure
  | SamplingExhausted;

/* -------------------------------------------------------------------------- */
/* Private fixed-width arithmetic                                              */
/* -------------------------------------------------------------------------- */

type Bit = 0 | 1;
type Bits32 = readonly [
  Bit, Bit, Bit, Bit, Bit, Bit, Bit, Bit,
  Bit, Bit, Bit, Bit, Bit, Bit, Bit, Bit,
  Bit, Bit, Bit, Bit, Bit, Bit, Bit, Bit,
  Bit, Bit, Bit, Bit, Bit, Bit, Bit, Bit,
];

/* Prefixes keep numeric-looking string keys stable in declaration files. */
type HexBitsMap = {
  readonly h0: [0, 0, 0, 0]; readonly h1: [0, 0, 0, 1]; readonly h2: [0, 0, 1, 0]; readonly h3: [0, 0, 1, 1];
  readonly h4: [0, 1, 0, 0]; readonly h5: [0, 1, 0, 1]; readonly h6: [0, 1, 1, 0]; readonly h7: [0, 1, 1, 1];
  readonly h8: [1, 0, 0, 0]; readonly h9: [1, 0, 0, 1]; readonly ha: [1, 0, 1, 0]; readonly hb: [1, 0, 1, 1];
  readonly hc: [1, 1, 0, 0]; readonly hd: [1, 1, 0, 1]; readonly he: [1, 1, 1, 0]; readonly hf: [1, 1, 1, 1];
};
type HexBits<S extends string> = `h${S}` extends keyof HexBitsMap ? HexBitsMap[`h${S}`] : never;

type BitsHexMap = {
  readonly b0000: "0"; readonly b0001: "1"; readonly b0010: "2"; readonly b0011: "3";
  readonly b0100: "4"; readonly b0101: "5"; readonly b0110: "6"; readonly b0111: "7";
  readonly b1000: "8"; readonly b1001: "9"; readonly b1010: "a"; readonly b1011: "b";
  readonly b1100: "c"; readonly b1101: "d"; readonly b1110: "e"; readonly b1111: "f";
};
type BitsHex<S extends string> = `b${S}` extends keyof BitsHexMap ? BitsHexMap[`b${S}`] : never;

type IsCanonicalWord<S extends string, Digits extends unknown[] = []> =
  Digits["length"] extends 8
    ? S extends "" ? true : false
    : S extends `${infer Head}${infer Tail}`
      ? Head extends HexDigit
        ? IsCanonicalWord<Tail, [...Digits, unknown]>
        : false
      : false;

type TextToBits<S extends string, Out extends Bit[] = []> =
  S extends `${infer Head}${infer Tail}`
    ? HexBits<Head> extends infer N extends Bit[]
      ? TextToBits<Tail, [...Out, ...N]>
      : never
    : Out extends Bits32 ? Out : never;

type BitsToText<S extends readonly Bit[], Out extends string = ""> =
  S extends readonly [
    infer A extends Bit,
    infer B extends Bit,
    infer C extends Bit,
    infer D extends Bit,
    ...infer Rest extends Bit[],
  ]
    ? BitsToText<Rest, `${Out}${BitsHex<`${A}${B}${C}${D}`>}`>
    : Out;

type XorBit<A extends Bit, B extends Bit> = A extends B ? 0 : 1;
type XorNibble<
  A0 extends Bit, A1 extends Bit, A2 extends Bit, A3 extends Bit,
  B0 extends Bit, B1 extends Bit, B2 extends Bit, B3 extends Bit,
> = [XorBit<A0, B0>, XorBit<A1, B1>, XorBit<A2, B2>, XorBit<A3, B3>];
type Xor<A extends readonly Bit[], B extends readonly Bit[], Out extends Bit[] = []> =
  A extends readonly [
    infer A0 extends Bit, infer A1 extends Bit, infer A2 extends Bit, infer A3 extends Bit,
    ...infer ARest extends Bit[],
  ]
    ? B extends readonly [
        infer B0 extends Bit, infer B1 extends Bit, infer B2 extends Bit, infer B3 extends Bit,
        ...infer BRest extends Bit[],
      ]
      ? Xor<ARest, BRest, [...Out, ...XorNibble<A0, A1, A2, A3, B0, B1, B2, B3>]>
      : Out
    : Out;

type Take<A extends readonly unknown[], N extends number, Out extends unknown[] = []> =
  Out["length"] extends N
    ? Out
    : A extends readonly [infer Head, ...infer Tail]
      ? Take<Tail, N, [...Out, Head]>
      : Out;

type Drop<A extends readonly unknown[], N extends number> =
  N extends 0
    ? A
    : A extends readonly [unknown, ...infer Tail]
      ? Drop<Tail, N extends 0 ? 0 : Decrement<N>>
      : [];

type RotateLeft<A extends Bits32, N extends number> =
  N extends 7
    ? AsBitArray<[...Drop<AsBitArray<A>, 7>, ...Take<AsBitArray<A>, 7>]>
    : N extends 11
      ? AsBitArray<[...Drop<AsBitArray<A>, 11>, ...Take<AsBitArray<A>, 11>]>
      : never;
type ShiftLeft<A extends Bits32, N extends number> =
  [...Drop<A, N>, ...Take<Zeros32, N>] extends infer Result
    ? Result extends Bits32 ? Result : never
    : never;
type Decrement<N extends number, Acc extends unknown[] = []> =
  [...Acc, unknown]["length"] extends N ? Acc["length"] : Decrement<N, [...Acc, unknown]>;
type Zeros32 = [
  0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0,
];

type AddBit<A extends Bit, B extends Bit, Carry extends Bit> =
  A extends 0
    ? B extends 0
      ? Carry extends 0 ? [0, 0] : [1, 0]
      : Carry extends 0 ? [1, 0] : [0, 1]
    : B extends 0
      ? Carry extends 0 ? [1, 0] : [0, 1]
      : Carry extends 0 ? [0, 1] : [1, 1];

type Reverse<A extends readonly unknown[], Out extends unknown[] = []> =
  A extends readonly [infer Head, ...infer Tail]
    ? Reverse<Tail, [Head, ...Out]>
    : Out;

type AddLittleEndian<
  A extends readonly Bit[],
  B extends readonly Bit[],
  Carry extends Bit = 0,
  Out extends Bit[] = [],
> = A extends readonly [
  infer A0 extends Bit, infer A1 extends Bit, infer A2 extends Bit, infer A3 extends Bit,
  ...infer ARest extends Bit[],
]
  ? B extends readonly [
      infer B0 extends Bit, infer B1 extends Bit, infer B2 extends Bit, infer B3 extends Bit,
      ...infer BRest extends Bit[],
    ]
    ? AddBit<A0, B0, Carry> extends [infer S0 extends Bit, infer C0 extends Bit]
      ? AddBit<A1, B1, C0> extends [infer S1 extends Bit, infer C1 extends Bit]
        ? AddBit<A2, B2, C1> extends [infer S2 extends Bit, infer C2 extends Bit]
          ? AddBit<A3, B3, C2> extends [infer S3 extends Bit, infer C3 extends Bit]
            ? AddLittleEndian<ARest, BRest, C3, [...Out, S0, S1, S2, S3]>
            : never
          : never
        : never
      : never
    : never
  : Out;

type AsBitArray<Value> = Value extends Bits32 ? Value : never;
type Add<A extends Bits32, B extends Bits32> = AsBitArray<Reverse<AddLittleEndian<Reverse<A>, Reverse<B>>>>;
type Mul5<A extends Bits32> = Add<A, ShiftLeft<A, 2>>;
type Mul9<A extends Bits32> = Add<A, ShiftLeft<A, 3>>;

type XoshiroStateWords<A extends Bits32, B extends Bits32, C extends Bits32, D extends Bits32> = readonly [
  BitsToText<Xor<A, Xor<B, D>>>,
  BitsToText<Xor<B, Xor<C, A>>>,
  BitsToText<Xor<Xor<C, A>, ShiftLeft<B, 9>>>,
  BitsToText<RotateLeft<AsBitArray<Xor<D, B>>, 11>>,
];

/** xoshiro128** 1.1: output scrambles the second state word. */
type XoshiroStep<A extends Bits32, B extends Bits32, C extends Bits32, D extends Bits32> = {
  readonly word: BitsToText<Mul9<RotateLeft<Mul5<B>, 7>>>;
  readonly state: XoshiroStateWords<A, B, C, D>;
};

type IsZeroWord<S extends string> = S extends "00000000" ? true : false;
type IsZeroState<W extends StateWords> =
  IsZeroWord<W[0]> extends true
    ? IsZeroWord<W[1]> extends true
      ? IsZeroWord<W[2]> extends true
        ? IsZeroWord<W[3]> extends true ? true : false
        : false
      : false
    : false;

type FourItems<W> = W extends readonly [unknown, unknown, unknown, unknown] ? true : false;
type FourStringWords<W> = W extends readonly [string, string, string, string] ? true : false;
type ValidWords<W> = W extends readonly [
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

/* -------------------------------------------------------------------------- */
/* Seed/state validation and raw transition                                   */
/* -------------------------------------------------------------------------- */

type InitializeWords<Words, Original> =
  FourItems<Words> extends true
    ? FourStringWords<Words> extends true
      ? ValidWords<Words> extends true
        ? Words extends StateWords
          ? IsZeroState<Words> extends true
            ? Failure<"invalid-seed-zero", { readonly seed: Original }>
            : Success<GeneratorState<Words>>
          : Failure<"invalid-seed-shape", { readonly seed: Original }>
        : Failure<"invalid-seed-word", { readonly seed: Original }>
      : Failure<"invalid-seed-word", { readonly seed: Original }>
    : Failure<"invalid-seed-shape", { readonly seed: Original }>;

type StateWordsResult<Words, Original> =
  FourItems<Words> extends true
    ? FourStringWords<Words> extends true
      ? ValidWords<Words> extends true
        ? Words extends StateWords
          ? IsZeroState<Words> extends true
            ? Failure<"invalid-state-zero", { readonly state: Original }>
            : Success<GeneratorState<Words>>
          : Failure<"invalid-state-shape", { readonly state: Original }>
        : Failure<"invalid-state-word", { readonly state: Original }>
      : Failure<"invalid-state-word", { readonly state: Original }>
    : Failure<"invalid-state-shape", { readonly state: Original }>;

/**
 * Initialize from canonical Seed words. A tagged Seed is accepted as a
 * convenience, while the language-neutral four-word tuple remains the
 * canonical serialized input.
 */
export type Initialize<Input> = Input extends {
  readonly kind: "Seed";
  readonly words: infer Words;
}
  ? InitializeWords<Words, Input>
  : InitializeWords<Input, Input>;

export type InitializeResult = Success<GeneratorState> | InvalidSeedFailure;

/** Validate and tag current state words without consuming a transition. */
type StateBits<State extends GeneratorState> = State["words"] extends readonly [
  infer A extends string,
  infer B extends string,
  infer C extends string,
  infer D extends string,
]
  ? TextToBits<A> extends infer AB extends Bits32
    ? TextToBits<B> extends infer BB extends Bits32
      ? TextToBits<C> extends infer CB extends Bits32
        ? TextToBits<D> extends infer DB extends Bits32
          ? XoshiroStep<AB, BB, CB, DB>
          : never
        : never
      : never
    : never
  : never;

/* d1 has no rejection decision or output conversion to perform.  Keep its
 * transition on a state-only path so the public Sample boundary does not
 * instantiate the unused output scramble and bit-prefix machinery. */
type StateWordsOnly<State extends GeneratorState> = State["words"] extends readonly [
  infer A extends string,
  infer B extends string,
  infer C extends string,
  infer D extends string,
]
  ? TextToBits<A> extends infer AB extends Bits32
    ? TextToBits<B> extends infer BB extends Bits32
      ? TextToBits<C> extends infer CB extends Bits32
        ? TextToBits<D> extends infer DB extends Bits32
          ? XoshiroStateWords<AB, BB, CB, DB>
          : never
        : never
      : never
    : never
  : never;

type NextWords<Words, Original> =
  FourItems<Words> extends true
    ? FourStringWords<Words> extends true
      ? ValidWords<Words> extends true
        ? Words extends StateWords
          ? IsZeroState<Words> extends true
            ? Failure<"invalid-state-zero", { readonly state: Original }>
            : StateBits<GeneratorState<Words>> extends infer Result
              ? Result extends {
                  readonly word: infer Word extends string;
                  readonly state: infer NextWordsValue extends StateWords;
                }
                ? Success<{
                    readonly word: Word;
                    readonly state: GeneratorState<readonly [
                      NextWordsValue[0],
                      NextWordsValue[1],
                      NextWordsValue[2],
                      NextWordsValue[3],
                    ]>;
                  }>
                : Failure<"invalid-state-word", { readonly state: Original }>
              : Failure<"invalid-state-word", { readonly state: Original }>
          : Failure<"invalid-state-shape", { readonly state: Original }>
        : Failure<"invalid-state-word", { readonly state: Original }>
      : Failure<"invalid-state-word", { readonly state: Original }>
    : Failure<"invalid-state-shape", { readonly state: Original }>;

/** Request one raw Word32 and receive the explicit successor Generator State. */
export type Next<Input> = Input extends {
  readonly kind: "GeneratorState";
  readonly words: infer Words;
}
  ? NextWords<Words, Input>
  : Failure<"invalid-state-shape", { readonly state: Input }>;

/* -------------------------------------------------------------------------- */
/* Unbiased bounded sampling                                                  */
/* -------------------------------------------------------------------------- */

/* The supported bound range is finite and explicit.  This rejects widened
 * numbers before any transition is evaluated and keeps the public d1..d100
 * envelope reviewable. */
type BoundWidth<M extends number> =
  M extends 1 ? 0
  : M extends 2 ? 1
  : M extends 3 | 4 ? 2
  : M extends 5 | 6 | 7 | 8 ? 3
  : M extends 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 ? 4
  : M extends 17 | 18 | 19 | 20 | 21 | 22 | 23 | 24 | 25 | 26 | 27 | 28 | 29 | 30 | 31 | 32 ? 5
  : M extends 33 | 34 | 35 | 36 | 37 | 38 | 39 | 40 | 41 | 42 | 43 | 44 | 45 | 46 | 47 | 48 | 49 | 50 | 51 | 52 | 53 | 54 | 55 | 56 | 57 | 58 | 59 | 60 | 61 | 62 | 63 | 64 ? 6
  : M extends 65 | 66 | 67 | 68 | 69 | 70 | 71 | 72 | 73 | 74 | 75 | 76 | 77 | 78 | 79 | 80 | 81 | 82 | 83 | 84 | 85 | 86 | 87 | 88 | 89 | 90 | 91 | 92 | 93 | 94 | 95 | 96 | 97 | 98 | 99 | 100 ? 7
  : never;

type SupportedBound<M extends number> = BoundWidth<M> extends never ? false : true;
type SupportedFuel<F extends number> = F extends 0 | 1 | 2 | 3 | 4 ? true : false;
type PreviousFuel<F extends number> = F extends 1 ? 0
  : F extends 2 ? 1
  : F extends 3 ? 2
  : F extends 4 ? 3
  : never;

/* TextToBits is big-endian, so taking its prefix reads the output's
 * most-significant bits directly.  No modulo, clamping, rejected-bit reuse,
 * or reservoir is involved. */
type PrefixBits<W extends string, N extends number> =
  TextToBits<W> extends infer Bits extends Bits32 ? Take<Bits, N> : never;
type BoundBitsMap = {
  readonly b1: [];
  readonly b2: [1, 0];
  readonly b3: [1, 1];
  readonly b4: [1, 0, 0];
  readonly b5: [1, 0, 1];
  readonly b6: [1, 1, 0];
  readonly b7: [1, 1, 1];
  readonly b8: [1, 0, 0, 0];
  readonly b9: [1, 0, 0, 1];
  readonly b10: [1, 0, 1, 0];
  readonly b11: [1, 0, 1, 1];
  readonly b12: [1, 1, 0, 0];
  readonly b13: [1, 1, 0, 1];
  readonly b14: [1, 1, 1, 0];
  readonly b15: [1, 1, 1, 1];
  readonly b16: [1, 0, 0, 0, 0];
  readonly b17: [1, 0, 0, 0, 1];
  readonly b18: [1, 0, 0, 1, 0];
  readonly b19: [1, 0, 0, 1, 1];
  readonly b20: [1, 0, 1, 0, 0];
  readonly b21: [1, 0, 1, 0, 1];
  readonly b22: [1, 0, 1, 1, 0];
  readonly b23: [1, 0, 1, 1, 1];
  readonly b24: [1, 1, 0, 0, 0];
  readonly b25: [1, 1, 0, 0, 1];
  readonly b26: [1, 1, 0, 1, 0];
  readonly b27: [1, 1, 0, 1, 1];
  readonly b28: [1, 1, 1, 0, 0];
  readonly b29: [1, 1, 1, 0, 1];
  readonly b30: [1, 1, 1, 1, 0];
  readonly b31: [1, 1, 1, 1, 1];
  readonly b32: [1, 0, 0, 0, 0, 0];
  readonly b33: [1, 0, 0, 0, 0, 1];
  readonly b34: [1, 0, 0, 0, 1, 0];
  readonly b35: [1, 0, 0, 0, 1, 1];
  readonly b36: [1, 0, 0, 1, 0, 0];
  readonly b37: [1, 0, 0, 1, 0, 1];
  readonly b38: [1, 0, 0, 1, 1, 0];
  readonly b39: [1, 0, 0, 1, 1, 1];
  readonly b40: [1, 0, 1, 0, 0, 0];
  readonly b41: [1, 0, 1, 0, 0, 1];
  readonly b42: [1, 0, 1, 0, 1, 0];
  readonly b43: [1, 0, 1, 0, 1, 1];
  readonly b44: [1, 0, 1, 1, 0, 0];
  readonly b45: [1, 0, 1, 1, 0, 1];
  readonly b46: [1, 0, 1, 1, 1, 0];
  readonly b47: [1, 0, 1, 1, 1, 1];
  readonly b48: [1, 1, 0, 0, 0, 0];
  readonly b49: [1, 1, 0, 0, 0, 1];
  readonly b50: [1, 1, 0, 0, 1, 0];
  readonly b51: [1, 1, 0, 0, 1, 1];
  readonly b52: [1, 1, 0, 1, 0, 0];
  readonly b53: [1, 1, 0, 1, 0, 1];
  readonly b54: [1, 1, 0, 1, 1, 0];
  readonly b55: [1, 1, 0, 1, 1, 1];
  readonly b56: [1, 1, 1, 0, 0, 0];
  readonly b57: [1, 1, 1, 0, 0, 1];
  readonly b58: [1, 1, 1, 0, 1, 0];
  readonly b59: [1, 1, 1, 0, 1, 1];
  readonly b60: [1, 1, 1, 1, 0, 0];
  readonly b61: [1, 1, 1, 1, 0, 1];
  readonly b62: [1, 1, 1, 1, 1, 0];
  readonly b63: [1, 1, 1, 1, 1, 1];
  readonly b64: [1, 0, 0, 0, 0, 0, 0];
  readonly b65: [1, 0, 0, 0, 0, 0, 1];
  readonly b66: [1, 0, 0, 0, 0, 1, 0];
  readonly b67: [1, 0, 0, 0, 0, 1, 1];
  readonly b68: [1, 0, 0, 0, 1, 0, 0];
  readonly b69: [1, 0, 0, 0, 1, 0, 1];
  readonly b70: [1, 0, 0, 0, 1, 1, 0];
  readonly b71: [1, 0, 0, 0, 1, 1, 1];
  readonly b72: [1, 0, 0, 1, 0, 0, 0];
  readonly b73: [1, 0, 0, 1, 0, 0, 1];
  readonly b74: [1, 0, 0, 1, 0, 1, 0];
  readonly b75: [1, 0, 0, 1, 0, 1, 1];
  readonly b76: [1, 0, 0, 1, 1, 0, 0];
  readonly b77: [1, 0, 0, 1, 1, 0, 1];
  readonly b78: [1, 0, 0, 1, 1, 1, 0];
  readonly b79: [1, 0, 0, 1, 1, 1, 1];
  readonly b80: [1, 0, 1, 0, 0, 0, 0];
  readonly b81: [1, 0, 1, 0, 0, 0, 1];
  readonly b82: [1, 0, 1, 0, 0, 1, 0];
  readonly b83: [1, 0, 1, 0, 0, 1, 1];
  readonly b84: [1, 0, 1, 0, 1, 0, 0];
  readonly b85: [1, 0, 1, 0, 1, 0, 1];
  readonly b86: [1, 0, 1, 0, 1, 1, 0];
  readonly b87: [1, 0, 1, 0, 1, 1, 1];
  readonly b88: [1, 0, 1, 1, 0, 0, 0];
  readonly b89: [1, 0, 1, 1, 0, 0, 1];
  readonly b90: [1, 0, 1, 1, 0, 1, 0];
  readonly b91: [1, 0, 1, 1, 0, 1, 1];
  readonly b92: [1, 0, 1, 1, 1, 0, 0];
  readonly b93: [1, 0, 1, 1, 1, 0, 1];
  readonly b94: [1, 0, 1, 1, 1, 1, 0];
  readonly b95: [1, 0, 1, 1, 1, 1, 1];
  readonly b96: [1, 1, 0, 0, 0, 0, 0];
  readonly b97: [1, 1, 0, 0, 0, 0, 1];
  readonly b98: [1, 1, 0, 0, 0, 1, 0];
  readonly b99: [1, 1, 0, 0, 0, 1, 1];
  readonly b100: [1, 1, 0, 0, 1, 0, 0];
};
type BoundBits<M extends number> =
  `b${M}` extends keyof BoundBitsMap ? BoundBitsMap[`b${M}`] : never;
type PowerOfTwoBound = 1 | 2 | 4 | 8 | 16 | 32 | 64;
type CompareCandidateToBound<
  Candidate extends readonly Bit[],
  Limit extends readonly Bit[],
> = Candidate extends readonly [
  infer Head extends Bit,
  ...infer Tail extends Bit[],
]
  ? Limit extends readonly [
      infer LimitHead extends Bit,
      ...infer LimitTail extends Bit[],
    ]
    ? Head extends LimitHead
      ? CompareCandidateToBound<Tail, LimitTail>
      : Head extends 0 ? true : false
    : false
  : false;
type IsBelowBound<
  Candidate extends readonly Bit[],
  Bound extends number,
> = Bound extends PowerOfTwoBound
  ? true
  : BoundBits<Bound> extends infer Limit extends readonly Bit[]
    ? Candidate extends Limit
      ? false
      : CompareCandidateToBound<Candidate, Limit>
    : false;
type SmallNumberMap = {
  readonly b: 0;
  readonly b0: 0;
  readonly b1: 1;
  readonly b00: 0;
  readonly b01: 1;
  readonly b10: 2;
  readonly b11: 3;
  readonly b000: 0;
  readonly b001: 1;
  readonly b010: 2;
  readonly b011: 3;
  readonly b100: 4;
  readonly b101: 5;
  readonly b110: 6;
  readonly b111: 7;
  readonly b0000: 0;
  readonly b0001: 1;
  readonly b0010: 2;
  readonly b0011: 3;
  readonly b0100: 4;
  readonly b0101: 5;
  readonly b0110: 6;
  readonly b0111: 7;
  readonly b1000: 8;
  readonly b1001: 9;
  readonly b1010: 10;
  readonly b1011: 11;
  readonly b1100: 12;
  readonly b1101: 13;
  readonly b1110: 14;
  readonly b1111: 15;
  readonly b00000: 0;
  readonly b00001: 1;
  readonly b00010: 2;
  readonly b00011: 3;
  readonly b00100: 4;
  readonly b00101: 5;
  readonly b00110: 6;
  readonly b00111: 7;
  readonly b01000: 8;
  readonly b01001: 9;
  readonly b01010: 10;
  readonly b01011: 11;
  readonly b01100: 12;
  readonly b01101: 13;
  readonly b01110: 14;
  readonly b01111: 15;
  readonly b10000: 16;
  readonly b10001: 17;
  readonly b10010: 18;
  readonly b10011: 19;
  readonly b10100: 20;
  readonly b10101: 21;
  readonly b10110: 22;
  readonly b10111: 23;
  readonly b11000: 24;
  readonly b11001: 25;
  readonly b11010: 26;
  readonly b11011: 27;
  readonly b11100: 28;
  readonly b11101: 29;
  readonly b11110: 30;
  readonly b11111: 31;
  readonly b000000: 0;
  readonly b000001: 1;
  readonly b000010: 2;
  readonly b000011: 3;
  readonly b000100: 4;
  readonly b000101: 5;
  readonly b000110: 6;
  readonly b000111: 7;
  readonly b001000: 8;
  readonly b001001: 9;
  readonly b001010: 10;
  readonly b001011: 11;
  readonly b001100: 12;
  readonly b001101: 13;
  readonly b001110: 14;
  readonly b001111: 15;
  readonly b010000: 16;
  readonly b010001: 17;
  readonly b010010: 18;
  readonly b010011: 19;
  readonly b010100: 20;
  readonly b010101: 21;
  readonly b010110: 22;
  readonly b010111: 23;
  readonly b011000: 24;
  readonly b011001: 25;
  readonly b011010: 26;
  readonly b011011: 27;
  readonly b011100: 28;
  readonly b011101: 29;
  readonly b011110: 30;
  readonly b011111: 31;
  readonly b100000: 32;
  readonly b100001: 33;
  readonly b100010: 34;
  readonly b100011: 35;
  readonly b100100: 36;
  readonly b100101: 37;
  readonly b100110: 38;
  readonly b100111: 39;
  readonly b101000: 40;
  readonly b101001: 41;
  readonly b101010: 42;
  readonly b101011: 43;
  readonly b101100: 44;
  readonly b101101: 45;
  readonly b101110: 46;
  readonly b101111: 47;
  readonly b110000: 48;
  readonly b110001: 49;
  readonly b110010: 50;
  readonly b110011: 51;
  readonly b110100: 52;
  readonly b110101: 53;
  readonly b110110: 54;
  readonly b110111: 55;
  readonly b111000: 56;
  readonly b111001: 57;
  readonly b111010: 58;
  readonly b111011: 59;
  readonly b111100: 60;
  readonly b111101: 61;
  readonly b111110: 62;
  readonly b111111: 63;
  readonly b0000000: 0;
  readonly b0000001: 1;
  readonly b0000010: 2;
  readonly b0000011: 3;
  readonly b0000100: 4;
  readonly b0000101: 5;
  readonly b0000110: 6;
  readonly b0000111: 7;
  readonly b0001000: 8;
  readonly b0001001: 9;
  readonly b0001010: 10;
  readonly b0001011: 11;
  readonly b0001100: 12;
  readonly b0001101: 13;
  readonly b0001110: 14;
  readonly b0001111: 15;
  readonly b0010000: 16;
  readonly b0010001: 17;
  readonly b0010010: 18;
  readonly b0010011: 19;
  readonly b0010100: 20;
  readonly b0010101: 21;
  readonly b0010110: 22;
  readonly b0010111: 23;
  readonly b0011000: 24;
  readonly b0011001: 25;
  readonly b0011010: 26;
  readonly b0011011: 27;
  readonly b0011100: 28;
  readonly b0011101: 29;
  readonly b0011110: 30;
  readonly b0011111: 31;
  readonly b0100000: 32;
  readonly b0100001: 33;
  readonly b0100010: 34;
  readonly b0100011: 35;
  readonly b0100100: 36;
  readonly b0100101: 37;
  readonly b0100110: 38;
  readonly b0100111: 39;
  readonly b0101000: 40;
  readonly b0101001: 41;
  readonly b0101010: 42;
  readonly b0101011: 43;
  readonly b0101100: 44;
  readonly b0101101: 45;
  readonly b0101110: 46;
  readonly b0101111: 47;
  readonly b0110000: 48;
  readonly b0110001: 49;
  readonly b0110010: 50;
  readonly b0110011: 51;
  readonly b0110100: 52;
  readonly b0110101: 53;
  readonly b0110110: 54;
  readonly b0110111: 55;
  readonly b0111000: 56;
  readonly b0111001: 57;
  readonly b0111010: 58;
  readonly b0111011: 59;
  readonly b0111100: 60;
  readonly b0111101: 61;
  readonly b0111110: 62;
  readonly b0111111: 63;
  readonly b1000000: 64;
  readonly b1000001: 65;
  readonly b1000010: 66;
  readonly b1000011: 67;
  readonly b1000100: 68;
  readonly b1000101: 69;
  readonly b1000110: 70;
  readonly b1000111: 71;
  readonly b1001000: 72;
  readonly b1001001: 73;
  readonly b1001010: 74;
  readonly b1001011: 75;
  readonly b1001100: 76;
  readonly b1001101: 77;
  readonly b1001110: 78;
  readonly b1001111: 79;
  readonly b1010000: 80;
  readonly b1010001: 81;
  readonly b1010010: 82;
  readonly b1010011: 83;
  readonly b1010100: 84;
  readonly b1010101: 85;
  readonly b1010110: 86;
  readonly b1010111: 87;
  readonly b1011000: 88;
  readonly b1011001: 89;
  readonly b1011010: 90;
  readonly b1011011: 91;
  readonly b1011100: 92;
  readonly b1011101: 93;
  readonly b1011110: 94;
  readonly b1011111: 95;
  readonly b1100000: 96;
  readonly b1100001: 97;
  readonly b1100010: 98;
  readonly b1100011: 99;
  readonly b1100100: 100;
  readonly b1100101: 101;
  readonly b1100110: 102;
  readonly b1100111: 103;
  readonly b1101000: 104;
  readonly b1101001: 105;
  readonly b1101010: 106;
  readonly b1101011: 107;
  readonly b1101100: 108;
  readonly b1101101: 109;
  readonly b1101110: 110;
  readonly b1101111: 111;
  readonly b1110000: 112;
  readonly b1110001: 113;
  readonly b1110010: 114;
  readonly b1110011: 115;
  readonly b1110100: 116;
  readonly b1110101: 117;
  readonly b1110110: 118;
  readonly b1110111: 119;
  readonly b1111000: 120;
  readonly b1111001: 121;
  readonly b1111010: 122;
  readonly b1111011: 123;
  readonly b1111100: 124;
  readonly b1111101: 125;
  readonly b1111110: 126;
  readonly b1111111: 127;
};
type SmallBitsToText<Bits extends readonly Bit[], Out extends string = ""> =
  Bits extends readonly [infer Head extends Bit, ...infer Tail extends Bit[]]
    ? SmallBitsToText<Tail, `${Out}${Head}`>
    : Out;
type BitsToSmallNumber<Bits extends readonly Bit[]> =
  `b${SmallBitsToText<Bits>}` extends keyof SmallNumberMap
    ? SmallNumberMap[`b${SmallBitsToText<Bits>}`]
    : never;

/* The caller has already completed StateWordsResult validation. Threading
 * this small raw-transition helper through the loop avoids re-running the
 * public state validator for every rejected attempt. */
type SampleTransition<State extends GeneratorState> = StateBits<State> extends infer Result
  ? Result extends {
      readonly word: infer Word extends string;
      readonly state: infer Words extends StateWords;
    }
    ? {
        readonly word: Word;
        readonly state: GeneratorState<readonly [Words[0], Words[1], Words[2], Words[3]]>;
      }
    : Failure<"invalid-state-word", { readonly state: State }>
  : Failure<"invalid-state-word", { readonly state: State }>;

type SampleLoop<
  State extends GeneratorState,
  Bound extends number,
  Fuel extends number,
  MaximumAttempts extends number,
  Attempts extends unknown[] = [],
> = Fuel extends 0
  ? Failure<"sampling-attempts-exhausted", {
      readonly maximumAttempts: MaximumAttempts;
      readonly attempts: Attempts["length"];
      readonly state: State;
    }>
  : Bound extends 1
    ? StateWordsOnly<State> extends infer Words extends StateWords
      ? BoundedSuccess<
          0,
          GeneratorState<readonly [Words[0], Words[1], Words[2], Words[3]]>,
          [...Attempts, unknown]["length"]
        >
      : never
    : StateBits<State> extends infer Step
      ? Step extends { readonly word: infer Word extends string; readonly state: infer Words extends StateWords }
        ? PrefixBits<Word, BoundWidth<Bound>> extends infer CandidateBits extends readonly Bit[]
          ? IsBelowBound<CandidateBits, Bound> extends true
            ? BoundedSuccess<
                BitsToSmallNumber<CandidateBits>,
                GeneratorState<readonly [Words[0], Words[1], Words[2], Words[3]]>,
                [...Attempts, unknown]["length"]
              >
            : SampleLoop<
                GeneratorState<readonly [Words[0], Words[1], Words[2], Words[3]]>,
                Bound,
                PreviousFuel<Fuel>,
                MaximumAttempts,
                [...Attempts, unknown]
              >
          : never
        : Step
      : never;

/* State validation deliberately runs before bound/fuel preflight. */
type SampleStateValidation<Input> = Input extends {
  readonly kind: "GeneratorState";
  readonly words: infer Words;
}
  ? StateWordsResult<Words, Input> extends infer Validation
    ? Validation extends Success<GeneratorState> ? Success<Input> : Validation
    : never
  : Failure<"invalid-state-shape", { readonly state: Input }>;

type SampleAfterStateValidation<
  State extends GeneratorState,
  Bound extends number,
  MaximumAttempts extends number,
> = SupportedBound<Bound> extends true
  ? SupportedFuel<MaximumAttempts> extends true
    ? SampleLoop<State, Bound, MaximumAttempts, MaximumAttempts>
    : InvalidAttemptFuelFailure<MaximumAttempts>
  : InvalidBoundFailure<Bound>;

/**
 * Sample an unbiased integer in [0, Bound). State validation precedes bound
 * and fuel validation; valid preflight failures do not advance the state.
 */
export type Sample<
  Input,
  Bound extends number,
  MaximumAttempts extends number,
> = SampleStateValidation<Input> extends infer Validation
  ? Validation extends Success<infer State extends GeneratorState>
    ? SampleAfterStateValidation<State, Bound, MaximumAttempts>
    : Validation
  : never;

/* -------------------------------------------------------------------------- */
/* Replay and serialization                                                   */
/* -------------------------------------------------------------------------- */

type SeedWordsOf<Input> = Input extends {
  readonly kind: "Seed";
  readonly words: infer Words;
}
  ? Words
  : Input;

/** A versioned token restarts from its Seed; it does not contain a cursor. */
export type ReplayToken<Input> = SeedWordsOf<Input> extends infer Words
  ? FourStringWords<Words> extends true
    ? ValidWords<Words> extends true
      ? Words extends SeedWords
        ? IsZeroState<Words> extends true
          ? never
          : {
              readonly schemaVersion: SchemaVersion;
              readonly sequenceProfile: SequenceProfile;
              readonly seed: Words;
            }
        : never
      : never
    : never
  : never;

/** A versioned snapshot resumes from its current Generator State. */
export type SerializedGeneratorState<Input> = Input extends {
  readonly kind: "GeneratorState";
  readonly words: infer Words;
}
  ? SerializedGeneratorState<Words>
  : FourStringWords<Input> extends true
    ? ValidWords<Input> extends true
      ? Input extends StateWords
        ? IsZeroState<Input> extends true
          ? never
          : {
              readonly schemaVersion: SchemaVersion;
              readonly sequenceProfile: SequenceProfile;
              readonly state: Input;
            }
        : never
      : never
    : never;

type SnapshotState<Input> = Input extends {
  readonly schemaVersion: SchemaVersion;
  readonly sequenceProfile: SequenceProfile;
  readonly state: infer Words;
}
  ? FourItems<Words> extends true
    ? StateWordsResult<Words, { readonly kind: "GeneratorState"; readonly words: Words }> extends infer Validated
      ? Validated extends Success<GeneratorState<infer ValidWordsValue extends StateWords>>
        ? Success<GeneratorState<ValidWordsValue>>
        : Validated
      : never
    : Failure<"invalid-state-shape", { readonly state: Input }>
  : Failure<"invalid-state-shape", { readonly state: Input }>;

/** Restore a serialized current state without advancing it. */
export type RestoreState<Input> = SnapshotState<Input>;
export type RestoreStateResult = Success<GeneratorState> | InvalidStateFailure;

type ReplayState<Input> = Input extends {
  readonly schemaVersion: SchemaVersion;
  readonly sequenceProfile: SequenceProfile;
  readonly seed: infer Words;
}
  ? InitializeWords<Words, Words>
  : Failure<"invalid-replay-token", { readonly token: Input }>;

/** Restore a Replay Token by initializing its Seed, always restarting. */
export type RestoreReplay<Input> = ReplayState<Input>;
export type RestoreReplayResult = Success<GeneratorState> | InvalidSeedFailure | InvalidReplayFailure;

/** Serialize a valid current Generator State without advancing it. */
export type SerializeState<Input> = Input extends {
  readonly kind: "GeneratorState";
  readonly words: infer Words;
}
  ? StateWordsResult<Words, Input> extends infer Validated
    ? Validated extends Success<GeneratorState<infer ValidWordsValue extends StateWords>>
      ? Success<SerializedGeneratorState<ValidWordsValue>>
      : Validated
    : never
  : Failure<"invalid-state-shape", { readonly state: Input }>;

export type SerializeStateResult = Success<SerializedGeneratorState<StateWords>> | InvalidStateFailure;

/* Package boundary metadata is retained for the workspace's generated checks. */
export type PackageMetadata = {
  readonly name: "@drdice/prng";
  readonly version: PackageVersion;
  readonly declarationOnly: true;
};
