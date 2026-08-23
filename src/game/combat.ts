import { GAME_CONFIG } from "./config";
import {
  applyCondition,
  initConditionState,
  tickConditionState,
  triggerZen,
} from "./conditions";
import { drawCards, initDeck } from "./deck";
import { createRngState } from "./rng";
import type {
  CardDefinition,
  CombatState,
  ConditionKey,
  ConditionState,
  Effect,
  EnemyDefinition,
  EnemyState,
  PlayerState,
} from "./types";

// --- Combat Initialization ---

export function initCombat(
  cardDefs: CardDefinition[],
  enemyDefs: EnemyDefinition[],
  seed: number,
): CombatState {
  const { deck, rng } = initDeck(cardDefs, createRngState(seed));

  const enemies: EnemyState[] = enemyDefs.map((def, index) => ({
    id: `${def.id}_${index}`,
    definitionId: def.id,
    name: def.name,
    hp: def.hp,
    maxHp: def.hp,
    block: 0,
    conditions: initConditionState(),
    intentIndex: 0,
    currentIntent: def.intents[0],
  }));

  const state: CombatState = {
    phase: "player_turn",
    turn: 1,
    player: {
      hp: GAME_CONFIG.player.maxHp,
      maxHp: GAME_CONFIG.player.maxHp,
      block: 0,
      energy: GAME_CONFIG.player.energyPerTurn,
      zen: 0,
      conditions: initConditionState(),
    },
    enemies,
    deck,
    hand: [],
    discard: [],
    exhaust: [],
    seed,
    rng,
  };

  return drawCards(state, GAME_CONFIG.player.drawPerTurn);
}

// --- Applying Damage or Condition ---

function applyDamageToEnemy(
  state: CombatState,
  enemyId: string,
  baseDamage: number,
): CombatState {
  const target = state.enemies.find((e) => e.id === enemyId);
  if (!target) return state;

  const finalDamage = calcConditionedDamage(
    baseDamage,
    state.player.conditions,
    target.conditions,
  );
  const result = calcRemainingHpAndBlock(target, finalDamage);

  // 被弾前のブロックを見る必要があるため，敵を更新する前にトリガを判定する．
  let player = state.player;
  if (finalDamage > 0) {
    player = triggerZen(player, "damage_dealt");
    if (target.block > 0) {
      player = triggerZen(player, "attack_blocked");
    }
  }

  return {
    ...state,
    player,
    enemies: state.enemies.map((e) =>
      e.id === enemyId ? { ...e, hp: result.hp, block: result.block } : e,
    ),
  };
}

function calcConditionedDamage(
  baseDamage: number,
  attacker: ConditionState,
  defender: ConditionState,
): number {
  let damage = baseDamage;
  if (attacker.weak > 0) {
    damage = Math.floor(damage * GAME_CONFIG.combat.weakMultiplier);
  }
  if (defender.vulnerable > 0) {
    damage = Math.floor(damage * GAME_CONFIG.combat.vulnerableMultiplier);
  }
  return damage;
}

function calcRemainingHpAndBlock(
  hpAndBlock: { hp: number; block: number },
  conditionedDamage: number,
): { hp: number; block: number } {
  const remainingBlock = Math.max(0, hpAndBlock.block - conditionedDamage);
  const hpDamage = Math.max(0, conditionedDamage - hpAndBlock.block);
  return {
    hp: hpAndBlock.hp - hpDamage,
    block: remainingBlock,
  };
}

function applyEnemyCondition(
  state: CombatState,
  targetEnemyId: string | null,
  key: ConditionKey,
  value: number,
): CombatState {
  return {
    ...state,
    enemies: state.enemies.map((e) =>
      !targetEnemyId || e.id === targetEnemyId
        ? {
            ...e,
            conditions: applyCondition(e.conditions, key, value),
          }
        : e,
    ),
  };
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

  // パワーカードは戦闘中に一度だけ効果を得られるよう除外に送る．
  // 除外は「捨て札に送る」ではないため card_discarded は発火しない．
  const isPower = def.type === "power";

  let newState: CombatState = {
    ...state,
    player: { ...state.player, energy: state.player.energy - def.cost },
    hand: state.hand.filter((_, i) => i !== cardIndex),
    discard: isPower ? state.discard : [...state.discard, card],
    exhaust: isPower ? [...state.exhaust, card] : state.exhaust,
  };

  if (!isPower) {
    newState = {
      ...newState,
      player: triggerZen(newState.player, "card_discarded"),
    };
  }

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
  effect: Effect,
  targetEnemyId: string | null,
): CombatState {
  switch (effect.type) {
    case "damage": {
      if (!targetEnemyId) return state;
      return applyDamageToEnemy(state, targetEnemyId, effect.value);
    }
    case "damage_all": {
      return state.enemies.reduce(
        (s, enemy) => applyDamageToEnemy(s, enemy.id, effect.value),
        state,
      );
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
    case "apply_condition": {
      return applyEnemyCondition(
        state,
        targetEnemyId,
        effect.condition,
        effect.value,
      );
    }
    case "obtain_condition": {
      return {
        ...state,
        player: {
          ...state.player,
          conditions: applyCondition(
            state.player.conditions,
            effect.condition,
            effect.value,
          ),
        },
      };
    }
    case "draw": {
      return drawCards(state, effect.value);
    }
    default:
      return state;
  }
}

// --- End Turn ---

export function endPlayerTurn(state: CombatState): CombatState {
  if (state.phase !== "player_turn") return state;

  // Tick player condition state at the end of the player's turn so that
  // debuffs applied by enemies last through the player's following turn.
  return {
    ...state,
    phase: "enemy_turn" as const,
    hand: [],
    discard: [...state.discard, ...state.hand],
    player: triggerZen(
      {
        ...state.player,
        conditions: tickConditionState(state.player.conditions),
      },
      "card_discarded",
      state.hand.length,
    ),
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
      // 敵にとっての「全体」はプレイヤー1人なので damage と同じ扱い
      case "damage":
      case "damage_all": {
        const damage = calcConditionedDamage(
          intent.value,
          enemy.conditions,
          player.conditions,
        );
        const result = calcRemainingHpAndBlock(player, damage);
        // 被弾前のブロック・HPを見る必要があるため，更新前にトリガを判定する．
        if (damage > 0 && player.block > 0) {
          player = triggerZen(player, "attack_absorbed");
        }
        if (result.hp < player.hp) {
          player = triggerZen(player, "hp_lost");
        }
        player = { ...player, hp: result.hp, block: result.block };
        break;
      }
      case "block": {
        enemy.block += intent.value;
        break;
      }
      case "apply_condition": {
        player = {
          ...player,
          conditions: applyCondition(
            player.conditions,
            intent.condition,
            intent.value,
          ),
        };
        break;
      }
      case "obtain_condition": {
        enemy.conditions = applyCondition(
          enemy.conditions,
          intent.condition,
          intent.value,
        );
        break;
      }
      // draw は敵の行動としては意味を持たないため無視
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
  // Reset block and refill energy for the upcoming player turn.
  // Player condition state is NOT ticked here; it ticks in endPlayerTurn so
  // that debuffs an enemy just applied remain active during the player's turn.
  player = {
    ...player,
    block: 0,
    energy: GAME_CONFIG.player.energyPerTurn,
  };

  // Tick enemy condition state at the end of the enemy turn.
  enemies = enemies.map((e) => ({
    ...e,
    conditions: tickConditionState(e.conditions),
  }));

  const newState: CombatState = {
    ...state,
    phase: "player_turn",
    turn: state.turn + 1,
    player,
    enemies,
  };

  return drawCards(newState, GAME_CONFIG.player.drawPerTurn);
}
