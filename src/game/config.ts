export const GAME_CONFIG = {
  player: {
    maxHp: 80,
    energyPerTurn: 3,
    drawPerTurn: 5,
    maxHandSize: 10,
  },
  combat: {
    vulnerableMultiplier: 1.5,
    weakMultiplier: 0.75,
  },
} as const;
