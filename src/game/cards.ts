import type { CardDefinition } from "./types";

export function needsTarget(def: CardDefinition): boolean {
  return def.effects.some(
    (e) => e.type === "damage" || e.type === "apply_condition",
  );
}

export function hasAoeEffect(def: CardDefinition): boolean {
  return def.effects.some((e) => e.type === "damage_all");
}
