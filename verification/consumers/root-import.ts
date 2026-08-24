import type { PackageMetadata as PrngPackageMetadata } from "@drdice/prng";
import type { PackageMetadata as DicePackageMetadata } from "@drdice/dice";

type Exact<Value, Expected extends Value> = Value extends Expected ? Value : never;

export type PrngRootConsumer = Exact<
  PrngPackageMetadata["name"],
  "@drdice/prng"
>;
export type DiceRootConsumer = Exact<
  DicePackageMetadata["name"],
  "@drdice/dice"
>;
