import type { PackageMetadata as PrngPackageMetadata } from "@drdice/prng";
import type { PackageMetadata as DicePackageMetadata } from "@drdice/dice";

type Equal<Left, Right> =
  (<Value>() => Value extends Left ? 1 : 2) extends
  (<Value>() => Value extends Right ? 1 : 2) ? true : false;
type Assert<Value extends true> = Value;

export type PrngBudgetAssertion = Assert<Equal<
  PrngPackageMetadata["declarationOnly"],
  false
>>;
export type DiceBudgetAssertion = Assert<Equal<
  DicePackageMetadata["declarationOnly"],
  false
>>;
