/* Public-type gameplay transcript backed by verification/usability/check.mjs. */
import type { GeneratorState, Initialize, PayloadOf as PrngPayloadOf, StateOf as PrngStateOf, Success as PrngSuccess } from "@drdice/prng";
import type {
  DieSample,
  Evaluate,
  PayloadOf,
  RollsOf,
  StateOf,
  Success as DiceSuccess,
  ValueOf,
} from "@drdice/dice";

type Equal<Left, Right> =
  (<Value>() => Value extends Left ? 1 : 2) extends
  (<Value>() => Value extends Right ? 1 : 2) ? true : false;
type Assert<Value extends true> = Value;
type Seed = readonly ["00000001", "00000002", "00000003", "00000004"];
type State<Words extends readonly [string, string, string, string]> = GeneratorState<Words>;

type InitialState = State<readonly ["e83c194b", "b7818bc1", "fb0d50b6", "8369c2d9"]>;
type _Initialize = Assert<Equal<Initialize<Seed>, PrngSuccess<InitialState>>>;
type _InitializedState = Assert<Equal<PrngStateOf<Initialize<Seed>>, InitialState>>;
type _InitializedPayload = Assert<Equal<PrngPayloadOf<Initialize<Seed>>, InitialState>>;

type InitiativeState = State<readonly ["dcd45053", "a4b0c23c", "1026cbfd", "4248c1a7"]>;
type Initiative = Evaluate<"d20+3", InitialState>;
type _Initiative = Assert<Equal<Initiative, DiceSuccess<{
  readonly total: 15;
  readonly rollTrace: [DieSample<20, 12>];
  readonly nextState: InitiativeState;
}>>>;
type _InitiativePayload = Assert<Equal<PayloadOf<Initiative>, {
  readonly total: 15;
  readonly rollTrace: [DieSample<20, 12>];
  readonly nextState: InitiativeState;
}>>;
type _InitiativeValue = Assert<Equal<ValueOf<Initiative>, 15>>;
type _InitiativeRolls = Assert<Equal<RollsOf<Initiative>, [DieSample<20, 12>]>>;
type _InitiativeState = Assert<Equal<StateOf<Initiative>, InitiativeState>>;
type Invalid = Evaluate<"d0", InitialState>;
type _InvalidValue = Assert<Equal<ValueOf<Invalid>, never>>;

type HeroAttackState = State<readonly ["3a2c53c8", "68425992", "ad76e3ae", "c01cdf37"]>;
type HeroAttack = Evaluate<"d20+5", StateOf<Initiative>>;
type _HeroAttack = Assert<Equal<HeroAttack, DiceSuccess<{
  readonly total: 23;
  readonly rollTrace: [DieSample<20, 18>];
  readonly nextState: HeroAttackState;
}>>>;

type HeroDamageState = State<readonly ["995f11db", "7e83a8ff", "b048a90b", "6e25b059"]>;
type HeroDamage = Evaluate<"2d6+3", StateOf<HeroAttack>>;
type _HeroDamage = Assert<Equal<HeroDamage, DiceSuccess<{
  readonly total: 15;
  readonly rollTrace: [DieSample<6, 6>, DieSample<6, 6>];
  readonly nextState: HeroDamageState;
}>>>;

type MonsterAttackState = State<readonly ["89f9097d", "5794102f", "2e4646d0", "30c53085"]>;
type MonsterAttack = Evaluate<"d20+4", StateOf<HeroDamage>>;
type _MonsterAttack = Assert<Equal<MonsterAttack, DiceSuccess<{
  readonly total: 23;
  readonly rollTrace: [DieSample<20, 19>];
  readonly nextState: MonsterAttackState;
}>>>;

type MonsterDamageState = State<readonly ["eea829d7", "f02b5f82", "8f9f11ad", "8905533a"]>;
type MonsterDamage = Evaluate<"d8+2", StateOf<MonsterAttack>>;
type _MonsterDamage = Assert<Equal<MonsterDamage, DiceSuccess<{
  readonly total: 7;
  readonly rollTrace: [DieSample<8, 5>];
  readonly nextState: MonsterDamageState;
}>>>;

type HealingState = State<readonly ["76ff815e", "31127eed", "98c1e915", "cd218f0b"]>;
type Healing = Evaluate<"2d4+2", StateOf<MonsterDamage>>;
type _Healing = Assert<Equal<Healing, DiceSuccess<{
  readonly total: 10;
  readonly rollTrace: [DieSample<4, 4>, DieSample<4, 4>];
  readonly nextState: HealingState;
}>>>;

/* Replay starts from the same Seed and therefore reproduces the whole chain. */
type _Replay = Assert<Equal<Initialize<Seed>, PrngSuccess<InitialState>>>;
