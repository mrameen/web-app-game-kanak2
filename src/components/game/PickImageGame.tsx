"use client";

import { useEffect, useState } from "react";
import type { GameQuestion } from "@/lib/types";
import { AudioButton } from "@/components/AudioButton";
import { isAudioUnlocked, playAudio, unlockAudio } from "@/lib/audio";

interface Props {
  question: GameQuestion;
  disabled?: boolean;
  volume?: number;
  soundEnabled?: boolean;
  onAnswer: (answer: string) => void;
}

export function PickImageGame({
  question,
  disabled,
  volume = 0.8,
  soundEnabled = true,
  onAnswer,
}: Props) {
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    if (!soundEnabled || !isAudioUnlocked()) return;
    void playAudio(question.targetText, question.promptAudio, {
      volume,
      soundEnabled,
    });
  }, [
    question.id,
    question.targetText,
    question.promptAudio,
    volume,
    soundEnabled,
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center gap-3 rounded-[2rem] bg-white/80 p-6 shadow-lg">
        <p className="text-lg font-bold text-slate-600">Pilih gambar</p>
        <AudioButton
          text={question.targetText}
          audioUrl={question.promptAudio}
          volume={volume}
          soundEnabled={soundEnabled}
        />
        <p className="text-base font-bold text-sky-700">
          Tekan butang untuk dengar
        </p>
        <p className="text-2xl font-black text-sky-800">{question.targetText}</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {(question.imageOptions ?? []).map((option) => {
          const isSelected = selected === option.label;
          return (
            <button
              key={option.id}
              type="button"
              disabled={disabled || selected !== null}
              aria-label={`Pilih gambar ${option.label}`}
              onClick={() => {
                unlockAudio();
                setSelected(option.label);
                onAnswer(option.label);
              }}
              className={`flex min-h-36 flex-col items-center justify-center gap-2 rounded-[2rem] border-4 bg-white p-4 text-6xl shadow-md transition active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sky-700 disabled:opacity-70 ${
                isSelected
                  ? "border-sky-500 ring-4 ring-sky-200"
                  : "border-sky-100 hover:border-sky-300"
              }`}
            >
              <span aria-hidden>{option.emoji}</span>
              <span className="text-lg font-bold text-slate-700">
                {option.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
