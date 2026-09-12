"use client";

interface StarRewardProps {
  stars: number;
  message?: string;
  show?: boolean;
}

export function StarReward({ stars, message, show = true }: StarRewardProps) {
  if (!show) return null;

  return (
    <div className="flex flex-col items-center gap-2 animate-bounce-soft">
      <div className="text-5xl" aria-hidden>
        ⭐
      </div>
      {message ? (
        <p className="text-2xl font-black text-amber-700">{message}</p>
      ) : null}
      <p className="text-lg font-bold text-slate-700">+{stars} bintang</p>
    </div>
  );
}
