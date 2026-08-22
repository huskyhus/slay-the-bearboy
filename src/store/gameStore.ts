import { create } from "zustand";
import type { CardDefinition, CombatState, EnemyDefinition } from "@/game/types";
import {
  initCombat,
  playCard,
  canPlayCard,
  endPlayerTurn,
  executeEnemyTurn,
} from "@/game/combat";
import { needsTarget, hasAoeEffect } from "@/game/cards";
import { createRandomSeed } from "@/game/rng";
import cardsData from "@/data/cards.json";
import enemiesData from "@/data/enemies.json";
import { selectStarterDeck } from "@/game/deck";

const cardDefs: CardDefinition[] = cardsData as CardDefinition[];
const enemyDefs: EnemyDefinition[] = enemiesData as EnemyDefinition[];

const cardDefsMap = new Map(cardDefs.map((c) => [c.id, c]));
const enemyDefsMap = new Map(enemyDefs.map((e) => [e.id, e]));

export function getCardDef(id: string): CardDefinition | undefined {
  return cardDefsMap.get(id);
}

interface GameStore {
  combat: CombatState | null;
  selectedCardInstanceId: string | null;

  startCombat: (seed?: number) => void;
  selectCard: (instanceId: string) => void;
  deselectCard: () => void;
  targetEnemy: (enemyId: string) => void;
  endTurn: () => void;
}

export const useGameStore = create<GameStore>((set, get) => {
  const playAndDeselect = (
    combat: CombatState,
    instanceId: string,
    targetEnemyId: string | null,
  ) => {
    set({
      combat: playCard(combat, instanceId, targetEnemyId, cardDefsMap),
      selectedCardInstanceId: null,
    });
  };

  return {
    combat: null,
    selectedCardInstanceId: null,

    // シードの生成は`createRandomSeed()`に集約する．
    // `seed`を明示すれば，同じ戦闘を再現できる．
    startCombat: (seed: number = createRandomSeed()) => {
      set({
        combat: initCombat(selectStarterDeck(cardDefs), enemyDefs, seed),
        selectedCardInstanceId: null,
      });
    },

    selectCard: (instanceId: string) => {
      const { combat } = get();
      if (!combat) return;

      const card = combat.hand.find((c) => c.instanceId === instanceId);
      if (!card) return;
      const def = cardDefsMap.get(card.definitionId);
      if (!def || !canPlayCard(combat, def)) return;

      // If card doesn't need a target (no single-target effects or is AOE-only), play immediately
      if (!needsTarget(def) || hasAoeEffect(def)) {
        // For AOE cards with debuffs (like Thunderclap), apply to all
        playAndDeselect(combat, instanceId, null);
        return;
      }

      // If only one enemy alive, auto-target
      if (combat.enemies.length === 1) {
        playAndDeselect(combat, instanceId, combat.enemies[0].id);
        return;
      }

      set({ selectedCardInstanceId: instanceId });
    },

    deselectCard: () => {
      set({ selectedCardInstanceId: null });
    },

    targetEnemy: (enemyId: string) => {
      const { combat, selectedCardInstanceId } = get();
      if (!combat || !selectedCardInstanceId) return;

      playAndDeselect(combat, selectedCardInstanceId, enemyId);
    },

    endTurn: () => {
      const { combat } = get();
      if (!combat || combat.phase !== "player_turn") return;

      const afterEnd = endPlayerTurn(combat);
      const afterEnemies = executeEnemyTurn(afterEnd, enemyDefsMap);
      set({ combat: afterEnemies, selectedCardInstanceId: null });
    },
  };
});
