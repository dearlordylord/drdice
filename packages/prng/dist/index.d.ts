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

export type HexDigit =
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
  | "invalid-replay-token"
  | "invalid-bound"
  | "invalid-attempt-fuel"
  | "sampling-attempts-exhausted";

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
export type InvalidBoundFailure = Failure<"invalid-bound", { readonly bound: number }>;
export type InvalidAttemptFuelFailure = Failure<"invalid-attempt-fuel", { readonly maximumAttempts: number }>;

/** Exact successful raw transition: one word and its explicit successor state. */
export type StepSuccess<
  Word extends Word32Text = Word32Text,
  State extends GeneratorState = GeneratorState,
> = Success<{
  readonly word: Word;
  readonly state: State;
}>;

export type StepResult = StepSuccess | InvalidStateFailure;

/** Public result shape reserved for the bounded-sampling slice. */
export type BoundedSuccess<
  Value extends number = number,
  State extends GeneratorState = GeneratorState,
  Attempts extends number = number,
> = Success<{
  readonly value: Value;
  readonly state: State;
  readonly attempts: Attempts;
}>;

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

/** xoshiro128** 1.1: output scrambles the second state word. */
type XoshiroStep<A extends Bits32, B extends Bits32, C extends Bits32, D extends Bits32> = {
  readonly word: BitsToText<Mul9<RotateLeft<Mul5<B>, 7>>>;
  readonly state: readonly [
    BitsToText<Xor<A, Xor<B, D>>>,
    BitsToText<Xor<B, Xor<C, A>>>,
    BitsToText<Xor<Xor<C, A>, ShiftLeft<B, 9>>>,
    BitsToText<RotateLeft<AsBitArray<Xor<D, B>>, 11>>,
  ];
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
  FourStringWords<Words> extends true
    ? ValidWords<Words> extends true
      ? Words extends StateWords
        ? IsZeroState<Words> extends true
          ? Failure<"invalid-seed-zero", { readonly seed: Original }>
          : Success<GeneratorState<Words>>
        : Failure<"invalid-seed-shape", { readonly seed: Original }>
      : Failure<"invalid-seed-word", { readonly seed: Original }>
    : Failure<"invalid-seed-shape", { readonly seed: Original }>;

type StateWordsResult<Words, Original> =
  FourStringWords<Words> extends true
    ? ValidWords<Words> extends true
      ? Words extends StateWords
        ? IsZeroState<Words> extends true
          ? Failure<"invalid-state-zero", { readonly state: Original }>
          : Success<GeneratorState<Words>>
        : Failure<"invalid-state-shape", { readonly state: Original }>
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
export type CreateState<Input> = Input extends {
  readonly kind: "GeneratorState";
  readonly words: infer Words;
}
  ? StateWordsResult<Words, Input>
  : StateWordsResult<Input, Input>;

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

type NextWords<Words, Original> =
  FourStringWords<Words> extends true
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
    : Failure<"invalid-state-shape", { readonly state: Original }>;

/** Request one raw Word32 and receive the explicit successor Generator State. */
export type Next<Input> = Input extends {
  readonly kind: "GeneratorState";
  readonly words: infer Words;
}
  ? NextWords<Words, Input>
  : Failure<"invalid-state-shape", { readonly state: Input }>;

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
  ? StateWordsResult<Words, Words> extends infer Validated
    ? Validated extends Success<GeneratorState<infer ValidWordsValue extends StateWords>>
      ? Success<GeneratorState<ValidWordsValue>>
      : Validated extends Failure<infer Code extends FailureCode, object>
        ? Failure<Code, { readonly state: Input }>
        : never
    : never
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
