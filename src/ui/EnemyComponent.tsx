"use client";

import { STATUS_EFFECT_DEFINITIONS } from "@/game/statusEffects";
import type { EnemyState } from "@/game/types";
import StatusEffectBadges from "./StatusEffectBadges";

interface Props {
  enemy: EnemyState;
  isTargeting: boolean;
  onTarget: () => void;
}

function intentLabel(intent: EnemyState["currentIntent"]): string {
  switch (intent.type) {
    case "attack":
      return `Attack ${intent.damage}`;
    case "defend":
      return `Defend ${intent.block}`;
    case "debuff":
      return `${STATUS_EFFECT_DEFINITIONS[intent.effect].label} ${intent.value}`;
  }
}

function intentColor(type: string): string {
  switch (type) {
    case "attack":
      return "text-red-400";
    case "defend":
      return "text-blue-400";
    case "debuff":
      return "text-purple-400";
    default:
      return "text-zinc-400";
  }
}

export default function EnemyComponent({
  enemy,
  isTargeting,
  onTarget,
}: Props) {
  const hpPercent = Math.max(0, (enemy.hp / enemy.maxHp) * 100);

  return (
    <button
      type="button"
      onClick={onTarget}
      disabled={!isTargeting}
      className={`flex w-40 flex-col items-center gap-2 rounded-lg border-2 p-4 transition-colors animate-fade-in ${
        isTargeting
          ? "cursor-pointer border-yellow-400 bg-zinc-800 hover:bg-zinc-700"
          : "cursor-default border-zinc-700 bg-zinc-800"
      }`}
    >
      <div className="text-3xl">
        {enemy.definitionId === "jaw_worm" ? "🐛" : "🪲"}
      </div>
      <div className="text-sm font-bold text-zinc-200">{enemy.name}</div>

      {/* HP bar */}
      <div className="h-2 w-full rounded-full bg-zinc-700">
        <div
          className="h-2 rounded-full bg-red-500 transition-all"
          style={{ width: `${hpPercent}%` }}
        />
      </div>
      <div className="text-xs text-zinc-400">
        HP {enemy.hp}/{enemy.maxHp}
      </div>

      {enemy.block > 0 && (
        <div className="text-xs text-blue-400">Block {enemy.block}</div>
      )}

      {/* Status effects */}
      <div className="flex gap-1 text-xs">
        <StatusEffectBadges
          statusEffects={enemy.statusEffects}
          variant="short"
        />
      </div>

      {/* Intent */}
      <div
        className={`text-xs font-medium ${intentColor(enemy.currentIntent.type)}`}
      >
        Intent: {intentLabel(enemy.currentIntent)}
      </div>
    </button>
  );
}
