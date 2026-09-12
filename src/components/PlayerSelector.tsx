"use client";

import type { Player } from "@/lib/types";
import { Plus, UserRound } from "lucide-react";

interface PlayerSelectorProps {
  players: Player[];
  activePlayerId?: string | null;
  onSelect: (id: string) => void;
  onAdd: () => void;
}

export function PlayerSelector({
  players,
  activePlayerId,
  onSelect,
  onAdd,
}: PlayerSelectorProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {players.map((player) => {
        const selected = player.id === activePlayerId;
        return (
          <button
            key={player.id}
            type="button"
            onClick={() => onSelect(player.id)}
            aria-label={`Pilih pemain ${player.name}`}
            aria-pressed={selected}
            className={`flex min-h-24 items-center gap-4 rounded-[1.75rem] border-4 p-4 text-left shadow-md transition active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sky-700 ${
              selected
                ? "border-sky-500 bg-sky-100"
                : "border-white/70 bg-white/90 hover:bg-white"
            }`}
          >
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-amber-300 to-orange-300 text-slate-800">
              <UserRound className="h-8 w-8" aria-hidden />
            </span>
            <span>
              <span className="block text-2xl font-black text-slate-800">
                {player.name}
              </span>
              <span className="block text-base font-bold text-slate-600">
                Umur {player.age} · ⭐ {player.progress.stars.toLocaleString("en-US")}
              </span>
            </span>
          </button>
        );
      })}

      <button
        type="button"
        onClick={onAdd}
        aria-label="Tambah pemain baharu"
        className="flex min-h-24 items-center justify-center gap-3 rounded-[1.75rem] border-4 border-dashed border-sky-300 bg-white/60 p-4 text-xl font-black text-sky-700 transition hover:bg-white active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sky-700"
      >
        <Plus className="h-7 w-7" aria-hidden />
        Tambah Pemain
      </button>
    </div>
  );
}
