/* Public-type gameplay transcript backed by verification/usability/check.mjs. */
import type { GeneratorState, Initialize, Success as PrngSuccess } from "@drdice/prng";
import type { DieSample, Evaluate, Success as DiceSuccess } from "@drdice/dice";

type Equal<Left, Right> =
  (<Value>() => Value extends Left ? 1 : 2) extends
  (<Value>() => Value extends Right ? 1 : 2) ? true : false;
type Assert<Value extends true> = Value;
type Seed = readonly ["00000001", "00000002", "00000003", "00000004"];
type State<Words extends readonly [string, string, string, string]> = GeneratorState<Words>;

type InitialState = State<readonly ["e83c194b", "b7818bc1", "fb0d50b6", "8369c2d9"]>;
type _Initialize = Assert<Equal<Initialize<Seed>, PrngSuccess<InitialState>>>;

type InitiativeState = State<readonly ["dcd45053", "a4b0c23c", "1026cbfd", "4248c1a7"]>;
type Initiative = Evaluate<"d20+3", InitialState, 5>;
type _Initiative = Assert<Equal<Initiative, DiceSuccess<{
  readonly total: 15;
  readonly rollTrace: [DieSample<20, 12>];
  readonly successorState: InitiativeState;
}>>>;

type HeroAttackState = State<readonly ["3a2c53c8", "68425992", "ad76e3ae", "c01cdf37"]>;
type HeroAttack = Evaluate<"d20+5", InitiativeState, 5>;
type _HeroAttack = Assert<Equal<HeroAttack, DiceSuccess<{
  readonly total: 23;
  readonly rollTrace: [DieSample<20, 18>];
  readonly successorState: HeroAttackState;
}>>>;

type HeroDamageState = State<readonly ["995f11db", "7e83a8ff", "b048a90b", "6e25b059"]>;
type HeroDamage = Evaluate<"2d6+3", HeroAttackState, 5>;
type _HeroDamage = Assert<Equal<HeroDamage, DiceSuccess<{
  readonly total: 15;
  readonly rollTrace: [DieSample<6, 6>, DieSample<6, 6>];
  readonly successorState: HeroDamageState;
}>>>;

type MonsterAttackState = State<readonly ["89f9097d", "5794102f", "2e4646d0", "30c53085"]>;
type MonsterAttack = Evaluate<"d20+4", HeroDamageState, 5>;
type _MonsterAttack = Assert<Equal<MonsterAttack, DiceSuccess<{
  readonly total: 23;
  readonly rollTrace: [DieSample<20, 19>];
  readonly successorState: MonsterAttackState;
}>>>;

type MonsterDamageState = State<readonly ["eea829d7", "f02b5f82", "8f9f11ad", "8905533a"]>;
type MonsterDamage = Evaluate<"d8+2", MonsterAttackState, 5>;
type _MonsterDamage = Assert<Equal<MonsterDamage, DiceSuccess<{
  readonly total: 7;
  readonly rollTrace: [DieSample<8, 5>];
  readonly successorState: MonsterDamageState;
}>>>;

type HealingState = State<readonly ["76ff815e", "31127eed", "98c1e915", "cd218f0b"]>;
type Healing = Evaluate<"2d4+2", MonsterDamageState, 5>;
type _Healing = Assert<Equal<Healing, DiceSuccess<{
  readonly total: 10;
  readonly rollTrace: [DieSample<4, 4>, DieSample<4, 4>];
  readonly successorState: HealingState;
}>>>;

/* Replay starts from the same Seed and therefore reproduces the whole chain. */
type _Replay = Assert<Equal<Initialize<Seed>, PrngSuccess<InitialState>>>;
