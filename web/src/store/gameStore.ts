import { create } from "zustand";
import type { CardDefinition, CombatState, EnemyDefinition } from "@/src/game/types";
import {
  initCombat,
  playCard,
  endPlayerTurn,
  executeEnemyTurn,
  needsTarget,
  hasAoeEffect,
} from "@/src/game/combat";
import cardsData from "@/data/cards.json";
import enemiesData from "@/data/enemies.json";

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

  startCombat: () => void;
  selectCard: (instanceId: string) => void;
  deselectCard: () => void;
  targetEnemy: (enemyId: string) => void;
  playSelectedCard: (targetEnemyId: string | null) => void;
  endTurn: () => void;
}

export const useGameStore = create<GameStore>((set, get) => ({
  combat: null,
  selectedCardInstanceId: null,

  startCombat: () => {
    set({
      combat: initCombat(cardDefs, enemyDefs),
      selectedCardInstanceId: null,
    });
  },

  selectCard: (instanceId: string) => {
    const { combat } = get();
    if (!combat || combat.phase !== "player_turn") return;

    const card = combat.hand.find((c) => c.instanceId === instanceId);
    if (!card) return;
    const def = cardDefsMap.get(card.definitionId);
    if (!def || def.cost > combat.player.energy) return;

    // If card doesn't need a target (no single-target effects or is AOE-only), play immediately
    if (!needsTarget(def) || hasAoeEffect(def)) {
      // For AOE cards with debuffs (like Thunderclap), apply to all
      const state = playCard(combat, instanceId, null, cardDefsMap);
      set({ combat: state, selectedCardInstanceId: null });
      return;
    }

    // If only one enemy alive, auto-target
    if (combat.enemies.length === 1) {
      const state = playCard(
        combat,
        instanceId,
        combat.enemies[0].id,
        cardDefsMap,
      );
      set({ combat: state, selectedCardInstanceId: null });
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

    const state = playCard(
      combat,
      selectedCardInstanceId,
      enemyId,
      cardDefsMap,
    );
    set({ combat: state, selectedCardInstanceId: null });
  },

  playSelectedCard: (targetEnemyId: string | null) => {
    const { combat, selectedCardInstanceId } = get();
    if (!combat || !selectedCardInstanceId) return;

    const state = playCard(
      combat,
      selectedCardInstanceId,
      targetEnemyId,
      cardDefsMap,
    );
    set({ combat: state, selectedCardInstanceId: null });
  },

  endTurn: () => {
    const { combat } = get();
    if (!combat || combat.phase !== "player_turn") return;

    const afterEnd = endPlayerTurn(combat);
    const afterEnemies = executeEnemyTurn(afterEnd, enemyDefsMap);
    set({ combat: afterEnemies, selectedCardInstanceId: null });
  },
}));
