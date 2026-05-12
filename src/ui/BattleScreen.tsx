"use client";

import { useGameStore, getCardDef } from "@/src/store/gameStore";
import PlayerStatus from "./PlayerStatus";
import EnemyComponent from "./EnemyComponent";
import CardComponent from "./CardComponent";

export default function BattleScreen() {
  const combat = useGameStore((s) => s.combat);
  const selectedCardInstanceId = useGameStore((s) => s.selectedCardInstanceId);
  const selectCard = useGameStore((s) => s.selectCard);
  const deselectCard = useGameStore((s) => s.deselectCard);
  const targetEnemy = useGameStore((s) => s.targetEnemy);
  const endTurn = useGameStore((s) => s.endTurn);
  const startCombat = useGameStore((s) => s.startCombat);

  if (!combat) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <button
          type="button"
          onClick={startCombat}
          className="rounded-lg bg-red-700 px-8 py-4 text-lg font-bold text-white hover:bg-red-600"
        >
          Start Battle
        </button>
      </div>
    );
  }

  if (combat.phase === "victory" || combat.phase === "defeat") {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-6">
        <h2 className="text-4xl font-bold">
          {combat.phase === "victory" ? (
            <span className="text-yellow-400">Victory!</span>
          ) : (
            <span className="text-red-500">Defeat...</span>
          )}
        </h2>
        <p className="text-zinc-400">
          {combat.phase === "victory"
            ? "All enemies defeated!"
            : "Hasu-kun has fallen..."}
        </p>
        <div className="text-sm text-zinc-500">
          Turns: {combat.turn} | Remaining HP: {Math.max(0, combat.player.hp)}/
          {combat.player.maxHp}
        </div>
        <button
          type="button"
          onClick={startCombat}
          className="rounded-lg bg-zinc-700 px-6 py-3 font-bold text-white hover:bg-zinc-600"
        >
          Play Again
        </button>
      </div>
    );
  }

  const isTargeting = selectedCardInstanceId !== null;

  return (
    <div
      className="flex flex-1 flex-col"
      onClick={(e) => {
        if (e.target === e.currentTarget && isTargeting) {
          deselectCard();
        }
      }}
    >
      {/* Turn info */}
      <div className="flex items-center justify-between px-6 py-3">
        <div className="text-sm text-zinc-500">Turn {combat.turn}</div>
        {isTargeting && (
          <div className="text-sm font-medium text-yellow-400">
            Select a target enemy
          </div>
        )}
        <button
          type="button"
          onClick={endTurn}
          disabled={combat.phase !== "player_turn"}
          className="rounded-lg bg-zinc-700 px-4 py-2 text-sm font-bold text-white hover:bg-zinc-600 disabled:opacity-50"
        >
          End Turn
        </button>
      </div>

      {/* Enemies */}
      <div className="flex flex-1 items-center justify-center gap-6">
        {combat.enemies.map((enemy) => (
          <EnemyComponent
            key={enemy.id}
            enemy={enemy}
            isTargeting={isTargeting}
            onTarget={() => targetEnemy(enemy.id)}
          />
        ))}
      </div>

      {/* Player status */}
      <div className="px-6 py-2">
        <PlayerStatus player={combat.player} />
      </div>

      {/* Hand */}
      <div className="flex items-end justify-center gap-2 px-6 pb-6 pt-2">
        {combat.hand.map((card) => {
          const def = getCardDef(card.definitionId);
          if (!def) return null;
          return (
            <CardComponent
              key={card.instanceId}
              def={def}
              instanceId={card.instanceId}
              isSelected={card.instanceId === selectedCardInstanceId}
              isPlayable={
                combat.phase === "player_turn" &&
                combat.player.energy >= def.cost
              }
              onSelect={() => selectCard(card.instanceId)}
            />
          );
        })}
      </div>

      {/* Deck info */}
      <div className="flex justify-center gap-4 pb-4 text-xs text-zinc-600">
        <span>Deck: {combat.deck.length}</span>
        <span>Discard: {combat.discard.length}</span>
        <span>Exhaust: {combat.exhaust.length}</span>
      </div>
    </div>
  );
}
