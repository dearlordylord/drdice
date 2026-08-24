/**
 * @drdice/dice is a declaration-only Dice Expression evaluator.
 *
 * This declaration owns complete scanning/parsing, domain validation, static
 * preflight, and state-consuming Dice evaluation.  The evaluator composes
 * bounded sampling only through the public @drdice/prng Sample boundary.
 */
import type { GeneratorState as PrngGeneratorState, Sample } from "@drdice/prng";

export const DICE_SEMANTIC_PROFILE: "dice-v1/utf16-bounded-left-to-right-1";
export const DICE_SEMANTIC_VERSION: 1;

export type Success<Value> = { readonly ok: true; readonly value: Value };
export type FailureCode =
  | "invalid-state-shape" | "invalid-state-word" | "invalid-state-zero"
  | "invalid-attempt-fuel" | "expected-expression" | "expected-die-sides"
  | "expected-closing-parenthesis" | "leading-zero" | "unexpected-token"
  | "dice-count-zero" | "side-count-zero" | "resource-limit-exceeded"
  | "sampling-attempts-exhausted";
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
export type DynamicResourceLimitExceededDiagnostic = Omit<ResourceLimitExceededDiagnostic, "partialTrace" | "successorState"> & {
  readonly partialTrace: RollTrace; readonly successorState: PrngGeneratorState;
};
export type SamplingAttemptsExhaustedDiagnostic = {
  readonly kind: "evaluation"; readonly code: "sampling-attempts-exhausted"; readonly offset: number;
  readonly maximumAttempts: number; readonly attempts: number;
  readonly partialTrace: RollTrace; readonly successorState: PrngGeneratorState;
};
export type Diagnostic = SyntaxDiagnostic | DomainDiagnostic | ResourceLimitExceededDiagnostic
  | DynamicResourceLimitExceededDiagnostic | SamplingAttemptsExhaustedDiagnostic;
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
  | DiagnosticFailure<DynamicResourceLimitExceededDiagnostic> | DiagnosticFailure<SamplingAttemptsExhaustedDiagnostic>
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
 * scanner therefore recognizes every UTF-16 surrogate pair.  The explicit
 * high/low-unit sets are finite (1024 code units each), and `HighMatch` is
 * generic over every Unicode astral code point; BMP and lone-surrogate
 * literals use a constant-size one-unit path before that lookup. */
type AsciiUnit = "\u0000" | "\u0001" | "\u0002" | "\u0003" | "\u0004" | "\u0005" | "\u0006" | "\u0007" | "\b" | "\t" | "\n" | "\u000b" | "\f" | "\r" | "\u000e" | "\u000f" | "\u0010" | "\u0011" | "\u0012" | "\u0013" | "\u0014" | "\u0015" | "\u0016" | "\u0017" | "\u0018" | "\u0019" | "\u001a" | "\u001b" | "\u001c" | "\u001d" | "\u001e" | "\u001f" | " " | "!" | "\"" | "#" | "$" | "%" | "&" | "'" | "(" | ")" | "*" | "+" | "," | "-" | "." | "/" | "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | ":" | ";" | "<" | "=" | ">" | "?" | "@" | "A" | "B" | "C" | "D" | "E" | "F" | "G" | "H" | "I" | "J" | "K" | "L" | "M" | "N" | "O" | "P" | "Q" | "R" | "S" | "T" | "U" | "V" | "W" | "X" | "Y" | "Z" | "[" | "\\" | "]" | "^" | "_" | "`" | "a" | "b" | "c" | "d" | "e" | "f" | "g" | "h" | "i" | "j" | "k" | "l" | "m" | "n" | "o" | "p" | "q" | "r" | "s" | "t" | "u" | "v" | "w" | "x" | "y" | "z" | "{" | "|" | "}" | "~" | "";
type HighSurrogateBlocks = readonly [
  readonly ["\ud800", "\ud801", "\ud802", "\ud803", "\ud804", "\ud805", "\ud806", "\ud807", "\ud808", "\ud809", "\ud80a", "\ud80b", "\ud80c", "\ud80d", "\ud80e", "\ud80f", "\ud810", "\ud811", "\ud812", "\ud813", "\ud814", "\ud815", "\ud816", "\ud817", "\ud818", "\ud819", "\ud81a", "\ud81b", "\ud81c", "\ud81d", "\ud81e", "\ud81f"],
  readonly ["\ud820", "\ud821", "\ud822", "\ud823", "\ud824", "\ud825", "\ud826", "\ud827", "\ud828", "\ud829", "\ud82a", "\ud82b", "\ud82c", "\ud82d", "\ud82e", "\ud82f", "\ud830", "\ud831", "\ud832", "\ud833", "\ud834", "\ud835", "\ud836", "\ud837", "\ud838", "\ud839", "\ud83a", "\ud83b", "\ud83c", "\ud83d", "\ud83e", "\ud83f"],
  readonly ["\ud840", "\ud841", "\ud842", "\ud843", "\ud844", "\ud845", "\ud846", "\ud847", "\ud848", "\ud849", "\ud84a", "\ud84b", "\ud84c", "\ud84d", "\ud84e", "\ud84f", "\ud850", "\ud851", "\ud852", "\ud853", "\ud854", "\ud855", "\ud856", "\ud857", "\ud858", "\ud859", "\ud85a", "\ud85b", "\ud85c", "\ud85d", "\ud85e", "\ud85f"],
  readonly ["\ud860", "\ud861", "\ud862", "\ud863", "\ud864", "\ud865", "\ud866", "\ud867", "\ud868", "\ud869", "\ud86a", "\ud86b", "\ud86c", "\ud86d", "\ud86e", "\ud86f", "\ud870", "\ud871", "\ud872", "\ud873", "\ud874", "\ud875", "\ud876", "\ud877", "\ud878", "\ud879", "\ud87a", "\ud87b", "\ud87c", "\ud87d", "\ud87e", "\ud87f"],
  readonly ["\ud880", "\ud881", "\ud882", "\ud883", "\ud884", "\ud885", "\ud886", "\ud887", "\ud888", "\ud889", "\ud88a", "\ud88b", "\ud88c", "\ud88d", "\ud88e", "\ud88f", "\ud890", "\ud891", "\ud892", "\ud893", "\ud894", "\ud895", "\ud896", "\ud897", "\ud898", "\ud899", "\ud89a", "\ud89b", "\ud89c", "\ud89d", "\ud89e", "\ud89f"],
  readonly ["\ud8a0", "\ud8a1", "\ud8a2", "\ud8a3", "\ud8a4", "\ud8a5", "\ud8a6", "\ud8a7", "\ud8a8", "\ud8a9", "\ud8aa", "\ud8ab", "\ud8ac", "\ud8ad", "\ud8ae", "\ud8af", "\ud8b0", "\ud8b1", "\ud8b2", "\ud8b3", "\ud8b4", "\ud8b5", "\ud8b6", "\ud8b7", "\ud8b8", "\ud8b9", "\ud8ba", "\ud8bb", "\ud8bc", "\ud8bd", "\ud8be", "\ud8bf"],
  readonly ["\ud8c0", "\ud8c1", "\ud8c2", "\ud8c3", "\ud8c4", "\ud8c5", "\ud8c6", "\ud8c7", "\ud8c8", "\ud8c9", "\ud8ca", "\ud8cb", "\ud8cc", "\ud8cd", "\ud8ce", "\ud8cf", "\ud8d0", "\ud8d1", "\ud8d2", "\ud8d3", "\ud8d4", "\ud8d5", "\ud8d6", "\ud8d7", "\ud8d8", "\ud8d9", "\ud8da", "\ud8db", "\ud8dc", "\ud8dd", "\ud8de", "\ud8df"],
  readonly ["\ud8e0", "\ud8e1", "\ud8e2", "\ud8e3", "\ud8e4", "\ud8e5", "\ud8e6", "\ud8e7", "\ud8e8", "\ud8e9", "\ud8ea", "\ud8eb", "\ud8ec", "\ud8ed", "\ud8ee", "\ud8ef", "\ud8f0", "\ud8f1", "\ud8f2", "\ud8f3", "\ud8f4", "\ud8f5", "\ud8f6", "\ud8f7", "\ud8f8", "\ud8f9", "\ud8fa", "\ud8fb", "\ud8fc", "\ud8fd", "\ud8fe", "\ud8ff"],
  readonly ["\ud900", "\ud901", "\ud902", "\ud903", "\ud904", "\ud905", "\ud906", "\ud907", "\ud908", "\ud909", "\ud90a", "\ud90b", "\ud90c", "\ud90d", "\ud90e", "\ud90f", "\ud910", "\ud911", "\ud912", "\ud913", "\ud914", "\ud915", "\ud916", "\ud917", "\ud918", "\ud919", "\ud91a", "\ud91b", "\ud91c", "\ud91d", "\ud91e", "\ud91f"],
  readonly ["\ud920", "\ud921", "\ud922", "\ud923", "\ud924", "\ud925", "\ud926", "\ud927", "\ud928", "\ud929", "\ud92a", "\ud92b", "\ud92c", "\ud92d", "\ud92e", "\ud92f", "\ud930", "\ud931", "\ud932", "\ud933", "\ud934", "\ud935", "\ud936", "\ud937", "\ud938", "\ud939", "\ud93a", "\ud93b", "\ud93c", "\ud93d", "\ud93e", "\ud93f"],
  readonly ["\ud940", "\ud941", "\ud942", "\ud943", "\ud944", "\ud945", "\ud946", "\ud947", "\ud948", "\ud949", "\ud94a", "\ud94b", "\ud94c", "\ud94d", "\ud94e", "\ud94f", "\ud950", "\ud951", "\ud952", "\ud953", "\ud954", "\ud955", "\ud956", "\ud957", "\ud958", "\ud959", "\ud95a", "\ud95b", "\ud95c", "\ud95d", "\ud95e", "\ud95f"],
  readonly ["\ud960", "\ud961", "\ud962", "\ud963", "\ud964", "\ud965", "\ud966", "\ud967", "\ud968", "\ud969", "\ud96a", "\ud96b", "\ud96c", "\ud96d", "\ud96e", "\ud96f", "\ud970", "\ud971", "\ud972", "\ud973", "\ud974", "\ud975", "\ud976", "\ud977", "\ud978", "\ud979", "\ud97a", "\ud97b", "\ud97c", "\ud97d", "\ud97e", "\ud97f"],
  readonly ["\ud980", "\ud981", "\ud982", "\ud983", "\ud984", "\ud985", "\ud986", "\ud987", "\ud988", "\ud989", "\ud98a", "\ud98b", "\ud98c", "\ud98d", "\ud98e", "\ud98f", "\ud990", "\ud991", "\ud992", "\ud993", "\ud994", "\ud995", "\ud996", "\ud997", "\ud998", "\ud999", "\ud99a", "\ud99b", "\ud99c", "\ud99d", "\ud99e", "\ud99f"],
  readonly ["\ud9a0", "\ud9a1", "\ud9a2", "\ud9a3", "\ud9a4", "\ud9a5", "\ud9a6", "\ud9a7", "\ud9a8", "\ud9a9", "\ud9aa", "\ud9ab", "\ud9ac", "\ud9ad", "\ud9ae", "\ud9af", "\ud9b0", "\ud9b1", "\ud9b2", "\ud9b3", "\ud9b4", "\ud9b5", "\ud9b6", "\ud9b7", "\ud9b8", "\ud9b9", "\ud9ba", "\ud9bb", "\ud9bc", "\ud9bd", "\ud9be", "\ud9bf"],
  readonly ["\ud9c0", "\ud9c1", "\ud9c2", "\ud9c3", "\ud9c4", "\ud9c5", "\ud9c6", "\ud9c7", "\ud9c8", "\ud9c9", "\ud9ca", "\ud9cb", "\ud9cc", "\ud9cd", "\ud9ce", "\ud9cf", "\ud9d0", "\ud9d1", "\ud9d2", "\ud9d3", "\ud9d4", "\ud9d5", "\ud9d6", "\ud9d7", "\ud9d8", "\ud9d9", "\ud9da", "\ud9db", "\ud9dc", "\ud9dd", "\ud9de", "\ud9df"],
  readonly ["\ud9e0", "\ud9e1", "\ud9e2", "\ud9e3", "\ud9e4", "\ud9e5", "\ud9e6", "\ud9e7", "\ud9e8", "\ud9e9", "\ud9ea", "\ud9eb", "\ud9ec", "\ud9ed", "\ud9ee", "\ud9ef", "\ud9f0", "\ud9f1", "\ud9f2", "\ud9f3", "\ud9f4", "\ud9f5", "\ud9f6", "\ud9f7", "\ud9f8", "\ud9f9", "\ud9fa", "\ud9fb", "\ud9fc", "\ud9fd", "\ud9fe", "\ud9ff"],
  readonly ["\uda00", "\uda01", "\uda02", "\uda03", "\uda04", "\uda05", "\uda06", "\uda07", "\uda08", "\uda09", "\uda0a", "\uda0b", "\uda0c", "\uda0d", "\uda0e", "\uda0f", "\uda10", "\uda11", "\uda12", "\uda13", "\uda14", "\uda15", "\uda16", "\uda17", "\uda18", "\uda19", "\uda1a", "\uda1b", "\uda1c", "\uda1d", "\uda1e", "\uda1f"],
  readonly ["\uda20", "\uda21", "\uda22", "\uda23", "\uda24", "\uda25", "\uda26", "\uda27", "\uda28", "\uda29", "\uda2a", "\uda2b", "\uda2c", "\uda2d", "\uda2e", "\uda2f", "\uda30", "\uda31", "\uda32", "\uda33", "\uda34", "\uda35", "\uda36", "\uda37", "\uda38", "\uda39", "\uda3a", "\uda3b", "\uda3c", "\uda3d", "\uda3e", "\uda3f"],
  readonly ["\uda40", "\uda41", "\uda42", "\uda43", "\uda44", "\uda45", "\uda46", "\uda47", "\uda48", "\uda49", "\uda4a", "\uda4b", "\uda4c", "\uda4d", "\uda4e", "\uda4f", "\uda50", "\uda51", "\uda52", "\uda53", "\uda54", "\uda55", "\uda56", "\uda57", "\uda58", "\uda59", "\uda5a", "\uda5b", "\uda5c", "\uda5d", "\uda5e", "\uda5f"],
  readonly ["\uda60", "\uda61", "\uda62", "\uda63", "\uda64", "\uda65", "\uda66", "\uda67", "\uda68", "\uda69", "\uda6a", "\uda6b", "\uda6c", "\uda6d", "\uda6e", "\uda6f", "\uda70", "\uda71", "\uda72", "\uda73", "\uda74", "\uda75", "\uda76", "\uda77", "\uda78", "\uda79", "\uda7a", "\uda7b", "\uda7c", "\uda7d", "\uda7e", "\uda7f"],
  readonly ["\uda80", "\uda81", "\uda82", "\uda83", "\uda84", "\uda85", "\uda86", "\uda87", "\uda88", "\uda89", "\uda8a", "\uda8b", "\uda8c", "\uda8d", "\uda8e", "\uda8f", "\uda90", "\uda91", "\uda92", "\uda93", "\uda94", "\uda95", "\uda96", "\uda97", "\uda98", "\uda99", "\uda9a", "\uda9b", "\uda9c", "\uda9d", "\uda9e", "\uda9f"],
  readonly ["\udaa0", "\udaa1", "\udaa2", "\udaa3", "\udaa4", "\udaa5", "\udaa6", "\udaa7", "\udaa8", "\udaa9", "\udaaa", "\udaab", "\udaac", "\udaad", "\udaae", "\udaaf", "\udab0", "\udab1", "\udab2", "\udab3", "\udab4", "\udab5", "\udab6", "\udab7", "\udab8", "\udab9", "\udaba", "\udabb", "\udabc", "\udabd", "\udabe", "\udabf"],
  readonly ["\udac0", "\udac1", "\udac2", "\udac3", "\udac4", "\udac5", "\udac6", "\udac7", "\udac8", "\udac9", "\udaca", "\udacb", "\udacc", "\udacd", "\udace", "\udacf", "\udad0", "\udad1", "\udad2", "\udad3", "\udad4", "\udad5", "\udad6", "\udad7", "\udad8", "\udad9", "\udada", "\udadb", "\udadc", "\udadd", "\udade", "\udadf"],
  readonly ["\udae0", "\udae1", "\udae2", "\udae3", "\udae4", "\udae5", "\udae6", "\udae7", "\udae8", "\udae9", "\udaea", "\udaeb", "\udaec", "\udaed", "\udaee", "\udaef", "\udaf0", "\udaf1", "\udaf2", "\udaf3", "\udaf4", "\udaf5", "\udaf6", "\udaf7", "\udaf8", "\udaf9", "\udafa", "\udafb", "\udafc", "\udafd", "\udafe", "\udaff"],
  readonly ["\udb00", "\udb01", "\udb02", "\udb03", "\udb04", "\udb05", "\udb06", "\udb07", "\udb08", "\udb09", "\udb0a", "\udb0b", "\udb0c", "\udb0d", "\udb0e", "\udb0f", "\udb10", "\udb11", "\udb12", "\udb13", "\udb14", "\udb15", "\udb16", "\udb17", "\udb18", "\udb19", "\udb1a", "\udb1b", "\udb1c", "\udb1d", "\udb1e", "\udb1f"],
  readonly ["\udb20", "\udb21", "\udb22", "\udb23", "\udb24", "\udb25", "\udb26", "\udb27", "\udb28", "\udb29", "\udb2a", "\udb2b", "\udb2c", "\udb2d", "\udb2e", "\udb2f", "\udb30", "\udb31", "\udb32", "\udb33", "\udb34", "\udb35", "\udb36", "\udb37", "\udb38", "\udb39", "\udb3a", "\udb3b", "\udb3c", "\udb3d", "\udb3e", "\udb3f"],
  readonly ["\udb40", "\udb41", "\udb42", "\udb43", "\udb44", "\udb45", "\udb46", "\udb47", "\udb48", "\udb49", "\udb4a", "\udb4b", "\udb4c", "\udb4d", "\udb4e", "\udb4f", "\udb50", "\udb51", "\udb52", "\udb53", "\udb54", "\udb55", "\udb56", "\udb57", "\udb58", "\udb59", "\udb5a", "\udb5b", "\udb5c", "\udb5d", "\udb5e", "\udb5f"],
  readonly ["\udb60", "\udb61", "\udb62", "\udb63", "\udb64", "\udb65", "\udb66", "\udb67", "\udb68", "\udb69", "\udb6a", "\udb6b", "\udb6c", "\udb6d", "\udb6e", "\udb6f", "\udb70", "\udb71", "\udb72", "\udb73", "\udb74", "\udb75", "\udb76", "\udb77", "\udb78", "\udb79", "\udb7a", "\udb7b", "\udb7c", "\udb7d", "\udb7e", "\udb7f"],
  readonly ["\udb80", "\udb81", "\udb82", "\udb83", "\udb84", "\udb85", "\udb86", "\udb87", "\udb88", "\udb89", "\udb8a", "\udb8b", "\udb8c", "\udb8d", "\udb8e", "\udb8f", "\udb90", "\udb91", "\udb92", "\udb93", "\udb94", "\udb95", "\udb96", "\udb97", "\udb98", "\udb99", "\udb9a", "\udb9b", "\udb9c", "\udb9d", "\udb9e", "\udb9f"],
  readonly ["\udba0", "\udba1", "\udba2", "\udba3", "\udba4", "\udba5", "\udba6", "\udba7", "\udba8", "\udba9", "\udbaa", "\udbab", "\udbac", "\udbad", "\udbae", "\udbaf", "\udbb0", "\udbb1", "\udbb2", "\udbb3", "\udbb4", "\udbb5", "\udbb6", "\udbb7", "\udbb8", "\udbb9", "\udbba", "\udbbb", "\udbbc", "\udbbd", "\udbbe", "\udbbf"],
  readonly ["\udbc0", "\udbc1", "\udbc2", "\udbc3", "\udbc4", "\udbc5", "\udbc6", "\udbc7", "\udbc8", "\udbc9", "\udbca", "\udbcb", "\udbcc", "\udbcd", "\udbce", "\udbcf", "\udbd0", "\udbd1", "\udbd2", "\udbd3", "\udbd4", "\udbd5", "\udbd6", "\udbd7", "\udbd8", "\udbd9", "\udbda", "\udbdb", "\udbdc", "\udbdd", "\udbde", "\udbdf"],
  readonly ["\udbe0", "\udbe1", "\udbe2", "\udbe3", "\udbe4", "\udbe5", "\udbe6", "\udbe7", "\udbe8", "\udbe9", "\udbea", "\udbeb", "\udbec", "\udbed", "\udbee", "\udbef", "\udbf0", "\udbf1", "\udbf2", "\udbf3", "\udbf4", "\udbf5", "\udbf6", "\udbf7", "\udbf8", "\udbf9", "\udbfa", "\udbfb", "\udbfc", "\udbfd", "\udbfe", "\udbff"]
];
type LowSurrogateBlocks = readonly [
  readonly ["\udc00", "\udc01", "\udc02", "\udc03", "\udc04", "\udc05", "\udc06", "\udc07", "\udc08", "\udc09", "\udc0a", "\udc0b", "\udc0c", "\udc0d", "\udc0e", "\udc0f", "\udc10", "\udc11", "\udc12", "\udc13", "\udc14", "\udc15", "\udc16", "\udc17", "\udc18", "\udc19", "\udc1a", "\udc1b", "\udc1c", "\udc1d", "\udc1e", "\udc1f"],
  readonly ["\udc20", "\udc21", "\udc22", "\udc23", "\udc24", "\udc25", "\udc26", "\udc27", "\udc28", "\udc29", "\udc2a", "\udc2b", "\udc2c", "\udc2d", "\udc2e", "\udc2f", "\udc30", "\udc31", "\udc32", "\udc33", "\udc34", "\udc35", "\udc36", "\udc37", "\udc38", "\udc39", "\udc3a", "\udc3b", "\udc3c", "\udc3d", "\udc3e", "\udc3f"],
  readonly ["\udc40", "\udc41", "\udc42", "\udc43", "\udc44", "\udc45", "\udc46", "\udc47", "\udc48", "\udc49", "\udc4a", "\udc4b", "\udc4c", "\udc4d", "\udc4e", "\udc4f", "\udc50", "\udc51", "\udc52", "\udc53", "\udc54", "\udc55", "\udc56", "\udc57", "\udc58", "\udc59", "\udc5a", "\udc5b", "\udc5c", "\udc5d", "\udc5e", "\udc5f"],
  readonly ["\udc60", "\udc61", "\udc62", "\udc63", "\udc64", "\udc65", "\udc66", "\udc67", "\udc68", "\udc69", "\udc6a", "\udc6b", "\udc6c", "\udc6d", "\udc6e", "\udc6f", "\udc70", "\udc71", "\udc72", "\udc73", "\udc74", "\udc75", "\udc76", "\udc77", "\udc78", "\udc79", "\udc7a", "\udc7b", "\udc7c", "\udc7d", "\udc7e", "\udc7f"],
  readonly ["\udc80", "\udc81", "\udc82", "\udc83", "\udc84", "\udc85", "\udc86", "\udc87", "\udc88", "\udc89", "\udc8a", "\udc8b", "\udc8c", "\udc8d", "\udc8e", "\udc8f", "\udc90", "\udc91", "\udc92", "\udc93", "\udc94", "\udc95", "\udc96", "\udc97", "\udc98", "\udc99", "\udc9a", "\udc9b", "\udc9c", "\udc9d", "\udc9e", "\udc9f"],
  readonly ["\udca0", "\udca1", "\udca2", "\udca3", "\udca4", "\udca5", "\udca6", "\udca7", "\udca8", "\udca9", "\udcaa", "\udcab", "\udcac", "\udcad", "\udcae", "\udcaf", "\udcb0", "\udcb1", "\udcb2", "\udcb3", "\udcb4", "\udcb5", "\udcb6", "\udcb7", "\udcb8", "\udcb9", "\udcba", "\udcbb", "\udcbc", "\udcbd", "\udcbe", "\udcbf"],
  readonly ["\udcc0", "\udcc1", "\udcc2", "\udcc3", "\udcc4", "\udcc5", "\udcc6", "\udcc7", "\udcc8", "\udcc9", "\udcca", "\udccb", "\udccc", "\udccd", "\udcce", "\udccf", "\udcd0", "\udcd1", "\udcd2", "\udcd3", "\udcd4", "\udcd5", "\udcd6", "\udcd7", "\udcd8", "\udcd9", "\udcda", "\udcdb", "\udcdc", "\udcdd", "\udcde", "\udcdf"],
  readonly ["\udce0", "\udce1", "\udce2", "\udce3", "\udce4", "\udce5", "\udce6", "\udce7", "\udce8", "\udce9", "\udcea", "\udceb", "\udcec", "\udced", "\udcee", "\udcef", "\udcf0", "\udcf1", "\udcf2", "\udcf3", "\udcf4", "\udcf5", "\udcf6", "\udcf7", "\udcf8", "\udcf9", "\udcfa", "\udcfb", "\udcfc", "\udcfd", "\udcfe", "\udcff"],
  readonly ["\udd00", "\udd01", "\udd02", "\udd03", "\udd04", "\udd05", "\udd06", "\udd07", "\udd08", "\udd09", "\udd0a", "\udd0b", "\udd0c", "\udd0d", "\udd0e", "\udd0f", "\udd10", "\udd11", "\udd12", "\udd13", "\udd14", "\udd15", "\udd16", "\udd17", "\udd18", "\udd19", "\udd1a", "\udd1b", "\udd1c", "\udd1d", "\udd1e", "\udd1f"],
  readonly ["\udd20", "\udd21", "\udd22", "\udd23", "\udd24", "\udd25", "\udd26", "\udd27", "\udd28", "\udd29", "\udd2a", "\udd2b", "\udd2c", "\udd2d", "\udd2e", "\udd2f", "\udd30", "\udd31", "\udd32", "\udd33", "\udd34", "\udd35", "\udd36", "\udd37", "\udd38", "\udd39", "\udd3a", "\udd3b", "\udd3c", "\udd3d", "\udd3e", "\udd3f"],
  readonly ["\udd40", "\udd41", "\udd42", "\udd43", "\udd44", "\udd45", "\udd46", "\udd47", "\udd48", "\udd49", "\udd4a", "\udd4b", "\udd4c", "\udd4d", "\udd4e", "\udd4f", "\udd50", "\udd51", "\udd52", "\udd53", "\udd54", "\udd55", "\udd56", "\udd57", "\udd58", "\udd59", "\udd5a", "\udd5b", "\udd5c", "\udd5d", "\udd5e", "\udd5f"],
  readonly ["\udd60", "\udd61", "\udd62", "\udd63", "\udd64", "\udd65", "\udd66", "\udd67", "\udd68", "\udd69", "\udd6a", "\udd6b", "\udd6c", "\udd6d", "\udd6e", "\udd6f", "\udd70", "\udd71", "\udd72", "\udd73", "\udd74", "\udd75", "\udd76", "\udd77", "\udd78", "\udd79", "\udd7a", "\udd7b", "\udd7c", "\udd7d", "\udd7e", "\udd7f"],
  readonly ["\udd80", "\udd81", "\udd82", "\udd83", "\udd84", "\udd85", "\udd86", "\udd87", "\udd88", "\udd89", "\udd8a", "\udd8b", "\udd8c", "\udd8d", "\udd8e", "\udd8f", "\udd90", "\udd91", "\udd92", "\udd93", "\udd94", "\udd95", "\udd96", "\udd97", "\udd98", "\udd99", "\udd9a", "\udd9b", "\udd9c", "\udd9d", "\udd9e", "\udd9f"],
  readonly ["\udda0", "\udda1", "\udda2", "\udda3", "\udda4", "\udda5", "\udda6", "\udda7", "\udda8", "\udda9", "\uddaa", "\uddab", "\uddac", "\uddad", "\uddae", "\uddaf", "\uddb0", "\uddb1", "\uddb2", "\uddb3", "\uddb4", "\uddb5", "\uddb6", "\uddb7", "\uddb8", "\uddb9", "\uddba", "\uddbb", "\uddbc", "\uddbd", "\uddbe", "\uddbf"],
  readonly ["\uddc0", "\uddc1", "\uddc2", "\uddc3", "\uddc4", "\uddc5", "\uddc6", "\uddc7", "\uddc8", "\uddc9", "\uddca", "\uddcb", "\uddcc", "\uddcd", "\uddce", "\uddcf", "\uddd0", "\uddd1", "\uddd2", "\uddd3", "\uddd4", "\uddd5", "\uddd6", "\uddd7", "\uddd8", "\uddd9", "\uddda", "\udddb", "\udddc", "\udddd", "\uddde", "\udddf"],
  readonly ["\udde0", "\udde1", "\udde2", "\udde3", "\udde4", "\udde5", "\udde6", "\udde7", "\udde8", "\udde9", "\uddea", "\uddeb", "\uddec", "\udded", "\uddee", "\uddef", "\uddf0", "\uddf1", "\uddf2", "\uddf3", "\uddf4", "\uddf5", "\uddf6", "\uddf7", "\uddf8", "\uddf9", "\uddfa", "\uddfb", "\uddfc", "\uddfd", "\uddfe", "\uddff"],
  readonly ["\ude00", "\ude01", "\ude02", "\ude03", "\ude04", "\ude05", "\ude06", "\ude07", "\ude08", "\ude09", "\ude0a", "\ude0b", "\ude0c", "\ude0d", "\ude0e", "\ude0f", "\ude10", "\ude11", "\ude12", "\ude13", "\ude14", "\ude15", "\ude16", "\ude17", "\ude18", "\ude19", "\ude1a", "\ude1b", "\ude1c", "\ude1d", "\ude1e", "\ude1f"],
  readonly ["\ude20", "\ude21", "\ude22", "\ude23", "\ude24", "\ude25", "\ude26", "\ude27", "\ude28", "\ude29", "\ude2a", "\ude2b", "\ude2c", "\ude2d", "\ude2e", "\ude2f", "\ude30", "\ude31", "\ude32", "\ude33", "\ude34", "\ude35", "\ude36", "\ude37", "\ude38", "\ude39", "\ude3a", "\ude3b", "\ude3c", "\ude3d", "\ude3e", "\ude3f"],
  readonly ["\ude40", "\ude41", "\ude42", "\ude43", "\ude44", "\ude45", "\ude46", "\ude47", "\ude48", "\ude49", "\ude4a", "\ude4b", "\ude4c", "\ude4d", "\ude4e", "\ude4f", "\ude50", "\ude51", "\ude52", "\ude53", "\ude54", "\ude55", "\ude56", "\ude57", "\ude58", "\ude59", "\ude5a", "\ude5b", "\ude5c", "\ude5d", "\ude5e", "\ude5f"],
  readonly ["\ude60", "\ude61", "\ude62", "\ude63", "\ude64", "\ude65", "\ude66", "\ude67", "\ude68", "\ude69", "\ude6a", "\ude6b", "\ude6c", "\ude6d", "\ude6e", "\ude6f", "\ude70", "\ude71", "\ude72", "\ude73", "\ude74", "\ude75", "\ude76", "\ude77", "\ude78", "\ude79", "\ude7a", "\ude7b", "\ude7c", "\ude7d", "\ude7e", "\ude7f"],
  readonly ["\ude80", "\ude81", "\ude82", "\ude83", "\ude84", "\ude85", "\ude86", "\ude87", "\ude88", "\ude89", "\ude8a", "\ude8b", "\ude8c", "\ude8d", "\ude8e", "\ude8f", "\ude90", "\ude91", "\ude92", "\ude93", "\ude94", "\ude95", "\ude96", "\ude97", "\ude98", "\ude99", "\ude9a", "\ude9b", "\ude9c", "\ude9d", "\ude9e", "\ude9f"],
  readonly ["\udea0", "\udea1", "\udea2", "\udea3", "\udea4", "\udea5", "\udea6", "\udea7", "\udea8", "\udea9", "\udeaa", "\udeab", "\udeac", "\udead", "\udeae", "\udeaf", "\udeb0", "\udeb1", "\udeb2", "\udeb3", "\udeb4", "\udeb5", "\udeb6", "\udeb7", "\udeb8", "\udeb9", "\udeba", "\udebb", "\udebc", "\udebd", "\udebe", "\udebf"],
  readonly ["\udec0", "\udec1", "\udec2", "\udec3", "\udec4", "\udec5", "\udec6", "\udec7", "\udec8", "\udec9", "\udeca", "\udecb", "\udecc", "\udecd", "\udece", "\udecf", "\uded0", "\uded1", "\uded2", "\uded3", "\uded4", "\uded5", "\uded6", "\uded7", "\uded8", "\uded9", "\udeda", "\udedb", "\udedc", "\udedd", "\udede", "\udedf"],
  readonly ["\udee0", "\udee1", "\udee2", "\udee3", "\udee4", "\udee5", "\udee6", "\udee7", "\udee8", "\udee9", "\udeea", "\udeeb", "\udeec", "\udeed", "\udeee", "\udeef", "\udef0", "\udef1", "\udef2", "\udef3", "\udef4", "\udef5", "\udef6", "\udef7", "\udef8", "\udef9", "\udefa", "\udefb", "\udefc", "\udefd", "\udefe", "\udeff"],
  readonly ["\udf00", "\udf01", "\udf02", "\udf03", "\udf04", "\udf05", "\udf06", "\udf07", "\udf08", "\udf09", "\udf0a", "\udf0b", "\udf0c", "\udf0d", "\udf0e", "\udf0f", "\udf10", "\udf11", "\udf12", "\udf13", "\udf14", "\udf15", "\udf16", "\udf17", "\udf18", "\udf19", "\udf1a", "\udf1b", "\udf1c", "\udf1d", "\udf1e", "\udf1f"],
  readonly ["\udf20", "\udf21", "\udf22", "\udf23", "\udf24", "\udf25", "\udf26", "\udf27", "\udf28", "\udf29", "\udf2a", "\udf2b", "\udf2c", "\udf2d", "\udf2e", "\udf2f", "\udf30", "\udf31", "\udf32", "\udf33", "\udf34", "\udf35", "\udf36", "\udf37", "\udf38", "\udf39", "\udf3a", "\udf3b", "\udf3c", "\udf3d", "\udf3e", "\udf3f"],
  readonly ["\udf40", "\udf41", "\udf42", "\udf43", "\udf44", "\udf45", "\udf46", "\udf47", "\udf48", "\udf49", "\udf4a", "\udf4b", "\udf4c", "\udf4d", "\udf4e", "\udf4f", "\udf50", "\udf51", "\udf52", "\udf53", "\udf54", "\udf55", "\udf56", "\udf57", "\udf58", "\udf59", "\udf5a", "\udf5b", "\udf5c", "\udf5d", "\udf5e", "\udf5f"],
  readonly ["\udf60", "\udf61", "\udf62", "\udf63", "\udf64", "\udf65", "\udf66", "\udf67", "\udf68", "\udf69", "\udf6a", "\udf6b", "\udf6c", "\udf6d", "\udf6e", "\udf6f", "\udf70", "\udf71", "\udf72", "\udf73", "\udf74", "\udf75", "\udf76", "\udf77", "\udf78", "\udf79", "\udf7a", "\udf7b", "\udf7c", "\udf7d", "\udf7e", "\udf7f"],
  readonly ["\udf80", "\udf81", "\udf82", "\udf83", "\udf84", "\udf85", "\udf86", "\udf87", "\udf88", "\udf89", "\udf8a", "\udf8b", "\udf8c", "\udf8d", "\udf8e", "\udf8f", "\udf90", "\udf91", "\udf92", "\udf93", "\udf94", "\udf95", "\udf96", "\udf97", "\udf98", "\udf99", "\udf9a", "\udf9b", "\udf9c", "\udf9d", "\udf9e", "\udf9f"],
  readonly ["\udfa0", "\udfa1", "\udfa2", "\udfa3", "\udfa4", "\udfa5", "\udfa6", "\udfa7", "\udfa8", "\udfa9", "\udfaa", "\udfab", "\udfac", "\udfad", "\udfae", "\udfaf", "\udfb0", "\udfb1", "\udfb2", "\udfb3", "\udfb4", "\udfb5", "\udfb6", "\udfb7", "\udfb8", "\udfb9", "\udfba", "\udfbb", "\udfbc", "\udfbd", "\udfbe", "\udfbf"],
  readonly ["\udfc0", "\udfc1", "\udfc2", "\udfc3", "\udfc4", "\udfc5", "\udfc6", "\udfc7", "\udfc8", "\udfc9", "\udfca", "\udfcb", "\udfcc", "\udfcd", "\udfce", "\udfcf", "\udfd0", "\udfd1", "\udfd2", "\udfd3", "\udfd4", "\udfd5", "\udfd6", "\udfd7", "\udfd8", "\udfd9", "\udfda", "\udfdb", "\udfdc", "\udfdd", "\udfde", "\udfdf"],
  readonly ["\udfe0", "\udfe1", "\udfe2", "\udfe3", "\udfe4", "\udfe5", "\udfe6", "\udfe7", "\udfe8", "\udfe9", "\udfea", "\udfeb", "\udfec", "\udfed", "\udfee", "\udfef", "\udff0", "\udff1", "\udff2", "\udff3", "\udff4", "\udff5", "\udff6", "\udff7", "\udff8", "\udff9", "\udffa", "\udffb", "\udffc", "\udffd", "\udffe", "\udfff"]
];
type LowSurrogate = LowSurrogateBlocks[number][number];
type AstralPairBlockMatch<C extends string, HighBlock extends readonly string[], LowBlock extends readonly string[]> = C extends `${infer _High extends HighBlock[number]}${infer _Low extends LowBlock[number]}` ? true : false;
type AstralLowBlockMatch<C extends string, HighBlock extends readonly string[], Blocks extends readonly (readonly string[])[] = LowSurrogateBlocks> = Blocks extends readonly [infer Block extends readonly string[], ...infer Tail extends (readonly string[])[]]
  ? AstralPairBlockMatch<C, HighBlock, Block> extends true ? true : AstralLowBlockMatch<C, HighBlock, Tail>
  : false;
type AstralBlockIndex<C extends string, Blocks extends readonly (readonly string[])[] = HighSurrogateBlocks, Seen extends unknown[] = []> = Blocks extends readonly [infer Block extends readonly string[], ...infer Tail extends (readonly string[])[]]
  ? AstralLowBlockMatch<C, Block> extends true ? Seen["length"] : AstralBlockIndex<C, Tail, [...Seen, unknown]>
  : never;
type LowMatch<C extends string, H extends string, Blocks extends readonly (readonly string[])[] = LowSurrogateBlocks> = Blocks extends readonly [infer Block extends readonly string[], ...infer Tail extends (readonly string[])[]]
  ? C extends `${H}${Block[number]}` ? H : LowMatch<C, H, Tail>
  : never;
type HighMatchInBlock<C extends string, Block extends readonly string[], LowBlocks extends readonly (readonly string[])[] = LowSurrogateBlocks> = Block extends readonly [infer Head extends string, ...infer Tail extends string[]]
  ? LowMatch<C, Head, LowBlocks> extends infer Found extends string
    ? [Found] extends [never] ? HighMatchInBlock<C, Tail, LowBlocks> : Found
    : never
  : never;
type HighMatch<C extends string> = [AstralBlockIndex<C>] extends [never] ? never
  : AstralBlockIndex<C> extends infer BlockIndex extends number
    ? HighMatchInBlock<C, HighSurrogateBlocks[BlockIndex]> : never;
/* ASCII and BMP literals are one UTF-16 unit.  Astral literals are classified
 * by the complete sharded surrogate-pair lookup; a valid pair also recovers
 * its exact high unit for diagnostics. */
type Utf16Units<C extends string> = string extends C ? [unknown] : C extends AsciiUnit ? [unknown]
  : [HighMatch<C>] extends [never] ? [unknown] : [unknown, unknown];
type Utf16FirstUnit<C extends string> = string extends C ? C : C extends AsciiUnit ? C
  : [HighMatch<C>] extends [never] ? C : HighMatch<C>;
type StringLength<S extends string, Out extends unknown[] = []> =
  S extends `${infer Head}${infer Tail}` ? StringLength<Tail, [...Out, ...Utf16Units<Head>]> : Out["length"];
/* Keep numeric literals exact for diagnostics, but cap tuple magnitudes at
 * the arithmetic limit plus one.  This makes `999` a constant-size static
 * rejection instead of materializing a 999-element tuple. */
type CappedMagnitude<N extends number, Out extends unknown[] = []> =
  Out["length"] extends 101 ? Out : Out["length"] extends N ? Out : CappedMagnitude<N, [...Out, unknown]>;
type ParsedNumber<Raw extends string> = Raw extends `${infer Value extends number}`
  ? Success<{ readonly value: Value; readonly magnitude: CappedMagnitude<Value> }>
  : never;
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
    : ParsedNumber<Raw>;

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

type SupportedSideCandidate<Ast> = Ast extends DiceNode<number, readonly unknown[], infer Sides, infer SideMagnitude extends readonly unknown[], number, infer SideOffset>
  ? IsGreaterThan<SideMagnitude["length"], L["supportedSideCount"]> extends true ? { readonly dimension: "supported-side-count"; readonly offset: SideOffset; readonly actual: Sides; readonly limit: L["supportedSideCount"] } : never
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
type LiteralArithmeticCandidate<Value extends Stats["integerValues"][number]> = IsGreaterThan<Value["magnitude"]["length"], L["arithmeticMagnitude"]> extends true
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
/* State/fuel validation and complete state-consuming evaluation               */
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
type EvaluationValue<
  Total extends number,
  Trace extends RollTrace,
  State extends PrngGeneratorState,
  Steps extends number,
> = {
  readonly total: Total;
  readonly rollTrace: Trace;
  readonly successorState: State;
  readonly steps: Steps;
};

type AddNatural<A extends number, B extends number> = [...TupleOf<A>, ...TupleOf<B>]["length"] & number;
type NumberToSigned<N extends number> = `${N}` extends `-${infer Magnitude extends number}`
  ? Signed<true, TupleOf<Magnitude>>
  : Signed<false, TupleOf<N>>;
type ApplyEvaluationOp<Op extends "+" | "-", A extends number, B extends number> =
  NumberToSigned<A> extends infer Left extends Signed<boolean, readonly unknown[]>
    ? NumberToSigned<B> extends infer Right extends Signed<boolean, readonly unknown[]>
      ? Op extends "+"
        ? AddSigned<Left, Right> extends infer Total extends Signed<boolean, readonly unknown[]>
          ? ToSignedNumber<Total["negative"], Total["magnitude"]>
          : never
        : AddSigned<Left, NegateSigned<Right>> extends infer Total extends Signed<boolean, readonly unknown[]>
          ? ToSignedNumber<Total["negative"], Total["magnitude"]>
          : never
      : never
    : never;
type MagnitudeOfNumber<N extends number> = `${N}` extends `-${infer Magnitude extends number}` ? Magnitude : N;
type ExceedsArithmeticLimit<N extends number> = IsGreaterThan<MagnitudeOfNumber<N>, L["arithmeticMagnitude"]>;

type DynamicResourceFailure<
  Dimension extends ResourceDimension,
  Offset extends number,
  Actual extends number,
  Trace extends RollTrace,
  State extends PrngGeneratorState,
> = Failure<"resource-limit-exceeded", {
  readonly kind: "resource";
  readonly code: "resource-limit-exceeded";
  readonly offset: Offset;
  readonly dimension: Dimension;
  readonly limit: Dimension extends "evaluation-steps" ? L["evaluationSteps"] : L["arithmeticMagnitude"];
  readonly actual: Actual;
  readonly partialTrace: Trace;
  readonly successorState: State;
}>;
type EvaluationStepFailure<
  Offset extends number,
  Actual extends number,
  Trace extends RollTrace,
  State extends PrngGeneratorState,
> = DynamicResourceFailure<"evaluation-steps", Offset, Actual, Trace, State>;
type SamplingExhaustionFailure<
  Offset extends number,
  MaximumAttempts extends number,
  Attempts extends number,
  Trace extends RollTrace,
  State extends PrngGeneratorState,
> = Failure<"sampling-attempts-exhausted", {
  readonly kind: "evaluation";
  readonly code: "sampling-attempts-exhausted";
  readonly offset: Offset;
  readonly maximumAttempts: MaximumAttempts;
  readonly attempts: Attempts;
  readonly partialTrace: Trace;
  readonly successorState: State;
}>;
type WithPartial<FailureValue, Trace extends RollTrace, State extends PrngGeneratorState> = FailureValue extends Failure<infer Code, infer Details extends object>
  ? Failure<Code, Details & { readonly partialTrace: Trace; readonly successorState: State }>
  : FailureValue;

/* A die node contributes its own step before consuming any PRNG state. */
type EvalDice<
  Count extends number,
  Sides extends number,
  State extends PrngGeneratorState,
  Fuel extends number,
  Trace extends RollTrace,
  Offset extends number,
  ConsumedSteps extends number,
> = AddNatural<ConsumedSteps, 1> extends infer Steps extends number
  ? IsGreaterThan<Steps, L["evaluationSteps"]> extends true
    ? EvaluationStepFailure<Offset, Steps, Trace, State>
    : EvalDiceRest<Count, Sides, State, Fuel, Trace, Offset, 0, Steps>
  : never;

type EvalDiceRest<
  Count extends number,
  Sides extends number,
  State extends PrngGeneratorState,
  Fuel extends number,
  Trace extends RollTrace,
  Offset extends number,
  Total extends number,
  Steps extends number,
> = Count extends 0
  ? Success<EvaluationValue<Total, Trace, State, Steps>>
: Sample<State, Sides, Fuel> extends infer SampleResult
    ? SampleResult extends {
        readonly ok: true;
        readonly value: {
          readonly value: infer Value extends number;
          readonly state: infer NextState extends PrngGeneratorState;
          readonly attempts: infer Attempts extends number;
        };
      }
      ? Increment<Value> extends infer Face extends number
        ? [...Trace, DieSample<Sides, Face>] extends infer NextTrace extends RollTrace
          ? AddNatural<Total, Face> extends infer NextTotal extends number
            ? AddNatural<Steps, Increment<Attempts>> extends infer NextSteps extends number
              ? IsGreaterThan<NextSteps, L["evaluationSteps"]> extends true
                ? EvaluationStepFailure<Offset, NextSteps, NextTrace, NextState>
                : IsGreaterThan<NextTotal, L["arithmeticMagnitude"]> extends true
                  ? DynamicResourceFailure<"arithmetic-magnitude", Offset, NextTotal, NextTrace, NextState>
                  : EvalDiceRest<Decrement<Count>, Sides, NextState, Fuel, NextTrace, Offset, NextTotal, NextSteps>
              : never
            : never
          : never
        : never
      : SampleResult extends {
          readonly ok: false;
          readonly code: "sampling-attempts-exhausted";
          readonly details: {
            readonly maximumAttempts: infer MaximumAttempts extends number;
            readonly attempts: infer Attempts extends number;
            readonly state: infer ExhaustedState extends PrngGeneratorState;
          };
        }
        ? AddNatural<Steps, Increment<Attempts>> extends infer AttemptedSteps extends number
          ? IsGreaterThan<AttemptedSteps, L["evaluationSteps"]> extends true
            ? EvaluationStepFailure<Offset, AttemptedSteps, Trace, ExhaustedState>
            : SamplingExhaustionFailure<Offset, MaximumAttempts, Attempts, Trace, ExhaustedState>
          : never
        : WithPartial<SampleResult, Trace, State>
    : never;

type EvalAst<
  Ast,
  State extends PrngGeneratorState,
  Fuel extends number,
  Trace extends RollTrace = [],
  ConsumedSteps extends number = 0,
> = Ast extends IntNode<infer Value, readonly unknown[], infer Offset>
  ? AddNatural<ConsumedSteps, 1> extends infer Steps extends number
    ? IsGreaterThan<Steps, L["evaluationSteps"]> extends true
      ? EvaluationStepFailure<Offset, Steps, Trace, State>
      : Success<EvaluationValue<Value, Trace, State, Steps>>
    : never
  : Ast extends DiceNode<infer Count, readonly unknown[], infer Sides, readonly unknown[], infer Offset, number>
    ? EvalDice<Count, Sides, State, Fuel, Trace, Offset, ConsumedSteps>
    : Ast extends GroupNode<infer Child, number>
      ? AddNatural<ConsumedSteps, 1> extends infer Steps extends number
        ? EvalAst<Child, State, Fuel, Trace, Steps>
        : never
      : Ast extends BinaryNode<infer Op extends "+" | "-", infer Left, infer Right, infer Offset>
        ? EvalAst<Left, State, Fuel, Trace, ConsumedSteps> extends infer LeftResult
          ? LeftResult extends {
              readonly ok: true;
              readonly value: {
                readonly total: infer LeftTotal extends number;
                readonly rollTrace: infer LeftTrace;
                readonly successorState: infer LeftState extends PrngGeneratorState;
                readonly steps: infer LeftSteps extends number;
              };
            }
            ? LeftTrace extends RollTrace
              ? EvalAst<Right, LeftState, Fuel, LeftTrace, LeftSteps> extends infer RightResult
                ? RightResult extends {
                    readonly ok: true;
                    readonly value: {
                      readonly total: infer RightTotal extends number;
                      readonly rollTrace: infer RightTrace;
                      readonly successorState: infer RightState extends PrngGeneratorState;
                      readonly steps: infer RightSteps extends number;
                    };
                  }
                  ? RightTrace extends RollTrace
                    ? ApplyEvaluationOp<Op, LeftTotal, RightTotal> extends infer Total extends number
                      ? Increment<RightSteps> extends infer Steps extends number
                        ? IsGreaterThan<Steps, L["evaluationSteps"]> extends true
                          ? EvaluationStepFailure<Offset, Steps, RightTrace, RightState>
                          : ExceedsArithmeticLimit<Total> extends true
                            ? DynamicResourceFailure<"arithmetic-magnitude", Offset, MagnitudeOfNumber<Total>, RightTrace, RightState>
                            : Success<EvaluationValue<Total, RightTrace, RightState, Steps>>
                        : never
                      : never
                    : never
                  : RightResult
                : never
              : never
            : LeftResult
          : never
        : never;

type ProjectEvaluation<Result> = Result extends {
  readonly ok: true;
  readonly value: {
    readonly total: infer Total extends number;
    readonly rollTrace: infer Trace extends RollTrace;
    readonly successorState: infer State extends PrngGeneratorState;
    readonly steps: number;
  };
}
  ? Success<DiceEvaluation<Total, Trace, State>>
  : Result;
type EvaluateParsed<Source extends string, State, MaximumAttempts extends number> = ParseSource<Source> extends infer Parsed
  ? Parsed extends Success<infer Ast>
    ? DomainOnlyValidation<Ast> extends infer Domain
      ? Domain extends true
        ? StaticPreflight<Ast> extends infer Planned
          ? Planned extends true
            ? ValidateState<State> extends infer StateResult
              ? StateResult extends Success<infer ValidState extends PrngGeneratorState>
                ? FuelPlan<ValidState, MaximumAttempts> extends infer Fuel
                  ? Fuel extends true ? ProjectEvaluation<EvalAst<Ast, ValidState, MaximumAttempts>> : Fuel
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
