"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { ProgressDashboard } from "@/components/ProgressDashboard";
import { usePlayers } from "@/hooks/usePlayers";
import Link from "next/link";

export default function ProgressPage() {
  const router = useRouter();
  const { hydrated, activePlayer } = usePlayers();

  useEffect(() => {
    if (hydrated && !activePlayer) {
      router.replace("/");
    }
  }, [hydrated, activePlayer, router]);

  if (!hydrated || !activePlayer) {
    return (
      <AppShell title="Progress">
        <div className="text-xl font-bold text-slate-600">Memuatkan...</div>
      </AppShell>
    );
  }

  return (
    <AppShell title="Progress">
      <ProgressDashboard player={activePlayer} />
      <div className="mt-8 flex justify-center">
        <Link
          href="/player"
          className="min-h-14 rounded-2xl bg-sky-500 px-8 text-lg font-black leading-[3.5rem] text-white shadow-md"
        >
          Kembali bermain
        </Link>
      </div>
    </AppShell>
  );
}
