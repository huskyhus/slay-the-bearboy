// --- Card Types ---

export type CardType = "attack" | "skill";
export type CardRarity = "basic" | "common" | "uncommon";

export type EffectType =
  "damage" | "damage_all" | "block" | "apply_condition" | "draw";

export interface CardEffect {
  type: EffectType;
  value: number;
  condition?: ConditionType; // type === "apply_condition" のときのみ使用
}

export interface CardDefinition {
  id: string;
  name: string;
  type: CardType;
  cost: number;
  rarity: CardRarity;
  effects: CardEffect[];
  description: string;
  image: string;
}

// Runtime card instance (each card in deck gets a unique instanceId)
export interface CardInstance {
  instanceId: string;
  definitionId: string;
}

// --- Enemy Types ---

export type EnemyIntentType = "attack" | "defend" | "debuff";

export type EnemyIntent =
  | { type: "attack"; damage: number }
  | { type: "defend"; block: number }
  | { type: "debuff"; effect: ConditionType; value: number };

export interface EnemyDefinition {
  id: string;
  name: string;
  hp: number;
  intents: EnemyIntent[];
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
  currentIntent: EnemyIntent;
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
