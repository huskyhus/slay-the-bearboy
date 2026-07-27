import { GAME_CONFIG } from "./config";
import { shuffle, type RngState } from "./rng";
import type { CardDefinition, CardInstance, CombatState } from "./types";

// 初期デッキ（カード定義から実体を生成してシャッフルしたもの）を作成する．
export function initDeck(
  cardDefs: CardDefinition[],
  rngState: RngState,
): { deck: CardInstance[]; rng: RngState } {
  // `instanceId`は，定義IDと初期デッキ内の位置から決定的に採番する．
  const cards: CardInstance[] = cardDefs.map((def, index) => ({
    instanceId: `${def.id}#${index}`,
    definitionId: def.id,
  }));
  const shuffled = shuffle(cards, rngState);
  return { deck: shuffled.items, rng: shuffled.state };
}

export function drawCards(state: CombatState, count: number): CombatState {
  let deck = [...state.deck];
  const hand = [...state.hand];
  let discard = [...state.discard];
  let rng = state.rng;

  for (let i = 0; i < count; i++) {
    if (hand.length >= GAME_CONFIG.player.maxHandSize) break;

    if (deck.length === 0) {
      if (discard.length === 0) break;
      const reshuffled = shuffle(discard, rng);
      deck = reshuffled.items;
      rng = reshuffled.state;
      discard = [];
    }

    hand.push(deck[0]);
    deck = deck.slice(1);
  }

  return { ...state, deck, hand, discard, rng };
}
