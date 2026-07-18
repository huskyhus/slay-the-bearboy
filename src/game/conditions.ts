import { GAME_CONFIG } from "./config";
import type { ConditionState, ConditionType } from "./types";

export interface ConditionDefinition {
  key: ConditionType;
  label: string;
  shortLabel: string;
  color: string;
  decaysPerTurn: boolean;
  damageMultiplier?: { role: "attacker" | "defender"; value: number };
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
    damageMultiplier: {
      role: "defender",
      value: GAME_CONFIG.combat.vulnerableMultiplier,
    },
  },
  weak: {
    key: "weak",
    label: "Weak",
    shortLabel: "Wk",
    color: "green",
    decaysPerTurn: true,
    damageMultiplier: {
      role: "attacker",
      value: GAME_CONFIG.combat.weakMultiplier,
    },
  },
};

export function initConditionState(): ConditionState {
  return { vulnerable: 0, weak: 0 };
}
