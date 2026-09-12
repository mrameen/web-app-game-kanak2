"use client";

import { useEffect, useState } from "react";
import type { GameQuestion } from "@/lib/types";
import { AnswerButton } from "@/components/AnswerButton";
import { AudioButton } from "@/components/AudioButton";
import { isAudioUnlocked, playAudio, unlockAudio } from "@/lib/audio";

interface Props {
  question: GameQuestion;
  disabled?: boolean;
  volume?: number;
  soundEnabled?: boolean;
  onAnswer: (answer: string) => void;
}

export function CombineGame({
  question,
  disabled,
  volume = 0.8,
  soundEnabled = true,
  onAnswer,
}: Props) {
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    if (!soundEnabled || !question.syllables || !isAudioUnlocked()) return;
    let cancelled = false;

    void (async () => {
      for (const part of question.syllables ?? []) {
        if (cancelled) return;
        await playAudio(part, undefined, { volume, soundEnabled });
        await new Promise((r) => setTimeout(r, 280));
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [question.id, question.syllables, volume, soundEnabled]);

  return (
    <div className="space-y-6">
      <div className="rounded-[2rem] bg-white/80 p-6 text-center shadow-lg">
        <p className="text-lg font-bold text-slate-600">Gabungkan</p>
        <p className="mt-3 text-4xl font-black tracking-wide text-slate-800 sm:text-5xl">
          {(question.syllables ?? []).join(" + ")}
        </p>
        <div className="mt-4 flex justify-center">
          <AudioButton
            text={question.targetText}
            audioUrl={question.promptAudio}
            volume={volume}
            soundEnabled={soundEnabled}
            label={`Dengar ${question.targetText}`}
          />
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
