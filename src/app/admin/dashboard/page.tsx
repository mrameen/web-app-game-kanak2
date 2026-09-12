"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { usePlayers } from "@/hooks/usePlayers";
import { getAccuracy } from "@/lib/progress";
import type { Player } from "@/lib/types";

export default function AdminDashboardPage() {
  const router = useRouter();
  const { hydrated: authHydrated, loggedIn, logout } = useAdminAuth();
  const {
    hydrated,
    players,
    removePlayer,
    removeAllPlayers,
    resetProgress,
    selectPlayer,
  } = usePlayers();
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [confirmAll, setConfirmAll] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (authHydrated && !loggedIn) {
      router.replace("/admin");
    }
  }, [authHydrated, loggedIn, router]);

  const sorted = useMemo(
    () =>
      [...players].sort((a, b) =>
        a.name.localeCompare(b.name, "ms", { sensitivity: "base" }),
      ),
    [players],
  );

  if (!authHydrated || !hydrated || !loggedIn) {
    return (
      <AppShell showNav={false} title="Admin Dashboard">
        <div className="text-xl font-bold text-slate-600">Memuatkan...</div>
      </AppShell>
    );
  }

  return (
    <AppShell showNav={false} title="Admin Dashboard">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <p className="text-lg font-bold text-slate-600">
          Jumlah pemain: {players.length.toLocaleString("en-US")}
        </p>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/"
            className="rounded-2xl bg-sky-100 px-4 py-2 text-sm font-black text-sky-800"
          >
            Laman permainan
          </Link>
          <button
            type="button"
            onClick={() => {
              logout();
              router.replace("/admin");
            }}
            className="rounded-2xl bg-slate-800 px-4 py-2 text-sm font-black text-white"
          >
            Log keluar
          </button>
        </div>
      </div>

      {message ? (
        <p className="mb-4 font-bold text-emerald-700" role="status">
          {message}
        </p>
      ) : null}

      {sorted.length === 0 ? (
        <div className="rounded-[2rem] bg-white/85 p-8 text-center shadow-lg">
          <p className="text-xl font-black text-slate-700">Tiada pemain lagi</p>
        </div>
      ) : (
        <div className="space-y-4">
          {sorted.map((player) => (
            <PlayerAdminCard
              key={player.id}
              player={player}
              confirming={confirmId === player.id}
              onAskDelete={() => setConfirmId(player.id)}
              onCancelDelete={() => setConfirmId(null)}
              onConfirmDelete={() => {
                removePlayer(player.id);
                setConfirmId(null);
                setMessage(`Pemain ${player.name} dipadam.`);
              }}
              onReset={() => {
                resetProgress(player.id);
                setMessage(`Progress ${player.name} direset.`);
              }}
              onViewAs={() => {
                selectPlayer(player.id);
                router.push("/player");
              }}
            />
          ))}
        </div>
      )}

      {sorted.length > 0 ? (
        <section className="mt-8 rounded-[2rem] border-4 border-rose-200 bg-rose-50 p-6">
          <h2 className="text-xl font-black text-rose-800">Zon bahaya</h2>
          <p className="mt-1 text-sm font-semibold text-rose-700">
            Padam semua pemain pada peranti ini.
          </p>
          {!confirmAll ? (
            <button
              type="button"
              onClick={() => setConfirmAll(true)}
              className="mt-4 min-h-12 rounded-2xl bg-rose-500 px-5 font-black text-white"
            >
              Padam semua pemain
            </button>
          ) : (
            <div className="mt-4 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => {
                  removeAllPlayers();
                  setConfirmAll(false);
                  setMessage("Semua pemain telah dipadam.");
                }}
                className="min-h-12 rounded-2xl bg-rose-700 px-5 font-black text-white"
              >
                Ya, padam semua
              </button>
              <button
                type="button"
                onClick={() => setConfirmAll(false)}
                className="min-h-12 rounded-2xl bg-white px-5 font-bold text-slate-700 shadow"
              >
                Batal
              </button>
            </div>
          )}
        </section>
      ) : null}
    </AppShell>
  );
}

function PlayerAdminCard({
  player,
  confirming,
  onAskDelete,
  onCancelDelete,
  onConfirmDelete,
  onReset,
  onViewAs,
}: {
  player: Player;
  confirming: boolean;
  onAskDelete: () => void;
  onCancelDelete: () => void;
  onConfirmDelete: () => void;
  onReset: () => void;
  onViewAs: () => void;
}) {
  const accuracy = getAccuracy(player.progress);
  const lastPlayed = player.progress.lastPlayedAt
    ? new Date(player.progress.lastPlayedAt).toLocaleString("ms-MY", {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : "Belum main";

  return (
    <article className="rounded-[1.75rem] bg-white/90 p-5 shadow-md">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-2xl font-black text-slate-800">{player.name}</h3>
          <p className="text-sm font-bold text-slate-500">
            Umur {player.age} · ⭐ {player.progress.stars.toLocaleString("en-US")} ·
            Ketepatan {accuracy}%
          </p>
          <p className="mt-1 text-xs font-semibold text-slate-400">
            Last played: {lastPlayed}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onViewAs}
            className="rounded-xl bg-sky-500 px-3 py-2 text-sm font-black text-white"
          >
            Lihat sebagai
          </button>
          <button
            type="button"
            onClick={onReset}
            className="rounded-xl bg-amber-200 px-3 py-2 text-sm font-black text-amber-900"
          >
            Reset progress
          </button>
          {!confirming ? (
            <button
              type="button"
              onClick={onAskDelete}
              className="rounded-xl bg-rose-100 px-3 py-2 text-sm font-black text-rose-700"
            >
              Padam
            </button>
          ) : (
            <>
              <button
                type="button"
                onClick={onConfirmDelete}
                className="rounded-xl bg-rose-600 px-3 py-2 text-sm font-black text-white"
              >
                Ya, padam
              </button>
              <button
                type="button"
                onClick={onCancelDelete}
                className="rounded-xl bg-white px-3 py-2 text-sm font-bold text-slate-600 shadow"
              >
                Batal
              </button>
            </>
          )}
        </div>
      </div>
    </article>
  );
}
