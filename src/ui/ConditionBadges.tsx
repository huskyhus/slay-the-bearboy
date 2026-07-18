import { CONDITION_DEFINITIONS } from "@/game/conditions";
import type { ConditionState } from "@/game/types";

// Tailwindはクラス名を静的解析するため、`bg-${color}-900` のような動的クラス名は
// 本番ビルドでパージされる可能性がある。色ごとに固定クラス名を用意する。
const COLOR_CLASSES: Record<string, string> = {
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
      {Object.values(CONDITION_DEFINITIONS).map((def) => {
        const value = conditions[def.key];
        if (value <= 0) return null;
        const label = variant === "short" ? def.shortLabel : def.label;
        return (
          <span
            key={def.key}
            className={`rounded px-1.5 py-0.5 ${COLOR_CLASSES[def.color]}`}
          >
            {label} {value}
          </span>
        );
      })}
    </>
  );
}
