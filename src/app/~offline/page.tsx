"use client";

import Link from "next/link";
import { AppShell } from "@/components/AppShell";

export default function OfflinePage() {
  return (
    <AppShell showNav={false} title="Luar talian">
      <div className="rounded-[2rem] bg-white/85 p-8 text-center shadow-lg">
        <p className="text-5xl" aria-hidden>
          📡
        </p>
        <p className="mt-4 text-xl font-black text-slate-800">
          Tiada sambungan internet
        </p>
        <p className="mt-2 text-base font-semibold text-slate-600">
          Semak Wi‑Fi atau data, kemudian cuba lagi.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex min-h-12 items-center rounded-2xl bg-sky-500 px-6 text-base font-black text-white"
        >
          Cuba semula
        </Link>
      </div>
    </AppShell>
  );
}
