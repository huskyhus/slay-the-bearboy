"use client";

import type { CardDefinition } from "@/src/game/types";

interface Props {
  def: CardDefinition;
  instanceId: string;
  isSelected: boolean;
  isPlayable: boolean;
  onSelect: () => void;
}

function typeColor(type: string): string {
  return type === "attack" ? "border-red-600" : "border-blue-600";
}

function rarityBg(rarity: string): string {
  switch (rarity) {
    case "uncommon":
      return "bg-zinc-700";
    default:
      return "bg-zinc-800";
  }
}

export default function CardComponent({
  def,
  instanceId,
  isSelected,
  isPlayable,
  onSelect,
}: Props) {
  return (
    <button
      type="button"
      onClick={onSelect}
      disabled={!isPlayable}
      className={`flex w-32 flex-col rounded-lg border-2 p-3 text-left transition-all ${
        rarityBg(def.rarity)
      } ${typeColor(def.type)} ${
        isSelected
          ? "scale-110 ring-2 ring-yellow-400"
          : ""
      } ${
        isPlayable
          ? "cursor-pointer hover:-translate-y-1 hover:brightness-125"
          : "cursor-not-allowed opacity-50"
      }`}
    >
      <div className="flex items-center justify-between text-xs">
        <span className="font-bold text-zinc-200">{def.name}</span>
        <span className="rounded bg-zinc-900 px-1.5 py-0.5 text-yellow-400">
          {def.cost}
        </span>
      </div>
      <div className="mt-1 text-[10px] uppercase tracking-wider text-zinc-500">
        {def.type}
      </div>
      <div className="mt-2 text-[11px] leading-tight text-zinc-400">
        {def.description}
      </div>
    </button>
  );
}
