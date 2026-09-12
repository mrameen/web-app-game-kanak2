"use client";

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { Confetti } from "@/components/Confetti";
import { GameResult } from "@/components/GameResult";
import { ProgressBar } from "@/components/ProgressBar";
import { LevelCompleteSummary } from "@/components/LevelCompleteSummary";
import { ListenPickGame } from "@/components/game/ListenPickGame";
import { CombineGame } from "@/components/game/CombineGame";
import { PickImageGame } from "@/components/game/PickImageGame";
import { ArrangeSyllablesGame } from "@/components/game/ArrangeSyllablesGame";
import { CompleteWordGame } from "@/components/game/CompleteWordGame";
import { MathCountGame } from "@/components/game/MathCountGame";
import { MathEquationGame } from "@/components/game/MathEquationGame";
import { usePlayers } from "@/hooks/usePlayers";
import { GAME_META, getGamesForAge } from "@/lib/content";
import { checkAnswer, generateLevelQuestions } from "@/lib/game-engine";
import { applyCorrectAnswer, applyWrongAnswer } from "@/lib/progress";
import { playAudio, playSuccessTone, playWrongTone, stopAudio, unlockAudio } from "@/lib/audio";
import {
  celebrateBgMusic,
  duckBgMusic,
  encourageBgMusic,
  tapBgMusic,
} from "@/lib/bg-music";
import { numberToMalay } from "@/lib/math-speech";
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
    value === "complete-word" ||
    value === "math-count" ||
    value === "math-add" ||
    value === "math-subtract"
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
  const [sessionCorrect, setSessionCorrect] = useState(0);
  const [sessionWrong, setSessionWrong] = useState(0);
  const [localProgress, setLocalProgress] = useState<PlayerProgress | null>(
    null,
  );
  const [boundKey, setBoundKey] = useState<string | null>(null);
  const [questions, setQuestions] = useState<GameQuestion[]>([]);
  const feedbackTimerRef = useRef<number | null>(null);
  const finishTimerRef = useRef<number | null>(null);

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
  // Questions are frozen for the whole round so saving progress cannot regenerate/retrigger audio.
  if (sessionKey && sessionKey !== boundKey && activePlayer && gameType) {
    setBoundKey(sessionKey);
    setLocalProgress(activePlayer.progress);
    setQuestions(
      generateLevelQuestions(
        gameType,
        activePlayer.age,
        activePlayer.progress,
        QUESTIONS_PER_LEVEL,
      ),
    );
    setIndex(0);
    setResult(null);
    setLocked(false);
    setFinished(false);
    setSessionStars(0);
    setSessionCorrect(0);
    setSessionWrong(0);
    setShowConfetti(false);
  }

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
      if (feedbackTimerRef.current !== null) {
        window.clearTimeout(feedbackTimerRef.current);
        feedbackTimerRef.current = null;
      }
      stopAudio();
    };
  }, []);

  // Clear pending feedback timer when a new round/session starts.
  // Do NOT stopAudio here — it races child autoplay effects and mutes the first question.
  useEffect(() => {
    return () => {
      if (feedbackTimerRef.current !== null) {
        window.clearTimeout(feedbackTimerRef.current);
        feedbackTimerRef.current = null;
      }
      if (finishTimerRef.current !== null) {
        window.clearTimeout(finishTimerRef.current);
        finishTimerRef.current = null;
      }
    };
  }, [sessionKey]);

  const current = questions[index];
  const isLastQuestion = questions.length > 0 && index + 1 >= questions.length;

  const goToSummary = useCallback(() => {
    setShowConfetti(false);
    setResult(null);
    setLocked(false);
    if (feedbackTimerRef.current !== null) {
      window.clearTimeout(feedbackTimerRef.current);
      feedbackTimerRef.current = null;
    }
    if (finishTimerRef.current !== null) {
      window.clearTimeout(finishTimerRef.current);
      finishTimerRef.current = null;
    }
    stopAudio();
    setFinished(true);
  }, []);

  const handleAnswer = useCallback(
    (answer: string) => {
      if (!current || !localProgress || locked || !gameType) return;

      const correct = checkAnswer(current, answer);
      setLocked(true);

      // Stop any playing question audio so feedback is heard once.
      stopAudio();
      if (feedbackTimerRef.current !== null) {
        window.clearTimeout(feedbackTimerRef.current);
        feedbackTimerRef.current = null;
      }
      if (finishTimerRef.current !== null) {
        window.clearTimeout(finishTimerRef.current);
        finishTimerRef.current = null;
      }

      const last = index + 1 >= questions.length;

      if (settings.musicEnabled) {
        tapBgMusic(settings.volume);
      }

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
        setSessionCorrect((c) => c + 1);
        setConfettiKey((k) => k + 1);
        setShowConfetti(true);
        if (settings.musicEnabled) {
          celebrateBgMusic(settings.volume);
        }
        if (settings.soundEnabled) {
          unlockAudio();
          const playCorrectFeedback = () => {
            playSuccessTone(settings.volume);
            duckBgMusic(1200);
            feedbackTimerRef.current = window.setTimeout(() => {
              const isMath =
                current.gameType === "math-count" ||
                current.gameType === "math-add" ||
                current.gameType === "math-subtract";
              if (isMath) {
                const n = Number(current.targetText);
                const spoken = Number.isFinite(n)
                  ? `Jawapannya ${numberToMalay(n)}`
                  : current.targetText;
                void playAudio(spoken, undefined, {
                  volume: settings.volume,
                  soundEnabled: true,
                });
              } else {
                void playAudio(current.targetText, current.promptAudio, {
                  volume: settings.volume,
                  soundEnabled: true,
                });
              }
              feedbackTimerRef.current = null;
            }, 700);
          };

          // Susun suku kata: tunggu 2 saat nampak jawapan dulu, baru bunyi "Betul!"
          if (current.gameType === "arrange-syllables") {
            feedbackTimerRef.current = window.setTimeout(() => {
              playCorrectFeedback();
            }, 2000);
          } else {
            playCorrectFeedback();
          }
        }
      } else {
        const { progress, result: nextResult } =
          applyWrongAnswer(localProgress);
        setLocalProgress(progress);
        saveProgress(progress);
        setResult(nextResult);
        setSessionWrong((w) => w + 1);
        setShowConfetti(false);
        if (settings.musicEnabled) {
          encourageBgMusic(settings.volume);
        }
        if (settings.soundEnabled) {
          unlockAudio();
          playWrongTone(settings.volume);
          duckBgMusic(700);
        }
      }

      // Auto show markah after last question so kids don't miss the summary.
      if (last) {
        const delay =
          correct && current.gameType === "arrange-syllables" ? 4500 : 2200;
        finishTimerRef.current = window.setTimeout(() => {
          setFinished(true);
          setResult(null);
          finishTimerRef.current = null;
        }, delay);
      }
    },
    [
      current,
      localProgress,
      locked,
      gameType,
      index,
      questions.length,
      saveProgress,
      settings.soundEnabled,
      settings.musicEnabled,
      settings.volume,
    ],
  );

  const goNext = () => {
    if (isLastQuestion) {
      goToSummary();
      return;
    }
    setShowConfetti(false);
    setResult(null);
    setLocked(false);
    if (feedbackTimerRef.current !== null) {
      window.clearTimeout(feedbackTimerRef.current);
      feedbackTimerRef.current = null;
    }
    stopAudio();
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
        <LevelCompleteSummary
          playerName={activePlayer.name}
          gameTitle={GAME_META[gameType].title}
          starsEarned={sessionStars}
          correctCount={sessionCorrect}
          wrongCount={sessionWrong}
          totalStars={localProgress.stars}
          onPlayAgain={() => setSessionId((s) => s + 1)}
          onDashboard={() => router.push("/player")}
        />
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
      {gameType === "math-count" ? (
        <MathCountGame key={current.id} {...sharedProps} />
      ) : null}
      {gameType === "math-add" || gameType === "math-subtract" ? (
        <MathEquationGame key={current.id} {...sharedProps} />
      ) : null}

      {result ? (
        <GameResult
          correct={result.correct}
          message={result.message}
          starsEarned={result.starsEarned}
          leveledUp={result.leveledUp}
          onNext={goNext}
          nextLabel={isLastQuestion ? "Lihat markah" : "Seterusnya"}
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
