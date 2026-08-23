import type { ConditionKey } from "@/game/types";

// 色ごとに固定クラス名を持つため、色はここで列挙する（COLOR_CLASSES 参照）
export type ConditionColor = "orange" | "green" | "purple";

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
  // --- パワー（プレイヤーのみが持つ）---
  destroyer: {
    label: "壊す ﾆﾔﾘ",
    shortLabel: "壊す",
    color: "purple",
  },
  powerless: {
    label: "あまりに無力な存在",
    shortLabel: "無力",
    color: "purple",
  },
  own_folly: {
    label: "おのれの愚かさ今知る！",
    shortLabel: "愚かさ",
    color: "purple",
  },
  breaking: {
    label: "壊れる…",
    shortLabel: "壊れる",
    color: "purple",
  },
  desire: {
    label: "人は欲望と共にある",
    shortLabel: "欲望",
    color: "purple",
  },
  farewell_desire: {
    label: "欲望よさらば",
    shortLabel: "さらば",
    color: "purple",
  },
};
