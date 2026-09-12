"use client";

import { playAudio, unlockAudio } from "@/lib/audio";
import { Volume2 } from "lucide-react";
import { useState } from "react";

interface AudioButtonProps {
  text: string;
  audioUrl?: string;
  label?: string;
  size?: "sm" | "md" | "lg";
  volume?: number;
  soundEnabled?: boolean;
  className?: string;
  autoPlay?: boolean;
}

export function AudioButton({
  text,
  audioUrl,
  label,
  size = "lg",
  volume = 0.8,
  soundEnabled = true,
  className = "",
}: AudioButtonProps) {
  const [playing, setPlaying] = useState(false);

  const sizeClass =
    size === "sm"
      ? "h-12 w-12 text-xl"
      : size === "md"
        ? "h-16 w-16 text-2xl"
        : "h-20 w-20 text-3xl sm:h-24 sm:w-24 sm:text-4xl";

  const handlePlay = async () => {
    if (!soundEnabled) return;
    unlockAudio();
    setPlaying(true);
    try {
      await playAudio(text, audioUrl, { volume, soundEnabled });
    } finally {
      setPlaying(false);
    }
  };

  return (
    <button
      type="button"
      onClick={() => {
        void handlePlay();
      }}
      aria-label={label ?? `Dengar ${text}`}
      aria-pressed={playing}
      className={`inline-flex items-center justify-center rounded-full bg-sky-400 text-white shadow-lg transition active:scale-95 hover:bg-sky-500 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-sky-700 ${sizeClass} ${playing ? "animate-pulse scale-110" : ""} ${className}`}
    >
      <Volume2 className="h-[1em] w-[1em]" aria-hidden />
    </button>
  );
}
