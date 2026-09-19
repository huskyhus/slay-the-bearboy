import { CONDITION_RULES, conditionKeys } from "@/game/conditions";
import type { ConditionState } from "@/game/types";
import { CONDITION_STYLES, type ConditionColor } from "./conditionStyles";

// Tailwindはクラス名を静的解析するため、`bg-${color}-900` のような動的クラス名は
// 本番ビルドでパージされる可能性がある。色ごとに固定クラス名を用意する。
const COLOR_CLASSES: Record<ConditionColor, string> = {
  orange: "bg-orange-900 text-orange-300",
  green: "bg-green-900 text-green-300",
  purple: "bg-purple-900 text-purple-300",
};

function durationText(decaysPerTurn: boolean): string {
  return decaysPerTurn
    ? "ターン終了時に1減少する。"
    : "戦闘が終わるまで持続する。";
}

interface Props {
  conditions: ConditionState;
}

export default function ConditionBadges({ conditions }: Props) {
  return (
    <>
      {conditionKeys().map((key) => {
        const value = conditions[key];
        if (value <= 0) return null;
        const style = CONDITION_STYLES[key];
        return (
          <span key={key} className="group relative inline-block">
            <span
              className={`inline-block rounded px-1.5 py-0.5 ${COLOR_CLASSES[style.color]}`}
            >
              {style.label} {value}
            </span>
            <span
              role="tooltip"
              className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-1.5 hidden w-52 -translate-x-1/2 rounded-md border border-zinc-600 bg-zinc-900 px-2 py-1.5 text-left text-[11px] leading-snug font-normal text-zinc-200 shadow-lg group-hover:block"
            >
              <span className="block font-bold text-zinc-100">
                {style.label}
              </span>
              <span className="mt-0.5 block text-zinc-300">
                {style.description}
              </span>
              <span className="mt-0.5 block text-zinc-400">
                {durationText(CONDITION_RULES[key].decaysPerTurn)}
              </span>
            </span>
          </span>
        );
      })}
    </>
  );
}
