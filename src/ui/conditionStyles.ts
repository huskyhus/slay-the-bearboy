import type { ConditionKey } from "@/game/types";

// 色ごとに固定クラス名を持つため、色はここで列挙する（COLOR_CLASSES 参照）
export type ConditionColor = "orange" | "green";

interface ConditionStyle {
  label: string;
  shortLabel: string;
  color: ConditionColor;
}

export const CONDITION_STYLES: Record<ConditionKey, ConditionStyle> = {
  vulnerable: {
    label: "Vulnerable",
    shortLabel: "Vul",
    color: "orange",
  },
  weak: {
    label: "Weak",
    shortLabel: "Wk",
    color: "green",
  },
};
