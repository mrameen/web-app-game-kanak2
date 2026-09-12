"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { AgeSelector } from "@/components/AgeSelector";
import { PlayerSelector } from "@/components/PlayerSelector";
import { usePlayers } from "@/hooks/usePlayers";
import type { AgeGroup } from "@/lib/types";

export default function HomePage() {
  const router = useRouter();
  const { hydrated, players, activePlayer, selectPlayer, addPlayer } =
    usePlayers();
  const [mode, setMode] = useState<"list" | "create">("list");
  const [name, setName] = useState("");
  const [age, setAge] = useState<AgeGroup | null>(null);
  const [error, setError] = useState("");

  if (!hydrated) {
    return (
      <AppShell showNav={false}>
        <div className="flex min-h-[50vh] items-center justify-center text-xl font-bold text-slate-600">
          Memuatkan...
        </div>
      </AppShell>
    );
  }

  const handleCreate = () => {
    if (!name.trim()) {
      setError("Masukkan nama");
      return;
    }
    if (!age) {
      setError("Pilih umur");
      return;
    }
    addPlayer(name.trim(), age);
    router.push("/player");
  };

  return (
    <AppShell showNav={players.length > 0}>
      <section className="mb-8 text-center">
        <p className="text-5xl" aria-hidden>
          📚
        </p>
        <h1 className="mt-3 text-4xl font-black text-sky-800 sm:text-5xl">
          Baca Ceria
        </h1>
        <p className="mt-2 text-xl font-bold text-slate-700">
          Jom belajar membaca sambil bermain!
        </p>
      </section>

      {mode === "list" ? (
        <div className="space-y-6">
          {players.length > 0 ? (
            <>
              <h2 className="text-2xl font-black text-slate-800">
                Siapa bermain?
              </h2>
              <PlayerSelector
                players={players}
                activePlayerId={activePlayer?.id}
                onSelect={(id) => {
                  selectPlayer(id);
                  router.push("/player");
                }}
                onAdd={() => {
                  setMode("create");
                  setError("");
                }}
              />
            </>
          ) : (
            <div className="rounded-[2rem] bg-white/80 p-8 text-center shadow-lg">
              <p className="text-2xl font-black text-slate-800">
                Selamat datang!
              </p>
              <p className="mt-2 text-lg font-semibold text-slate-600">
                Buat profil pemain untuk mula.
              </p>
              <button
                type="button"
                onClick={() => setMode("create")}
                className="mt-6 min-h-16 rounded-2xl bg-sky-500 px-8 text-xl font-black text-white shadow-md transition hover:bg-sky-600 active:scale-95"
              >
                Tambah Pemain
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-6 rounded-[2rem] bg-white/85 p-6 shadow-lg">
          <h2 className="text-3xl font-black text-slate-800">Pemain baharu</h2>

          <label className="block">
            <span className="mb-2 block text-lg font-bold text-slate-700">
              Nama
            </span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={20}
              placeholder="Contoh: Aiman"
              aria-label="Nama pemain"
              className="min-h-14 w-full rounded-2xl border-4 border-sky-200 bg-white px-4 text-2xl font-bold text-slate-800 outline-none focus:border-sky-500"
            />
          </label>

          <div>
            <p className="mb-3 text-lg font-bold text-slate-700">Umur saya</p>
            <AgeSelector value={age} onSelect={setAge} />
          </div>

          {error ? (
            <p className="text-base font-bold text-rose-600" role="alert">
              {error}
            </p>
          ) : null}

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={handleCreate}
              className="min-h-14 flex-1 rounded-2xl bg-emerald-500 px-6 text-xl font-black text-white shadow-md transition hover:bg-emerald-600 active:scale-95"
            >
              Simpan & Mula
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("list");
                setError("");
              }}
              className="min-h-14 rounded-2xl bg-white px-6 text-lg font-bold text-slate-700 shadow"
            >
              Kembali
            </button>
          </div>
        </div>
      )}
    </AppShell>
  );
}
