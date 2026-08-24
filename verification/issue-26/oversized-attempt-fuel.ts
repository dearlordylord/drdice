import type { GeneratorState } from "@drdice/prng";
import type { Evaluate, Failure } from "@drdice/dice";

type Equal<Left, Right> =
  (<Value>() => Value extends Left ? 1 : 2) extends
  (<Value>() => Value extends Right ? 1 : 2) ? true : false;
type Assert<Value extends true> = Value;

type State = GeneratorState<readonly ["00000001", "00000002", "00000003", "00000004"]>;
type Actual = Evaluate<"d6", State, 1000000>;
type Expected = Failure<"resource-limit-exceeded", {
  readonly kind: "resource";
  readonly code: "resource-limit-exceeded";
  readonly offset: 0;
  readonly dimension: "rejection-sampling-attempts";
  readonly limit: 5;
  readonly actual: 1000000;
}>;

export type OversizedAttemptFuelIsStructured = Assert<Equal<Actual, Expected>>;
