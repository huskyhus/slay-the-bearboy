import type { RngState } from "./rng";

// --- Card Types ---

export type CardType = "attack" | "skill" | "power";
export type CardRarity = "basic" | "common" | "uncommon";

export type Effect =
  | { type: "damage"; value: number }
  | { type: "damage_all"; value: number }
  | { type: "block"; value: number }
  // apply_condition は「相手」に，obtain_condition は「自分」に付与する．
  | { type: "apply_condition"; condition: ConditionKey; value: number }
  | { type: "obtain_condition"; condition: ConditionKey; value: number }
  | { type: "draw"; value: number };

export type EffectType = Effect["type"];

export interface CardDefinition {
  id: string;
  name: string;
  type: CardType;
  cost: number;
  rarity: CardRarity;
  effects: Effect[];
  description: string;
  image: string;
}

// Runtime card instance (each card in deck gets a unique instanceId)
export interface CardInstance {
  instanceId: string;
  definitionId: string;
}

// --- Enemy Types ---

// 敵のインテントも Effect で表現する。
// 敵が使う場合、damage / apply_condition の対象はプレイヤー、block は自分自身。
export interface EnemyDefinition {
  id: string;
  name: string;
  hp: number;
  intents: Effect[];
}

// --- Combat State ---

// パワーもコンディションの一種として扱う（減少しないコンディション）．
// キーを1つ増やしたら conditions.ts の CONDITION_RULES にも規則を足す必要がある
// （足さなければ型エラーになる）．
export interface ConditionState {
  vulnerable: number;
  weak: number;
  // --- パワー（減少せず，スタック数だけ座禅が増える）---
  destroyer: number; // 壊す ﾆﾔﾘ
  powerless: number; // あまりに無力な存在
  own_folly: number; // おのれの愚かさ今知る！
  breaking: number; // 壊れる…
  desire: number; // 人は欲望と共にある
  farewell_desire: number; // 欲望よさらば
}

export type ConditionKey = keyof ConditionState;

export interface PlayerState {
  hp: number;
  maxHp: number;
  block: number;
  energy: number;
  // 戦闘中に蓄積する．ブロックと違いターンをまたいで保持し，リセットしない．
  zen: number;
  conditions: ConditionState;
}

export interface EnemyState {
  id: string;
  definitionId: string;
  name: string;
  hp: number;
  maxHp: number;
  block: number;
  conditions: ConditionState;
  intentIndex: number;
  currentIntent: Effect;
}

export type CombatPhase = "player_turn" | "enemy_turn" | "victory" | "defeat";

export interface CombatState {
  phase: CombatPhase;
  turn: number;
  player: PlayerState;
  enemies: EnemyState[];
  deck: CardInstance[];
  hand: CardInstance[];
  discard: CardInstance[];
  exhaust: CardInstance[];
  // 戦闘開始時のシード．同じシードなら戦闘全体を再現できる（不具合再現・リプレイ用）．
  seed: number;
  // 現在の乱数状態．シャッフルのたびに更新される．
  rng: RngState;
}
