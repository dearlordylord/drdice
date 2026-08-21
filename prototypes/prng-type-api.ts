// PROTOTYPE: this file is a design artifact, not a production implementation.
//
// It deliberately keeps the public shape and the fixed-width operations in one
// small file so a reviewer can inspect the API, run the type assertions, and
// compare the independent runtime oracle with the same golden vectors.

/* -------------------------------------------------------------------------- */
/* Public domain vocabulary                                                   */
/* -------------------------------------------------------------------------- */

export const SEQUENCE_PROFILE = "xoshiro128ss-1.1/direct128-msb-rejection-1" as const;

export type SequenceProfile = typeof SEQUENCE_PROFILE;
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
export type Word32Text = string;
export type SeedWords = readonly [string, string, string, string];
export type StateWords = readonly [string, string, string, string];

/** A Seed and GeneratorState stay distinct despite the same four-word shape. */
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
  | "sampling-attempts-exhausted";

export type Failure<Code extends FailureCode, Details extends object = object> = {
  readonly ok: false;
  readonly code: Code;
  readonly details: Details;
};

export type Success<Value> = { readonly ok: true; readonly value: Value };

export type InvalidSeedFailure =
  | Failure<"invalid-seed-shape">
  | Failure<"invalid-seed-word">
  | Failure<"invalid-seed-zero">;

export type InvalidStateFailure =
  | Failure<"invalid-state-shape">
  | Failure<"invalid-state-word">
  | Failure<"invalid-state-zero">;

export type InvalidBoundFailure = Failure<"invalid-bound">;
export type InvalidAttemptFuelFailure = Failure<"invalid-attempt-fuel">;

/** These schemas only materialize for a literal tuple of canonical words. */
export type ReplayToken<W extends readonly unknown[]> =
  ValidWords<W> extends true
    ? W extends SeedWords
      ? IsZeroState<W> extends true
        ? never
        : {
            readonly schemaVersion: 1;
            readonly sequenceProfile: SequenceProfile;
            readonly seed: W;
          }
      : never
    : never;

export type SerializedGeneratorState<W extends readonly unknown[]> =
  ValidWords<W> extends true
    ? W extends StateWords
      ? IsZeroState<W> extends true
        ? never
        : {
            readonly schemaVersion: 1;
            readonly sequenceProfile: SequenceProfile;
            readonly state: W;
          }
      : never
    : never;

export type StepSuccess<W extends Word32Text, S extends GeneratorState> = Success<{
  readonly word: W;
  readonly state: S;
}>;

export type StepResult =
  | StepSuccess<Word32Text, GeneratorState>
  | InvalidStateFailure;

export type BoundedSuccess<
  Value extends number = number,
  S extends GeneratorState = GeneratorState,
  Attempts extends number = number,
> = Success<{
  readonly value: Value;
  readonly state: S;
  readonly attempts: Attempts;
}>;

export type SamplingExhausted<S extends GeneratorState = GeneratorState> = Failure<
  "sampling-attempts-exhausted",
  {
    readonly maximumAttempts: number;
    readonly attempts: number;
    readonly state: S;
  }
>;

export type BoundedResult =
  | BoundedSuccess
  | InvalidStateFailure
  | InvalidBoundFailure
  | InvalidAttemptFuelFailure
  | SamplingExhausted;

/* -------------------------------------------------------------------------- */
/* Fixed-width type-level arithmetic                                          */
/* -------------------------------------------------------------------------- */

type Bit = 0 | 1;
type Bits32 = readonly [
  Bit, Bit, Bit, Bit, Bit, Bit, Bit, Bit,
  Bit, Bit, Bit, Bit, Bit, Bit, Bit, Bit,
  Bit, Bit, Bit, Bit, Bit, Bit, Bit, Bit,
  Bit, Bit, Bit, Bit, Bit, Bit, Bit, Bit,
];

type HexBits = {
  readonly "0": [0, 0, 0, 0];
  readonly "1": [0, 0, 0, 1];
  readonly "2": [0, 0, 1, 0];
  readonly "3": [0, 0, 1, 1];
  readonly "4": [0, 1, 0, 0];
  readonly "5": [0, 1, 0, 1];
  readonly "6": [0, 1, 1, 0];
  readonly "7": [0, 1, 1, 1];
  readonly "8": [1, 0, 0, 0];
  readonly "9": [1, 0, 0, 1];
  readonly a: [1, 0, 1, 0];
  readonly b: [1, 0, 1, 1];
  readonly c: [1, 1, 0, 0];
  readonly d: [1, 1, 0, 1];
  readonly e: [1, 1, 1, 0];
  readonly f: [1, 1, 1, 1];
};

type BitsHex = {
  readonly "0000": "0";
  readonly "0001": "1";
  readonly "0010": "2";
  readonly "0011": "3";
  readonly "0100": "4";
  readonly "0101": "5";
  readonly "0110": "6";
  readonly "0111": "7";
  readonly "1000": "8";
  readonly "1001": "9";
  readonly "1010": "a";
  readonly "1011": "b";
  readonly "1100": "c";
  readonly "1101": "d";
  readonly "1110": "e";
  readonly "1111": "f";
};

type IsCanonicalWord<S extends string, N extends unknown[] = []> =
  N["length"] extends 8
    ? S extends "" ? true : false
    : S extends `${infer Head}${infer Tail}`
      ? Head extends HexDigit
        ? IsCanonicalWord<Tail, [...N, unknown]>
        : false
      : false;

type TextToBits<S extends string, Out extends Bit[] = []> =
  S extends `${infer Head}${infer Tail}`
    ? Head extends keyof HexBits
      ? TextToBits<Tail, [...Out, ...HexBits[Head]]>
      : never
    : Out extends Bits32 ? Out : never;

type BitsToText<S extends readonly Bit[], Out extends string = ""> =
  S extends readonly [
    infer A extends Bit, infer B extends Bit, infer C extends Bit, infer D extends Bit,
    ...infer Rest extends Bit[],
  ]
    ? BitsToText<Rest, `${Out}${BitsHex[`${A}${B}${C}${D}`]}`>
    : Out;

type XorBit<A extends Bit, B extends Bit> = A extends B ? 0 : 1;
type Xor<A extends readonly Bit[], B extends readonly Bit[], Out extends Bit[] = []> =
  A extends readonly [infer AH extends Bit, ...infer AT extends Bit[]]
    ? B extends readonly [infer BH extends Bit, ...infer BT extends Bit[]]
      ? Xor<AT, BT, [...Out, XorBit<AH, BH>]>
      : never
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

type RotateLeft<A extends Bits32, N extends number> = [...Drop<A, N>, ...Take<A, N>] & Bits32;
type ShiftLeft<A extends Bits32, N extends number> = [...Drop<A, N>, ...Take<Zeros32, N>] & Bits32;
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
> = A extends readonly [infer AH extends Bit, ...infer AT extends Bit[]]
  ? B extends readonly [infer BH extends Bit, ...infer BT extends Bit[]]
    ? AddBit<AH, BH, Carry> extends [infer Sum extends Bit, infer NextCarry extends Bit]
      ? AddLittleEndian<AT, BT, NextCarry, [...Out, Sum]>
      : never
    : never
  : Out;

type Add<A extends Bits32, B extends Bits32> = Reverse<AddLittleEndian<Reverse<A>, Reverse<B>>> & Bits32;
type Mul5<A extends Bits32> = Add<A, ShiftLeft<A, 2>>;
type Mul9<A extends Bits32> = Add<A, ShiftLeft<A, 3>>;

type XoshiroStep<A extends Bits32, B extends Bits32, C extends Bits32, D extends Bits32> = {
  readonly word: BitsToText<Mul9<RotateLeft<Mul5<B>, 7>>>;
  readonly state: readonly [
    BitsToText<Xor<A, Xor<B, D>>>,
    BitsToText<Xor<B, Xor<C, A>>>,
    BitsToText<Xor<Xor<C, A>, ShiftLeft<B, 9>>>,
    BitsToText<RotateLeft<Xor<D, B> & Bits32, 11>>,
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

type SeedShape<S extends readonly unknown[]> = S extends readonly [string, string, string, string]
  ? true
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

/* -------------------------------------------------------------------------- */
/* Public type operations                                                     */
/* -------------------------------------------------------------------------- */

export type InitializeResult = Success<GeneratorState> | InvalidSeedFailure;

export type Initialize<S extends readonly unknown[]> =
  SeedShape<S> extends true
    ? ValidWords<S> extends true
      ? S extends StateWords
        ? IsZeroState<S> extends true
          ? Failure<"invalid-seed-zero", { readonly seed: S }>
          : Success<GeneratorState<S>>
        : Failure<"invalid-seed-shape">
      : Failure<"invalid-seed-word", { readonly seed: S }>
    : Failure<"invalid-seed-shape", { readonly seed: S }>;

export type CreateState<W extends readonly unknown[]> =
  SeedShape<W> extends true
    ? ValidWords<W> extends true
      ? W extends StateWords
        ? IsZeroState<W> extends true
          ? Failure<"invalid-state-zero", { readonly state: W }>
          : Success<GeneratorState<W>>
        : Failure<"invalid-state-shape">
      : Failure<"invalid-state-word", { readonly state: W }>
    : Failure<"invalid-state-shape", { readonly state: W }>;

type StateBits<S extends GeneratorState> = S["words"] extends readonly [
  infer A extends string, infer B extends string, infer C extends string, infer D extends string,
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
type NormalizeWords<W extends StateWords> = readonly [W[0], W[1], W[2], W[3]];

export type Next<S> = S extends GeneratorState<infer W>
  ? ValidWords<W> extends true
    ? IsZeroState<W> extends true
      ? Failure<"invalid-state-zero", { readonly state: W }>
      : StateBits<S> extends infer R
        ? R extends { readonly word: infer Word extends string; readonly state: infer Words extends StateWords }
          ? Success<{
            readonly word: Word;
              readonly state: GeneratorState<NormalizeWords<Words>>;
            }>
          : Failure<"invalid-state-word", { readonly state: W }>
        : Failure<"invalid-state-word", { readonly state: W }>
    : Failure<"invalid-state-word", { readonly state: W }>
  : Failure<"invalid-state-shape">;

type BoundWidth<M extends number> =
  M extends 1 ? 0 :
  M extends 2 ? 1 :
  M extends 3 | 4 ? 2 :
  M extends 5 | 6 | 7 | 8 ? 3 :
  M extends 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 ? 4 :
  M extends 17 | 18 | 19 | 20 | 21 | 22 | 23 | 24 | 25 | 26 | 27 | 28 | 29 | 30 | 31 | 32 ? 5 :
  M extends 33 | 34 | 35 | 36 | 37 | 38 | 39 | 40 | 41 | 42 | 43 | 44 | 45 | 46 | 47 | 48 | 49 | 50 | 51 | 52 | 53 | 54 | 55 | 56 | 57 | 58 | 59 | 60 | 61 | 62 | 63 | 64 ? 6 :
  M extends 65 | 66 | 67 | 68 | 69 | 70 | 71 | 72 | 73 | 74 | 75 | 76 | 77 | 78 | 79 | 80 | 81 | 82 | 83 | 84 | 85 | 86 | 87 | 88 | 89 | 90 | 91 | 92 | 93 | 94 | 95 | 96 | 97 | 98 | 99 | 100 ? 7 :
  never;

type SupportedBound<M extends number> = BoundWidth<M> extends never ? false : true;
type SupportedFuel<F extends number> = number extends F
  ? false
  : `${F}` extends `-${string}`
    ? false
    : `${F}` extends `${bigint}` ? true : false;
type PrefixBits<W extends string, N extends number> = TextToBits<W> extends infer B extends Bits32 ? Take<B, N> : never;
type BitsToSmallNumber<B extends readonly Bit[], Out extends unknown[] = []> =
  B extends readonly [infer Head extends Bit, ...infer Tail extends Bit[]]
    ? BitsToSmallNumber<Tail, [...Out, ...Out, ...(Head extends 1 ? [unknown] : [])]>
    : Out["length"];

type Decrement<N extends number, Acc extends unknown[] = []> =
  [...Acc, unknown]["length"] extends N ? Acc["length"] : Decrement<N, [...Acc, unknown]>;

type IsLessThan<A extends number, B extends number, Count extends unknown[] = []> =
  Count["length"] extends A
    ? A extends B ? false : true
    : Count["length"] extends B
      ? false
      : IsLessThan<A, B, [...Count, unknown]>;

type SampleLoop<
  S extends GeneratorState,
  M extends number,
  Fuel extends number,
  Attempts extends unknown[] = [],
> = Fuel extends 0
  ? Failure<"sampling-attempts-exhausted", {
      readonly maximumAttempts: Attempts["length"];
      readonly attempts: Attempts["length"];
      readonly state: S;
    }>
  : Next<S> extends infer Step
    ? Step extends Success<infer V extends { readonly word: string; readonly state: GeneratorState }>
      ? BitsToSmallNumber<PrefixBits<V["word"], BoundWidth<M>>> extends infer Candidate extends number
        ? IsLessThan<Candidate, M> extends true
          ? Success<{
              readonly value: Candidate;
              readonly state: V["state"];
              readonly attempts: [...Attempts, unknown]["length"];
            }>
          : SampleLoop<V["state"], M, Decrement<Fuel>, [...Attempts, unknown]>
        : never
      : Step
    : never;

export type Sample<
  S,
  M extends number,
  MaximumAttempts extends number,
> = S extends GeneratorState
  ? SupportedBound<M> extends true
    ? SupportedFuel<MaximumAttempts> extends true
      ? SampleLoop<S, M, MaximumAttempts>
      : Failure<"invalid-attempt-fuel", { readonly maximumAttempts: MaximumAttempts }>
    : Failure<"invalid-bound", { readonly bound: M }>
  : Failure<"invalid-state-shape">;

/* -------------------------------------------------------------------------- */
/* Runtime oracle: deliberately separate arithmetic and state threading       */
/* -------------------------------------------------------------------------- */

export type OracleState = { readonly words: StateWords };
export type OracleStep = { readonly word: string; readonly state: OracleState };
export type OracleReplayToken = {
  readonly schemaVersion: 1;
  readonly sequenceProfile: SequenceProfile;
  readonly seed: SeedWords;
};
export type OracleSerializedState = {
  readonly schemaVersion: 1;
  readonly sequenceProfile: SequenceProfile;
  readonly state: StateWords;
};
export type OracleBoundedResult =
  | { readonly ok: true; readonly value: number; readonly state: OracleState; readonly attempts: number }
  | {
      readonly ok: false;
      readonly code: "invalid-state-shape";
      readonly details: { readonly state: unknown };
    }
  | {
      readonly ok: false;
      readonly code: "invalid-state-word";
      readonly details: { readonly state: unknown };
    }
  | {
      readonly ok: false;
      readonly code: "invalid-state-zero";
      readonly details: { readonly state: unknown };
    }
  | { readonly ok: false; readonly code: "invalid-bound"; readonly details: { readonly bound: number } }
  | {
      readonly ok: false;
      readonly code: "invalid-attempt-fuel";
      readonly details: { readonly maximumAttempts: number };
    }
  | {
      readonly ok: false;
      readonly code: "sampling-attempts-exhausted";
      readonly details: { readonly maximumAttempts: number; readonly attempts: number; readonly state: OracleState };
    };
type OracleStateFailure = Extract<OracleBoundedResult, { readonly ok: false; readonly code: `invalid-state-${string}` }>;

const normalize = (value: number): number => value >>> 0;
const hex = (value: number): string => normalize(value).toString(16).padStart(8, "0");
const parseWord = (value: string): number => Number.parseInt(value, 16) >>> 0;

/** Internal correctness oracle only; this is not part of a public runtime API. */
export function oracleInitialize(words: SeedWords): OracleState {
  if (words.length !== 4 || words.some((word) => !/^[0-9a-f]{8}$/.test(word))) {
    throw new Error("oracle received a non-canonical seed");
  }
  if (words.every((word) => word === "00000000")) {
    throw new Error("oracle received the all-zero seed");
  }
  return { words };
}

/** Internal correctness oracle only; xoshiro128** 1.1, output scrambles s1. */
export function oracleNext(state: OracleState): OracleStep {
  const [s0, s1, s2, s3] = state.words.map(parseWord);
  if ((s0 | s1 | s2 | s3) === 0) throw new Error("oracle received the all-zero state");
  const result = normalize(Math.imul(normalize(Math.imul(s1, 5) << 7 | Math.imul(s1, 5) >>> 25), 9));
  const t = normalize(s1 << 9);
  const n2 = normalize(s2 ^ s0);
  const n3 = normalize(s3 ^ s1);
  const n1 = normalize(s1 ^ n2);
  const n0 = normalize(s0 ^ n3);
  const n2b = normalize(n2 ^ t);
  const n3b = normalize((n3 << 11) | (n3 >>> 21));
  return { word: hex(result), state: { words: [hex(n0), hex(n1), hex(n2b), hex(n3b)] } };
}

function oracleStateFailure(state: unknown): OracleStateFailure | null {
  if (typeof state !== "object" || state === null || !("words" in state)) {
    return { ok: false, code: "invalid-state-shape", details: { state } };
  }
  const words = (state as { readonly words?: unknown }).words;
  if (!Array.isArray(words) || words.length !== 4) {
    return { ok: false, code: "invalid-state-shape", details: { state } };
  }
  if (words.some((word) => typeof word !== "string" || !/^[0-9a-f]{8}$/.test(word))) {
    return { ok: false, code: "invalid-state-word", details: { state } };
  }
  if (words.every((word) => word === "00000000")) {
    return { ok: false, code: "invalid-state-zero", details: { state } };
  }
  return null;
}

export function oracleSerializeState(state: OracleState): OracleSerializedState {
  return { schemaVersion: 1, sequenceProfile: SEQUENCE_PROFILE, state: state.words };
}

export function oracleRestoreReplay(token: OracleReplayToken): OracleState {
  if (token.schemaVersion !== 1 || token.sequenceProfile !== SEQUENCE_PROFILE) {
    throw new Error("oracle received an unsupported replay token");
  }
  return oracleInitialize(token.seed);
}

export function oracleRestoreState(snapshot: OracleSerializedState): OracleState {
  if (snapshot.schemaVersion !== 1 || snapshot.sequenceProfile !== SEQUENCE_PROFILE) {
    throw new Error("oracle received an unsupported serialized state");
  }
  const state = { words: snapshot.state };
  const invalid = oracleStateFailure(state);
  if (invalid) throw new Error(`oracle received invalid serialized state: ${invalid.code}`);
  return state;
}

export function oracleSample(
  state: OracleState,
  bound: number,
  maximumAttempts: number,
): OracleBoundedResult {
  const invalidState = oracleStateFailure(state);
  if (invalidState) return invalidState;
  if (!Number.isInteger(bound) || bound < 1 || bound > 100) {
    return { ok: false, code: "invalid-bound", details: { bound } };
  }
  if (!Number.isInteger(maximumAttempts) || maximumAttempts < 0) {
    return { ok: false, code: "invalid-attempt-fuel", details: { maximumAttempts } };
  }
  let current = state;
  let attempts = 0;
  const width = bound === 1 ? 0 : Math.ceil(Math.log2(bound));
  const mask = width === 0 ? 0 : 2 ** width - 1;
  while (attempts < maximumAttempts) {
    const step = oracleNext(current);
    attempts += 1;
    const candidate = width === 0 ? 0 : parseWord(step.word) >>> (32 - width);
    current = step.state;
    if (candidate < bound) return { ok: true, value: candidate, state: current, attempts };
    // `mask` documents the fixed-width high-bit rejection intent in this
    // tiny oracle; the candidate is already the high-bit slice, not modulo.
    void mask;
  }
  return {
    ok: false,
    code: "sampling-attempts-exhausted",
    details: { maximumAttempts, attempts, state: current },
  };
}

/* -------------------------------------------------------------------------- */
/* Golden vectors and compile-time API probes                                 */
/* -------------------------------------------------------------------------- */

export const GOLDEN_SEED = ["00000001", "00000002", "00000003", "00000004"] as const;
export const GOLDEN_STEPS = [
  {
    word: "00002d00",
    state: ["00000007", "00000000", "00000402", "00003000"],
  },
  {
    word: "00000000",
    state: ["00003007", "00000405", "00000405", "01800000"],
  },
  {
    word: "005a7080",
    state: ["01803402", "00003007", "00083e02", "0020280c"],
  },
] as const;

type Equal<A, B> = (<T>() => T extends A ? 1 : 2) extends
  (<T>() => T extends B ? 1 : 2) ? true : false;
type Expect<T extends true> = T;
type Initialized = Initialize<typeof GOLDEN_SEED>;
type InitialState = Initialized extends Success<infer V extends GeneratorState> ? V : never;
type Step1 = Next<InitialState>;
type _Step1Word = Expect<Step1 extends Success<infer V> ? V extends { word: "00002d00" } ? true : false : false>;
type _Step1State = Expect<Step1 extends Success<infer V> ? V extends { state: { words: typeof GOLDEN_STEPS[0]["state"] } } ? true : false : false>;
type Step2 = Next<GeneratorState<typeof GOLDEN_STEPS[0]["state"]>>;
type Step3 = Next<GeneratorState<typeof GOLDEN_STEPS[1]["state"]>>;
type _Step2Word = Expect<Step2 extends Success<infer V> ? V extends { word: "00000000" } ? true : false : false>;
type _Step3Word = Expect<Step3 extends Success<infer V> ? V extends { word: "005a7080" } ? true : false : false>;
type _InvalidSeed = Expect<Equal<Initialize<["00000000", "00000000", "00000000", "00000000"]>["code"], "invalid-seed-zero">>;
type _InvalidState = Expect<Equal<Next<{ kind: "GeneratorState"; words: ["00000000", "00000000", "00000000", "00000000"] }>["code"], "invalid-state-zero">>;
type _InvalidSampleState = Expect<Equal<Sample<null, 6, 0>["code"], "invalid-state-shape">>;
type _InvalidBound = Expect<Equal<Sample<InitialState, 101, 1>["code"], "invalid-bound">>;
type _InvalidFuel = Expect<Equal<Sample<InitialState, 6, -1>["code"], "invalid-attempt-fuel">>;
type _Exhausted = Expect<Equal<Sample<InitialState, 100, 0>["code"], "sampling-attempts-exhausted">>;
type _D1 = Expect<Equal<Sample<InitialState, 1, 1> extends Success<infer V> ? V extends { value: infer N } ? N : never : never, 0>>;
type _D1Attempts = Expect<Equal<Sample<InitialState, 1, 1> extends Success<infer V> ? V extends { attempts: infer N } ? N : never : never, 1>>;
type _Replay = ReplayToken<typeof GOLDEN_SEED>;
type _Serialized = SerializedGeneratorState<typeof GOLDEN_STEPS[0]["state"]>;
type _ReplayCanonical = Expect<Equal<_Replay["seed"], typeof GOLDEN_SEED>>;
type _SerializedCanonical = Expect<Equal<_Serialized["state"], typeof GOLDEN_STEPS[0]["state"]>>;
type _ReplayRejectsArbitraryWords = Expect<Equal<ReplayToken<[string, string, string, string]>, never>>;
type _SerializedRejectsUppercase = Expect<Equal<SerializedGeneratorState<["0000000A", "00000000", "00000000", "00000001"]>, never>>;
type _ReplayRejectsZero = Expect<Equal<ReplayToken<["00000000", "00000000", "00000000", "00000000"]>, never>>;
type _SerializedRejectsZero = Expect<Equal<SerializedGeneratorState<["00000000", "00000000", "00000000", "00000000"]>, never>>;

const assert = (condition: unknown, message: string): void => {
  if (!condition) throw new Error(message);
};

function runOracleVectors(): void {
  let state = oracleInitialize(GOLDEN_SEED);
  for (const [index, expected] of GOLDEN_STEPS.entries()) {
    const actual = oracleNext(state);
    assert(actual.word === expected.word, `step ${index} output mismatch`);
    assert(JSON.stringify(actual.state.words) === JSON.stringify(expected.state), `step ${index} state mismatch`);
    state = actual.state;
  }
  const d1 = oracleSample(oracleInitialize(GOLDEN_SEED), 1, 1);
  assert(d1.ok && d1.value === 0 && d1.attempts === 1, "d1 must consume one output");
  const exhausted = oracleSample(oracleInitialize(GOLDEN_SEED), 100, 0);
  assert(!exhausted.ok && exhausted.code === "sampling-attempts-exhausted", "fuel zero must exhaust");
  const invalidState = oracleSample(
    { words: ["00000000", "00000000", "00000000", "00000000"] },
    6,
    0,
  );
  assert(!invalidState.ok && invalidState.code === "invalid-state-zero", "state validation must precede zero-fuel exhaustion");
  for (const invalidFuel of [-1, 0.5, Number.NaN, Number.POSITIVE_INFINITY]) {
    const result = oracleSample(oracleInitialize(GOLDEN_SEED), 6, invalidFuel);
    assert(!result.ok && result.code === "invalid-attempt-fuel", `invalid fuel ${invalidFuel} must fail structurally`);
  }
  const replayToken: OracleReplayToken = {
    schemaVersion: 1,
    sequenceProfile: SEQUENCE_PROFILE,
    seed: GOLDEN_SEED,
  };
  const replayed = oracleRestoreReplay(replayToken);
  const first = oracleNext(replayed);
  assert(first.word === GOLDEN_STEPS[0].word, "replay token must restart at the first word");
  const snapshot = oracleSerializeState(first.state);
  const resumed = oracleRestoreState(snapshot);
  const resumedStep = oracleNext(resumed);
  const expectedResumedStep = oracleNext(first.state);
  assert(resumedStep.word === expectedResumedStep.word, "serialized state must resume at the next word");
  console.log("PRNG prototype vectors passed; type-level assertions compiled.");
}

runOracleVectors();
