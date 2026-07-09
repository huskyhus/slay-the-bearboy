import { GAME_CONFIG } from "./config";
import type { StatusEffectKey } from "./types";

export interface StatusEffectDefinition {
  key: StatusEffectKey;
  label: string;
  shortLabel: string;
  color: string;
  decaysPerTurn: boolean;
  damageMultiplier?: { role: "attacker" | "defender"; value: number };
}

export const STATUS_EFFECT_DEFINITIONS: Record<
  StatusEffectKey,
  StatusEffectDefinition
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

// STATUS_EFFECT_DEFINITIONS は Record<StatusEffectKey, ...> 型なので、
// StatusEffectKey の全キーを持つことが型で保証されている。
export const STATUS_EFFECT_KEYS = Object.keys(
  STATUS_EFFECT_DEFINITIONS,
) as StatusEffectKey[];
