import { GAME_CONFIG } from "./config";
import { shuffle, type RngState } from "./rng";
import type { CardDefinition, CardInstance, CombatState } from "./types";

// 初期デッキの構成カードID
export const STARTER_DECK_CARD_IDS: readonly string[] = [
  "s650352762",
  "s705381879",
  "s705381880",
  "s744223945",
  "s744223947",
  "s744223948",
  "s744223949",
  "s744223950",
  "s744223954",
  "s744223955",
  "s772622444",
  "s772622445",
  "s772622459",
  "s786875964",
  "s786875975",
  "s820777897",
  "s847773233",
  "s847773245",
  "s847773253",
  "s847773260"
]

// 指定したカードID(STARTER_DECK_CARD_IDS)のみを抽出する。
export function selectStarterDeck(
  cardDefs: CardDefinition[],
  ids: readonly string[] = STARTER_DECK_CARD_IDS,
): CardDefinition[] {
  const byId = new Map(cardDefs.map((def) => [def.id, def]));
  return ids.map((id) => {
    const def = byId.get(id);
    if (!def) throw new Error(`Unknown starter card id: ${id}`);
    return def;
  });
}

// デッキの初期化（カード定義から実体を生成してシャッフルしたものを作成する．）
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

  for (let i = 0; i < count; i++) {
    if (hand.length >= GAME_CONFIG.player.maxHandSize) break;

    if (deck.length === 0) {
      if (discard.length === 0) break;
      const reshuffled = shuffle(discard, rng);
      deck = reshuffled.array;
      rng = reshuffled.state;
      discard = [];
    }

    hand.push(deck[0]);
    deck = deck.slice(1);
  }

  return { ...state, deck, hand, discard, rng };
}
