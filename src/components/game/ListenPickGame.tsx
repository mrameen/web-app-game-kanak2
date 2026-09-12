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

export function ListenPickGame({
  question,
  disabled,
  volume = 0.8,
  soundEnabled = true,
  onAnswer,
}: Props) {
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    if (!soundEnabled) return;
    if (!isAudioUnlocked()) return;
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
      <div className="flex flex-col items-center gap-4 rounded-[2rem] bg-white/80 p-6 shadow-lg">
        <p className="text-lg font-bold text-slate-600">{question.prompt}</p>
        <AudioButton
          text={question.targetText}
          audioUrl={question.promptAudio}
          volume={volume}
          soundEnabled={soundEnabled}
        />
        <p className="text-base font-bold text-sky-700">
          Tekan butang untuk dengar
        </p>
        <p className="text-5xl font-black tracking-widest text-sky-800">
          {question.targetText}
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
