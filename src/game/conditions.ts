import type { ConditionState, ConditionKey } from "./types";

interface ConditionRule {
  decaysPerTurn: boolean;
}

export const CONDITION_RULES: Record<ConditionKey, ConditionRule> = {
  vulnerable: {
    decaysPerTurn: true,
  },
  weak: {
    decaysPerTurn: true,
  },
};

export function conditionKeys(): ConditionKey[] {
  return Object.keys(CONDITION_RULES) as ConditionKey[];
}

export function initConditionState(): ConditionState {
  return { vulnerable: 0, weak: 0 };
}

export function applyCondition(
  conditions: ConditionState,
  key: ConditionKey,
  value: number,
): ConditionState {
  return { ...conditions, [key]: conditions[key] + value };
}

export function tickConditionState(conditions: ConditionState): ConditionState {
  const result = { ...conditions };
  for (const key of conditionKeys()) {
    if (CONDITION_RULES[key].decaysPerTurn) {
      result[key] = Math.max(0, result[key] - 1);
    }
  }
  return result;
}
