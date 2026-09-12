"use client";

import { useEffect, useMemo, useState } from "react";
import type { GameQuestion } from "@/lib/types";
import { AnswerButton } from "@/components/AnswerButton";
import { AudioButton } from "@/components/AudioButton";
import { isAudioUnlocked, playAudio, unlockAudio } from "@/lib/audio";
import { speechFromMathPrompt } from "@/lib/math-speech";

interface Props {
  question: GameQuestion;
  disabled?: boolean;
  volume?: number;
  soundEnabled?: boolean;
  onAnswer: (answer: string) => void;
}

export function MathEquationGame({
  question,
  disabled,
  volume = 0.8,
  soundEnabled = true,
  onAnswer,
}: Props) {
  const [selected, setSelected] = useState<string | null>(null);
  const speech = useMemo(
    () => speechFromMathPrompt(question.gameType, question.prompt),
    [question.gameType, question.prompt],
  );

  useEffect(() => {
    if (!soundEnabled || !isAudioUnlocked()) return;
    void playAudio(speech, undefined, { volume, soundEnabled });
  }, [question.id, speech, volume, soundEnabled]);

  return (
    <div className="space-y-6">
      <div className="rounded-[2rem] bg-white/80 p-6 text-center shadow-lg">
        <p className="text-5xl" aria-hidden>
          {question.promptEmoji ?? "🧮"}
        </p>
        <p className="mt-4 text-4xl font-black tracking-wide text-slate-800 sm:text-5xl">
          {question.prompt}
        </p>
        <p className="mt-2 text-lg font-bold text-slate-600">{speech}</p>
        <div className="mt-4 flex justify-center">
          <AudioButton
            text={speech}
            volume={volume}
            soundEnabled={soundEnabled}
            label="Dengar soalan matematik"
          />
        </div>
        <p className="mt-2 text-base font-bold text-sky-700">
          Dengar soalan, kemudian pilih jawapan
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
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
