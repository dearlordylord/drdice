import { initialize, stateOf as prngStateOf } from "@drdice/prng";
import { evaluate, rollsOf, stateOf, valueOf } from "@drdice/dice";

type Equal<Left, Right> =
  (<Value>() => Value extends Left ? 1 : 2) extends
  (<Value>() => Value extends Right ? 1 : 2) ? true : false;
type Assert<Value extends true> = Value;

const initialized = initialize([
  "00000001",
  "00000002",
  "00000003",
  "00000004",
] as const);

const d20 = evaluate("d20", prngStateOf(initialized));
const d20Value = valueOf(d20);
type _D20Value = Assert<Equal<typeof d20Value, 12>>;

const combinedRoll = evaluate(`4d6 + ${d20Value}`, stateOf(d20));
const combinedValue = valueOf(combinedRoll);
const combinedRolls = rollsOf(combinedRoll);
type _CombinedValue = Assert<Equal<typeof combinedValue, 34>>;
type _CombinedRolls = Assert<Equal<
  typeof combinedRolls,
  readonly [
    { readonly sideCount: 6; readonly face: 5 },
    { readonly sideCount: 6; readonly face: 6 },
    { readonly sideCount: 6; readonly face: 6 },
    { readonly sideCount: 6; readonly face: 5 },
  ]
>>;

console.log({ value: combinedValue, rolls: combinedRolls, nextState: stateOf(combinedRoll) });
