"use client";

import { useEffect } from "react";
import { usePlayers } from "@/hooks/usePlayers";
import { unlockAudio } from "@/lib/audio";
import {
  setBgMusicVolume,
  startBgMusic,
  stopBgMusic,
} from "@/lib/bg-music";

/**
 * Plays interactive background music when Settings → Muzik latar is ON.
 * Independent from learning audio (stopAudio will not mute it).
 */
export function BackgroundMusic() {
  const { hydrated, settings } = usePlayers();
  const enabled = hydrated && settings.musicEnabled;

  useEffect(() => {
    if (!enabled) {
      stopBgMusic();
      return;
    }

    const tryStart = () => {
      unlockAudio();
      void startBgMusic(settings.volume);
    };

    tryStart();

    window.addEventListener("pointerdown", tryStart);
    window.addEventListener("keydown", tryStart);

    return () => {
      window.removeEventListener("pointerdown", tryStart);
      window.removeEventListener("keydown", tryStart);
      stopBgMusic();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- volume via setBgMusicVolume
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return;
    setBgMusicVolume(settings.volume);
  }, [enabled, settings.volume]);

  if (!enabled) return null;

  return (
    <div
      className="pointer-events-none fixed bottom-4 left-4 z-40 flex h-10 items-end gap-1 rounded-2xl bg-white/70 px-3 py-2 shadow-md backdrop-blur"
      aria-hidden
    >
      {[0, 1, 2, 3, 4].map((i) => (
        <span
          key={i}
          className="animate-bgm-bar w-1.5 rounded-full bg-sky-500"
          style={{
            height: `${12 + (i % 3) * 8}px`,
            animationDelay: `${i * 0.1}s`,
            animationDuration: `${0.45 + i * 0.08}s`,
          }}
        />
      ))}
    </div>
  );
}
