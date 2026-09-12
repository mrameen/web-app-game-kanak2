"use client";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { Confetti } from "@/components/Confetti";
import { GameResult } from "@/components/GameResult";
import { ProgressBar } from "@/components/ProgressBar";
import { StarReward } from "@/components/StarReward";
import { ListenPickGame } from "@/components/game/ListenPickGame";
import { CombineGame } from "@/components/game/CombineGame";
import { PickImageGame } from "@/components/game/PickImageGame";
import { ArrangeSyllablesGame } from "@/components/game/ArrangeSyllablesGame";
import { CompleteWordGame } from "@/components/game/CompleteWordGame";
import { usePlayers } from "@/hooks/usePlayers";
import { GAME_META, getGamesForAge } from "@/lib/content";
import { checkAnswer, generateLevelQuestions } from "@/lib/game-engine";
import { applyCorrectAnswer, applyWrongAnswer } from "@/lib/progress";
import { playAudio, playSuccessTone, playWrongTone, unlockAudio } from "@/lib/audio";
import type {
  GameQuestion,
  GameSessionResult,
  GameType,
  PlayerProgress,
} from "@/lib/types";

const QUESTIONS_PER_LEVEL = 5;

function isGameType(value: string | null): value is GameType {
  return (
    value === "listen-pick" ||
    value === "combine" ||
    value === "pick-image" ||
    value === "arrange-syllables" ||
    value === "complete-word"
  );
}

function PlayPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { hydrated, activePlayer, settings, saveProgress } = usePlayers();

  const [sessionId, setSessionId] = useState(0);
  const [index, setIndex] = useState(0);
  const [locked, setLocked] = useState(false);
  const [result, setResult] = useState<GameSessionResult | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [confettiKey, setConfettiKey] = useState(0);
  const [finished, setFinished] = useState(false);
  const [sessionStars, setSessionStars] = useState(0);
  const [localProgress, setLocalProgress] = useState<PlayerProgress | null>(
    null,
  );
  const [boundKey, setBoundKey] = useState<string | null>(null);

  const requestedGame = searchParams.get("game");

  const gameType: GameType | null = useMemo(() => {
    if (!activePlayer) return null;
    const allowed = getGamesForAge(activePlayer.age);
    if (isGameType(requestedGame) && allowed.includes(requestedGame)) {
      return requestedGame;
    }
    return allowed[0] ?? "listen-pick";
  }, [activePlayer, requestedGame]);

  const sessionKey =
    activePlayer && gameType
      ? `${activePlayer.id}:${gameType}:${sessionId}`
      : null;

  // Reset round state when player/game/session changes (React-recommended render adjustment).
  if (sessionKey && sessionKey !== boundKey && activePlayer) {
    setBoundKey(sessionKey);
    setLocalProgress(activePlayer.progress);
    setIndex(0);
    setResult(null);
    setLocked(false);
    setFinished(false);
    setSessionStars(0);
    setShowConfetti(false);
  }

  const questions: GameQuestion[] = useMemo(() => {
    if (!activePlayer || !gameType || !sessionKey) return [];
    return generateLevelQuestions(
      gameType,
      activePlayer.age,
      activePlayer.progress,
      QUESTIONS_PER_LEVEL,
    );
  }, [activePlayer, gameType, sessionKey]);

  useEffect(() => {
    if (hydrated && !activePlayer) {
      router.replace("/");
    }
  }, [hydrated, activePlayer, router]);

  useEffect(() => {
    const unlock = () => unlockAudio();
    window.addEventListener("pointerdown", unlock, { once: true });
    window.addEventListener("keydown", unlock, { once: true });
    return () => {
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
    };
  }, []);

  const current = questions[index];

  const handleAnswer = useCallback(
    (answer: string) => {
      if (!current || !localProgress || locked || !gameType) return;

      const correct = checkAnswer(current, answer);
      setLocked(true);

      if (correct) {
        const { progress, result: nextResult } = applyCorrectAnswer(
          localProgress,
          current.contentId,
          `${gameType}-${current.contentId}`,
        );
        setLocalProgress(progress);
        saveProgress(progress);
        setResult(nextResult);
        setSessionStars((s) => s + nextResult.starsEarned);
        setConfettiKey((k) => k + 1);
        setShowConfetti(true);
        if (settings.soundEnabled) {
          unlockAudio();
          playSuccessTone(settings.volume);
          // Biar "Betul!" dengar dulu, kemudian ulang jawapan
          window.setTimeout(() => {
            void playAudio(current.targetText, current.promptAudio, {
              volume: settings.volume,
              soundEnabled: true,
            });
          }, 700);
        }
      } else {
        const { progress, result: nextResult } =
          applyWrongAnswer(localProgress);
        setLocalProgress(progress);
        saveProgress(progress);
        setResult(nextResult);
        setShowConfetti(false);
        if (settings.soundEnabled) {
          unlockAudio();
          playWrongTone(settings.volume);
        }
      }
    },
    [
      current,
      localProgress,
      locked,
      gameType,
      saveProgress,
      settings.soundEnabled,
      settings.volume,
    ],
  );

  const goNext = () => {
    setShowConfetti(false);
    setResult(null);
    setLocked(false);

    if (index + 1 >= questions.length) {
      setFinished(true);
      return;
    }
    setIndex((i) => i + 1);
  };

  if (!hydrated || !activePlayer || !gameType || !localProgress) {
    return (
      <AppShell>
        <div className="text-xl font-bold text-slate-600">Memuatkan...</div>
      </AppShell>
    );
  }

  if (finished) {
    return (
      <AppShell>
        <div className="mx-auto max-w-xl rounded-[2rem] bg-white/90 p-8 text-center shadow-xl">
          <p className="text-6xl" aria-hidden>
            🏆
          </p>
          <h1 className="mt-4 text-4xl font-black text-slate-800">
            Tahniah, {activePlayer.name}!
          </h1>
          <StarReward stars={sessionStars} message="Level selesai!" />
          <p className="mt-4 text-lg font-bold text-slate-600">
            Jumlah bintang: {localProgress.stars.toLocaleString("en-US")}
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => setSessionId((s) => s + 1)}
              className="min-h-14 flex-1 rounded-2xl bg-emerald-500 text-lg font-black text-white shadow-md"
            >
              Main lagi
            </button>
            <Link
              href="/player"
              className="flex min-h-14 flex-1 items-center justify-center rounded-2xl bg-sky-500 text-lg font-black text-white shadow-md"
            >
              Dashboard
            </Link>
          </div>
        </div>
      </AppShell>
    );
  }

  if (!current) {
    return (
      <AppShell>
        <div className="text-xl font-bold text-slate-600">
          Menyediakan soalan...
        </div>
      </AppShell>
    );
  }

  const meta = GAME_META[gameType];
  const sharedProps = {
    question: current,
    disabled: locked,
    volume: settings.volume,
    soundEnabled: settings.soundEnabled,
    onAnswer: handleAnswer,
  };

  return (
    <AppShell>
      <Confetti active={showConfetti} burstKey={confettiKey} />

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-bold uppercase tracking-wide text-sky-700">
            {meta.emoji} {meta.title}
          </p>
          <h1 className="text-2xl font-black text-slate-800 sm:text-3xl">
            Soalan {(index + 1).toLocaleString("en-US")} /{" "}
            {questions.length.toLocaleString("en-US")}
          </h1>
        </div>
        <div className="rounded-2xl bg-amber-100 px-4 py-2 text-lg font-black text-amber-800">
          ⭐ {localProgress.stars.toLocaleString("en-US")}
        </div>
      </div>

      <div className="mb-6">
        <ProgressBar
          value={index + (result?.correct ? 1 : 0)}
          max={questions.length}
        />
      </div>

      {gameType === "listen-pick" ? (
        <ListenPickGame key={current.id} {...sharedProps} />
      ) : null}
      {gameType === "combine" ? (
        <CombineGame key={current.id} {...sharedProps} />
      ) : null}
      {gameType === "pick-image" ? (
        <PickImageGame key={current.id} {...sharedProps} />
      ) : null}
      {gameType === "arrange-syllables" ? (
        <ArrangeSyllablesGame key={current.id} {...sharedProps} />
      ) : null}
      {gameType === "complete-word" ? (
        <CompleteWordGame key={current.id} {...sharedProps} />
      ) : null}

      {result ? (
        <GameResult
          correct={result.correct}
          message={result.message}
          starsEarned={result.starsEarned}
          leveledUp={result.leveledUp}
          onNext={goNext}
          nextLabel={
            index + 1 >= questions.length ? "Lihat ganjaran" : "Seterusnya"
          }
        />
      ) : null}

      <div className="mt-8 text-center">
        <Link
          href="/player"
          className="text-base font-bold text-slate-600 underline-offset-4 hover:underline"
        >
          Keluar ke dashboard
        </Link>
      </div>
    </AppShell>
  );
}

export default function PlayPage() {
  return (
    <Suspense
      fallback={
        <AppShell>
          <div className="text-xl font-bold text-slate-600">Memuatkan...</div>
        </AppShell>
      }
    >
      <PlayPageInner />
    </Suspense>
  );
}
