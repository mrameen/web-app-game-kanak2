/**
 * Audio utility for the reading game.
 *
 * TODO: Replace SpeechSynthesis with real MP3 files in /public/audio/
 * when recordings are available. Paths are already set in reading-content.json.
 *
 * Important: Do NOT await network/file checks before speaking — browsers block
 * SpeechSynthesis outside the user-gesture window.
 */

let currentAudio: HTMLAudioElement | null = null;
let audioUnlocked = false;
const audioFileCache = new Map<string, boolean>();

export function isAudioUnlocked(): boolean {
  return audioUnlocked;
}

function stopMp3Only(): void {
  if (currentAudio) {
    try {
      currentAudio.pause();
      currentAudio.src = "";
    } catch {
      // ignore
    }
    currentAudio = null;
  }
}

function stopAll(): void {
  stopMp3Only();
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    try {
      window.speechSynthesis.cancel();
    } catch {
      // ignore
    }
  }
}

/** Warm up voices + AudioContext after first tap (Safari/Chrome). */
export function unlockAudio(): void {
  if (typeof window === "undefined") return;
  audioUnlocked = true;

  try {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.addEventListener(
        "voiceschanged",
        () => undefined,
        { once: true },
      );
      window.speechSynthesis.getVoices();
    }
  } catch {
    // ignore
  }

  try {
    const Ctx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    if (ctx.state === "suspended") {
      void ctx.resume();
    }
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    gain.gain.value = 0.0001;
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.01);
    setTimeout(() => void ctx.close(), 100);
  } catch {
    // ignore
  }
}

function pickVoice(): SpeechSynthesisVoice | null {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    return null;
  }

  const voices = window.speechSynthesis.getVoices();
  if (voices.length === 0) return null;

  return (
    voices.find((v) => v.lang.toLowerCase().startsWith("ms")) ||
    voices.find((v) => v.lang.toLowerCase().startsWith("id")) ||
    voices.find((v) => /malaysia|malay|indonesia/i.test(v.name)) ||
    voices.find((v) => v.lang.toLowerCase().startsWith("en")) ||
    voices[0] ||
    null
  );
}

function speakWithSynthesis(text: string, volume: number): Promise<void> {
  return new Promise((resolve) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      resolve();
      return;
    }

    const synth = window.speechSynthesis;
    const clean = text.trim();
    if (!clean) {
      resolve();
      return;
    }

    const start = () => {
      try {
        if (synth.paused) synth.resume();

        const utterance = new SpeechSynthesisUtterance(clean);
        // Letter-by-letter / syllable friendly pacing
        utterance.lang = "ms-MY";
        utterance.rate = 0.85;
        utterance.pitch = 1.1;
        utterance.volume = Math.max(0, Math.min(1, volume));

        const voice = pickVoice();
        if (voice) {
          utterance.voice = voice;
          if (voice.lang) utterance.lang = voice.lang;
        }

        let done = false;
        const finish = () => {
          if (done) return;
          done = true;
          window.clearInterval(keepAlive);
          resolve();
        };

        const keepAlive = window.setInterval(() => {
          if (!synth.speaking) {
            window.clearInterval(keepAlive);
            return;
          }
          if (synth.paused) synth.resume();
        }, 200);

        utterance.onend = finish;
        utterance.onerror = finish;

        synth.speak(utterance);
        if (synth.paused) synth.resume();

        setTimeout(finish, Math.max(2500, clean.length * 450));
      } catch {
        resolve();
      }
    };

    try {
      const wasBusy = synth.speaking || synth.pending;
      if (wasBusy) {
        synth.cancel();
        // Chrome: need a gap after cancel()
        setTimeout(start, 70);
      } else {
        // Speak immediately while still in user-gesture
        start();
      }
    } catch {
      resolve();
    }
  });
}

function playAudioFile(url: string, volume: number): Promise<boolean> {
  return new Promise((resolve) => {
    try {
      const audio = new Audio(url);
      currentAudio = audio;
      audio.volume = Math.max(0, Math.min(1, volume));

      let settled = false;
      const finish = (ok: boolean) => {
        if (settled) return;
        settled = true;
        resolve(ok);
      };

      audio.onended = () => finish(true);
      audio.onerror = () => finish(false);

      void audio.play().then(
        () => undefined,
        () => finish(false),
      );

      setTimeout(() => {
        if (!settled && audio.paused) finish(false);
      }, 1500);
    } catch {
      resolve(false);
    }
  });
}

/**
 * Play learning audio.
 * Try MP3 first (files ship in /public/audio). Fall back to SpeechSynthesis.
 */
export async function playAudio(
  text: string,
  audioUrl?: string,
  options?: { volume?: number; soundEnabled?: boolean },
): Promise<void> {
  const volume = options?.volume ?? 0.8;
  const soundEnabled = options?.soundEnabled ?? true;

  if (!soundEnabled || typeof window === "undefined") return;

  try {
    stopMp3Only();

    if (audioUrl) {
      // Skip known-missing files; otherwise try MP3 immediately.
      if (audioFileCache.get(audioUrl) !== false) {
        const played = await playAudioFile(audioUrl, volume);
        if (played) {
          audioFileCache.set(audioUrl, true);
          return;
        }
        audioFileCache.set(audioUrl, false);
      }
    }

    await speakWithSynthesis(text, volume);
  } catch {
    try {
      await speakWithSynthesis(text, volume);
    } catch {
      // Never crash the app if audio fails.
    }
  }
}

export function playSuccessTone(volume = 0.5): void {
  playUiClip("/audio/ui/correct.mp3", volume, () => playToneFallback("correct", volume));
}

export function playWrongTone(volume = 0.5): void {
  playUiClip("/audio/ui/wrong.mp3", volume, () => playToneFallback("wrong", volume));
}

function playUiClip(url: string, volume: number, onFail: () => void): void {
  if (typeof window === "undefined") return;
  stopAll();
  const audio = new Audio(url);
  currentAudio = audio;
  audio.volume = Math.max(0, Math.min(1, volume));
  void audio.play().catch(() => {
    if (currentAudio === audio) currentAudio = null;
    onFail();
  });
  audio.onended = () => {
    if (currentAudio === audio) currentAudio = null;
  };
}

function playToneFallback(kind: "correct" | "wrong", volume: number): void {
  try {
    const Ctx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    if (!Ctx) return;

    const ctx = new Ctx();
    if (ctx.state === "suspended") {
      void ctx.resume();
    }

    const now = ctx.currentTime;
    const notes =
      kind === "correct" ? [523.25, 659.25, 783.99] : [392.0, 329.63, 261.63];
    const step = kind === "correct" ? 0.12 : 0.16;

    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = kind === "correct" ? "sine" : "triangle";
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0, now + i * step);
      gain.gain.linearRampToValueAtTime(
        volume * (kind === "correct" ? 0.3 : 0.18),
        now + i * step + 0.02,
      );
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * step + 0.28);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + i * step);
      osc.stop(now + i * step + 0.3);
    });

    setTimeout(() => {
      void ctx.close();
    }, 900);
  } catch {
    // Ignore Web Audio failures.
  }
}

export function stopAudio(): void {
  stopAll();
}
