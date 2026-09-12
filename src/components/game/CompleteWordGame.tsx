"use client";

import { useState } from "react";
import type { GameQuestion } from "@/lib/types";
import { AnswerButton } from "@/components/AnswerButton";
import { AudioButton } from "@/components/AudioButton";
import { unlockAudio } from "@/lib/audio";

interface Props {
  question: GameQuestion;
  disabled?: boolean;
  volume?: number;
  soundEnabled?: boolean;
  onAnswer: (answer: string) => void;
}

export function CompleteWordGame({
  question,
  disabled,
  volume = 0.8,
  soundEnabled = true,
  onAnswer,
}: Props) {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <div className="rounded-[2rem] bg-white/80 p-6 text-center shadow-lg">
        <p className="text-lg font-bold text-slate-600">Lengkapkan perkataan</p>
        <p className="mt-3 text-4xl font-black tracking-wide text-slate-800 sm:text-5xl">
          {question.prompt}
        </p>
        {question.promptEmoji ? (
          <p className="mt-3 text-5xl" aria-hidden>
            {question.promptEmoji}
          </p>
        ) : null}
        <div className="mt-4 flex justify-center">
          <AudioButton
            text={question.targetText}
            audioUrl={question.promptAudio}
            volume={volume}
            soundEnabled={soundEnabled}
            label={`Dengar petunjuk ${question.targetText}`}
          />
        </div>
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
