import type { ConditionKey, ConditionState, PlayerState } from "./types";

// 座禅を増やすきっかけになるゲームイベント．
// 発火箇所は combat.ts と deck.ts にあり，triggerZen() 経由でのみ座禅が増える．
export type GameEvent =
  | "damage_dealt" // プレイヤーが敵にダメージを与えた
  | "attack_blocked" // プレイヤーの攻撃が敵のブロックに阻まれた
  | "hp_lost" // プレイヤーのHPが減少した
  | "attack_absorbed" // プレイヤーのブロックが敵の攻撃を受け止めた
  | "card_drawn" // カードを1枚引いた
  | "card_discarded"; // カードを1枚捨て札に送った

interface ConditionRule {
  decaysPerTurn: boolean;
  // 指定した場合，そのイベントが起きるたびスタック数だけ座禅が増える（パワー）．
  zenTrigger?: GameEvent;
}

export const CONDITION_RULES: Record<ConditionKey, ConditionRule> = {
  vulnerable: {
    decaysPerTurn: true,
  },
  weak: {
    decaysPerTurn: true,
  },
  destroyer: {
    decaysPerTurn: false,
    zenTrigger: "damage_dealt",
  },
  powerless: {
    decaysPerTurn: false,
    zenTrigger: "attack_blocked",
  },
  own_folly: {
    decaysPerTurn: false,
    zenTrigger: "hp_lost",
  },
  breaking: {
    decaysPerTurn: false,
    zenTrigger: "attack_absorbed",
  },
  desire: {
    decaysPerTurn: false,
    zenTrigger: "card_drawn",
  },
  farewell_desire: {
    decaysPerTurn: false,
    zenTrigger: "card_discarded",
  },
};

export function conditionKeys(): ConditionKey[] {
  return Object.keys(CONDITION_RULES) as ConditionKey[];
}

export function initConditionState(): ConditionState {
  // キーの追加漏れを防ぐため，規則テーブルから全キーを 0 で生成する．
  const conditions = {} as ConditionState;
  for (const key of conditionKeys()) {
    conditions[key] = 0;
  }
  return conditions;
}

export function applyCondition(
  conditions: ConditionState,
  key: ConditionKey,
  value: number,
): ConditionState {
  return { ...conditions, [key]: conditions[key] + value };
}

export function tickConditionState(conditions: ConditionState): ConditionState {
  const result = { ...conditions };
  for (const key of conditionKeys()) {
    if (CONDITION_RULES[key].decaysPerTurn) {
      result[key] = Math.max(0, result[key] - 1);
    }
  }
  return result;
}

// event が times 回起きたものとして，対応するパワーのスタック数だけ座禅を加算する．
// times が 0 のときは何も起きない（手札0枚でのターン終了など）．
export function triggerZen(
  player: PlayerState,
  event: GameEvent,
  times = 1,
): PlayerState {
  if (times <= 0) return player;

  let gained = 0;
  for (const key of conditionKeys()) {
    if (CONDITION_RULES[key].zenTrigger === event) {
      gained += player.conditions[key] * times;
    }
  }
  if (gained === 0) return player;

  return { ...player, zen: player.zen + gained };
}
