// --- Card Types ---

export type CardType = "attack" | "skill";
export type CardRarity = "basic" | "common" | "uncommon";

export type Effect =
  | { type: "damage"; value: number }
  | { type: "damage_all"; value: number }
  | { type: "block"; value: number }
  | { type: "apply_condition"; condition: ConditionType; value: number }
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

export interface ConditionState {
  vulnerable: number;
  weak: number;
}

export type ConditionType = keyof ConditionState;

export interface PlayerState {
  hp: number;
  maxHp: number;
  block: number;
  energy: number;
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
}
