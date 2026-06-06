// --- Card Types ---

export type CardType = "attack" | "skill";
export type CardRarity = "basic" | "common" | "uncommon";

export type EffectType =
  | "damage"
  | "damage_all"
  | "block"
  | "apply_vulnerable"
  | "apply_weak"
  | "draw";

export interface CardEffect {
  type: EffectType;
  value: number;
}

export interface CardDefinition {
  id: string;
  name: string;
  type: CardType;
  cost: number;
  rarity: CardRarity;
  effects: CardEffect[];
  description: string;
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
  | { type: "debuff"; effect: "weak" | "vulnerable"; value: number };

export interface EnemyDefinition {
  id: string;
  name: string;
  hp: number;
  intents: EnemyIntent[];
}

// --- Combat State ---

export interface StatusEffects {
  vulnerable: number;
  weak: number;
}

export interface PlayerState {
  hp: number;
  maxHp: number;
  block: number;
  energy: number;
  statusEffects: StatusEffects;
}

export interface EnemyState {
  id: string;
  definitionId: string;
  name: string;
  hp: number;
  maxHp: number;
  block: number;
  statusEffects: StatusEffects;
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
