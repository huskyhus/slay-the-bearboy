import { GAME_CONFIG } from "./config";
import { STATUS_EFFECT_DEFINITIONS, STATUS_EFFECT_KEYS } from "./statusEffects";
import type {
  CardDefinition,
  CardEffect,
  CardInstance,
  CombatState,
  EnemyDefinition,
  EnemyState,
  PlayerState,
  StatusEffects,
} from "./types";

// --- Utilities ---

let nextInstanceId = 0;

export function createCardInstance(definitionId: string): CardInstance {
  return { instanceId: String(nextInstanceId++), definitionId };
}

export function resetInstanceIdCounter(): void {
  nextInstanceId = 0;
}

function shuffle<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function createStatusEffects(): StatusEffects {
  const effects = {} as StatusEffects;
  for (const key of STATUS_EFFECT_KEYS) {
    effects[key] = 0;
  }
  return effects;
}

function tickStatusEffects(effects: StatusEffects): StatusEffects {
  const result = { ...effects };
  for (const key of STATUS_EFFECT_KEYS) {
    if (STATUS_EFFECT_DEFINITIONS[key].decaysPerTurn) {
      result[key] = Math.max(0, result[key] - 1);
    }
  }
  return result;
}

function applyEnemyStatusEffect(
  state: CombatState,
  targetEnemyId: string | null,
  key: keyof StatusEffects,
  value: number,
): CombatState {
  return {
    ...state,
    enemies: state.enemies.map((e) =>
      !targetEnemyId || e.id === targetEnemyId
        ? {
            ...e,
            statusEffects: {
              ...e.statusEffects,
              [key]: e.statusEffects[key] + value,
            },
          }
        : e,
    ),
  };
}

// --- Damage Calculation ---

export function calculateDamage(
  baseDamage: number,
  attacker: StatusEffects,
  defender: StatusEffects,
): number {
  let damage = baseDamage;
  for (const key of STATUS_EFFECT_KEYS) {
    const multiplier = STATUS_EFFECT_DEFINITIONS[key].damageMultiplier;
    if (!multiplier) continue;
    const effects = multiplier.role === "attacker" ? attacker : defender;
    if (effects[key] > 0) {
      damage = Math.floor(damage * multiplier.value);
    }
  }
  return damage;
}

function applyDamageToTarget(
  target: { hp: number; block: number },
  damage: number,
): { hp: number; block: number } {
  const remainingBlock = Math.max(0, target.block - damage);
  const hpDamage = Math.max(0, damage - target.block);
  return {
    hp: target.hp - hpDamage,
    block: remainingBlock,
  };
}

// --- Combat Initialization ---

export function initCombat(
  cardDefs: CardDefinition[],
  enemyDefs: EnemyDefinition[],
): CombatState {
  resetInstanceIdCounter();
  const { maxHp, energyPerTurn } = GAME_CONFIG.player;

  const allCards = cardDefs.map((def) => createCardInstance(def.id));
  const deck = shuffle(allCards);

  const enemies: EnemyState[] = enemyDefs.map((def, index) => ({
    id: `${def.id}_${index}`,
    definitionId: def.id,
    name: def.name,
    hp: def.hp,
    maxHp: def.hp,
    block: 0,
    statusEffects: createStatusEffects(),
    intentIndex: 0,
    currentIntent: def.intents[0],
  }));

  const state: CombatState = {
    phase: "player_turn",
    turn: 1,
    player: {
      hp: maxHp,
      maxHp,
      block: 0,
      energy: energyPerTurn,
      statusEffects: createStatusEffects(),
    },
    enemies,
    deck,
    hand: [],
    discard: [],
    exhaust: [],
  };

  return drawCards(state, GAME_CONFIG.player.drawPerTurn);
}

// --- Card Drawing ---

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

// --- Playing a Card ---

export function canPlayCard(
  state: CombatState,
  cardDef: CardDefinition,
): boolean {
  return state.phase === "player_turn" && state.player.energy >= cardDef.cost;
}

export function playCard(
  state: CombatState,
  cardInstanceId: string,
  targetEnemyId: string | null,
  cardDefs: Map<string, CardDefinition>,
): CombatState {
  const cardIndex = state.hand.findIndex(
    (c) => c.instanceId === cardInstanceId,
  );
  if (cardIndex === -1) return state;

  const card = state.hand[cardIndex];
  const def = cardDefs.get(card.definitionId);
  if (!def) return state;
  if (!canPlayCard(state, def)) return state;

  let newState: CombatState = {
    ...state,
    player: { ...state.player, energy: state.player.energy - def.cost },
    hand: state.hand.filter((_, i) => i !== cardIndex),
    discard: [...state.discard, card],
    enemies: state.enemies.map((e) => ({ ...e })),
  };

  for (const effect of def.effects) {
    newState = applyEffect(newState, effect, targetEnemyId);
  }

  // Check for dead enemies
  newState = {
    ...newState,
    enemies: newState.enemies.filter((e) => e.hp > 0),
  };

  // Check victory
  if (newState.enemies.length === 0) {
    newState = { ...newState, phase: "victory" };
  }

  return newState;
}

function applyEffect(
  state: CombatState,
  effect: CardEffect,
  targetEnemyId: string | null,
): CombatState {
  switch (effect.type) {
    case "damage": {
      if (!targetEnemyId) return state;
      return applyDamageToEnemy(
        state,
        targetEnemyId,
        effect.value,
        state.player.statusEffects,
      );
    }
    case "damage_all": {
      let s = state;
      for (const enemy of s.enemies) {
        s = applyDamageToEnemy(
          s,
          enemy.id,
          effect.value,
          s.player.statusEffects,
        );
      }
      return s;
    }
    case "block": {
      return {
        ...state,
        player: {
          ...state.player,
          block: state.player.block + effect.value,
        },
      };
    }
    case "apply_status": {
      if (!effect.status) return state;
      return applyEnemyStatusEffect(
        state,
        targetEnemyId,
        effect.status,
        effect.value,
      );
    }
    case "draw": {
      return drawCards(state, effect.value);
    }
    default:
      return state;
  }
}

function applyDamageToEnemy(
  state: CombatState,
  enemyId: string,
  baseDamage: number,
  attacker: StatusEffects,
): CombatState {
  return {
    ...state,
    enemies: state.enemies.map((e) => {
      if (e.id !== enemyId) return e;
      const finalDamage = calculateDamage(
        baseDamage,
        attacker,
        e.statusEffects,
      );
      const result = applyDamageToTarget(e, finalDamage);
      return { ...e, hp: result.hp, block: result.block };
    }),
  };
}

// --- End Turn ---

export function endPlayerTurn(state: CombatState): CombatState {
  if (state.phase !== "player_turn") return state;

  // Tick player status effects at the end of the player's turn so that
  // debuffs applied by enemies last through the player's following turn.
  return {
    ...state,
    phase: "enemy_turn" as const,
    hand: [],
    discard: [...state.discard, ...state.hand],
    player: {
      ...state.player,
      statusEffects: tickStatusEffects(state.player.statusEffects),
    },
  };
}

// --- Enemy Turn ---

export function executeEnemyTurn(
  state: CombatState,
  enemyDefs: Map<string, EnemyDefinition>,
): CombatState {
  if (state.phase !== "enemy_turn") return state;

  let player: PlayerState = { ...state.player };
  // Reset enemy block at the start of enemy turn
  let enemies = state.enemies.map((e) => ({ ...e, block: 0 }));

  for (const enemy of enemies) {
    const intent = enemy.currentIntent;

    switch (intent.type) {
      case "attack": {
        const damage = calculateDamage(
          intent.damage,
          enemy.statusEffects,
          player.statusEffects,
        );
        const result = applyDamageToTarget(player, damage);
        player = { ...player, hp: result.hp, block: result.block };
        break;
      }
      case "defend": {
        enemy.block += intent.block;
        break;
      }
      case "debuff": {
        if (intent.effect === "weak") {
          player = {
            ...player,
            statusEffects: {
              ...player.statusEffects,
              weak: player.statusEffects.weak + intent.value,
            },
          };
        } else if (intent.effect === "vulnerable") {
          player = {
            ...player,
            statusEffects: {
              ...player.statusEffects,
              vulnerable: player.statusEffects.vulnerable + intent.value,
            },
          };
        }
        break;
      }
    }

    // Advance intent
    const def = enemyDefs.get(enemy.definitionId);
    if (def) {
      enemy.intentIndex = (enemy.intentIndex + 1) % def.intents.length;
      enemy.currentIntent = def.intents[enemy.intentIndex];
    }
  }

  // Check defeat
  if (player.hp <= 0) {
    return {
      ...state,
      player: { ...player, hp: 0 },
      enemies,
      phase: "defeat",
    };
  }

  // Start next player turn
  const { energyPerTurn, drawPerTurn } = GAME_CONFIG.player;

  // Reset block and refill energy for the upcoming player turn.
  // Player status effects are NOT ticked here; they tick in endPlayerTurn so
  // that debuffs an enemy just applied remain active during the player's turn.
  player = {
    ...player,
    block: 0,
    energy: energyPerTurn,
  };

  // Tick enemy status effects at the end of the enemy turn.
  enemies = enemies.map((e) => ({
    ...e,
    statusEffects: tickStatusEffects(e.statusEffects),
  }));

  const newState: CombatState = {
    ...state,
    phase: "player_turn",
    turn: state.turn + 1,
    player,
    enemies,
  };

  return drawCards(newState, drawPerTurn);
}

// --- Helpers for UI ---

export function needsTarget(def: CardDefinition): boolean {
  return def.effects.some(
    (e) => e.type === "damage" || e.type === "apply_status",
  );
}

export function hasAoeEffect(def: CardDefinition): boolean {
  return def.effects.some((e) => e.type === "damage_all");
}
