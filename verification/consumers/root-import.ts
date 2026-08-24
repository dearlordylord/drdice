import type {
  GeneratorState,
  PackageMetadata as PrngPackageMetadata,
  Sample,
  Success,
} from "@drdice/prng";
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

type ConsumerState = GeneratorState<readonly [
  "00000001",
  "00000002",
  "00000003",
  "00000004",
]>;
export type PrngSampleRootConsumer = Exact<
  Sample<ConsumerState, 1, 1>,
  Success<{
    readonly value: 0;
    readonly state: GeneratorState<readonly [
      "00000007",
      "00000000",
      "00000402",
      "00003000",
    ]>;
    readonly attempts: 1;
  }>
>;
