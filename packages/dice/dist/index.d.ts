/**
 * @drdice/dice is a declaration-only Dice Expression evaluator.
 *
 * This slice owns complete scanning/parsing, domain validation, static
 * preflight, and arithmetic-only evaluation.  The state-consuming DiceNode
 * evaluator is added by issue #22; keeping that branch here lets the later
 * slice preserve the accepted parser and diagnostic contract.
 */
import type { GeneratorState as PrngGeneratorState } from "@drdice/prng";

export const DICE_SEMANTIC_PROFILE: "dice-v1/utf16-bounded-left-to-right-1";
export const DICE_SEMANTIC_VERSION: 1;

export type Success<Value> = { readonly ok: true; readonly value: Value };
export type FailureCode =
  | "invalid-state-shape" | "invalid-state-word" | "invalid-state-zero"
  | "invalid-attempt-fuel" | "expected-expression" | "expected-die-sides"
  | "expected-closing-parenthesis" | "leading-zero" | "unexpected-token"
  | "dice-count-zero" | "side-count-zero" | "resource-limit-exceeded";
export type Failure<Code extends FailureCode, Details extends object = object> = {
  readonly ok: false; readonly code: Code; readonly details: Details;
};

export type DieSample<SideCount extends number = number, Face extends number = number> = {
  readonly sideCount: SideCount; readonly face: Face;
};
export type RollTrace = readonly DieSample[];
export type DiceEvaluation<
  Total extends number = number,
  Trace extends RollTrace = RollTrace,
  State extends PrngGeneratorState = PrngGeneratorState,
> = { readonly total: Total; readonly rollTrace: Trace; readonly successorState: State };

export type SyntaxCode =
  | "expected-expression" | "expected-die-sides" | "expected-closing-parenthesis"
  | "leading-zero" | "unexpected-token";
export type ResourceDimension =
  | "source-length" | "numeric-token-length" | "nesting-depth" | "ast-node-count"
  | "dice-term-count" | "die-sample-count" | "supported-side-count"
  | "arithmetic-magnitude" | "evaluation-steps" | "rejection-sampling-attempts";

export type ExpectedExpressionDiagnostic = {
  readonly kind: "syntax"; readonly code: "expected-expression"; readonly offset: number;
  readonly found: string | "eof"; readonly expected: readonly ["dice", "integer", "("];
};
export type ExpectedDieSidesDiagnostic = {
  readonly kind: "syntax"; readonly code: "expected-die-sides"; readonly offset: number;
  readonly found: string | "eof"; readonly expected: readonly ["positive-integer"];
};
export type ExpectedClosingParenthesisDiagnostic = {
  readonly kind: "syntax"; readonly code: "expected-closing-parenthesis"; readonly offset: number;
  readonly found: string | "eof"; readonly expected: readonly [")"];
};
export type LeadingZeroDiagnostic = {
  readonly kind: "syntax"; readonly code: "leading-zero"; readonly offset: number;
  readonly found: string; readonly expected: readonly ["canonical-integer"];
};
export type UnexpectedTokenDiagnostic = {
  readonly kind: "syntax"; readonly code: "unexpected-token"; readonly offset: number;
  readonly found: string; readonly expected: readonly string[];
};
export type SyntaxDiagnostic = ExpectedExpressionDiagnostic | ExpectedDieSidesDiagnostic
  | ExpectedClosingParenthesisDiagnostic | LeadingZeroDiagnostic | UnexpectedTokenDiagnostic;
export type DiceCountZeroDiagnostic = {
  readonly kind: "domain"; readonly code: "dice-count-zero"; readonly offset: number;
  readonly subject: "dice-count"; readonly value: "0";
};
export type SideCountZeroDiagnostic = {
  readonly kind: "domain"; readonly code: "side-count-zero"; readonly offset: number;
  readonly subject: "side-count"; readonly value: "0";
};
export type DomainDiagnostic = DiceCountZeroDiagnostic | SideCountZeroDiagnostic;
export type ResourceLimitExceededDiagnostic = {
  readonly kind: "resource"; readonly code: "resource-limit-exceeded"; readonly offset: number;
  readonly dimension: ResourceDimension; readonly limit: number; readonly actual: number | "widened";
  readonly partialTrace?: never; readonly successorState?: never;
};
export type Diagnostic = SyntaxDiagnostic | DomainDiagnostic | ResourceLimitExceededDiagnostic;
export type DiagnosticFailure<D extends { readonly code: FailureCode }> = Failure<D["code"], D>;

export type EvaluationStateFailure =
  | Failure<"invalid-state-shape", { readonly state: unknown; readonly partialTrace: []; readonly successorState: null }>
  | Failure<"invalid-state-word", { readonly state: unknown; readonly partialTrace: []; readonly successorState: null }>
  | Failure<"invalid-state-zero", { readonly state: unknown; readonly partialTrace: []; readonly successorState: null }>;
export type EvaluationInputFailure = EvaluationStateFailure | Failure<"invalid-attempt-fuel", {
  readonly maximumAttempts: number; readonly partialTrace: []; readonly successorState: PrngGeneratorState;
}>;
export type EvaluationFailure =
  | DiagnosticFailure<ExpectedExpressionDiagnostic> | DiagnosticFailure<ExpectedDieSidesDiagnostic>
  | DiagnosticFailure<ExpectedClosingParenthesisDiagnostic> | DiagnosticFailure<LeadingZeroDiagnostic>
  | DiagnosticFailure<UnexpectedTokenDiagnostic> | DiagnosticFailure<DiceCountZeroDiagnostic>
  | DiagnosticFailure<SideCountZeroDiagnostic> | DiagnosticFailure<ResourceLimitExceededDiagnostic>
  | EvaluationInputFailure;
export type EvaluationResult = Success<DiceEvaluation> | EvaluationFailure;

type Limits = {
  readonly sourceLength: 64; readonly numericTokenLength: 3; readonly nestingDepth: 4;
  readonly astNodeCount: 15; readonly diceTermCount: 4; readonly dieSampleCount: 8;
  readonly supportedSideCount: 100; readonly arithmeticMagnitude: 100; readonly evaluationSteps: 24;
  readonly rejectionSamplingAttempts: 4;
};
type L = Limits;

type Digit = "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9";
type Whitespace = " " | "\t" | "\n" | "\r";
type TupleOf<N extends number, Out extends unknown[] = []> =
  Out["length"] extends N ? Out : TupleOf<N, [...Out, unknown]>;
type Increment<N extends number> = [...TupleOf<N>, unknown]["length"] & number;
type Decrement<N extends number, Acc extends unknown[] = []> =
  [...Acc, unknown]["length"] extends N ? Acc["length"] : Decrement<N, [...Acc, unknown]>;
/* TypeScript template-literal inference treats an astral code point as one
 * match, while JavaScript source offsets are UTF-16 code-unit offsets.  The
 * reviewed v1 corpus exercises U+1F642; retain its two-unit accounting and
 * high-surrogate diagnostic spelling here. */
type Utf16Units<C extends string> = C extends "🙂" ? [unknown, unknown] : [unknown];
type Utf16FirstUnit<C extends string> = C extends "🙂" ? "\ud83d" : C;
type StringLength<S extends string, Out extends unknown[] = []> =
  S extends `${infer Head}${infer Tail}` ? StringLength<Tail, [...Out, ...Utf16Units<Head>]> : Out["length"];
type DigitTuple<D extends Digit> = D extends "0" ? [] : D extends "1" ? [unknown]
  : D extends "2" ? [unknown, unknown] : D extends "3" ? [unknown, unknown, unknown]
  : D extends "4" ? [unknown, unknown, unknown, unknown]
  : D extends "5" ? [unknown, unknown, unknown, unknown, unknown]
  : D extends "6" ? [unknown, unknown, unknown, unknown, unknown, unknown]
  : D extends "7" ? [unknown, unknown, unknown, unknown, unknown, unknown, unknown]
  : D extends "8" ? [unknown, unknown, unknown, unknown, unknown, unknown, unknown, unknown]
  : [unknown, unknown, unknown, unknown, unknown, unknown, unknown, unknown, unknown];
type TimesTen<A extends unknown[]> = [...A, ...A, ...A, ...A, ...A, ...A, ...A, ...A, ...A, ...A];
type ParseNat<S extends string, Acc extends unknown[] = []> =
  S extends `${infer Head extends Digit}${infer Tail}` ? ParseNat<Tail, [...TimesTen<Acc>, ...DigitTuple<Head>]> : Acc;
type ToNegative<M extends number> = `-${M}` extends `${infer N extends number}` ? N : never;
type ToSignedNumber<Negative extends boolean, Magnitude extends readonly unknown[]> =
  Magnitude["length"] extends 0 ? 0 : Negative extends true ? ToNegative<Magnitude["length"]> : Magnitude["length"];
type IsGreaterThan<A extends number, B extends number> = TupleOf<A> extends [...TupleOf<B>, ...infer Rest]
  ? Rest extends [] ? false : true : false;
type IsLessThan<A extends number, B extends number> = A extends B ? false
  : TupleOf<B> extends [...TupleOf<A>, ...infer Rest] ? Rest extends [] ? false : true : false;
type CompareTupleLengths<A extends readonly unknown[], B extends readonly unknown[]> =
  A extends [...B, ...infer Rest] ? Rest extends [] ? "equal" : "greater"
    : B extends [...A, ...infer Rest] ? Rest extends [] ? "equal" : "less" : "less";
type SubtractTuples<A extends readonly unknown[], B extends readonly unknown[]> = A extends [...B, ...infer Rest] ? Rest : [];
type Signed<Negative extends boolean, Magnitude extends readonly unknown[]> = { readonly negative: Negative; readonly magnitude: Magnitude };
type NormalizeSigned<Negative extends boolean, Magnitude extends readonly unknown[]> = Magnitude extends [] ? Signed<false, []> : Signed<Negative, Magnitude>;
type SignedFromNat<M extends readonly unknown[]> = Signed<false, M>;
type NegateSigned<A extends Signed<boolean, readonly unknown[]>> = NormalizeSigned<A["negative"] extends true ? false : true, A["magnitude"]>;
type AddSigned<A extends Signed<boolean, readonly unknown[]>, B extends Signed<boolean, readonly unknown[]>> =
  A["negative"] extends B["negative"] ? NormalizeSigned<A["negative"], [...A["magnitude"], ...B["magnitude"]]>
    : CompareTupleLengths<A["magnitude"], B["magnitude"]> extends infer Compared
      ? Compared extends "greater" ? NormalizeSigned<A["negative"], SubtractTuples<A["magnitude"], B["magnitude"]>>
        : Compared extends "less" ? NormalizeSigned<B["negative"], SubtractTuples<B["magnitude"], A["magnitude"]>> : Signed<false, []>
      : never;

type Cursor<R extends string, Offset extends number> = { readonly rest: R; readonly offset: Offset };
type ParseOk<Ast, R extends string, Offset extends number> = { readonly ok: true; readonly ast: Ast; readonly rest: R; readonly offset: Offset };
type Found<R extends string> = R extends `${infer Head}${string}` ? Utf16FirstUnit<Head> : "eof";
type SkipWhitespace<R extends string, Offset extends number> = R extends `${infer Head}${infer Tail}`
  ? Head extends Whitespace ? SkipWhitespace<Tail, Increment<Offset>> : Cursor<R, Offset> : Cursor<R, Offset>;
type ScanDigits<R extends string, Offset extends number, Raw extends string = ""> = R extends `${infer Head}${infer Tail}`
  ? Head extends Digit ? ScanDigits<Tail, Increment<Offset>, `${Raw}${Head}`> : { readonly raw: Raw; readonly rest: R; readonly offset: Offset }
  : { readonly raw: Raw; readonly rest: ""; readonly offset: Offset };
type SyntaxFailure<Code extends SyntaxCode, Offset extends number, FoundValue extends string | "eof", Expected extends readonly string[]> = DiagnosticFailure<{
  readonly kind: "syntax"; readonly code: Code; readonly offset: Offset; readonly found: FoundValue; readonly expected: Expected;
}>;
type ResourceFailure<Dimension extends ResourceDimension, Offset extends number, Limit extends number, Actual extends number | "widened"> = DiagnosticFailure<{
  readonly kind: "resource"; readonly code: "resource-limit-exceeded"; readonly offset: Offset; readonly dimension: Dimension; readonly limit: Limit; readonly actual: Actual;
}>;
type DomainFailure<Code extends "dice-count-zero" | "side-count-zero", Offset extends number, Subject extends "dice-count" | "side-count"> =
  Code extends "dice-count-zero" ? DiagnosticFailure<{ readonly kind: "domain"; readonly code: "dice-count-zero"; readonly offset: Offset; readonly subject: "dice-count"; readonly value: "0" }>
    : DiagnosticFailure<{ readonly kind: "domain"; readonly code: "side-count-zero"; readonly offset: Offset; readonly subject: "side-count"; readonly value: "0" }>;

type IntNode<Value extends number, Magnitude extends readonly unknown[], Offset extends number> = { readonly kind: "integer"; readonly value: Value; readonly magnitude: Magnitude; readonly offset: Offset };
type DiceNode<Count extends number, CountMagnitude extends readonly unknown[], Sides extends number, SideMagnitude extends readonly unknown[], Offset extends number, SideOffset extends number> = {
  readonly kind: "dice"; readonly count: Count; readonly countMagnitude: CountMagnitude; readonly sides: Sides; readonly sideMagnitude: SideMagnitude; readonly offset: Offset; readonly sideOffset: SideOffset;
};
type GroupNode<Child, Offset extends number> = { readonly kind: "group"; readonly child: Child; readonly offset: Offset };
type BinaryNode<Op extends "+" | "-", Left, Right, Offset extends number> = { readonly kind: "binary"; readonly op: Op; readonly left: Left; readonly right: Right; readonly offset: Offset };

type NumberToken<Raw extends string, Start extends number> = IsGreaterThan<StringLength<Raw>, L["numericTokenLength"]> extends true
  ? ResourceFailure<"numeric-token-length", Start, L["numericTokenLength"], StringLength<Raw>>
  : Raw extends `0${infer Tail}` ? Tail extends "" ? Success<{ readonly value: 0; readonly magnitude: [] }>
    : SyntaxFailure<"leading-zero", Start, Tail extends `${infer Head}${string}` ? Head : "eof", readonly ["canonical-integer"]>
    : ParseNat<Raw> extends infer Magnitude extends unknown[] ? Success<{ readonly value: Magnitude["length"]; readonly magnitude: Magnitude }> : never;

type ParseSidesScanned<Digits, Offset extends number, Start extends number, Count extends number, CountMagnitude extends readonly unknown[]> = Digits extends {
  readonly raw: ""; readonly rest: infer Rest extends string;
}
  ? SyntaxFailure<"expected-die-sides", Offset, Found<Rest>, readonly ["positive-integer"]>
  : Digits extends { readonly raw: infer Raw extends string; readonly rest: infer Rest extends string; readonly offset: infer DigitsOffset extends number }
    ? NumberToken<Raw, Offset> extends infer N
      ? N extends Success<infer Parsed extends { readonly value: number; readonly magnitude: readonly unknown[] }>
        ? ParseOk<DiceNode<Count, CountMagnitude, Parsed["value"], Parsed["magnitude"], Start, Offset>, Rest, DigitsOffset> : N
      : never : never;
type ParseSides<R extends string, Offset extends number, Start extends number, Count extends number, CountMagnitude extends readonly unknown[]> = ParseSidesScanned<ScanDigits<R, Offset>, Offset, Start, Count, CountMagnitude>;
type ParseNumberScanned<Digits, Offset extends number> = Digits extends { readonly raw: infer Raw extends string; readonly rest: infer Rest extends string; readonly offset: infer DigitsOffset extends number }
  ? NumberToken<Raw, Offset> extends infer N
    ? N extends Success<infer Parsed extends { readonly value: number; readonly magnitude: readonly unknown[] }>
      ? Rest extends `d${infer After}` ? ParseSides<After, Increment<DigitsOffset>, Offset, Parsed["value"], Parsed["magnitude"]>
        : Rest extends `D${infer AfterUpper}` ? ParseSides<AfterUpper, Increment<DigitsOffset>, Offset, Parsed["value"], Parsed["magnitude"]>
          : ParseOk<IntNode<Parsed["value"], Parsed["magnitude"], Offset>, Rest, DigitsOffset>
      : N : never : never;
type ParseNumberPrimary<R extends string, Offset extends number> = ParseNumberScanned<ScanDigits<R, Offset>, Offset>;

type ParsePrimary<R extends string, Offset extends number, Depth extends unknown[] = []> = SkipWhitespace<R, Offset> extends infer C extends Cursor<string, number>
  ? C["rest"] extends ""
    ? SyntaxFailure<"expected-expression", C["offset"], "eof", readonly ["dice", "integer", "("]>
    : C["rest"] extends `(${infer Tail}`
      ? IsGreaterThan<Increment<Depth["length"]>, L["nestingDepth"]> extends true
        ? ResourceFailure<"nesting-depth", C["offset"], L["nestingDepth"], Increment<Depth["length"]>>
        : ParseExpression<Tail, Increment<C["offset"]>, [...Depth, unknown]> extends infer Inner
          ? Inner extends ParseOk<infer Ast, infer Rest extends string, infer NextOffset extends number>
            ? SkipWhitespace<Rest, NextOffset> extends infer Close extends Cursor<string, number>
              ? Close["rest"] extends `)${infer AfterClose}`
                ? ParseOk<GroupNode<Ast, C["offset"]>, AfterClose, Increment<Close["offset"]>>
                : SyntaxFailure<"expected-closing-parenthesis", Close["offset"], Found<Close["rest"]>, readonly [")"]>
              : never
            : Inner
          : never
      : C["rest"] extends `d${infer AfterD}` ? ParseSides<AfterD, Increment<C["offset"]>, C["offset"], 1, [unknown]>
        : C["rest"] extends `D${infer AfterUpperD}` ? ParseSides<AfterUpperD, Increment<C["offset"]>, C["offset"], 1, [unknown]>
          : C["rest"] extends `${infer Head}${string}`
            ? Head extends Digit ? ParseNumberPrimary<C["rest"], C["offset"]>
              : SyntaxFailure<"unexpected-token", C["offset"], Utf16FirstUnit<Head>, readonly ["dice", "integer", "("]>
            : never
  : never;

type ParseTail<Left, R extends string, Offset extends number, Depth extends unknown[]> = SkipWhitespace<R, Offset> extends infer C extends Cursor<string, number>
  ? C["rest"] extends "" | `)${string}` ? ParseOk<Left, C["rest"], C["offset"]>
    : C["rest"] extends `+${infer Tail}`
      ? ParsePrimary<Tail, Increment<C["offset"]>, Depth> extends infer Right
        ? Right extends ParseOk<infer Ast, infer Rest extends string, infer Next extends number>
          ? ParseTail<BinaryNode<"+", Left, Ast, C["offset"]>, Rest, Next, Depth> : Right
        : never
      : C["rest"] extends `-${infer TailMinus}`
        ? ParsePrimary<TailMinus, Increment<C["offset"]>, Depth> extends infer RightMinus
          ? RightMinus extends ParseOk<infer Ast, infer Rest extends string, infer Next extends number>
            ? ParseTail<BinaryNode<"-", Left, Ast, C["offset"]>, Rest, Next, Depth> : RightMinus
          : never
        : SyntaxFailure<"unexpected-token", C["offset"], Found<C["rest"]>, readonly ["+", "-", "EOF"]>
  : never;

type ParseExpression<R extends string, Offset extends number, Depth extends unknown[] = []> = ParsePrimary<R, Offset, Depth> extends infer First
  ? First extends ParseOk<infer Ast, infer Rest extends string, infer Next extends number> ? ParseTail<Ast, Rest, Next, Depth> : First
  : never;

type ParseSource<Source extends string> = string extends Source
  ? ResourceFailure<"source-length", 0, L["sourceLength"], "widened">
  : IsGreaterThan<StringLength<Source>, L["sourceLength"]> extends true
    ? ResourceFailure<"source-length", 0, L["sourceLength"], StringLength<Source>>
    : SkipWhitespace<Source, 0> extends infer Start extends Cursor<string, number>
      ? Start["rest"] extends "" ? SyntaxFailure<"expected-expression", Start["offset"], "eof", readonly ["dice", "integer", "("]>
        : ParseExpression<Start["rest"], Start["offset"]> extends infer Parsed
          ? Parsed extends ParseOk<infer Ast, infer Rest extends string, infer Offset extends number>
            ? SkipWhitespace<Rest, Offset> extends infer End extends Cursor<string, number>
              ? End["rest"] extends "" ? Success<Ast> : SyntaxFailure<"unexpected-token", End["offset"], Found<End["rest"]>, readonly ["EOF"]>
              : never
            : Parsed
          : never
      : never;

/* -------------------------------------------------------------------------- */
/* Full-AST domain and static accounting                                      */
/* -------------------------------------------------------------------------- */

type DomainOnlyValidation<Ast> = Ast extends DiceNode<infer Count, readonly unknown[], infer Sides, readonly unknown[], infer Offset, infer SideOffset>
  ? Count extends 0 ? DomainFailure<"dice-count-zero", Offset, "dice-count"> : Sides extends 0 ? DomainFailure<"side-count-zero", SideOffset, "side-count"> : true
  : Ast extends GroupNode<infer Child, number> ? DomainOnlyValidation<Child>
    : Ast extends BinaryNode<"+" | "-", infer Left, infer Right, number>
      ? DomainOnlyValidation<Left> extends infer LeftResult ? LeftResult extends true ? DomainOnlyValidation<Right> : LeftResult : never
      : true;

type Stats = {
  readonly nodes: readonly unknown[]; readonly diceTerms: readonly unknown[]; readonly samples: readonly unknown[]; readonly steps: readonly unknown[];
  readonly nodeOffsets: readonly number[]; readonly diceOffsets: readonly number[]; readonly sampleOffsets: readonly number[]; readonly stepOffsets: readonly number[];
  readonly integerValues: readonly { readonly value: number; readonly magnitude: readonly unknown[]; readonly offset: number }[];
};
type Twice<A extends readonly unknown[]> = [...A, ...A];
type RepeatValue<A extends readonly unknown[], Value, Out extends Value[] = []> = A extends readonly [unknown, ...infer Rest]
  ? RepeatValue<Rest, Value, [...Out, Value]> : Out;
type AstStats<Ast> = Ast extends IntNode<infer Value, infer Magnitude, infer Offset>
  ? { readonly nodes: [unknown]; readonly diceTerms: []; readonly samples: []; readonly steps: [unknown]; readonly nodeOffsets: [Offset]; readonly diceOffsets: []; readonly sampleOffsets: []; readonly stepOffsets: [Offset]; readonly integerValues: [{ readonly value: Value; readonly magnitude: Magnitude; readonly offset: Offset }] }
  : Ast extends DiceNode<infer _Count, infer CountMagnitude, number, readonly unknown[], infer Offset, number>
    ? { readonly nodes: [unknown]; readonly diceTerms: [unknown]; readonly samples: CountMagnitude; readonly steps: [unknown, ...Twice<CountMagnitude>]; readonly nodeOffsets: [Offset]; readonly diceOffsets: [Offset]; readonly sampleOffsets: RepeatValue<CountMagnitude, Offset>; readonly stepOffsets: [Offset, ...RepeatValue<Twice<CountMagnitude>, Offset>]; readonly integerValues: [] }
    : Ast extends GroupNode<infer Child, infer Offset>
      ? AstStats<Child> extends infer ChildStats extends Stats
        ? { readonly nodes: [unknown, ...ChildStats["nodes"]]; readonly diceTerms: ChildStats["diceTerms"]; readonly samples: ChildStats["samples"]; readonly steps: [unknown, ...ChildStats["steps"]]; readonly nodeOffsets: [Offset, ...ChildStats["nodeOffsets"]]; readonly diceOffsets: ChildStats["diceOffsets"]; readonly sampleOffsets: ChildStats["sampleOffsets"]; readonly stepOffsets: [Offset, ...ChildStats["stepOffsets"]]; readonly integerValues: ChildStats["integerValues"] }
        : never
      : Ast extends BinaryNode<"+" | "-", infer Left, infer Right, infer Offset>
        ? AstStats<Left> extends infer LeftStats extends Stats ? AstStats<Right> extends infer RightStats extends Stats
          ? { readonly nodes: [...LeftStats["nodes"], unknown, ...RightStats["nodes"]]; readonly diceTerms: [...LeftStats["diceTerms"], ...RightStats["diceTerms"]]; readonly samples: [...LeftStats["samples"], ...RightStats["samples"]]; readonly steps: [...LeftStats["steps"], unknown, ...RightStats["steps"]]; readonly nodeOffsets: [...LeftStats["nodeOffsets"], Offset, ...RightStats["nodeOffsets"]]; readonly diceOffsets: [...LeftStats["diceOffsets"], ...RightStats["diceOffsets"]]; readonly sampleOffsets: [...LeftStats["sampleOffsets"], ...RightStats["sampleOffsets"]]; readonly stepOffsets: [...LeftStats["stepOffsets"], Offset, ...RightStats["stepOffsets"]]; readonly integerValues: [...LeftStats["integerValues"], ...RightStats["integerValues"]] }
          : never : never
        : never;

type InsertSorted<N extends number, Values extends readonly number[]> = Values extends readonly [infer Head extends number, ...infer Tail extends number[]]
  ? IsLessThan<N, Head> extends true ? [N, ...Values] : [Head, ...InsertSorted<N, Tail>] : [N];
type SortNumbers<Values extends readonly number[], Out extends number[] = []> = Values extends readonly [infer Head extends number, ...infer Tail extends number[]]
  ? SortNumbers<Tail, InsertSorted<Head, Out>> : Out;
type At<Values extends readonly unknown[], Index extends number> = Values extends readonly [infer Head, ...infer Tail]
  ? Index extends 0 ? Head : At<Tail, Decrement<Index>> : never;
type FirstExcess<Values extends readonly number[], Limit extends number> = SortNumbers<Values> extends infer Sorted extends readonly number[]
  ? At<Sorted, Limit> extends infer Offset extends number ? { readonly offset: Offset; readonly actual: Increment<Limit> } : never : never;
type StatCandidate<Dimension extends ResourceDimension, Values extends readonly number[], Limit extends number> = Values extends readonly [...infer Items extends number[]]
  ? IsGreaterThan<Items["length"], Limit> extends true
    ? FirstExcess<Items, Limit> extends infer Excess extends { readonly offset: number; readonly actual: number }
      ? { readonly dimension: Dimension; readonly offset: Excess["offset"]; readonly actual: Excess["actual"]; readonly limit: Limit } : never
    : never
  : never;

type SupportedSideCandidate<Ast> = Ast extends DiceNode<number, readonly unknown[], infer Sides, readonly unknown[], number, infer SideOffset>
  ? IsGreaterThan<Sides, L["supportedSideCount"]> extends true ? { readonly dimension: "supported-side-count"; readonly offset: SideOffset; readonly actual: Sides; readonly limit: L["supportedSideCount"] } : never
  : Ast extends GroupNode<infer Child, number> ? SupportedSideCandidate<Child>
    : Ast extends BinaryNode<"+" | "-", infer Left, infer Right, number> ? SupportedSideCandidate<Left> extends infer LeftResult ? [LeftResult] extends [never] ? SupportedSideCandidate<Right> : LeftResult : never : never;

type SignedOfAst<Ast> = Ast extends IntNode<number, infer Magnitude, number> ? SignedFromNat<Magnitude>
  : Ast extends GroupNode<infer Child, number> ? SignedOfAst<Child>
    : Ast extends BinaryNode<infer Op, infer Left, infer Right, number>
      ? SignedOfAst<Left> extends infer LeftValue ? SignedOfAst<Right> extends infer RightValue
        ? LeftValue extends Signed<boolean, readonly unknown[]> ? RightValue extends Signed<boolean, readonly unknown[]>
          ? Op extends "+" ? AddSigned<LeftValue, RightValue> : AddSigned<LeftValue, NegateSigned<RightValue>> : never : never : never : never
      : never;
type ArithmeticCandidate<Ast> = SignedOfAst<Ast> extends infer Value ? Value extends Signed<boolean, readonly unknown[]>
  ? IsGreaterThan<Value["magnitude"]["length"], L["arithmeticMagnitude"]> extends true
    ? { readonly dimension: "arithmetic-magnitude"; readonly offset: Ast extends { readonly offset: infer Offset extends number } ? Offset : never; readonly actual: Value["magnitude"]["length"]; readonly limit: L["arithmeticMagnitude"] } : never
  : never : never;
type LiteralArithmeticCandidate<Value extends Stats["integerValues"][number]> = IsGreaterThan<Value["value"], L["arithmeticMagnitude"]> extends true
  ? { readonly dimension: "arithmetic-magnitude"; readonly offset: Value["offset"]; readonly actual: Value["value"]; readonly limit: L["arithmeticMagnitude"] } : never;
type FirstArithmeticLiterals<Values extends readonly Stats["integerValues"][number][], Current = never> = Values extends readonly [infer Head extends Stats["integerValues"][number], ...infer Tail extends Stats["integerValues"][number][]]
  ? FirstArithmeticLiterals<Tail, ChooseCandidate<Current, LiteralArithmeticCandidate<Head>>> : Current;
type FirstArithmeticCandidate<Ast, Current = never> = Ast extends GroupNode<infer Child, number>
  ? ChooseCandidate<Current, ChooseCandidate<ArithmeticCandidate<Ast>, FirstArithmeticCandidate<Child>>> 
  : Ast extends BinaryNode<"+" | "-", infer Left, infer Right, number>
    ? ChooseCandidate<Current, ChooseCandidate<ArithmeticCandidate<Ast>, ChooseCandidate<FirstArithmeticCandidate<Left>, FirstArithmeticCandidate<Right>>>>
    : ChooseCandidate<Current, ArithmeticCandidate<Ast>>;

type DimensionPriority<D extends ResourceDimension> = D extends "ast-node-count" ? 0 : D extends "dice-term-count" ? 1 : D extends "die-sample-count" ? 2 : D extends "supported-side-count" ? 3 : D extends "arithmetic-magnitude" ? 4 : D extends "evaluation-steps" ? 5 : 6;
type ChooseCandidate<Current, Next> = [Current] extends [never] ? Next : [Next] extends [never] ? Current
  : Current extends { readonly dimension: infer CD extends ResourceDimension; readonly offset: infer CO extends number }
    ? Next extends { readonly dimension: infer ND extends ResourceDimension; readonly offset: infer NO extends number }
      ? IsLessThan<NO, CO> extends true ? Next : IsLessThan<CO, NO> extends true ? Current : IsLessThan<DimensionPriority<ND>, DimensionPriority<CD>> extends true ? Next : Current
      : Current : Current;
type StaticPreflightOriginal<Ast> = AstStats<Ast> extends infer S extends Stats
  ? ChooseCandidate<
      ChooseCandidate<
        ChooseCandidate<
          ChooseCandidate<
            ChooseCandidate<StatCandidate<"ast-node-count", S["nodeOffsets"], L["astNodeCount"]>, StatCandidate<"dice-term-count", S["diceOffsets"], L["diceTermCount"]>>,
            StatCandidate<"die-sample-count", S["sampleOffsets"], L["dieSampleCount"]>>,
          SupportedSideCandidate<Ast>>,
        ChooseCandidate<FirstArithmeticLiterals<S["integerValues"]>, FirstArithmeticCandidate<Ast>>>,
      StatCandidate<"evaluation-steps", S["stepOffsets"], L["evaluationSteps"]>> extends infer Candidate
    ? Candidate extends { readonly dimension: infer D extends ResourceDimension; readonly offset: infer O extends number; readonly limit: infer Limit extends number; readonly actual: infer Actual extends number } ? ResourceFailure<D, O, Limit, Actual> : true
    : never
  : never;
type StaticPreflight<Ast> = AstStats<Ast> extends infer S extends Stats
  ? ChooseCandidate<
      ChooseCandidate<
        ChooseCandidate<
          ChooseCandidate<
            ChooseCandidate<StatCandidate<"ast-node-count", S["nodeOffsets"], L["astNodeCount"]>, StatCandidate<"dice-term-count", S["diceOffsets"], L["diceTermCount"]>>,
            StatCandidate<"die-sample-count", S["sampleOffsets"], L["dieSampleCount"]>>,
          SupportedSideCandidate<Ast>>,
        ChooseCandidate<FirstArithmeticLiterals<S["integerValues"]>, FirstArithmeticCandidate<Ast>>>,
      StatCandidate<"evaluation-steps", S["stepOffsets"], L["evaluationSteps"]>> extends infer Candidate
    ? [Candidate] extends [never]
      ? true
      : Candidate extends { readonly dimension: infer D extends ResourceDimension; readonly offset: infer O extends number; readonly limit: infer Limit extends number; readonly actual: infer Actual extends number }
        ? ResourceFailure<D, O, Limit, Actual>
        : true
    : never
  : never;

/* -------------------------------------------------------------------------- */
/* State/fuel validation and arithmetic evaluation                             */
/* -------------------------------------------------------------------------- */

type HexDigit = "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "a" | "b" | "c" | "d" | "e" | "f";
type IsCanonicalWord<S extends string, Seen extends unknown[] = []> = Seen["length"] extends 8
  ? S extends "" ? true : false
  : S extends `${infer Head}${infer Tail}` ? Head extends HexDigit ? IsCanonicalWord<Tail, [...Seen, unknown]> : false : false;
type IsFourWords<W> = W extends readonly [unknown, unknown, unknown, unknown] ? true : false;
type IsStringWords<W> = W extends readonly [string, string, string, string] ? true : false;
type IsZeroWords<W> = W extends readonly ["00000000", "00000000", "00000000", "00000000"] ? true : false;
type ValidWordTuple<W> = W extends readonly [infer A extends string, infer B extends string, infer C extends string, infer D extends string]
  ? IsCanonicalWord<A> extends true ? IsCanonicalWord<B> extends true ? IsCanonicalWord<C> extends true ? IsCanonicalWord<D> : false : false : false : false;
type StateFailureWithContext<Code extends "invalid-state-shape" | "invalid-state-word" | "invalid-state-zero", Input> = Failure<Code, { readonly state: Input; readonly partialTrace: []; readonly successorState: null }>;
type ValidateState<Input> = Input extends { readonly kind: "GeneratorState"; readonly words: infer Words }
  ? IsFourWords<Words> extends true ? IsStringWords<Words> extends true ? ValidWordTuple<Words> extends true
    ? IsZeroWords<Words> extends true ? StateFailureWithContext<"invalid-state-zero", Input> : Success<Input>
    : StateFailureWithContext<"invalid-state-word", Input> : StateFailureWithContext<"invalid-state-word", Input>
  : StateFailureWithContext<"invalid-state-shape", Input> : StateFailureWithContext<"invalid-state-shape", Input>;
type ValidFuel<F extends number> = number extends F ? false : `${F}` extends `-${string}` ? false : `${F}` extends `${bigint}` ? true : false;
type FuelFailure<State, MaximumAttempts extends number> = Failure<"invalid-attempt-fuel", { readonly maximumAttempts: MaximumAttempts; readonly partialTrace: []; readonly successorState: State extends PrngGeneratorState ? State : never }>;
type FuelPlan<State, MaximumAttempts extends number> = ValidFuel<MaximumAttempts> extends true
  ? IsGreaterThan<MaximumAttempts, L["rejectionSamplingAttempts"]> extends true ? ResourceFailure<"rejection-sampling-attempts", 0, L["rejectionSamplingAttempts"], MaximumAttempts> : true
  : FuelFailure<State, MaximumAttempts>;
type EvaluationValue<Total extends number, State extends PrngGeneratorState> = Success<DiceEvaluation<Total, [], State>>;
type EvalArithmetic<Ast, State extends PrngGeneratorState> = Ast extends IntNode<infer Value, readonly unknown[], number> ? EvaluationValue<Value, State>
  : Ast extends GroupNode<infer Child, number> ? EvalArithmetic<Child, State>
    : Ast extends BinaryNode<infer _Op, infer Left, infer Right, number>
      ? EvalArithmetic<Left, State> extends infer LeftResult
        ? LeftResult extends Success<DiceEvaluation<number, [], State>>
          ? EvalArithmetic<Right, State> extends infer RightResult
            ? RightResult extends Success<DiceEvaluation<number, [], State>>
              ? SignedOfAst<Ast> extends infer TotalValue
                ? TotalValue extends Signed<boolean, readonly unknown[]> ? EvaluationValue<ToSignedNumber<TotalValue["negative"], TotalValue["magnitude"]>, State> : never
                : never
              : RightResult
            : never
          : LeftResult
        : never
      : never;
type EvaluateParsed<Source extends string, State, MaximumAttempts extends number> = ParseSource<Source> extends infer Parsed
  ? Parsed extends Success<infer Ast>
    ? DomainOnlyValidation<Ast> extends infer Domain
      ? Domain extends true
        ? StaticPreflight<Ast> extends infer Planned
          ? Planned extends true
            ? ValidateState<State> extends infer StateResult
              ? StateResult extends Success<infer ValidState extends PrngGeneratorState>
                ? FuelPlan<ValidState, MaximumAttempts> extends infer Fuel
                  ? Fuel extends true ? EvalArithmetic<Ast, ValidState> : Fuel
                  : never
                : StateResult
              : never
            : Planned
          : never
        : Domain
      : never
    : Parsed
  : never;

/** Arithmetic-only stage of the complete literal Evaluate contract. */
export type Evaluate<Source extends string, State, MaximumAttempts extends number> = EvaluateParsed<Source, State, MaximumAttempts>;

export type PackageMetadata = { readonly name: "@drdice/dice"; readonly version: "0.1.0"; readonly declarationOnly: true };
