/* GENERATED FILE. Run pnpm generate:fixtures; do not edit by hand. */
import type { PackageMetadata as PrngPackageMetadata } from "@drdice/prng";
import type { PackageMetadata as DicePackageMetadata } from "@drdice/dice";

type Equal<Left, Right> =
  (<Value>() => Value extends Left ? 1 : 2) extends
  (<Value>() => Value extends Right ? 1 : 2) ? true : false;
type Assert<Value extends true> = Value;

export type PrngScaffoldAssertion = Assert<Equal<
  PrngPackageMetadata["name"],
  "@drdice/prng"
>>;
export type DiceScaffoldAssertion = Assert<Equal<
  DicePackageMetadata["name"],
  "@drdice/dice"
>>;
