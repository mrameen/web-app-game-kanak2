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

export function ArrangeSyllablesGame({
  question,
  disabled,
  volume = 0.8,
  soundEnabled = true,
  onAnswer,
}: Props) {
  const [bank, setBank] = useState(() => question.options);
  const [slots, setSlots] = useState<string[]>([]);

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

  const pick = (syllable: string, index: number) => {
    if (disabled) return;
    const nextBank = [...bank];
    nextBank.splice(index, 1);
    const nextSlots = [...slots, syllable];
    setBank(nextBank);
    setSlots(nextSlots);

    if (nextSlots.length === (question.syllables?.length ?? 0)) {
      onAnswer(nextSlots.join(""));
    }
  };

  const undo = () => {
    if (disabled || slots.length === 0) return;
    const nextSlots = [...slots];
    const last = nextSlots.pop()!;
    setSlots(nextSlots);
    setBank([...bank, last]);
  };

  return (
    <div className="space-y-6">
      <div className="rounded-[2rem] bg-white/80 p-6 text-center shadow-lg">
        <p className="text-lg font-bold text-slate-600">Susun suku kata</p>
        {question.promptEmoji ? (
          <p className="mt-2 text-5xl" aria-hidden>
            {question.promptEmoji}
          </p>
        ) : null}
        <div className="mt-4 flex justify-center">
          <AudioButton
            text={question.targetText}
            audioUrl={question.promptAudio}
            volume={volume}
            soundEnabled={soundEnabled}
          />
        </div>
        <p className="mt-2 text-base font-bold text-sky-700">
          Tekan butang untuk dengar
        </p>
      </div>

      <div className="flex min-h-24 flex-wrap items-center justify-center gap-3 rounded-[1.75rem] border-4 border-dashed border-sky-300 bg-sky-50/80 p-4">
        {slots.length === 0 ? (
          <p className="text-lg font-bold text-sky-700">Susun di sini</p>
        ) : (
          slots.map((s, i) => (
            <span
              key={`${s}-${i}`}
              className="rounded-2xl bg-white px-5 py-3 text-3xl font-black text-slate-800 shadow"
            >
              {s}
            </span>
          ))
        )}
      </div>

      <div className="flex flex-wrap justify-center gap-3">
        {bank.map((syllable, index) => (
          <button
            key={`${syllable}-${index}`}
            type="button"
            disabled={disabled}
            aria-label={`Pilih suku kata ${syllable}`}
            onClick={() => {
              unlockAudio();
              void playAudio(syllable, undefined, { volume, soundEnabled });
              pick(syllable, index);
            }}
            className="min-h-16 rounded-2xl bg-amber-300 px-6 text-3xl font-black text-amber-950 shadow-md transition hover:bg-amber-200 active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber-800 disabled:opacity-60"
          >
            {syllable}
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={undo}
        disabled={disabled || slots.length === 0}
        aria-label="Buang susunan terakhir"
        className="mx-auto block rounded-xl bg-white px-4 py-2 text-base font-bold text-slate-600 shadow disabled:opacity-40"
      >
        Buang
      </button>
    </div>
  );
}
