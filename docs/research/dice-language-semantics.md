# Dice-language semantics and diagnostic precedents

Research for [Survey dice-language semantics and diagnostic precedents](https://github.com/dearlordylord/drdice/issues/4), captured 2026-08-20.

## Answer

DRDice v1 should specify a deliberately small, deterministic language rather than inherit the accidental semantics of a larger dice notation:

```ebnf
source     = whitespace, expression, whitespace, EOF ;
expression = primary, { whitespace, ("+" | "-"), whitespace, primary } ;
primary    = dice | integer | "(", whitespace, expression, whitespace, ")" ;
dice       = [positiveInteger], ("d" | "D"), positiveInteger ;
integer    = "0" | positiveInteger ;
positiveInteger = nonZeroDigit, { digit } ;
nonZeroDigit = "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" ;
digit      = "0" | nonZeroDigit ;
whitespace = { " " | "\t" | "\n" | "\r" } ;
```

This makes `d6` an abbreviation for `1d6`. Dice count and side count are positive; therefore `0d6`, `d0`, bare `d`, signs inside literals, implicit multiplication, and trailing input are invalid. Leading zeroes other than the literal `0` should be rejected so the language has one spelling per numeric token. `D` is accepted as the only case-folded token, matching `@yipe/dice`'s acceptance through normalization ([`parser.ts`](https://github.com/yipe/dice/blob/a77a07ff765645e397262172f5c9bf331706cd17/src/parser/parser.ts#L48-L60)); globally lowercasing input would unnecessarily discard the original spelling used in diagnostics.

`+` and `-` have equal precedence and associate left. Parentheses override grouping. Dice Evaluation is a depth-first, left-to-right traversal of that AST. Within `NdS`, Die Samples are produced in Roll Trace order from first to last. Every accepted expression has exactly one parse and one Generator State-consumption order. For example, `d6 - d6 - d6` parses as `(d6 - d6) - d6`, and the three Die Samples are assigned from left to right. Parentheses change grouping but do not permit reordering during evaluation.

The Dice Evaluation should retain the final total, the successor Generator State, and a Roll Trace containing every Die Sample. Each Die Sample needs at least the die's side count and sampled face; grouping or source span can be attached to the AST rather than duplicated in every sample. The important contract is that Roll Trace order *is* Generator State-consumption order. This is stronger than returning only the total and is what lets a later runtime mirror be checked exactly against type-level evaluation.

Invalid input and exhausted budgets should be values in the type-level result, not `never` and not a widened `number`. Use a stable discriminant and code plus structured context, conceptually:

```ts
type Diagnostic =
  | {
      readonly kind: "syntax"
      readonly code: string
      readonly offset: number
      readonly found: string | "eof"
      readonly expected: readonly string[]
    }
  | {
      readonly kind: "domain"
      readonly code: string
      readonly offset: number
      readonly subject: "dice-count" | "side-count" | "integer"
      readonly value: string
    }
  | {
      readonly kind: "resource"
      readonly code: string
      readonly offset: number
      readonly limit: number
      readonly actual: number
    }
```

A convenience API may render that structure into a human-readable compiler error, but messages should be derived from the structured diagnostic. The runtime parser should emit the same codes and offsets. Syntax errors cover malformed token sequences; domain errors cover syntactically valid but forbidden values such as a zero-sided die; resource errors cover valid expressions outside the supported evaluation envelope.

The implementation must budget source length, numeric-token length, nesting depth, AST nodes, dice terms, total Die Samples, arithmetic result width, and type-level evaluation steps. The public limits should be named and shared by the type-level and runtime implementations. Exact numeric thresholds should be established by the separate compiler-budget investigation, not copied from runtime libraries whose cost model is different. Rejection sampling in the Seeded PRNG also needs its own explicit fuel because a fair bounded sample can consume more than one Generator State transition.

## What the precedents establish

### Avrae `d20`: explicit grammar, AST, trace, and roll budget

Avrae's `d20` is the strongest dice-language precedent surveyed. Its checked-in Lark grammar separates comparison, additive, multiplicative, unary, and primary levels; its left-recursive additive production gives `+` and `-` ordinary left associativity, and its whitespace token accepts spaces, tabs, form feeds, carriage returns, and newlines. Dice use `INTEGER? "d" DICE_VALUE`, so omitted count is established notation. See [`grammar.lark`](https://github.com/avrae/d20/blob/ad2ce2533af82645a29bbb79df5d814c93a4a590/d20/grammar.lark#L1-L55).

The parser produces a distinct AST before evaluation, with explicit `Literal`, `Parenthetical`, `BinOp`, and `Dice` nodes ([`diceast.py`](https://github.com/avrae/d20/blob/ad2ce2533af82645a29bbb79df5d814c93a4a590/d20/diceast.py#L201-L289)). Its evaluator recursively evaluates a binary node's left child before its right child, making execution order visible in source rather than relying on algebraic equivalence ([`dice.py`](https://github.com/avrae/d20/blob/ad2ce2533af82645a29bbb79df5d814c93a4a590/d20/dice.py#L255-L286)). A `RollResult` retains both the original AST and the evaluated expression tree as well as the total, and individual `Die` values retain their roll history ([`dice.py`](https://github.com/avrae/d20/blob/ad2ce2533af82645a29bbb79df5d814c93a4a590/d20/dice.py#L71-L132), [`expression.py`](https://github.com/avrae/d20/blob/ad2ce2533af82645a29bbb79df5d814c93a4a590/d20/expression.py#L342-L430)). This supports DRDice's AST-plus-ordered-trace result rather than a total-only result.

`d20` counts primitive samples and stops after a configurable default of 1,000, including rerolls, by raising a dedicated `TooManyRolls` error ([`dice.py`](https://github.com/avrae/d20/blob/ad2ce2533af82645a29bbb79df5d814c93a4a590/d20/dice.py#L42-L68)). Its syntax error records line, column, encountered token, and expected tokens ([`errors.py`](https://github.com/avrae/d20/blob/ad2ce2533af82645a29bbb79df5d814c93a4a590/d20/errors.py#L9-L35)). Those are applicable concepts, but the value `1,000` and exception transport are not: type evaluation has a different cost model and needs diagnostic values.

One behavior should not be copied: `d20` accepts `0d6` as zero while rejecting a zero-sided die; its tests make that distinction explicit ([`test_dice.py`](https://github.com/avrae/d20/blob/ad2ce2533af82645a29bbb79df5d814c93a4a590/tests/test_dice.py#L83-L94)). For a v1 language whose dice term means one or more random observations, rejecting a zero count keeps traces and state consumption unsurprising.

### `@yipe/dice`: useful warning about normalization and precedence

`@yipe/dice` normalizes by deleting only literal spaces and lowercasing the whole expression before parsing ([`parser.ts`](https://github.com/yipe/dice/blob/a77a07ff765645e397262172f5c9bf331706cd17/src/parser/parser.ts#L48-L60)). That makes tabs/newlines behave differently from spaces and discards original case. DRDice should instead scan a documented finite whitespace set while retaining the original source position.

Its `parseExpression` parses one argument and then applies every following operation in a single loop ([`parser.ts`](https://github.com/yipe/dice/blob/a77a07ff765645e397262172f5c9bf331706cd17/src/parser/parser.ts#L109-L129)); `parseOperation` recognizes all operators at that same layer ([`parser.ts`](https://github.com/yipe/dice/blob/a77a07ff765645e397262172f5c9bf331706cd17/src/parser/parser.ts#L544-L614)). This supplies deterministic left-to-right behavior but no conventional precedence between addition and multiplication. DRDice v1 has only one binary precedence level, so the technique is sufficient today, but an explicit AST grammar prevents a later operator from silently inheriting the wrong precedence.

The library does demonstrate why limits must cover more than input length. It caps sides, dice count, keep-enumeration outcomes, and the cross product of binary distributions ([`parser.ts`](https://github.com/yipe/dice/blob/a77a07ff765645e397262172f5c9bf331706cd17/src/parser/parser.ts#L8-L21), [`dice.ts`](https://github.com/yipe/dice/blob/a77a07ff765645e397262172f5c9bf331706cd17/src/parser/dice.ts#L12-L27)). The exact operations differ, but the principle transfers: budget the expensive semantic operation, not merely characters.

### ArkType: mirrored scanner state and readable type errors

ArkType is the most applicable TypeScript precedent for keeping runtime and type-level parsing aligned. Its `parseString` has parallel runtime functions and type aliases; the type-level path repeatedly chooses operand versus operator from an explicit static state ([`string.ts`](https://github.com/arktypeio/arktype/blob/03b1f015d9b7c5af5dac2caed1aeedefaf705ab3/ark/type/parser/string.ts#L16-L110)). That static state retains `root`, grouping/branch state, `finalizer`, `scanned`, and `unscanned`, and each transition returns a new state ([`static.ts`](https://github.com/arktypeio/arktype/blob/03b1f015d9b7c5af5dac2caed1aeedefaf705ab3/ark/type/parser/reduce/static.ts#L1-L75)). DRDice can use the same state-machine shape while adding PRNG state and explicit fuel to evaluation, not parsing.

ArkType represents a type-level parse failure as a recognizable string-literal `ErrorMessage` marker and constructs matching runtime messages ([`errors.ts`](https://github.com/arktypeio/arktype/blob/03b1f015d9b7c5af5dac2caed1aeedefaf705ab3/ark/util/errors.ts#L14-L49), [`operator.ts`](https://github.com/arktypeio/arktype/blob/03b1f015d9b7c5af5dac2caed1aeedefaf705ab3/ark/type/parser/shift/operator/operator.ts#L72-L95)). The useful precedent is readable, intentional compiler feedback and mirrored message construction. DRDice should go one step further and preserve structured diagnostic codes/context beneath the rendered message so consumers and parity tests do not depend on prose.

ArkType deliberately defines its own small whitespace set—space, LF, and tab—shared by value and type definitions ([`strings.ts`](https://github.com/arktypeio/arktype/blob/03b1f015d9b7c5af5dac2caed1aeedefaf705ab3/ark/util/strings.ts#L65-L81)). That is evidence for an explicit character union instead of an ambient notion such as JavaScript `\s`; DRDice adds CR so CRLF source is accepted consistently.

### TypeScript: recursion limits are part of the product envelope

TypeScript officially supports recursive conditional types but warns that they can increase type-checking time and may hit an internal recursion-depth limit; its release notes explicitly advise against shipping Collatz-like computation in declaration files ([TypeScript 4.1 release notes](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-1.html#recursive-conditional-types)). Template literal types provide the string decomposition and reconstruction mechanism used by a literal parser ([TypeScript handbook](https://www.typescriptlang.org/docs/handbook/2/template-literal-types.html)). Consequently, resource exhaustion must become a DRDice diagnostic *before* the compiler emits its opaque excessive-instantiation error. Compiler limits are a backstop, not the language specification.

## Recommended conformance cases

These cases should be shared between the future type-level implementation and runtime mirror:

| Source | Outcome |
| --- | --- |
| `d6`, `D6`, `2d6` | accepted dice terms |
| `0`, `12`, `12 - 7 + 2` | accepted integer/additive expressions; last expression groups left |
| `d6 + (2d8 - 1)` | accepted; Die Samples consume Generator States in textual depth-first order |
| ` \t d6\r\n+ 2 ` | accepted whitespace |
| ``, `d`, `d0`, `0d6`, `01`, `1d06` | rejected with specific syntax/domain codes |
| `-1`, `+1`, `1+-2`, `2 d6`, `2(d6)` | rejected; unary signs and implicit multiplication are outside v1 |
| `d6 d8`, `d6 +`, `(d6`, `d6)`, `d6 garbage` | rejected at the first offending/end position |

Conformance must compare not just totals but the Roll Trace and successor Generator State. For diagnostics it must compare kind, code, and offset; human wording can be snapshot-tested separately.

## Scope boundary

This research does not select numeric compiler budgets, the Seeded PRNG algorithm, an internal integer representation, or the exact exported TypeScript API. It fixes the language behaviors those decisions must preserve. Multiplication/division, unary operators, keep/drop, rerolls, exploding dice, comments, annotations, and probability distributions remain outside the agreed v1 language.
