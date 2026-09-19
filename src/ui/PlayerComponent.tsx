"use client";

import type { PlayerState } from "@/game/types";
import ConditionBadges from "./ConditionBadges";

interface Props {
  player: PlayerState;
}

export default function PlayerComponent({ player }: Props) {
  return (
    <div className="flex items-center gap-4 rounded-lg bg-zinc-800 px-4 py-3">
      <div className="text-sm font-bold text-zinc-200">Hasu-kun</div>
      <div className="flex items-center gap-3 text-sm">
        <span className="text-red-400">
          HP {player.hp}/{player.maxHp}
        </span>
        {player.block > 0 && (
          <span className="text-blue-400">Block {player.block}</span>
        )}
        <span className="text-yellow-400">Energy {player.energy}</span>
        <span className="text-purple-400">座禅 {player.zen}</span>
      </div>
      <div className="flex gap-2 text-xs">
        <ConditionBadges conditions={player.conditions} />
      </div>
    </div>
  );
}
