"use client";

interface LevelCompleteSummaryProps {
  playerName: string;
  gameTitle: string;
  starsEarned: number;
  correctCount: number;
  wrongCount: number;
  totalStars: number;
  onPlayAgain: () => void;
  onDashboard: () => void;
}

export function LevelCompleteSummary({
  playerName,
  gameTitle,
  starsEarned,
  correctCount,
  wrongCount,
  totalStars,
  onPlayAgain,
  onDashboard,
}: LevelCompleteSummaryProps) {
  const total = correctCount + wrongCount;
  const accuracy =
    total === 0 ? 0 : Math.round((correctCount / total) * 100);

  return (
    <div className="mx-auto max-w-xl rounded-[2rem] bg-white/95 p-8 text-center shadow-xl">
      <p className="text-6xl" aria-hidden>
        🏆
      </p>
      <h1 className="mt-4 text-4xl font-black text-slate-800">
        Tahniah, {playerName}!
      </h1>
      <p className="mt-2 text-lg font-bold text-sky-700">{gameTitle} selesai</p>

      <div className="mt-6 rounded-[1.75rem] bg-amber-50 p-5">
        <p className="text-sm font-bold uppercase tracking-wide text-amber-700">
          Markah pusingan ini
        </p>
        <p className="mt-2 text-5xl font-black text-amber-600">
          ⭐ {starsEarned.toLocaleString("en-US")}
        </p>
        <p className="mt-1 text-lg font-bold text-amber-800">
          bintang diperolehi
        </p>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-3">
        <div className="rounded-2xl bg-emerald-50 p-3">
          <p className="text-2xl font-black text-emerald-700">
            {correctCount.toLocaleString("en-US")}
          </p>
          <p className="text-xs font-bold text-emerald-800">Betul</p>
        </div>
        <div className="rounded-2xl bg-rose-50 p-3">
          <p className="text-2xl font-black text-rose-700">
            {wrongCount.toLocaleString("en-US")}
          </p>
          <p className="text-xs font-bold text-rose-800">Salah</p>
        </div>
        <div className="rounded-2xl bg-sky-50 p-3">
          <p className="text-2xl font-black text-sky-700">
            {accuracy.toLocaleString("en-US")}%
          </p>
          <p className="text-xs font-bold text-sky-800">Ketepatan</p>
        </div>
      </div>

      <p className="mt-5 text-base font-bold text-slate-600">
        Jumlah bintang semua:{" "}
        <span className="text-amber-700">
          ⭐ {totalStars.toLocaleString("en-US")}
        </span>
      </p>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={onPlayAgain}
          className="min-h-14 flex-1 rounded-2xl bg-emerald-500 text-lg font-black text-white shadow-md"
        >
          Main lagi
        </button>
        <button
          type="button"
          onClick={onDashboard}
          className="min-h-14 flex-1 rounded-2xl bg-sky-500 text-lg font-black text-white shadow-md"
        >
          Dashboard
        </button>
      </div>
    </div>
  );
}
