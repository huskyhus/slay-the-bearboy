import { GAME_CONFIG } from "./config";
import type { CardInstance, CombatState } from "./types";

let nextInstanceId = 0;

export function createCardInstance(definitionId: string): CardInstance {
  return { instanceId: String(nextInstanceId++), definitionId };
}

export function resetInstanceIdCounter(): void {
  nextInstanceId = 0;
}

export function shuffle<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export function drawCards(state: CombatState, count: number): CombatState {
  let deck = [...state.deck];
  const hand = [...state.hand];
  let discard = [...state.discard];
  const { maxHandSize } = GAME_CONFIG.player;

  for (let i = 0; i < count; i++) {
    if (hand.length >= maxHandSize) break;

    if (deck.length === 0) {
      if (discard.length === 0) break;
      deck = shuffle(discard);
      discard = [];
    }

    hand.push(deck[0]);
    deck = deck.slice(1);
  }

  return { ...state, deck, hand, discard };
}
