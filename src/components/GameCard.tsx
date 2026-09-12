"use client";

import Link from "next/link";

interface GameCardProps {
  title: string;
  emoji: string;
  description: string;
  href: string;
  colorClass?: string;
}

export function GameCard({
  title,
  emoji,
  description,
  href,
  colorClass = "from-sky-300 to-cyan-200",
}: GameCardProps) {
  return (
    <Link
      href={href}
      aria-label={`Main ${title}`}
      className={`flex min-h-[9rem] flex-col justify-between rounded-[2rem] bg-gradient-to-br ${colorClass} p-5 shadow-lg transition hover:-translate-y-1 hover:shadow-xl active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sky-700`}
    >
      <span className="text-4xl" aria-hidden>
        {emoji}
      </span>
      <div>
        <h3 className="text-2xl font-black text-slate-800">{title}</h3>
        <p className="mt-1 text-base font-semibold text-slate-700/80">
          {description}
        </p>
      </div>
    </Link>
  );
}
