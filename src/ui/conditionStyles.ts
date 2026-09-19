import { GAME_CONFIG } from "@/game/config";
import type { ConditionKey } from "@/game/types";

// 色ごとに固定クラス名を持つため、色はここで列挙する（COLOR_CLASSES 参照）
export type ConditionColor = "orange" | "green" | "purple";

interface ConditionStyle {
  label: string;
  shortLabel: string;
  color: ConditionColor;
  description: string; // ホバー時のツールチップに出す効果の説明。
}

export const CONDITION_STYLES: Record<ConditionKey, ConditionStyle> = {
  vulnerable: {
    label: "Vulnerable",
    shortLabel: "Vul",
    color: "orange",
    description: `受けるダメージが ${GAME_CONFIG.combat.vulnerableMultiplier} 倍になる（端数切捨て）。`,
  },
  weak: {
    label: "Weak",
    shortLabel: "Wk",
    color: "green",
    description: `与えるダメージが ${GAME_CONFIG.combat.weakMultiplier} 倍になる（端数切捨て）。`,
  },
  // --- パワー（プレイヤーのみが持つ）---
  destroyer: {
    label: "壊す ﾆﾔﾘ",
    shortLabel: "壊す",
    color: "purple",
    description: "敵にダメージを与えるたび、座禅が増える。",
  },
  powerless: {
    label: "あまりに無力な存在",
    shortLabel: "無力",
    color: "purple",
    description:
      "ブロックを持つ敵にダメージを与えるたび、座禅が増える。",
  },
  own_folly: {
    label: "おのれの愚かさ今知る！",
    shortLabel: "愚かさ",
    color: "purple",
    description: "敵の攻撃でHPが減るたび、座禅が増える。",
  },
  breaking: {
    label: "壊れる…",
    shortLabel: "壊れる",
    color: "purple",
    description:
      "ブロックがある状態で敵の攻撃を受けるたび、座禅が増える。",
  },
  desire: {
    label: "人は欲望と共にある",
    shortLabel: "欲望",
    color: "purple",
    description: "カードを1枚引くたび、座禅が増える。",
  },
  farewell_desire: {
    label: "欲望よさらば",
    shortLabel: "さらば",
    color: "purple",
    description: "カードを1枚捨て札に送るたび、座禅が増える。",
  },
};
