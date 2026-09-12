"use client";

import { useState } from "react";
import Link from "next/link";
import type { AgeGroup, Player } from "@/lib/types";
import { ProgressBar } from "./ProgressBar";
import { getGamesForAgeByCategory, GAME_META } from "@/lib/content";
import { GameCard } from "./GameCard";
import { AgeSelector } from "./AgeSelector";

interface PlayerDashboardProps {
  player: Player;
  onChangeAge: (age: AgeGroup) => void;
}

const GAME_COLORS = [
  "from-rose-300 to-orange-200",
  "from-sky-300 to-cyan-200",
  "from-emerald-300 to-lime-200",
  "from-amber-300 to-yellow-200",
  "from-fuchsia-300 to-pink-200",
  "from-indigo-300 to-sky-200",
];

export function PlayerDashboard({ player, onChangeAge }: PlayerDashboardProps) {
  const readingGames = getGamesForAgeByCategory(player.age, "reading");
  const mathGames = getGamesForAgeByCategory(player.age, "math");
  const firstGame = readingGames[0] ?? mathGames[0] ?? "listen-pick";
  const levelProgress = player.progress.correctAnswers % 8;
  const [showAgePicker, setShowAgePicker] = useState(false);

  return (
    <div className="space-y-8">
      <section className="rounded-[2rem] bg-white/80 p-6 shadow-lg backdrop-blur">
        <p className="text-lg font-bold text-sky-700">Hai,</p>
        <h1 className="text-4xl font-black text-slate-800 sm:text-5xl">
          {player.name}! 👋
        </h1>
        <p className="mt-2 text-2xl font-bold text-slate-700">
          Jom belajar sambil bermain!
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <span className="rounded-2xl bg-sky-100 px-4 py-2 text-base font-black text-sky-800">
            Umur {player.age} tahun
          </span>
          <button
            type="button"
            onClick={() => setShowAgePicker((v) => !v)}
            className="rounded-2xl bg-white px-4 py-2 text-base font-black text-slate-700 shadow"
            aria-expanded={showAgePicker}
          >
            {showAgePicker ? "Tutup" : "Tukar umur"}
          </button>
        </div>

        {showAgePicker ? (
          <div className="mt-4 rounded-[1.5rem] bg-sky-50/80 p-4">
            <p className="mb-3 text-sm font-bold text-slate-600">
              Pilih umur untuk tukar tahap permainan
            </p>
            <AgeSelector
              compact
              value={player.age}
              onSelect={(age) => {
                onChangeAge(age);
                setShowAgePicker(false);
              }}
            />
          </div>
        ) : null}

        <div className="mt-6 grid grid-cols-3 gap-3 text-center">
          <div className="rounded-2xl bg-amber-100 p-3">
            <p className="text-2xl" aria-hidden>
              ⭐
            </p>
            <p className="text-xl font-black text-amber-800">
              {player.progress.stars.toLocaleString("en-US")}
            </p>
            <p className="text-xs font-bold text-amber-700">Progress</p>
          </div>
          <div className="rounded-2xl bg-orange-100 p-3">
            <p className="text-2xl" aria-hidden>
              🔥
            </p>
            <p className="text-xl font-black text-orange-800">
              {player.progress.streak.toLocaleString("en-US")}
            </p>
            <p className="text-xs font-bold text-orange-700">Streak</p>
          </div>
          <div className="rounded-2xl bg-rose-100 p-3">
            <p className="text-2xl" aria-hidden>
              🏆
            </p>
            <p className="text-xl font-black text-rose-800">
              Lv {player.progress.currentLevel.toLocaleString("en-US")}
            </p>
            <p className="text-xs font-bold text-rose-700">Bintang</p>
          </div>
        </div>

        <div className="mt-5">
          <ProgressBar
            value={levelProgress}
            max={8}
            label="Ke tahap seterusnya"
          />
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <Link
            href={`/play?game=${firstGame}`}
            className="flex min-h-16 items-center justify-center rounded-2xl bg-sky-500 px-4 text-center text-lg font-black text-white shadow-md transition hover:bg-sky-600 active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sky-800"
          >
            MULA BERMAIN
          </Link>
          <a
            href="#aktiviti"
            className="flex min-h-16 items-center justify-center rounded-2xl bg-emerald-400 px-4 text-center text-lg font-black text-emerald-950 shadow-md transition hover:bg-emerald-300 active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-800"
          >
            PILIH AKTIVITI
          </a>
          <Link
            href="/progress"
            className="flex min-h-16 items-center justify-center rounded-2xl bg-amber-300 px-4 text-center text-lg font-black text-amber-950 shadow-md transition hover:bg-amber-200 active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber-800"
          >
            PROGRESS SAYA
          </Link>
        </div>
      </section>

      <section id="aktiviti">
        <h2 className="mb-4 text-3xl font-black text-slate-800">Bacaan</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {readingGames.map((game, index) => (
            <GameCard
              key={game}
              title={GAME_META[game].title}
              emoji={GAME_META[game].emoji}
              description={GAME_META[game].description}
              href={`/play?game=${game}`}
              colorClass={GAME_COLORS[index % GAME_COLORS.length]}
            />
          ))}
        </div>
      </section>

      <section id="matematik">
        <h2 className="mb-4 text-3xl font-black text-slate-800">Matematik</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {mathGames.map((game, index) => (
            <GameCard
              key={game}
              title={GAME_META[game].title}
              emoji={GAME_META[game].emoji}
              description={GAME_META[game].description}
              href={`/play?game=${game}`}
              colorClass={GAME_COLORS[(index + 3) % GAME_COLORS.length]}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
