/**
 * Interactive kids BGM via Web Audio (separate from learning MP3 / stopAudio).
 * Alternating phrases + reactive flourishes on correct / wrong / tap.
 */

type Note = { freq: number; beat: number; dur: number; type?: OscillatorType };

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let fx: GainNode | null = null;
let loopTimer: number | null = null;
let running = false;
let phraseIndex = 0;
let desiredVolume = 0.35;

const PHRASE_A: Note[] = [
  { freq: 261.63, beat: 0, dur: 0.35 },
  { freq: 329.63, beat: 0.4, dur: 0.35 },
  { freq: 392.0, beat: 0.8, dur: 0.35 },
  { freq: 523.25, beat: 1.2, dur: 0.45 },
  { freq: 392.0, beat: 1.75, dur: 0.3 },
  { freq: 329.63, beat: 2.15, dur: 0.3 },
  { freq: 349.23, beat: 2.55, dur: 0.35 },
  { freq: 392.0, beat: 3.0, dur: 0.55 },
];

const PHRASE_B: Note[] = [
  { freq: 293.66, beat: 0, dur: 0.35 },
  { freq: 349.23, beat: 0.4, dur: 0.35 },
  { freq: 440.0, beat: 0.8, dur: 0.35 },
  { freq: 523.25, beat: 1.2, dur: 0.4 },
  { freq: 587.33, beat: 1.7, dur: 0.35 },
  { freq: 523.25, beat: 2.15, dur: 0.3 },
  { freq: 440.0, beat: 2.55, dur: 0.35 },
  { freq: 392.0, beat: 3.0, dur: 0.55 },
];

const PHRASE_C: Note[] = [
  { freq: 261.63, beat: 0, dur: 0.28 },
  { freq: 392.0, beat: 0.35, dur: 0.28 },
  { freq: 329.63, beat: 0.7, dur: 0.28 },
  { freq: 523.25, beat: 1.05, dur: 0.4 },
  { freq: 440.0, beat: 1.55, dur: 0.28 },
  { freq: 392.0, beat: 1.95, dur: 0.28 },
  { freq: 349.23, beat: 2.35, dur: 0.28 },
  { freq: 329.63, beat: 2.75, dur: 0.28 },
  { freq: 261.63, beat: 3.15, dur: 0.55 },
];

const PHRASES = [PHRASE_A, PHRASE_B, PHRASE_C];
const LOOP_SECONDS = 4.0;

function ensureContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (ctx) return ctx;

  const Ctx =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext: typeof AudioContext })
      .webkitAudioContext;
  if (!Ctx) return null;

  ctx = new Ctx();
  master = ctx.createGain();
  fx = ctx.createGain();
  master.gain.value = 0;
  fx.gain.value = 1;
  master.connect(ctx.destination);
  fx.connect(ctx.destination);
  return ctx;
}

function musicGain(volume: number): number {
  return Math.max(0, Math.min(1, volume)) * 0.16;
}

function playTone(
  dest: GainNode,
  freq: number,
  start: number,
  dur: number,
  peak = 0.85,
  type: OscillatorType = "sine",
): void {
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.value = freq;

  const t1 = start + dur;
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(peak, start + 0.03);
  gain.gain.exponentialRampToValueAtTime(0.0001, t1);

  osc.connect(gain);
  gain.connect(dest);
  osc.start(start);
  osc.stop(t1 + 0.03);
}

function softPluck(startAt: number): void {
  if (!ctx || !master) return;
  // Light wooden tick under the melody
  playTone(master, 180, startAt, 0.06, 0.25, "triangle");
  playTone(master, 240, startAt + 0.8, 0.05, 0.18, "triangle");
  playTone(master, 180, startAt + 1.6, 0.06, 0.22, "triangle");
  playTone(master, 240, startAt + 2.4, 0.05, 0.18, "triangle");
}

function schedulePhrase(startAt: number, phrase: Note[]): void {
  if (!ctx || !master) return;
  for (const note of phrase) {
    playTone(
      master,
      note.freq,
      startAt + note.beat,
      note.dur,
      0.85,
      note.type ?? "sine",
    );
  }
  softPluck(startAt);
}

function armNextLoops(): void {
  if (!ctx || !running) return;

  const phrase = PHRASES[phraseIndex % PHRASES.length]!;
  phraseIndex += 1;
  schedulePhrase(ctx.currentTime + 0.04, phrase);

  if (loopTimer !== null) window.clearTimeout(loopTimer);
  loopTimer = window.setTimeout(() => {
    armNextLoops();
  }, LOOP_SECONDS * 1000);
}

export function isBgMusicRunning(): boolean {
  return running;
}

export async function startBgMusic(volume = desiredVolume): Promise<void> {
  desiredVolume = volume;
  const audioCtx = ensureContext();
  if (!audioCtx || !master) return;

  if (audioCtx.state === "suspended") {
    try {
      await audioCtx.resume();
    } catch {
      return;
    }
  }

  master.gain.cancelScheduledValues(audioCtx.currentTime);
  master.gain.setTargetAtTime(musicGain(volume), audioCtx.currentTime, 0.05);

  if (running) return;
  running = true;
  phraseIndex = 0;
  armNextLoops();
}

export function stopBgMusic(): void {
  running = false;
  if (loopTimer !== null) {
    window.clearTimeout(loopTimer);
    loopTimer = null;
  }
  if (ctx && master) {
    master.gain.cancelScheduledValues(ctx.currentTime);
    master.gain.setTargetAtTime(0.0001, ctx.currentTime, 0.08);
  }
}

export function setBgMusicVolume(volume: number): void {
  desiredVolume = volume;
  if (!ctx || !master || !running) return;
  master.gain.cancelScheduledValues(ctx.currentTime);
  master.gain.setTargetAtTime(musicGain(volume), ctx.currentTime, 0.05);
}

/** Duck melody briefly so speech/MP3 stays clear. */
export function duckBgMusic(ms = 900): void {
  if (!ctx || !master || !running) return;
  const now = ctx.currentTime;
  const base = musicGain(desiredVolume);
  master.gain.cancelScheduledValues(now);
  master.gain.setTargetAtTime(base * 0.25, now, 0.05);
  master.gain.setTargetAtTime(base, now + ms / 1000, 0.12);
}

/** Happy rising sparkle — call on correct answer when music is on. */
export function celebrateBgMusic(volume = desiredVolume): void {
  const audioCtx = ensureContext();
  const dest = fx;
  if (!audioCtx || !dest || !running) return;
  void audioCtx.resume();

  const now = audioCtx.currentTime;
  const peak = Math.max(0.15, Math.min(1, volume)) * 0.55;
  const notes = [523.25, 659.25, 783.99, 1046.5];
  notes.forEach((freq, i) => {
    playTone(
      dest,
      freq,
      now + i * 0.09,
      0.28,
      peak,
      i === 3 ? "triangle" : "sine",
    );
  });

  // Little bounce in master level
  if (master) {
    const base = musicGain(desiredVolume);
    master.gain.cancelScheduledValues(now);
    master.gain.setTargetAtTime(base * 1.35, now, 0.04);
    master.gain.setTargetAtTime(base, now + 0.55, 0.1);
  }
}

/** Soft “try again” motif — call on wrong answer when music is on. */
export function encourageBgMusic(volume = desiredVolume): void {
  const audioCtx = ensureContext();
  const dest = fx;
  if (!audioCtx || !dest || !running) return;
  void audioCtx.resume();

  const now = audioCtx.currentTime;
  const peak = Math.max(0.12, Math.min(1, volume)) * 0.4;
  playTone(dest, 392.0, now, 0.22, peak, "sine");
  playTone(dest, 349.23, now + 0.2, 0.28, peak * 0.9, "sine");
  playTone(dest, 329.63, now + 0.45, 0.35, peak * 0.8, "triangle");
}

/** Tiny tap blip for UI interactions. */
export function tapBgMusic(volume = desiredVolume): void {
  const audioCtx = ensureContext();
  const dest = fx;
  if (!audioCtx || !dest || !running) return;
  void audioCtx.resume();
  const peak = Math.max(0.1, Math.min(1, volume)) * 0.35;
  playTone(dest, 660, audioCtx.currentTime, 0.07, peak, "triangle");
}
