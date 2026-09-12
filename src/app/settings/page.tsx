"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { AgeSelector } from "@/components/AgeSelector";
import { usePlayers } from "@/hooks/usePlayers";
import { unlockAudio } from "@/lib/audio";
import {
  celebrateBgMusic,
  startBgMusic,
  stopBgMusic,
  tapBgMusic,
} from "@/lib/bg-music";

export default function SettingsPage() {
  const router = useRouter();
  const {
    hydrated,
    activePlayer,
    settings,
    saveSettings,
    resetProgress,
    logoutPlayer,
    updateAge,
  } = usePlayers();
  const [confirmReset, setConfirmReset] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (hydrated && !activePlayer) {
      router.replace("/");
    }
  }, [hydrated, activePlayer, router]);

  if (!hydrated || !activePlayer) {
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
          <h2 className="text-2xl font-black text-slate-800">Akaun saya</h2>
          <p className="mt-2 text-lg font-semibold text-slate-600">
            {activePlayer.name} · Umur {activePlayer.age}
          </p>
          <button
            type="button"
            onClick={() => {
              logoutPlayer();
              router.replace("/");
            }}
            className="mt-4 inline-flex min-h-12 items-center rounded-2xl bg-sky-500 px-5 text-base font-black text-white"
          >
            Keluar / Tukar nama
          </button>
        </section>

        <section className="rounded-[2rem] bg-white/85 p-6 shadow-lg">
          <h2 className="text-2xl font-black text-slate-800">Tukar umur</h2>
          <p className="mt-2 mb-4 text-base font-semibold text-slate-600">
            Boleh tukar bila-bila masa. Tahap permainan akan ikut umur baharu.
          </p>
          <AgeSelector
            compact
            value={activePlayer.age}
            onSelect={(age) => {
              updateAge(age);
              setMessage(`Umur dikemaskini ke ${age} tahun.`);
            }}
          />
        </section>

        <section className="space-y-4 rounded-[2rem] bg-white/85 p-6 shadow-lg">
          <h2 className="text-2xl font-black text-slate-800">Bunyi</h2>

          <ToggleRow
            label="Bunyi (sound)"
            checked={settings.soundEnabled}
            onChange={(checked) => saveSettings({ soundEnabled: checked })}
          />
          <ToggleRow
            label="Muzik latar"
            checked={settings.musicEnabled}
            onChange={(checked) => {
              unlockAudio();
              saveSettings({ musicEnabled: checked });
              if (checked) {
                void startBgMusic(settings.volume).then(() => {
                  tapBgMusic(settings.volume);
                  window.setTimeout(() => celebrateBgMusic(settings.volume), 180);
                });
                setMessage("Muzik latar dihidupkan — cuba jawab soalan!");
              } else {
                stopBgMusic();
                setMessage("Muzik latar dimatikan.");
              }
            }}
          />

          {settings.musicEnabled ? (
            <div className="flex items-center gap-3 rounded-2xl bg-amber-50 px-4 py-3">
              <div className="flex h-8 items-end gap-1" aria-hidden>
                {[0, 1, 2, 3, 4].map((i) => (
                  <span
                    key={i}
                    className="animate-bgm-bar w-1.5 rounded-full bg-amber-500"
                    style={{
                      height: `${10 + (i % 3) * 7}px`,
                      animationDelay: `${i * 0.09}s`,
                    }}
                  />
                ))}
              </div>
              <p className="text-sm font-bold text-amber-900">
                Muzik ikut permainan — betul ada sparkle, salah ada nada lembut.
              </p>
            </div>
          ) : null}

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
          <h2 className="text-2xl font-black text-slate-800">Progress saya</h2>
          <p className="mt-2 text-base font-semibold text-slate-600">
            Reset progress akaun ini sahaja.
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
                Pastikan? Progress {activePlayer.name} akan dipadam.
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
