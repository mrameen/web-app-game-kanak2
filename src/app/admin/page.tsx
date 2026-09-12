"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { useAdminAuth } from "@/hooks/useAdminAuth";

export default function AdminLoginPage() {
  const router = useRouter();
  const { hydrated, loggedIn, login } = useAdminAuth();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (hydrated && loggedIn) {
      router.replace("/admin/dashboard");
    }
  }, [hydrated, loggedIn, router]);

  if (!hydrated) {
    return (
      <AppShell showNav={false}>
        <div className="text-xl font-bold text-slate-600">Memuatkan...</div>
      </AppShell>
    );
  }

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!login(password)) {
      setError("Kata laluan salah");
      return;
    }
    router.push("/admin/dashboard");
  };

  return (
    <AppShell showNav={false} title="Admin">
      <div className="mx-auto max-w-md rounded-[2rem] bg-white/90 p-6 shadow-lg">
        <p className="text-base font-semibold text-slate-600">
          Log masuk untuk urus pemain & progress.
        </p>

        <form onSubmit={handleLogin} className="mt-6 space-y-4">
          <label className="block">
            <span className="mb-2 block text-sm font-bold text-slate-700">
              Kata laluan
            </span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              aria-label="Kata laluan admin"
              className="min-h-12 w-full rounded-2xl border-4 border-slate-200 px-4 text-lg font-bold text-slate-800 outline-none focus:border-sky-500"
            />
          </label>

          {error ? (
            <p className="font-bold text-rose-600" role="alert">
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            className="min-h-12 w-full rounded-2xl bg-slate-800 text-lg font-black text-white"
          >
            Log masuk
          </button>
        </form>

        <Link
          href="/"
          className="mt-6 block text-center text-sm font-bold text-sky-700 underline-offset-4 hover:underline"
        >
          Kembali ke permainan
        </Link>
      </div>
    </AppShell>
  );
}
