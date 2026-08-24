/*
 * Private issue #20 Dice correctness oracle.
 *
 * This is verification infrastructure, not package source.  The scanner,
 * parser, analyzer, and evaluator below are ordinary JavaScript and do not
 * import a production implementation.  Sampling is composed only through
 * the public runtime-oracle boundary established by issue #17.
 */

import {
  oracleSample,
} from "../issue-17/oracle.mjs";

/**
 * A Dice semantic identity is separate from the package version, PRNG
 * Sequence Profile, and PRNG schema version.  Any value/consumption/failure
 * semantic change requires a new identity and reviewed vectors.
 */
export const DICE_SEMANTIC_PROFILE = "dice-v2/utf16-bounded-left-to-right-2";
export const DICE_SEMANTIC_VERSION = 2;
export const PRNG_SEQUENCE_PROFILE = "xoshiro128ss-1.1/warmup16-msb-chunk-rejection-2";

export const LIMITS = Object.freeze({
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

export const RESOURCE_DIMENSIONS = Object.freeze([
  "source-length",
  "numeric-token-length",
  "nesting-depth",
  "ast-node-count",
  "dice-term-count",
  "die-sample-count",
  "supported-side-count",
  "arithmetic-magnitude",
  "evaluation-steps",
  "rejection-sampling-attempts",
]);

export const STATIC_RESOURCE_TIE_ORDER = Object.freeze([
  "ast-node-count",
  "dice-term-count",
  "die-sample-count",
  "supported-side-count",
  "arithmetic-magnitude",
  "evaluation-steps",
]);

const failure = (code, details) => ({ ok: false, code, details });
const success = (value) => ({ ok: true, value });

const whitespace = (char) => char === " "
  || char === "\t"
  || char === "\n"
  || char === "\r";

const digit = (char) => typeof char === "string"
  && char.length === 1
  && char >= "0"
  && char <= "9";

const foundAt = (source, offset) => offset >= source.length ? "eof" : source[offset];

const parseDiagnostic = (code, offset, found, expected) => failure(code, {
  kind: "syntax",
  code,
  offset,
  found,
  expected,
});

const resourceDiagnostic = (offset, dimension, limit, actual) => failure("resource-limit-exceeded", {
  kind: "resource",
  code: "resource-limit-exceeded",
  offset,
  dimension,
  limit,
  actual,
});

const domainDiagnostic = (code, offset, subject) => failure(code, {
  kind: "domain",
  code,
  offset,
  subject,
  value: "0",
});

const skipWhitespace = (source, offset) => {
  let cursor = offset;
  while (cursor < source.length && whitespace(source[cursor])) cursor += 1;
  return cursor;
};

const scanDigits = (source, offset) => {
  let cursor = offset;
  while (cursor < source.length && digit(source[cursor])) cursor += 1;
  return { raw: source.slice(offset, cursor), end: cursor };
};

/** Return either a number or a structured scanner failure. */
const parseNumber = (raw, offset) => {
  if (raw.length > LIMITS.numericTokenLength) {
    return resourceDiagnostic(offset, "numeric-token-length", LIMITS.numericTokenLength, raw.length);
  }
  if (raw.length > 1 && raw.startsWith("0")) {
    return parseDiagnostic("leading-zero", offset, raw[1], ["canonical-integer"]);
  }
  return Number(raw);
};

const parsePrimary = (source, offset, depth) => {
  const start = skipWhitespace(source, offset);
  if (start >= source.length) {
    return {
      result: parseDiagnostic("expected-expression", start, "eof", ["dice", "integer", "("]),
      end: start,
    };
  }

  const head = source[start];
  if (head === "(") {
    if (depth + 1 > LIMITS.nestingDepth) {
      return {
        result: resourceDiagnostic(start, "nesting-depth", LIMITS.nestingDepth, depth + 1),
        end: start,
      };
    }
    const inner = parseExpression(source, start + 1, depth + 1);
    if (!inner.result.ok) return inner;
    const close = skipWhitespace(source, inner.end);
    if (source[close] !== ")") {
      return {
        result: parseDiagnostic(
          "expected-closing-parenthesis",
          close,
          foundAt(source, close),
          [")"],
        ),
        end: close,
      };
    }
    return {
      result: success({ kind: "group", child: inner.result.value, offset: start }),
      end: close + 1,
    };
  }

  const expressionStart = start;
  let count;
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
      result: parseDiagnostic("unexpected-token", start, head, ["dice", "integer", "("]),
      end: start,
    };
  }

  const sides = scanDigits(source, cursor);
  if (sides.raw === "") {
    return {
      result: parseDiagnostic(
        "expected-die-sides",
        cursor,
        foundAt(source, cursor),
        ["positive-integer"],
      ),
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

const parseExpression = (source, offset, depth) => {
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
        result: parseDiagnostic("unexpected-token", cursor, op, ["+", "-", "EOF"]),
        end: cursor,
      };
    }
    const right = parsePrimary(source, cursor + 1, depth);
    if (!right.result.ok) return right;
    left = {
      kind: "binary",
      op,
      left,
      right: right.result.value,
      offset: cursor,
    };
    cursor = right.end;
  }
};

const domainValidation = (ast) => {
  if (ast.kind === "dice") {
    if (ast.count === 0) return domainDiagnostic("dice-count-zero", ast.offset, "dice-count");
    if (ast.sides === 0) return domainDiagnostic("side-count-zero", ast.sideOffset, "side-count");
    return null;
  }
  if (ast.kind === "group") return domainValidation(ast.child);
  if (ast.kind === "binary") return domainValidation(ast.left) || domainValidation(ast.right);
  return null;
};

const supportedSideCandidate = (ast) => {
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
  if (ast.kind === "group") return supportedSideCandidate(ast.child);
  if (ast.kind === "binary") return supportedSideCandidate(ast.left) || supportedSideCandidate(ast.right);
  return null;
};

/* Full-AST accounting deliberately records source offsets for each conceptual
 * node, sample, and minimum evaluation step.  The first excess item is the
 * first source-order observation that proves the selected limit is crossed. */
const astCounts = (ast) => {
  if (ast.kind === "integer") {
    return {
      nodes: 1,
      diceTerms: 0,
      samples: 0,
      steps: 1,
      nodeOffsets: [ast.offset],
      diceOffsets: [],
      sampleOffsets: [],
      stepOffsets: [ast.offset],
      integerValues: [{ value: ast.value, offset: ast.offset }],
    };
  }
  if (ast.kind === "dice") {
    return {
      nodes: 1,
      diceTerms: 1,
      samples: ast.count,
      steps: ast.count * 2 + 1,
      nodeOffsets: [ast.offset],
      diceOffsets: [ast.offset],
      sampleOffsets: Array.from({ length: ast.count }, () => ast.offset),
      stepOffsets: [ast.offset, ...Array.from({ length: ast.count * 2 }, () => ast.offset)],
      integerValues: [],
    };
  }
  if (ast.kind === "group") {
    const child = astCounts(ast.child);
    return {
      ...child,
      nodes: child.nodes + 1,
      steps: child.steps + 1,
      nodeOffsets: [ast.offset, ...child.nodeOffsets],
      stepOffsets: [ast.offset, ...child.stepOffsets],
    };
  }

  const left = astCounts(ast.left);
  const right = astCounts(ast.right);
  return {
    nodes: left.nodes + right.nodes + 1,
    diceTerms: left.diceTerms + right.diceTerms,
    samples: left.samples + right.samples,
    steps: left.steps + right.steps + 1,
    nodeOffsets: [...left.nodeOffsets, ast.offset, ...right.nodeOffsets],
    diceOffsets: [...left.diceOffsets, ...right.diceOffsets],
    sampleOffsets: [...left.sampleOffsets, ...right.sampleOffsets],
    stepOffsets: [...left.stepOffsets, ast.offset, ...right.stepOffsets],
    integerValues: [...left.integerValues, ...right.integerValues],
  };
};

const firstExcess = (offsets, limit) => {
  if (offsets.length <= limit) return null;
  const ordered = [...offsets].sort((left, right) => left - right);
  return {
    offset: ordered[limit] ?? ordered[ordered.length - 1] ?? 0,
    actual: limit + 1,
  };
};

const constantValue = (ast) => {
  if (ast.kind === "integer") return ast.value;
  if (ast.kind === "group") return constantValue(ast.child);
  if (ast.kind !== "binary") return null;
  const left = constantValue(ast.left);
  const right = constantValue(ast.right);
  if (left === null || right === null) return null;
  return ast.op === "+" ? left + right : left - right;
};

const constantResourceCandidates = (ast) => {
  const candidates = [];
  const value = constantValue(ast);
  if (value !== null && Math.abs(value) > LIMITS.arithmeticMagnitude) {
    candidates.push({
      offset: ast.offset,
      dimension: "arithmetic-magnitude",
      limit: LIMITS.arithmeticMagnitude,
      actual: Math.abs(value),
    });
  }
  if (ast.kind === "group") candidates.push(...constantResourceCandidates(ast.child));
  if (ast.kind === "binary") {
    candidates.push(...constantResourceCandidates(ast.left));
    candidates.push(...constantResourceCandidates(ast.right));
  }
  return candidates;
};

const staticPreflight = (ast) => {
  const counts = astCounts(ast);
  const candidates = [];
  for (const [dimension, limit, offsets] of [
    ["ast-node-count", LIMITS.astNodeCount, counts.nodeOffsets],
    ["dice-term-count", LIMITS.diceTermCount, counts.diceOffsets],
    ["die-sample-count", LIMITS.dieSampleCount, counts.sampleOffsets],
    ["evaluation-steps", LIMITS.evaluationSteps, counts.stepOffsets],
  ]) {
    const excess = firstExcess(offsets, limit);
    if (excess) candidates.push({ ...excess, dimension, limit });
  }

  const supportedSide = supportedSideCandidate(ast);
  if (supportedSide) candidates.push(supportedSide);
  for (const integer of counts.integerValues) {
    if (Math.abs(integer.value) > LIMITS.arithmeticMagnitude) {
      candidates.push({
        offset: integer.offset,
        dimension: "arithmetic-magnitude",
        limit: LIMITS.arithmeticMagnitude,
        actual: Math.abs(integer.value),
      });
    }
  }
  candidates.push(...constantResourceCandidates(ast));

  if (candidates.length === 0) return null;
  const tieIndex = (dimension) => {
    const index = STATIC_RESOURCE_TIE_ORDER.indexOf(dimension);
    return index < 0 ? STATIC_RESOURCE_TIE_ORDER.length : index;
  };
  const chosen = candidates.reduce((best, candidate) => (
    !best
      || candidate.offset < best.offset
      || (candidate.offset === best.offset && tieIndex(candidate.dimension) < tieIndex(best.dimension))
      ? candidate
      : best
  ), null);
  return resourceDiagnostic(chosen.offset, chosen.dimension, chosen.limit, chosen.actual);
};

const stepFailure = (offset, actual, trace, state) => failure("resource-limit-exceeded", {
  kind: "resource",
  code: "resource-limit-exceeded",
  offset,
  dimension: "evaluation-steps",
  limit: LIMITS.evaluationSteps,
  actual,
  partialTrace: trace,
  successorState: state,
});

const evalAst = (ast, state, maximumAttempts, trace, consumedSteps = 0) => {
  if (ast.kind === "integer") {
    const steps = consumedSteps + 1;
    return steps > LIMITS.evaluationSteps
      ? stepFailure(ast.offset, steps, trace, state)
      : success({ total: ast.value, rollTrace: trace, successorState: state, steps });
  }

  if (ast.kind === "group") {
    return evalAst(ast.child, state, maximumAttempts, trace, consumedSteps + 1);
  }

  if (ast.kind === "dice") {
    let current = state;
    let currentTrace = trace;
    let total = 0;
    let steps = consumedSteps + 1;
    if (steps > LIMITS.evaluationSteps) return stepFailure(ast.offset, steps, currentTrace, current);

    for (let index = 0; index < ast.count; index += 1) {
      const sampled = oracleSample(current, ast.sides, maximumAttempts);
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
            successorState: sampled.details.state,
          });
        }
        return failure(sampled.code, {
          ...sampled.details,
          partialTrace: currentTrace,
          successorState: current,
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
          ...resourceDiagnostic(ast.offset, "arithmetic-magnitude", LIMITS.arithmeticMagnitude, Math.abs(total)).details,
          partialTrace: currentTrace,
          successorState: current,
        });
      }
    }
    return success({ total, rollTrace: currentTrace, successorState: current, steps });
  }

  const left = evalAst(ast.left, state, maximumAttempts, trace, consumedSteps);
  if (!left.ok) return left;
  const right = evalAst(
    ast.right,
    left.value.successorState,
    maximumAttempts,
    left.value.rollTrace,
    left.value.steps,
  );
  if (!right.ok) return right;

  const total = ast.op === "+"
    ? left.value.total + right.value.total
    : left.value.total - right.value.total;
  const steps = right.value.steps + 1;
  if (steps > LIMITS.evaluationSteps) return stepFailure(ast.offset, steps, right.value.rollTrace, right.value.successorState);
  if (Math.abs(total) > LIMITS.arithmeticMagnitude) {
    return failure("resource-limit-exceeded", {
      ...resourceDiagnostic(ast.offset, "arithmetic-magnitude", LIMITS.arithmeticMagnitude, Math.abs(total)).details,
      partialTrace: right.value.rollTrace,
      successorState: right.value.successorState,
    });
  }
  return success({
    total,
    rollTrace: right.value.rollTrace,
    successorState: right.value.successorState,
    steps,
  });
};

const stateFailureWithContext = (state) => {
  const probe = oracleSample(state, 1, 0);
  if (probe.ok || probe.code === "sampling-attempts-exhausted") return null;
  return failure(probe.code, {
    ...probe.details,
    partialTrace: [],
    successorState: null,
  });
};

/**
 * Evaluate the complete bounded v2 semantics. This is the oracle's public
 * verification seam; package code is intentionally absent from this module.
 */
export const oracleEvaluate = (source, state, maximumAttempts) => {
  if (typeof source !== "string") {
    return resourceDiagnostic(0, "source-length", LIMITS.sourceLength, "widened");
  }
  if (source.length > LIMITS.sourceLength) {
    return resourceDiagnostic(0, "source-length", LIMITS.sourceLength, source.length);
  }

  const start = skipWhitespace(source, 0);
  if (start >= source.length) {
    return parseDiagnostic("expected-expression", start, "eof", ["dice", "integer", "("]);
  }
  const parsed = parseExpression(source, start, 0);
  if (!parsed.result.ok) return parsed.result;
  const end = skipWhitespace(source, parsed.end);
  if (end !== source.length) {
    return parseDiagnostic("unexpected-token", end, source[end], ["EOF"]);
  }

  const domain = domainValidation(parsed.result.value);
  if (domain) return domain;
  const planned = staticPreflight(parsed.result.value);
  if (planned) return planned;

  const invalid = stateFailureWithContext(state);
  if (invalid) return invalid;

  if (!Number.isInteger(maximumAttempts) || maximumAttempts < 0) {
    return failure("invalid-attempt-fuel", {
      maximumAttempts,
      partialTrace: [],
      successorState: state,
    });
  }
  if (maximumAttempts > LIMITS.rejectionSamplingAttempts) {
    return resourceDiagnostic(
      0,
      "rejection-sampling-attempts",
      LIMITS.rejectionSamplingAttempts,
      maximumAttempts,
    );
  }

  const evaluated = evalAst(parsed.result.value, state, maximumAttempts, []);
  if (!evaluated.ok) return evaluated;
  return success({
    total: evaluated.value.total,
    rollTrace: evaluated.value.rollTrace,
    successorState: evaluated.value.successorState,
  });
};
