import type { ConditionState, ConditionKey } from "./types";

interface ConditionRule {
  key: ConditionKey;
  decaysPerTurn: boolean;
}

export const CONDITION_RULES: Record<ConditionKey, ConditionRule> = {
  vulnerable: {
    key: "vulnerable",
    decaysPerTurn: true,
  },
  weak: {
    key: "weak",
    decaysPerTurn: true,
  },
};

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
  for (const rule of Object.values(CONDITION_RULES)) {
    if (rule.decaysPerTurn) {
      result[rule.key] = Math.max(0, result[rule.key] - 1);
    }
  }
  return result;
}
