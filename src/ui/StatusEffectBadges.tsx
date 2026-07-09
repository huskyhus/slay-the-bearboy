import {
  STATUS_EFFECT_DEFINITIONS,
  STATUS_EFFECT_KEYS,
} from "@/game/statusEffects";
import type { StatusEffects } from "@/game/types";

// Tailwindはクラス名を静的解析するため、`bg-${color}-900` のような動的クラス名は
// 本番ビルドでパージされる可能性がある。色ごとに固定クラス名を用意する。
const COLOR_CLASSES: Record<string, string> = {
  orange: "bg-orange-900 text-orange-300",
  green: "bg-green-900 text-green-300",
};

interface Props {
  statusEffects: StatusEffects;
  variant?: "full" | "short";
}

export default function StatusEffectBadges({
  statusEffects,
  variant = "full",
}: Props) {
  return (
    <>
      {STATUS_EFFECT_KEYS.map((key) => {
        const value = statusEffects[key];
        if (value <= 0) return null;
        const def = STATUS_EFFECT_DEFINITIONS[key];
        const label = variant === "short" ? def.shortLabel : def.label;
        return (
          <span
            key={key}
            className={`rounded px-1.5 py-0.5 ${COLOR_CLASSES[def.color]}`}
          >
            {label} {value}
          </span>
        );
      })}
    </>
  );
}
