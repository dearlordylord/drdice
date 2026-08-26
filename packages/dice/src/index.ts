import { sample, validateState } from "@drdice/prng";
import type { BoundedResult, ValidateStateResult } from "@drdice/prng";
import type { DiceEvaluation, RuntimeEvaluate, Success } from "./types.js";

export type {
  Success,
  FailureCode,
  Failure,
  DieSample,
  RollTrace,
  DiceEvaluation,
  PayloadOf,
  ValueOf,
  RollsOf,
  StateOf,
  SyntaxCode,
  ResourceDimension,
  ExpectedExpressionDiagnostic,
  ExpectedDieSidesDiagnostic,
  ExpectedClosingParenthesisDiagnostic,
  LeadingZeroDiagnostic,
  UnexpectedTokenDiagnostic,
  SyntaxDiagnostic,
  DiceCountZeroDiagnostic,
  SideCountZeroDiagnostic,
  DomainDiagnostic,
  ResourceLimitExceededDiagnostic,
  DynamicResourceLimitExceededDiagnostic,
  SamplingAttemptsExhaustedDiagnostic,
  Diagnostic,
  DiagnosticFailure,
  EvaluationStateFailure,
  EvaluationInputFailure,
  EvaluationFailure,
  EvaluationResult,
  Evaluate,
  PackageMetadata,
} from "./types.js";

export const DICE_SEMANTIC_PROFILE = "dice-v3/utf16-bounded-left-to-right-3" as const;
export const DICE_SEMANTIC_VERSION = 3 as const;

const LIMITS = Object.freeze({
  sourceLength: 64,
  numericTokenLength: 3,
  nestingDepth: 4,
  astNodeCount: 15,
  diceTermCount: 4,
  dieSampleCount: 8,
  supportedSideCount: 100,
  arithmeticMagnitude: 100,
  evaluationSteps: 24,
  rejectionSamplingAttempts: 5,
});

const STATIC_TIE_ORDER = [
  "ast-node-count",
  "dice-term-count",
  "die-sample-count",
  "supported-side-count",
  "arithmetic-magnitude",
  "evaluation-steps",
] as const;

type RuntimeFailure = { ok: false; code: string; details: Record<string, unknown> };
type RuntimeResult<Value> = { ok: true; value: Value } | RuntimeFailure;
type IntegerAst = { kind: "integer"; value: number; offset: number };
type DiceAst = { kind: "dice"; count: number; sides: number; offset: number; sideOffset: number };
type GroupAst = { kind: "group"; child: Ast; offset: number };
type BinaryAst = { kind: "binary"; op: "+" | "-"; left: Ast; right: Ast; offset: number };
type Ast = IntegerAst | DiceAst | GroupAst | BinaryAst;
type ParseResult = { result: RuntimeResult<Ast>; end: number };
type ResourceCandidate = { offset: number; dimension: string; limit: number; actual: number };
type AstCounts = {
  nodes: number;
  diceTerms: number;
  samples: number;
  steps: number;
  nodeOffsets: number[];
  diceOffsets: number[];
  sampleOffsets: number[];
  stepOffsets: number[];
  integers: Array<{ value: number; offset: number }>;
};
type RuntimeDieSample = { sideCount: number; face: number };
type Evaluated = {
  total: number;
  rollTrace: RuntimeDieSample[];
  nextState: unknown;
  steps: number;
};
const success = <Value>(value: Value): { ok: true; value: Value } => ({ ok: true, value });
const failure = (code: string, details: Record<string, unknown>): RuntimeFailure => ({ ok: false, code, details });
const whitespace = (char: string | undefined) => char === " " || char === "\t" || char === "\n" || char === "\r";
const digit = (char: string | undefined): char is string => typeof char === "string" && char >= "0" && char <= "9";
const foundAt = (source: string, offset: number) => offset >= source.length ? "eof" : source[offset];
const skipWhitespace = (source: string, offset: number) => {
  let cursor = offset;
  while (cursor < source.length && whitespace(source[cursor])) cursor += 1;
  return cursor;
};
const scanDigits = (source: string, offset: number) => {
  let cursor = offset;
  while (cursor < source.length && digit(source[cursor])) cursor += 1;
  return { raw: source.slice(offset, cursor), end: cursor };
};

const syntaxFailure = (code: string, offset: number, found: string, expected: string[]) => failure(code, {
  kind: "syntax",
  code,
  offset,
  found,
  expected,
});
const resourceFailure = (offset: number, dimension: string, limit: number, actual: number | string) => failure("resource-limit-exceeded", {
  kind: "resource",
  code: "resource-limit-exceeded",
  offset,
  dimension,
  limit,
  actual,
});
const domainFailure = (code: string, offset: number, subject: string) => failure(code, {
  kind: "domain",
  code,
  offset,
  subject,
  value: "0",
});

const parseNumber = (raw: string, offset: number): number | RuntimeFailure => {
  if (raw.length > LIMITS.numericTokenLength) {
    return resourceFailure(offset, "numeric-token-length", LIMITS.numericTokenLength, raw.length);
  }
  if (raw.length > 1 && raw.startsWith("0")) {
    return syntaxFailure("leading-zero", offset, raw[1], ["canonical-integer"]);
  }
  return Number(raw);
};

const parsePrimary = (source: string, offset: number, depth: number): ParseResult => {
  const start = skipWhitespace(source, offset);
  if (start >= source.length) {
    return {
      result: syntaxFailure("expected-expression", start, "eof", ["dice", "integer", "("]),
      end: start,
    };
  }

  const head = source[start];
  if (head === "(") {
    if (depth + 1 > LIMITS.nestingDepth) {
      return {
        result: resourceFailure(start, "nesting-depth", LIMITS.nestingDepth, depth + 1),
        end: start,
      };
    }
    const inner = parseExpression(source, start + 1, depth + 1);
    if (!inner.result.ok) return inner;
    const close = skipWhitespace(source, inner.end);
    if (source[close] !== ")") {
      return {
        result: syntaxFailure("expected-closing-parenthesis", close, foundAt(source, close), [")"]),
        end: close,
      };
    }
    return {
      result: success({ kind: "group", child: inner.result.value, offset: start }),
      end: close + 1,
    };
  }

  const expressionStart = start;
  let count: number;
  let cursor = start;
  if (head === "d" || head === "D") {
    count = 1;
    cursor += 1;
  } else if (digit(head)) {
    const scanned = scanDigits(source, cursor);
    const parsed = parseNumber(scanned.raw, cursor);
    if (typeof parsed !== "number") return { result: parsed, end: cursor };
    cursor = scanned.end;
    if (source[cursor] === "d" || source[cursor] === "D") {
      count = parsed;
      cursor += 1;
    } else {
      return {
        result: success({ kind: "integer", value: parsed, offset: expressionStart }),
        end: cursor,
      };
    }
  } else {
    return {
      result: syntaxFailure("unexpected-token", start, head, ["dice", "integer", "("]),
      end: start,
    };
  }

  const sides = scanDigits(source, cursor);
  if (sides.raw === "") {
    return {
      result: syntaxFailure("expected-die-sides", cursor, foundAt(source, cursor), ["positive-integer"]),
      end: cursor,
    };
  }
  const parsedSides = parseNumber(sides.raw, cursor);
  if (typeof parsedSides !== "number") return { result: parsedSides, end: cursor };
  return {
    result: success({
      kind: "dice",
      count,
      sides: parsedSides,
      offset: expressionStart,
      sideOffset: cursor,
    }),
    end: sides.end,
  };
};

const parseExpression = (source: string, offset: number, depth: number): ParseResult => {
  const first = parsePrimary(source, offset, depth);
  if (!first.result.ok) return first;
  let left = first.result.value;
  let cursor = first.end;
  while (true) {
    cursor = skipWhitespace(source, cursor);
    if (cursor >= source.length || source[cursor] === ")") {
      return { result: success(left), end: cursor };
    }
    const op = source[cursor];
    if (op !== "+" && op !== "-") {
      return {
        result: syntaxFailure("unexpected-token", cursor, op, ["+", "-", "EOF"]),
        end: cursor,
      };
    }
    const right = parsePrimary(source, cursor + 1, depth);
    if (!right.result.ok) return right;
    left = { kind: "binary", op, left, right: right.result.value, offset: cursor };
    cursor = right.end;
  }
};

const validateDomain = (ast: Ast): RuntimeFailure | null => {
  if (ast.kind === "dice") {
    if (ast.count === 0) return domainFailure("dice-count-zero", ast.offset, "dice-count");
    if (ast.sides === 0) return domainFailure("side-count-zero", ast.sideOffset, "side-count");
    return null;
  }
  if (ast.kind === "group") return validateDomain(ast.child);
  if (ast.kind === "binary") return validateDomain(ast.left) || validateDomain(ast.right);
  return null;
};

const unsupportedSides = (ast: Ast): ResourceCandidate | null => {
  if (ast.kind === "dice") {
    return ast.sides > LIMITS.supportedSideCount
      ? {
          offset: ast.sideOffset,
          dimension: "supported-side-count",
          limit: LIMITS.supportedSideCount,
          actual: ast.sides,
        }
      : null;
  }
  if (ast.kind === "group") return unsupportedSides(ast.child);
  if (ast.kind === "binary") return unsupportedSides(ast.left) || unsupportedSides(ast.right);
  return null;
};

const countAst = (ast: Ast): AstCounts => {
  if (ast.kind === "integer") {
    return {
      nodes: 1, diceTerms: 0, samples: 0, steps: 1,
      nodeOffsets: [ast.offset], diceOffsets: [], sampleOffsets: [], stepOffsets: [ast.offset],
      integers: [{ value: ast.value, offset: ast.offset }],
    };
  }
  if (ast.kind === "dice") {
    return {
      nodes: 1, diceTerms: 1, samples: ast.count, steps: ast.count * 2 + 1,
      nodeOffsets: [ast.offset], diceOffsets: [ast.offset],
      sampleOffsets: Array.from({ length: ast.count }, () => ast.offset),
      stepOffsets: [ast.offset, ...Array.from({ length: ast.count * 2 }, () => ast.offset)],
      integers: [],
    };
  }
  if (ast.kind === "group") {
    const child = countAst(ast.child);
    return {
      ...child,
      nodes: child.nodes + 1,
      steps: child.steps + 1,
      nodeOffsets: [ast.offset, ...child.nodeOffsets],
      stepOffsets: [ast.offset, ...child.stepOffsets],
    };
  }
  const left = countAst(ast.left);
  const right = countAst(ast.right);
  return {
    nodes: left.nodes + right.nodes + 1,
    diceTerms: left.diceTerms + right.diceTerms,
    samples: left.samples + right.samples,
    steps: left.steps + right.steps + 1,
    nodeOffsets: [...left.nodeOffsets, ast.offset, ...right.nodeOffsets],
    diceOffsets: [...left.diceOffsets, ...right.diceOffsets],
    sampleOffsets: [...left.sampleOffsets, ...right.sampleOffsets],
    stepOffsets: [...left.stepOffsets, ast.offset, ...right.stepOffsets],
    integers: [...left.integers, ...right.integers],
  };
};

const firstExcess = (offsets: number[], limit: number) => {
  if (offsets.length <= limit) return null;
  const ordered = [...offsets].sort((left, right) => left - right);
  return { offset: ordered[limit] ?? ordered.at(-1) ?? 0, actual: limit + 1 };
};

const constantValue = (ast: Ast): number | null => {
  if (ast.kind === "integer") return ast.value;
  if (ast.kind === "group") return constantValue(ast.child);
  if (ast.kind !== "binary") return null;
  const left = constantValue(ast.left);
  const right = constantValue(ast.right);
  if (left === null || right === null) return null;
  return ast.op === "+" ? left + right : left - right;
};

const constantMagnitudeCandidates = (ast: Ast): ResourceCandidate[] => {
  const candidates: ResourceCandidate[] = [];
  const value = constantValue(ast);
  if (value !== null && Math.abs(value) > LIMITS.arithmeticMagnitude) {
    candidates.push({
      offset: ast.offset,
      dimension: "arithmetic-magnitude",
      limit: LIMITS.arithmeticMagnitude,
      actual: Math.abs(value),
    });
  }
  if (ast.kind === "group") candidates.push(...constantMagnitudeCandidates(ast.child));
  if (ast.kind === "binary") {
    candidates.push(...constantMagnitudeCandidates(ast.left));
    candidates.push(...constantMagnitudeCandidates(ast.right));
  }
  return candidates;
};

const staticPreflight = (ast: Ast): RuntimeFailure | null => {
  const counts = countAst(ast);
  const candidates: ResourceCandidate[] = [];
  for (const [dimension, limit, offsets] of [
    ["ast-node-count", LIMITS.astNodeCount, counts.nodeOffsets],
    ["dice-term-count", LIMITS.diceTermCount, counts.diceOffsets],
    ["die-sample-count", LIMITS.dieSampleCount, counts.sampleOffsets],
    ["evaluation-steps", LIMITS.evaluationSteps, counts.stepOffsets],
  ] as Array<[string, number, number[]]>) {
    const excess = firstExcess(offsets, limit);
    if (excess) candidates.push({ ...excess, dimension, limit });
  }
  const sideCandidate = unsupportedSides(ast);
  if (sideCandidate) candidates.push(sideCandidate);
  for (const integer of counts.integers) {
    if (Math.abs(integer.value) > LIMITS.arithmeticMagnitude) {
      candidates.push({
        offset: integer.offset,
        dimension: "arithmetic-magnitude",
        limit: LIMITS.arithmeticMagnitude,
        actual: Math.abs(integer.value),
      });
    }
  }
  candidates.push(...constantMagnitudeCandidates(ast));
  if (candidates.length === 0) return null;
  const rank = (dimension: string) => {
    const index = (STATIC_TIE_ORDER as readonly string[]).indexOf(dimension);
    return index < 0 ? STATIC_TIE_ORDER.length : index;
  };
  const chosen = candidates.reduce<ResourceCandidate | null>((best, candidate) => !best
    || candidate.offset < best.offset
    || (candidate.offset === best.offset && rank(candidate.dimension) < rank(best.dimension))
    ? candidate
    : best, null);
  if (!chosen) throw new Error("resource candidate selection failed");
  return resourceFailure(chosen.offset, chosen.dimension, chosen.limit, chosen.actual);
};

const stepFailure = (offset: number, actual: number, trace: RuntimeDieSample[], state: unknown) => failure("resource-limit-exceeded", {
  kind: "resource",
  code: "resource-limit-exceeded",
  offset,
  dimension: "evaluation-steps",
  limit: LIMITS.evaluationSteps,
  actual,
  partialTrace: trace,
  nextState: state,
});

const evaluateAst = (
  ast: Ast,
  state: unknown,
  maximumAttempts: number,
  trace: RuntimeDieSample[],
  consumedSteps = 0,
): RuntimeResult<Evaluated> => {
  if (ast.kind === "integer") {
    const steps = consumedSteps + 1;
    return steps > LIMITS.evaluationSteps
      ? stepFailure(ast.offset, steps, trace, state)
      : success({ total: ast.value, rollTrace: trace, nextState: state, steps });
  }
  if (ast.kind === "group") {
    return evaluateAst(ast.child, state, maximumAttempts, trace, consumedSteps + 1);
  }
  if (ast.kind === "dice") {
    let current = state;
    let currentTrace = trace;
    let total = 0;
    let steps = consumedSteps + 1;
    if (steps > LIMITS.evaluationSteps) return stepFailure(ast.offset, steps, currentTrace, current);
    for (let index = 0; index < ast.count; index += 1) {
      const sampled: BoundedResult = sample(current, ast.sides, maximumAttempts);
      if (!sampled.ok) {
        if (sampled.code === "sampling-attempts-exhausted") {
          const attemptedSteps = steps + sampled.details.attempts + 1;
          if (attemptedSteps > LIMITS.evaluationSteps) {
            return stepFailure(ast.offset, attemptedSteps, currentTrace, sampled.details.state);
          }
          return failure("sampling-attempts-exhausted", {
            kind: "evaluation",
            code: "sampling-attempts-exhausted",
            offset: ast.offset,
            maximumAttempts: sampled.details.maximumAttempts,
            attempts: sampled.details.attempts,
            partialTrace: currentTrace,
            nextState: sampled.details.state,
          });
        }
        return failure(sampled.code, {
          ...sampled.details,
          partialTrace: currentTrace,
          nextState: current,
        });
      }
      current = sampled.value.state;
      const face = sampled.value.value + 1;
      currentTrace = [...currentTrace, { sideCount: ast.sides, face }];
      total += face;
      steps += sampled.value.attempts + 1;
      if (steps > LIMITS.evaluationSteps) return stepFailure(ast.offset, steps, currentTrace, current);
      if (Math.abs(total) > LIMITS.arithmeticMagnitude) {
        return failure("resource-limit-exceeded", {
          ...resourceFailure(ast.offset, "arithmetic-magnitude", LIMITS.arithmeticMagnitude, Math.abs(total)).details,
          partialTrace: currentTrace,
          nextState: current,
        });
      }
    }
    return success({ total, rollTrace: currentTrace, nextState: current, steps });
  }

  const left = evaluateAst(ast.left, state, maximumAttempts, trace, consumedSteps);
  if (!left.ok) return left;
  const right = evaluateAst(
    ast.right,
    left.value.nextState,
    maximumAttempts,
    left.value.rollTrace,
    left.value.steps,
  );
  if (!right.ok) return right;
  const total = ast.op === "+" ? left.value.total + right.value.total : left.value.total - right.value.total;
  const steps = right.value.steps + 1;
  if (steps > LIMITS.evaluationSteps) {
    return stepFailure(ast.offset, steps, right.value.rollTrace, right.value.nextState);
  }
  if (Math.abs(total) > LIMITS.arithmeticMagnitude) {
    return failure("resource-limit-exceeded", {
      ...resourceFailure(ast.offset, "arithmetic-magnitude", LIMITS.arithmeticMagnitude, Math.abs(total)).details,
      partialTrace: right.value.rollTrace,
      nextState: right.value.nextState,
    });
  }
  return success({
    total,
    rollTrace: right.value.rollTrace,
    nextState: right.value.nextState,
    steps,
  });
};

const stateFailure = (state: unknown): RuntimeFailure | null => {
  const validated: ValidateStateResult = validateState(state);
  if (validated.ok) return null;
  return failure(validated.code, {
    ...validated.details,
    partialTrace: [],
    nextState: null,
  });
};

const evaluateRuntime = (source: unknown, state: unknown, maximumAttempts = 5) => {
  if (typeof source !== "string") {
    return resourceFailure(0, "source-length", LIMITS.sourceLength, "widened");
  }
  if (source.length > LIMITS.sourceLength) {
    return resourceFailure(0, "source-length", LIMITS.sourceLength, source.length);
  }
  const start = skipWhitespace(source, 0);
  if (start >= source.length) {
    return syntaxFailure("expected-expression", start, "eof", ["dice", "integer", "("]);
  }
  const parsed = parseExpression(source, start, 0);
  if (!parsed.result.ok) return parsed.result;
  const end = skipWhitespace(source, parsed.end);
  if (end !== source.length) return syntaxFailure("unexpected-token", end, source[end], ["EOF"]);

  const invalidDomain = validateDomain(parsed.result.value);
  if (invalidDomain) return invalidDomain;
  const staticFailure = staticPreflight(parsed.result.value);
  if (staticFailure) return staticFailure;
  const invalidState = stateFailure(state);
  if (invalidState) return invalidState;

  if (!Number.isInteger(maximumAttempts) || maximumAttempts < 0) {
    return failure("invalid-attempt-fuel", {
      maximumAttempts,
      partialTrace: [],
      nextState: state,
    });
  }
  if (maximumAttempts > LIMITS.rejectionSamplingAttempts) {
    return resourceFailure(
      0,
      "rejection-sampling-attempts",
      LIMITS.rejectionSamplingAttempts,
      maximumAttempts,
    );
  }

  const evaluated = evaluateAst(parsed.result.value, state, maximumAttempts, []);
  if (!evaluated.ok) return evaluated;
  return success({
    total: evaluated.value.total,
    rollTrace: evaluated.value.rollTrace,
    nextState: evaluated.value.nextState,
  });
};

/** Parse and roll a Dice Expression using exactly the v3 semantics. */
export const evaluate = evaluateRuntime as <
  const Source extends string,
  const State,
  const MaximumAttempts extends number = 5,
>(source: Source, state: State, maximumAttempts?: MaximumAttempts) => RuntimeEvaluate<Source, State, MaximumAttempts>;

const requireSuccess = (result: { ok?: boolean; value?: unknown } | null | undefined): unknown => {
  if (!result?.ok) throw new TypeError("Cannot extract a value from a failed Dice result");
  return result.value;
};

export const payloadOf = requireSuccess as <const Payload>(result: Success<Payload>) => Payload;
export const valueOf = ((result: Success<DiceEvaluation>) =>
  (requireSuccess(result) as DiceEvaluation).total) as <const Payload extends DiceEvaluation>(
    result: Success<Payload>,
  ) => Payload["total"];
export const rollsOf = ((result: Success<DiceEvaluation>) =>
  (requireSuccess(result) as DiceEvaluation).rollTrace) as <const Payload extends DiceEvaluation>(
    result: Success<Payload>,
  ) => Payload["rollTrace"];
export const stateOf = ((result: Success<DiceEvaluation>) =>
  (requireSuccess(result) as DiceEvaluation).nextState) as <const Payload extends DiceEvaluation>(
    result: Success<Payload>,
  ) => Payload["nextState"];
