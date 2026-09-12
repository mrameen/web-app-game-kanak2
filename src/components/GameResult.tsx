"use client";

interface GameResultProps {
  correct: boolean;
  message: string;
  starsEarned: number;
  leveledUp?: boolean;
  onNext: () => void;
  nextLabel?: string;
}

export function GameResult({
  correct,
  message,
  starsEarned,
  leveledUp = false,
  onNext,
  nextLabel = "Seterusnya",
}: GameResultProps) {
  return (
    <div
      className={`mt-6 rounded-[2rem] p-6 text-center shadow-lg ${
        correct
          ? "bg-emerald-100 border-4 border-emerald-300"
          : "bg-amber-50 border-4 border-amber-200"
      }`}
      role="status"
      aria-live="polite"
    >
      <p className="text-4xl" aria-hidden>
        {correct ? "🎉" : "💪"}
      </p>
      <p className="mt-2 text-3xl font-black text-slate-800">{message}</p>
      {correct ? (
        <p className="mt-1 text-lg font-bold text-amber-700">
          +{starsEarned} ⭐
        </p>
      ) : null}
      {leveledUp ? (
        <p className="mt-2 text-base font-bold text-sky-700">
          Tahap baharu dibuka! 🚀
        </p>
      ) : null}
      <button
        type="button"
        onClick={onNext}
        aria-label={nextLabel}
        className="mt-5 min-h-14 w-full rounded-2xl bg-sky-500 px-6 text-xl font-black text-white shadow-md transition hover:bg-sky-600 active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sky-800"
      >
        {nextLabel}
      </button>
    </div>
  );
}
