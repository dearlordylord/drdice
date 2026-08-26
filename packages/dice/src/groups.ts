import { sample, validateState } from "@drdice/prng";
import type { BoundedResult, GeneratorState, ValidateStateResult } from "@drdice/prng";

export const DICE_GROUP_SEMANTIC_PROFILE =
  "dice-groups-v1/ordered-atomic-rejection-5-blocks-x-5-attempts" as const;
export const DICE_GROUP_SEMANTIC_VERSION = 1 as const;

export const DICE_GROUP_LIMITS = Object.freeze({
  groupCount: 10_000,
  dieSampleCount: 10_000,
  supportedSideCount: 100,
  rejectionSamplingBlocks: 5,
  rejectionSamplingAttemptsPerBlock: 5,
});

export type DiceGroup = {
  readonly count: number;
  readonly sideCount: number;
};

export type SampledDiceGroup = {
  readonly sideCount: number;
  readonly faces: readonly [number, ...number[]];
};

export type DiceGroupSampling = {
  readonly groups: readonly [SampledDiceGroup, ...SampledDiceGroup[]];
  readonly nextState: GeneratorState;
};

type GeneratorStateFailure = Exclude<ValidateStateResult, { readonly ok: true }>;

export type DiceGroupInputFailure =
  | {
      readonly ok: false;
      readonly code: "invalid-dice-groups";
      readonly details: { readonly reason: "expected-non-empty-array" };
    }
  | {
      readonly ok: false;
      readonly code: "invalid-dice-group";
      readonly details: {
        readonly groupIndex: number;
        readonly reason:
          | "expected-object"
          | "count-must-be-positive-integer"
          | "side-count-must-be-positive-integer";
      };
    };

export type DiceGroupResourceFailure =
  | {
      readonly ok: false;
      readonly code: "resource-limit-exceeded";
      readonly details: {
        readonly dimension: "group-count";
        readonly limit: number;
        readonly actual: number;
      };
    }
  | {
      readonly ok: false;
      readonly code: "resource-limit-exceeded";
      readonly details: {
        readonly dimension: "die-sample-count" | "supported-side-count";
        readonly limit: number;
        readonly actual: number;
        readonly groupIndex: number;
      };
    };

export type DiceGroupSamplingExhausted = {
  readonly ok: false;
  readonly code: "sampling-attempts-exhausted";
  readonly details: {
    readonly groupIndex: number;
    readonly sampleIndex: number;
    readonly attempts: number;
  };
};

export type DiceGroupSamplingFailure =
  | GeneratorStateFailure
  | DiceGroupInputFailure
  | DiceGroupResourceFailure
  | DiceGroupSamplingExhausted;

export type DiceGroupSamplingResult =
  | { readonly ok: true; readonly value: DiceGroupSampling }
  | DiceGroupSamplingFailure;

type DiceGroupBlockSampler = (
  state: GeneratorState,
  bound: number,
  maximumAttempts: number,
) => BoundedResult;

type DiceGroupFaceResult =
  | {
      readonly ok: true;
      readonly value: { readonly face: number; readonly nextState: GeneratorState };
    }
  | DiceGroupSamplingExhausted;

const failure = <Code extends DiceGroupSamplingFailure["code"], const Details>(
  code: Code,
  details: Details,
): { readonly ok: false; readonly code: Code; readonly details: Details } => ({ ok: false, code, details });

const isRecord = (value: unknown): value is Record<PropertyKey, unknown> =>
  typeof value === "object" && value !== null;

type DiceGroupValidationResult =
  | { readonly ok: true; readonly value: readonly DiceGroup[] }
  | DiceGroupInputFailure
  | DiceGroupResourceFailure;

const validateGroups = (input: unknown): DiceGroupValidationResult => {
  if (!Array.isArray(input) || input.length === 0) {
    return failure("invalid-dice-groups", { reason: "expected-non-empty-array" });
  }
  if (input.length > DICE_GROUP_LIMITS.groupCount) {
    return failure("resource-limit-exceeded", {
      dimension: "group-count",
      limit: DICE_GROUP_LIMITS.groupCount,
      actual: input.length,
    });
  }

  let sampleCount = 0;
  const groups: DiceGroup[] = [];
  for (let groupIndex = 0; groupIndex < input.length; groupIndex += 1) {
    const group = input[groupIndex];
    if (!isRecord(group)) {
      return failure("invalid-dice-group", { groupIndex, reason: "expected-object" });
    }
    const count = group.count;
    const sideCount = group.sideCount;
    if (!Number.isInteger(count) || (count as number) < 1) {
      return failure("invalid-dice-group", { groupIndex, reason: "count-must-be-positive-integer" });
    }
    if (!Number.isInteger(sideCount) || (sideCount as number) < 1) {
      return failure("invalid-dice-group", { groupIndex, reason: "side-count-must-be-positive-integer" });
    }
    if ((sideCount as number) > DICE_GROUP_LIMITS.supportedSideCount) {
      return failure("resource-limit-exceeded", {
        dimension: "supported-side-count",
        limit: DICE_GROUP_LIMITS.supportedSideCount,
        actual: sideCount as number,
        groupIndex,
      });
    }
    sampleCount += count as number;
    if (sampleCount > DICE_GROUP_LIMITS.dieSampleCount) {
      return failure("resource-limit-exceeded", {
        dimension: "die-sample-count",
        limit: DICE_GROUP_LIMITS.dieSampleCount,
        actual: sampleCount,
        groupIndex,
      });
    }
    groups.push({ count: count as number, sideCount: sideCount as number });
  }
  return { ok: true, value: groups };
};

/** @internal Exercise bounded-block orchestration without changing the public API. */
export const sampleGroupFaceInBlocks = (
  groupIndex: number,
  sampleIndex: number,
  initialState: GeneratorState,
  sideCount: number,
  sampleBlock: DiceGroupBlockSampler,
): DiceGroupFaceResult => {
  let current = initialState;
  let sampled = sampleBlock(
    current,
    sideCount,
    DICE_GROUP_LIMITS.rejectionSamplingAttemptsPerBlock,
  );
  let blocks = 1;
  while (!sampled.ok && sampled.code === "sampling-attempts-exhausted"
    && blocks < DICE_GROUP_LIMITS.rejectionSamplingBlocks) {
    current = sampled.details.state;
    sampled = sampleBlock(
      current,
      sideCount,
      DICE_GROUP_LIMITS.rejectionSamplingAttemptsPerBlock,
    );
    blocks += 1;
  }
  if (!sampled.ok) {
    return failure("sampling-attempts-exhausted", {
      groupIndex,
      sampleIndex,
      attempts: blocks * DICE_GROUP_LIMITS.rejectionSamplingAttemptsPerBlock,
    });
  }
  return {
    ok: true,
    value: { face: sampled.value.value + 1, nextState: sampled.value.state },
  };
};

/** Sample ordered Dice Groups atomically using the Dice Group Semantic Profile. */
export const sampleDiceGroups = (
  groupsInput: readonly DiceGroup[],
  stateInput: unknown,
): DiceGroupSamplingResult => {
  const validatedGroups = validateGroups(groupsInput);
  if (!validatedGroups.ok) return validatedGroups;
  const groups = validatedGroups.value;

  const validatedState = validateState(stateInput);
  if (!validatedState.ok) return validatedState;

  let current: GeneratorState = validatedState.value;
  const sampledGroups: SampledDiceGroup[] = [];

  for (let groupIndex = 0; groupIndex < groups.length; groupIndex += 1) {
    const group = groups[groupIndex];
    const faces: number[] = [];
    for (let sampleIndex = 0; sampleIndex < group.count; sampleIndex += 1) {
      const sampled = sampleGroupFaceInBlocks(
        groupIndex,
        sampleIndex,
        current,
        group.sideCount,
        sample,
      );
      if (!sampled.ok) return sampled;
      current = sampled.value.nextState;
      faces.push(sampled.value.face);
    }
    sampledGroups.push({
      sideCount: group.sideCount,
      faces: faces as [number, ...number[]],
    });
  }

  return {
    ok: true,
    value: {
      groups: sampledGroups as [SampledDiceGroup, ...SampledDiceGroup[]],
      nextState: current,
    },
  };
};
