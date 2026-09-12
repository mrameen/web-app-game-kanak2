"use client";

import type { AgeGroup } from "@/lib/types";

const AGES: {
  age: AgeGroup;
  emoji: string;
  title: string;
  description: string;
  color: string;
}[] = [
  {
    age: 3,
    emoji: "🧸",
    title: "UMUR 3",
    description: "Kenal huruf & kira",
    color: "from-rose-300 to-orange-200",
  },
  {
    age: 4,
    emoji: "🐻",
    title: "UMUR 4",
    description: "Gabung suku kata & tambah",
    color: "from-sky-300 to-emerald-200",
  },
  {
    age: 5,
    emoji: "🚀",
    title: "UMUR 5",
    description: "Baca & kira lebih jauh",
    color: "from-amber-300 to-lime-200",
  },
  {
    age: 6,
    emoji: "🎓",
    title: "UMUR 6",
    description: "Ayat, baca & matematik",
    color: "from-violet-300 to-cyan-200",
  },
];

interface AgeSelectorProps {
  value?: AgeGroup | null;
  onSelect: (age: AgeGroup) => void;
  compact?: boolean;
}

export function AgeSelector({
  value,
  onSelect,
  compact = false,
}: AgeSelectorProps) {
  return (
    <div
      className={
        compact
          ? "grid grid-cols-2 gap-2 sm:grid-cols-4"
          : "grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
      }
    >
      {AGES.map((item) => {
        const selected = value === item.age;
        return (
          <button
            key={item.age}
            type="button"
            onClick={() => onSelect(item.age)}
            aria-label={`${item.title}. ${item.description}`}
            aria-pressed={selected}
            className={`rounded-[1.5rem] bg-gradient-to-br ${item.color} text-left shadow-md transition hover:-translate-y-0.5 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sky-700 ${
              compact ? "min-h-20 p-3" : "min-h-36 p-5"
            } ${selected ? "ring-4 ring-sky-500 ring-offset-2" : ""}`}
          >
            <span className={compact ? "text-2xl" : "text-5xl"} aria-hidden>
              {item.emoji}
            </span>
            <h3
              className={`font-black text-slate-800 ${
                compact ? "mt-1 text-base" : "mt-3 text-2xl lg:text-3xl"
              }`}
            >
              {item.title}
            </h3>
            {!compact ? (
              <p className="mt-1 text-base font-bold text-slate-700/90">
                {item.description}
              </p>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}
