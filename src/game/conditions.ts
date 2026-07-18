import { GAME_CONFIG } from "./config";
import type { ConditionType } from "./types";

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

// CONDITION_DEFINITIONS は Record<ConditionType, ...> 型なので、
// ConditionType の全キーを持つことが型で保証されている。
export const CONDITION_KEYS = Object.keys(
  CONDITION_DEFINITIONS,
) as ConditionType[];
