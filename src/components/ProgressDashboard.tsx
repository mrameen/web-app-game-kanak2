"use client";

import type { Player } from "@/lib/types";
import { getAccuracy } from "@/lib/progress";
import { getItemById } from "@/lib/content";

interface ProgressDashboardProps {
  player: Player;
}

export function ProgressDashboard({ player }: ProgressDashboardProps) {
  const { progress } = player;
  const accuracy = getAccuracy(progress);
  const mastered = progress.completedWords
    .map((id) => getItemById(id))
    .filter(Boolean)
    .slice(-20);

  const lastPlayed = progress.lastPlayedAt
    ? new Date(progress.lastPlayedAt).toLocaleString("ms-MY", {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : "Belum main";

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] bg-white/85 p-6 shadow-lg">
        <h1 className="text-4xl font-black text-slate-800">{player.name}</h1>
        <p className="mt-1 text-xl font-bold text-slate-600">
          Umur: {player.age}
        </p>
        <p
          className="mt-4 text-3xl tracking-wide"
          aria-label={`${progress.stars.toLocaleString("en-US")} bintang`}
        >
          {progress.stars === 0
            ? "☆"
            : `${"⭐".repeat(Math.min(8, progress.stars))}${
                progress.stars > 8
                  ? ` +${(progress.stars - 8).toLocaleString("en-US")}`
                  : ""
              }`}
        </p>
        <p className="mt-2 text-lg font-bold text-amber-700">
          {progress.stars.toLocaleString("en-US")} bintang
        </p>
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        <StatCard label="Aktiviti selesai" value={progress.completedActivities.length} />
        <StatCard label="Jawapan betul" value={progress.correctAnswers} />
        <StatCard label="Ketepatan" value={`${accuracy}%`} />
        <StatCard label="Tahap" value={progress.currentLevel} />
      </section>

      <section className="rounded-[2rem] bg-white/85 p-6 shadow-lg">
        <h2 className="text-2xl font-black text-slate-800">Perkataan dikuasai</h2>
        {mastered.length === 0 ? (
          <p className="mt-3 text-lg font-semibold text-slate-600">
            Belum ada lagi. Jom main!
          </p>
        ) : (
          <ul className="mt-4 grid gap-2 sm:grid-cols-2">
            {mastered.map((item) => (
              <li
                key={item!.id}
                className="rounded-2xl bg-emerald-50 px-4 py-3 text-lg font-bold text-emerald-900"
              >
                ✓ {item!.emoji ? `${item!.emoji} ` : ""}
                {item!.text}
              </li>
            ))}
          </ul>
        )}
      </section>

      <p className="text-center text-base font-semibold text-slate-600">
        Last played: {lastPlayed}
      </p>
    </div>
  );
}

function StatCard({
  label,
  value,
}: {
  label: string;
  value: number | string;
}) {
  const display =
    typeof value === "number" ? value.toLocaleString("en-US") : value;

  return (
    <div className="rounded-[1.75rem] bg-white/85 p-5 shadow-md">
      <p className="text-sm font-bold uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="mt-2 text-3xl font-black text-slate-800">{display}</p>
    </div>
  );
}
