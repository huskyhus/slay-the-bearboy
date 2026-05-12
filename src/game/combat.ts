import { GAME_CONFIG } from "./config";
import type {
  CardDefinition,
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
  return { vulnerable: 0, weak: 0 };
}

function tickStatusEffects(effects: StatusEffects): StatusEffects {
  return {
    vulnerable: Math.max(0, effects.vulnerable - 1),
    weak: Math.max(0, effects.weak - 1),
  };
}

// --- Damage Calculation ---

export function calculateDamage(
  baseDamage: number,
  attackerWeak: number,
  defenderVulnerable: number,
): number {
  const { weakMultiplier, vulnerableMultiplier } = GAME_CONFIG.combat;
  let damage = baseDamage;
  if (attackerWeak > 0) {
    damage = Math.floor(damage * weakMultiplier);
  }
  if (defenderVulnerable > 0) {
    damage = Math.floor(damage * vulnerableMultiplier);
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
  let hand = [...state.hand];
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
  return (
    state.phase === "player_turn" && state.player.energy >= cardDef.cost
  );
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
  effect: { type: string; value: number },
  targetEnemyId: string | null,
): CombatState {
  switch (effect.type) {
    case "damage": {
      if (!targetEnemyId) return state;
      const damage = calculateDamage(
        effect.value,
        state.player.statusEffects.weak,
        0,
      );
      return applyDamageToEnemy(state, targetEnemyId, damage);
    }
    case "damage_all": {
      let s = state;
      for (const enemy of s.enemies) {
        const damage = calculateDamage(
          effect.value,
          s.player.statusEffects.weak,
          0,
        );
        s = applyDamageToEnemy(s, enemy.id, damage);
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
    case "apply_vulnerable": {
      if (!targetEnemyId) {
        // Apply to all enemies for damage_all cards
        return {
          ...state,
          enemies: state.enemies.map((e) => ({
            ...e,
            statusEffects: {
              ...e.statusEffects,
              vulnerable: e.statusEffects.vulnerable + effect.value,
            },
          })),
        };
      }
      return {
        ...state,
        enemies: state.enemies.map((e) =>
          e.id === targetEnemyId
            ? {
                ...e,
                statusEffects: {
                  ...e.statusEffects,
                  vulnerable: e.statusEffects.vulnerable + effect.value,
                },
              }
            : e,
        ),
      };
    }
    case "apply_weak": {
      if (!targetEnemyId) {
        return {
          ...state,
          enemies: state.enemies.map((e) => ({
            ...e,
            statusEffects: {
              ...e.statusEffects,
              weak: e.statusEffects.weak + effect.value,
            },
          })),
        };
      }
      return {
        ...state,
        enemies: state.enemies.map((e) =>
          e.id === targetEnemyId
            ? {
                ...e,
                statusEffects: {
                  ...e.statusEffects,
                  weak: e.statusEffects.weak + effect.value,
                },
              }
            : e,
        ),
      };
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
): CombatState {
  return {
    ...state,
    enemies: state.enemies.map((e) => {
      if (e.id !== enemyId) return e;
      const finalDamage = calculateDamage(
        baseDamage,
        0,
        e.statusEffects.vulnerable,
      );
      const result = applyDamageToTarget(e, finalDamage);
      return { ...e, hp: result.hp, block: result.block };
    }),
  };
}

// --- End Turn ---

export function endPlayerTurn(state: CombatState): CombatState {
  if (state.phase !== "player_turn") return state;

  // Discard hand
  let newState: CombatState = {
    ...state,
    phase: "enemy_turn",
    hand: [],
    discard: [...state.discard, ...state.hand],
  };

  return newState;
}

// --- Enemy Turn ---

export function executeEnemyTurn(
  state: CombatState,
  enemyDefs: Map<string, EnemyDefinition>,
): CombatState {
  if (state.phase !== "enemy_turn") return state;

  let player: PlayerState = { ...state.player };
  let enemies = state.enemies.map((e) => ({ ...e }));

  for (const enemy of enemies) {
    const intent = enemy.currentIntent;

    switch (intent.type) {
      case "attack": {
        const damage = calculateDamage(
          intent.damage,
          enemy.statusEffects.weak,
          player.statusEffects.vulnerable,
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

  // Tick status effects
  player = {
    ...player,
    block: 0,
    energy: energyPerTurn,
    statusEffects: tickStatusEffects(player.statusEffects),
  };

  enemies = enemies.map((e) => ({
    ...e,
    block: 0,
    statusEffects: tickStatusEffects(e.statusEffects),
  }));

  let newState: CombatState = {
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
    (e) =>
      e.type === "damage" ||
      e.type === "apply_vulnerable" ||
      e.type === "apply_weak",
  );
}

export function hasAoeEffect(def: CardDefinition): boolean {
  return def.effects.some((e) => e.type === "damage_all");
}
