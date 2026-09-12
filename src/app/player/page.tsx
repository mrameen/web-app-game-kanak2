"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { PlayerDashboard } from "@/components/PlayerDashboard";
import { usePlayers } from "@/hooks/usePlayers";

export default function PlayerPage() {
  const router = useRouter();
  const { hydrated, activePlayer, updateAge } = usePlayers();

  useEffect(() => {
    if (hydrated && !activePlayer) {
      router.replace("/");
    }
  }, [hydrated, activePlayer, router]);

  if (!hydrated || !activePlayer) {
    return (
      <AppShell>
        <div className="flex min-h-[40vh] items-center justify-center text-xl font-bold text-slate-600">
          Memuatkan...
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <PlayerDashboard
        player={activePlayer}
        onChangeAge={(age) => {
          updateAge(age);
        }}
      />
    </AppShell>
  );
}
