"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { usePlayers } from "@/hooks/usePlayers";

export default function SettingsPage() {
  const router = useRouter();
  const {
    hydrated,
    activePlayer,
    settings,
    saveSettings,
    resetProgress,
    players,
  } = usePlayers();
  const [confirmReset, setConfirmReset] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (hydrated && players.length === 0) {
      router.replace("/");
    }
  }, [hydrated, players.length, router]);

  if (!hydrated) {
    return (
      <AppShell title="Settings">
        <div className="text-xl font-bold text-slate-600">Memuatkan...</div>
      </AppShell>
    );
  }

  return (
    <AppShell title="Settings">
      <div className="space-y-5">
        <section className="rounded-[2rem] bg-white/85 p-6 shadow-lg">
          <h2 className="text-2xl font-black text-slate-800">Pemain</h2>
          <p className="mt-2 text-lg font-semibold text-slate-600">
            Aktif: {activePlayer?.name ?? "Tiada"}
          </p>
          <Link
            href="/"
            className="mt-4 inline-flex min-h-12 items-center rounded-2xl bg-sky-500 px-5 text-base font-black text-white"
          >
            Tukar pemain
          </Link>
        </section>

        <section className="rounded-[2rem] bg-white/85 p-6 shadow-lg space-y-4">
          <h2 className="text-2xl font-black text-slate-800">Bunyi</h2>

          <ToggleRow
            label="Bunyi (sound)"
            checked={settings.soundEnabled}
            onChange={(checked) => saveSettings({ soundEnabled: checked })}
          />
          <ToggleRow
            label="Muzik latar"
            checked={settings.musicEnabled}
            onChange={(checked) => saveSettings({ musicEnabled: checked })}
          />

          <label className="block">
            <span className="mb-2 block text-base font-bold text-slate-700">
              Volume: {Math.round(settings.volume * 100)}%
            </span>
            <input
              type="range"
              min={0}
              max={100}
              value={Math.round(settings.volume * 100)}
              aria-label="Volume"
              onChange={(e) =>
                saveSettings({ volume: Number(e.target.value) / 100 })
              }
              className="w-full accent-sky-500"
            />
          </label>
        </section>

        <section className="rounded-[2rem] bg-white/85 p-6 shadow-lg">
          <h2 className="text-2xl font-black text-slate-800">Progress</h2>
          <p className="mt-2 text-base font-semibold text-slate-600">
            Reset progress pemain aktif.
          </p>

          {!confirmReset ? (
            <button
              type="button"
              onClick={() => setConfirmReset(true)}
              className="mt-4 min-h-12 rounded-2xl bg-rose-100 px-5 text-base font-black text-rose-700"
            >
              Reset progress
            </button>
          ) : (
            <div className="mt-4 space-y-3 rounded-2xl bg-rose-50 p-4">
              <p className="font-bold text-rose-800">
                Pastikan? Progress {activePlayer?.name} akan dipadam.
              </p>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    resetProgress();
                    setConfirmReset(false);
                    setMessage("Progress telah direset.");
                  }}
                  className="min-h-12 rounded-2xl bg-rose-500 px-5 font-black text-white"
                >
                  Ya, reset
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmReset(false)}
                  className="min-h-12 rounded-2xl bg-white px-5 font-bold text-slate-700 shadow"
                >
                  Batal
                </button>
              </div>
            </div>
          )}

          {message ? (
            <p className="mt-3 font-bold text-emerald-700" role="status">
              {message}
            </p>
          ) : null}
        </section>
      </div>
    </AppShell>
  );
}

function ToggleRow({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex items-center justify-between gap-4 rounded-2xl bg-sky-50 px-4 py-3">
      <span className="text-lg font-bold text-slate-800">{label}</span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        aria-label={label}
        className="h-6 w-6 accent-sky-500"
      />
    </label>
  );
}
