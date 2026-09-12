"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { AgeSelector } from "@/components/AgeSelector";
import { usePlayers } from "@/hooks/usePlayers";
import type { AgeGroup } from "@/lib/types";

export default function HomePage() {
  const router = useRouter();
  const { hydrated, activePlayer, resumeOrCreate, logoutPlayer } = usePlayers();
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

  const handleStart = () => {
    if (!name.trim()) {
      setError("Masukkan nama anda");
      return;
    }
    if (!age) {
      setError("Pilih umur anda");
      return;
    }
    resumeOrCreate(name.trim(), age);
    router.push("/player");
  };

  return (
    <AppShell showNav={Boolean(activePlayer)}>
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

      {activePlayer ? (
        <div className="mx-auto max-w-lg space-y-4 rounded-[2rem] bg-white/85 p-6 text-center shadow-lg">
          <p className="text-lg font-bold text-slate-600">Selamat kembali,</p>
          <p className="text-3xl font-black text-slate-800">
            {activePlayer.name}! 👋
          </p>
          <button
            type="button"
            onClick={() => router.push("/player")}
            className="min-h-16 w-full rounded-2xl bg-sky-500 px-6 text-xl font-black text-white shadow-md transition hover:bg-sky-600 active:scale-95"
          >
            Teruskan bermain
          </button>
          <button
            type="button"
            onClick={() => {
              logoutPlayer();
              setName("");
              setAge(null);
              setError("");
            }}
            className="text-base font-bold text-slate-500 underline-offset-4 hover:underline"
          >
            Bukan saya? Masuk nama lain
          </button>
        </div>
      ) : null}

      <div className="mx-auto mt-6 max-w-lg space-y-6 rounded-[2rem] bg-white/85 p-6 shadow-lg">
        <h2 className="text-center text-2xl font-black text-slate-800">
          {activePlayer ? "Masuk nama lain" : "Siapa nama kamu?"}
        </h2>

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

        <button
          type="button"
          onClick={handleStart}
          className="min-h-16 w-full rounded-2xl bg-emerald-500 px-6 text-xl font-black text-white shadow-md transition hover:bg-emerald-600 active:scale-95"
        >
          Mula bermain
        </button>
      </div>

      <p className="mt-10 text-center text-sm font-semibold text-slate-400">
        <Link
          href="/admin"
          className="hover:text-slate-600 hover:underline"
          aria-label="Log masuk admin"
        >
          Admin
        </Link>
      </p>
    </AppShell>
  );
}
