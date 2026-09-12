"use client";

import Link from "next/link";
import { Home, Settings, BarChart3 } from "lucide-react";
import { BackgroundMusic } from "@/components/BackgroundMusic";

interface AppShellProps {
  children: React.ReactNode;
  title?: string;
  showNav?: boolean;
}

export function AppShell({ children, title, showNav = true }: AppShellProps) {
  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <BackgroundMusic />
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_20%_20%,#fde68a55,transparent_35%),radial-gradient(circle_at_80%_0%,#7dd3fc66,transparent_40%),radial-gradient(circle_at_50%_80%,#86efac55,transparent_40%),linear-gradient(180deg,#e0f2fe,#fff7ed)]" />

      <header className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
        <Link
          href="/"
          className="rounded-2xl bg-white/70 px-4 py-2 text-xl font-black text-sky-800 shadow-sm backdrop-blur transition hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sky-700"
          aria-label="Laman utama Baca Ceria"
        >
          Baca Ceria
        </Link>
        {showNav ? (
          <nav className="flex items-center gap-2" aria-label="Navigasi utama">
            <NavIcon href="/player" label="Dashboard" icon={<Home className="h-5 w-5" />} />
            <NavIcon href="/progress" label="Progress" icon={<BarChart3 className="h-5 w-5" />} />
            <NavIcon href="/settings" label="Settings" icon={<Settings className="h-5 w-5" />} />
          </nav>
        ) : null}
      </header>

      <main className="mx-auto w-full max-w-5xl px-4 pb-16 sm:px-6">
        {title ? (
          <h1 className="mb-6 text-3xl font-black text-slate-800 sm:text-4xl">
            {title}
          </h1>
        ) : null}
        {children}
      </main>
    </div>
  );
}

function NavIcon({
  href,
  label,
  icon,
}: {
  href: string;
  label: string;
  icon: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      aria-label={label}
      className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/80 text-sky-800 shadow-sm transition hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sky-700"
    >
      {icon}
    </Link>
  );
}
