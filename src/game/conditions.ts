import type { ConditionState, ConditionType } from "./types";

export interface ConditionDefinition {
  key: ConditionType;
  label: string;
  shortLabel: string;
  color: string;
  decaysPerTurn: boolean;
}

export const CONDITION_DEFINITIONS: Record<
  ConditionType,
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
