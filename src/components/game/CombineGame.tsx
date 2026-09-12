"use client";

import { useEffect, useState } from "react";
import type { GameQuestion } from "@/lib/types";
import { AnswerButton } from "@/components/AnswerButton";
import { getAudioForToken } from "@/lib/content";
import { isAudioUnlocked, playAudio, unlockAudio } from "@/lib/audio";
import { Volume2 } from "lucide-react";

interface Props {
  question: GameQuestion;
  disabled?: boolean;
  volume?: number;
  soundEnabled?: boolean;
  onAnswer: (answer: string) => void;
}

async function playCombineSequence(
  question: GameQuestion,
  volume: number,
  soundEnabled: boolean,
  isCancelled?: () => boolean,
): Promise<void> {
  const parts = question.syllables ?? [];
  if (parts.length === 0) {
    await playAudio(question.targetText, question.promptAudio, {
      volume,
      soundEnabled,
    });
    return;
  }

  for (const part of parts) {
    if (isCancelled?.()) return;
    await playAudio(part, getAudioForToken(part), { volume, soundEnabled });
    await new Promise((r) => setTimeout(r, 280));
  }

  if (isCancelled?.()) return;
  await new Promise((r) => setTimeout(r, 200));
  await playAudio(question.targetText, question.promptAudio, {
    volume,
    soundEnabled,
  });
}

export function CombineGame({
  question,
  disabled,
  volume = 0.8,
  soundEnabled = true,
  onAnswer,
}: Props) {
  const [selected, setSelected] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    if (!soundEnabled || !isAudioUnlocked()) return;
    let cancelled = false;

    void (async () => {
      setPlaying(true);
      try {
        await playCombineSequence(
          question,
          volume,
          soundEnabled,
          () => cancelled,
        );
      } finally {
        if (!cancelled) setPlaying(false);
      }
    })();

    return () => {
      cancelled = true;
    };
    // Replay when the question identity changes (frozen per round).
  }, [question, volume, soundEnabled]);

  const replay = async () => {
    if (!soundEnabled || playing) return;
    unlockAudio();
    setPlaying(true);
    try {
      await playCombineSequence(question, volume, soundEnabled);
    } finally {
      setPlaying(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-[2rem] bg-white/80 p-6 text-center shadow-lg">
        <p className="text-lg font-bold text-slate-600">Gabungkan</p>
        <p className="mt-3 text-4xl font-black tracking-wide text-slate-800 sm:text-5xl">
          {(question.syllables ?? []).join(" + ")}
        </p>
        <div className="mt-4 flex justify-center">
          <button
            type="button"
            onClick={() => {
              void replay();
            }}
            disabled={!soundEnabled || playing}
            aria-label={`Dengar ${(question.syllables ?? []).join(" plus ")} jadi ${question.targetText}`}
            aria-pressed={playing}
            className={`inline-flex h-20 w-20 items-center justify-center rounded-full bg-sky-400 text-white shadow-lg transition active:scale-95 hover:bg-sky-500 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sky-700 sm:h-24 sm:w-24 ${playing ? "animate-pulse scale-110" : ""} disabled:opacity-60`}
          >
            <Volume2 className="h-8 w-8 sm:h-10 sm:w-10" aria-hidden />
          </button>
        </div>
        <p className="mt-2 text-base font-bold text-sky-700">
          Tekan butang untuk dengar
        </p>
        {question.promptEmoji ? (
          <p className="mt-3 text-5xl" aria-hidden>
            {question.promptEmoji}
          </p>
        ) : null}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {question.options.map((option) => (
          <AnswerButton
            key={option}
            label={option}
            disabled={disabled || selected !== null}
            state={selected === option ? "selected" : "idle"}
            onClick={() => {
              unlockAudio();
              setSelected(option);
              onAnswer(option);
            }}
          />
        ))}
      </div>
    </div>
  );
}
