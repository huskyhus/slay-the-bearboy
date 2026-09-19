import type { ConditionKey, ConditionState, PlayerState } from "./types";

// 一部のConditionが発火するイベントの種類を定義する．
export type GameEvent =
  | "damage_dealt" // プレイヤーの攻撃で敵のHPが減少した
  | "attack_blocked" // プレイヤーがブロックを持つ敵に攻撃した
  | "hp_lost" // プレイヤーのHPが減少した
  | "attack_absorbed" // プレイヤーのブロックが敵の攻撃を受け止めた
  | "card_drawn" // カードを1枚引いた
  | "card_discarded"; // カードを1枚捨て札に送った

interface ConditionRule {
  decaysPerTurn: boolean;
  zenTrigger?: GameEvent; // 指定した場合，そのイベントが起きるたびスタック数だけ座禅が増える（パワー）．
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
  // 加算が0なら同じ参照を返す（パワー未取得でも毎ヒット呼ばれるため）．
  return gained === 0 ? player : { ...player, zen: player.zen + gained };
}
