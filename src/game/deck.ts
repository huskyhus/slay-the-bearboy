import { GAME_CONFIG } from "./config";
import { triggerZen } from "./conditions";
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
  return { deck: shuffled.array, rng: shuffled.state };
}

export function drawCards(state: CombatState, count: number): CombatState {
  let deck = [...state.deck];
  const hand = [...state.hand];
  let discard = [...state.discard];
  let rng = state.rng;
  let drawn = 0;

  for (let i = 0; i < count; i++) {
    if (hand.length >= GAME_CONFIG.player.maxHandSize) break;

    if (deck.length === 0) {
      if (discard.length === 0) break;
      // 捨て札の山札への戻しは「捨て札に送る」ではないため card_discarded は発火しない．
      const reshuffled = shuffle(discard, rng);
      deck = reshuffled.array;
      rng = reshuffled.state;
      discard = [];
    }

    hand.push(deck[0]);
    deck = deck.slice(1);
    drawn++;
  }

  // 手札上限や山札枯渇で引けなかった分は数えない．
  return {
    ...state,
    deck,
    hand,
    discard,
    rng,
    player: triggerZen(state.player, "card_drawn", drawn),
  };
}
