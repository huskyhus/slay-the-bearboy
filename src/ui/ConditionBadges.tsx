import { conditionKeys } from "@/game/conditions";
import type { ConditionState } from "@/game/types";
import { CONDITION_STYLES, type ConditionColor } from "./conditionStyles";

// Tailwindはクラス名を静的解析するため、`bg-${color}-900` のような動的クラス名は
// 本番ビルドでパージされる可能性がある。色ごとに固定クラス名を用意する。
const COLOR_CLASSES: Record<ConditionColor, string> = {
  orange: "bg-orange-900 text-orange-300",
  green: "bg-green-900 text-green-300",
};

interface Props {
  conditions: ConditionState;
  variant?: "full" | "short";
}

export default function ConditionBadges({
  conditions,
  variant = "full",
}: Props) {
  return (
    <>
      {conditionKeys().map((key) => {
        const value = conditions[key];
        if (value <= 0) return null;
        const style = CONDITION_STYLES[key];
        const label = variant === "short" ? style.shortLabel : style.label;
        return (
          <span
            key={key}
            className={`rounded px-1.5 py-0.5 ${COLOR_CLASSES[style.color]}`}
          >
            {label} {value}
          </span>
        );
      })}
    </>
  );
}
