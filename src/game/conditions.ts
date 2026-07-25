import type { ConditionState, ConditionKey } from "./types";

// UI 側（ConditionBadges）が色ごとに固定クラス名を持つため、色はここで列挙する
export type ConditionColor = "orange" | "green";

export interface ConditionDefinition {
  key: ConditionKey;
  label: string;
  shortLabel: string;
  color: ConditionColor;
  decaysPerTurn: boolean;
}

export const CONDITION_DEFINITIONS: Record<
  ConditionKey,
  ConditionDefinition
> = {
  vulnerable: {
    key: "vulnerable",
    label: "Vulnerable",
    shortLabel: "Vul",
    color: "orange",
    decaysPerTurn: true,
  },
  weak: {
    key: "weak",
    label: "Weak",
    shortLabel: "Wk",
    color: "green",
    decaysPerTurn: true,
  },
};

export function initConditionState(): ConditionState {
  return { vulnerable: 0, weak: 0 };
}
