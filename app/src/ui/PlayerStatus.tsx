"use client";

import type { PlayerState } from "@/src/game/types";

interface Props {
  player: PlayerState;
}

export default function PlayerStatus({ player }: Props) {
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
      </div>
      <div className="flex gap-2 text-xs">
        {player.statusEffects.vulnerable > 0 && (
          <span className="rounded bg-orange-900 px-1.5 py-0.5 text-orange-300">
            Vulnerable {player.statusEffects.vulnerable}
          </span>
        )}
        {player.statusEffects.weak > 0 && (
          <span className="rounded bg-green-900 px-1.5 py-0.5 text-green-300">
            Weak {player.statusEffects.weak}
          </span>
        )}
      </div>
    </div>
  );
}
