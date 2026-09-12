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
    description: "Kenal huruf & bunyi",
    color: "from-rose-300 to-orange-200",
  },
  {
    age: 4,
    emoji: "🐻",
    title: "UMUR 4",
    description: "Mari gabung suku kata",
    color: "from-sky-300 to-emerald-200",
  },
  {
    age: 5,
    emoji: "🚀",
    title: "UMUR 5",
    description: "Jom baca perkataan & ayat",
    color: "from-amber-300 to-lime-200",
  },
];

interface AgeSelectorProps {
  value?: AgeGroup | null;
  onSelect: (age: AgeGroup) => void;
}

export function AgeSelector({ value, onSelect }: AgeSelectorProps) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {AGES.map((item) => {
        const selected = value === item.age;
        return (
          <button
            key={item.age}
            type="button"
            onClick={() => onSelect(item.age)}
            aria-label={`${item.title}. ${item.description}`}
            aria-pressed={selected}
            className={`min-h-40 rounded-[2rem] bg-gradient-to-br ${item.color} p-5 text-left shadow-lg transition hover:-translate-y-1 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sky-700 ${
              selected ? "ring-4 ring-sky-500 ring-offset-2" : ""
            }`}
          >
            <span className="text-5xl" aria-hidden>
              {item.emoji}
            </span>
            <h3 className="mt-3 text-3xl font-black text-slate-800">
              {item.title}
            </h3>
            <p className="mt-1 text-lg font-bold text-slate-700/90">
              {item.description}
            </p>
          </button>
        );
      })}
    </div>
  );
}
