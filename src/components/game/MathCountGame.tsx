"use client";

import { useEffect, useState } from "react";
import type { GameQuestion } from "@/lib/types";
import { AnswerButton } from "@/components/AnswerButton";
import { AudioButton } from "@/components/AudioButton";
import { isAudioUnlocked, playAudio, unlockAudio } from "@/lib/audio";
import { mathCountSpeech } from "@/lib/math-speech";

interface Props {
  question: GameQuestion;
  disabled?: boolean;
  volume?: number;
  soundEnabled?: boolean;
  onAnswer: (answer: string) => void;
}

export function MathCountGame({
  question,
  disabled,
  volume = 0.8,
  soundEnabled = true,
  onAnswer,
}: Props) {
  const [selected, setSelected] = useState<string | null>(null);
  const speech = mathCountSpeech();

  useEffect(() => {
    if (!soundEnabled || !isAudioUnlocked()) return;
    // Speak the question only — never the answer number.
    void playAudio(speech, undefined, { volume, soundEnabled });
  }, [question.id, speech, volume, soundEnabled]);

  return (
    <div className="space-y-6">
      <div className="rounded-[2rem] bg-white/80 p-6 text-center shadow-lg">
        <p className="text-lg font-bold text-slate-600">{question.prompt}</p>
        <p
          className="mt-4 break-words text-4xl leading-relaxed sm:text-5xl"
          aria-label="Objek untuk dikira"
        >
          {question.countEmoji}
        </p>
        <div className="mt-4 flex justify-center">
          <AudioButton
            text={speech}
            volume={volume}
            soundEnabled={soundEnabled}
            label="Dengar soalan: berapa banyak"
          />
        </div>
        <p className="mt-2 text-base font-bold text-sky-700">
          Dengar soalan, kemudian pilih nombor
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
