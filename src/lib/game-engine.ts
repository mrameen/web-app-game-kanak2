import {
  getContentForAge,
  getWordsWithEmoji,
  ALL_CONTENT,
} from "./content";
import { generateMathLevelQuestions, generateMathQuestion } from "./math-engine";
import type {
  AgeGroup,
  GameType,
  GameQuestion,
  PlayerProgress,
  ReadingItem,
} from "./types";

function isMathGame(
  gameType: GameType,
): gameType is "math-count" | "math-add" | "math-subtract" {
  return (
    gameType === "math-count" ||
    gameType === "math-add" ||
    gameType === "math-subtract"
  );
}

function shuffle<T>(items: T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function pickOne<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

function optionCount(age: AgeGroup, bonus: number): number {
  if (age === 3) return Math.min(2 + Math.min(bonus, 1), 3);
  if (age === 4) return 3;
  return Math.min(3 + Math.min(bonus, 1), 4);
}

function maxDifficulty(age: AgeGroup, bonus: number): number {
  const base = age === 3 ? 1 : age === 4 ? 2 : age === 5 ? 3 : 3;
  return Math.min(3, base + Math.max(0, bonus - 1));
}

function filterByDifficulty(
  items: ReadingItem[],
  age: AgeGroup,
  progress: PlayerProgress,
): ReadingItem[] {
  const max = maxDifficulty(age, progress.difficultyBonus);
  const filtered = items.filter((item) => item.difficulty <= max);
  return filtered.length > 0 ? filtered : items;
}

function buildOptions(
  correct: string,
  pool: string[],
  count: number,
): string[] {
  const distractors = shuffle(pool.filter((t) => t !== correct)).slice(
    0,
    Math.max(0, count - 1),
  );
  return shuffle([correct, ...distractors]);
}

function makeListenPick(
  age: AgeGroup,
  progress: PlayerProgress,
): GameQuestion | null {
  const types =
    age === 3
      ? (["letter", "syllable"] as const)
      : age === 4
        ? (["syllable", "word"] as const)
        : (["word", "sentence", "syllable"] as const);

  const pool = filterByDifficulty(
    getContentForAge(age).filter((i) =>
      (types as readonly string[]).includes(i.type),
    ),
    age,
    progress,
  );
  if (pool.length === 0) return null;

  const target = pickOne(pool);
  const sameType = pool.filter((i) => i.type === target.type);
  const options = buildOptions(
    target.text,
    sameType.map((i) => i.text),
    optionCount(age, progress.difficultyBonus),
  );

  return {
    id: `q-listen-${target.id}-${Date.now()}`,
    gameType: "listen-pick",
    prompt: "Dengar & pilih",
    promptAudio: target.audio,
    promptEmoji: target.emoji,
    targetText: target.text,
    options,
    correctAnswer: target.text,
    contentId: target.id,
  };
}

function makeCombine(
  age: AgeGroup,
  progress: PlayerProgress,
): GameQuestion | null {
  const words = filterByDifficulty(
    getContentForAge(age).filter(
      (i) => i.type === "word" && i.syllables && i.syllables.length >= 2,
    ),
    age,
    progress,
  );
  if (words.length === 0) return null;

  const target = pickOne(words);
  const options = buildOptions(
    target.text,
    words.map((w) => w.text),
    optionCount(age, progress.difficultyBonus),
  );

  return {
    id: `q-combine-${target.id}-${Date.now()}`,
    gameType: "combine",
    prompt: (target.syllables ?? []).join(" + "),
    promptAudio: target.audio,
    promptEmoji: target.emoji,
    targetText: target.text,
    options,
    correctAnswer: target.text,
    syllables: target.syllables,
    contentId: target.id,
  };
}

function makePickImage(
  age: AgeGroup,
  progress: PlayerProgress,
): GameQuestion | null {
  const withEmoji = filterByDifficulty(
    getWordsWithEmoji(age).filter((i) => i.type !== "letter" || age === 3),
    age,
    progress,
  );
  const pool =
    withEmoji.length >= 2
      ? withEmoji
      : ALL_CONTENT.filter((i) => i.emoji && i.type === "word");

  if (pool.length < 2) return null;

  const target = pickOne(pool);
  const count = optionCount(age, progress.difficultyBonus);
  const distractors = shuffle(pool.filter((i) => i.id !== target.id)).slice(
    0,
    count - 1,
  );
  const imageOptions = shuffle([target, ...distractors]).map((item) => ({
    id: item.id,
    emoji: item.emoji ?? "❓",
    label: item.text,
  }));

  return {
    id: `q-image-${target.id}-${Date.now()}`,
    gameType: "pick-image",
    prompt: "Pilih gambar",
    promptAudio: target.audio,
    promptEmoji: target.emoji,
    targetText: target.text,
    options: imageOptions.map((o) => o.label),
    correctAnswer: target.text,
    imageOptions,
    contentId: target.id,
  };
}

function makeArrange(
  age: AgeGroup,
  progress: PlayerProgress,
): GameQuestion | null {
  const words = filterByDifficulty(
    getContentForAge(age).filter(
      (i) => i.type === "word" && i.syllables && i.syllables.length >= 2,
    ),
    age,
    progress,
  );
  if (words.length === 0) return null;

  const target = pickOne(words);
  const syllables = target.syllables ?? [];

  return {
    id: `q-arrange-${target.id}-${Date.now()}`,
    gameType: "arrange-syllables",
    prompt: "Susun suku kata",
    promptAudio: target.audio,
    promptEmoji: target.emoji,
    targetText: target.text,
    options: shuffle(syllables),
    // Use delimiter so order is checked (LA+BO !== BO+LA), not just concatenated letters.
    correctAnswer: syllables.join("|"),
    syllables,
    contentId: target.id,
  };
}

function makeComplete(
  age: AgeGroup,
  progress: PlayerProgress,
): GameQuestion | null {
  const words = filterByDifficulty(
    getContentForAge(age).filter(
      (i) => i.type === "word" && i.syllables && i.syllables.length >= 2,
    ),
    age,
    progress,
  );
  if (words.length === 0) return null;

  const target = pickOne(words);
  const syllables = target.syllables ?? [];
  const missing = syllables[syllables.length - 1];
  const prefix = syllables.slice(0, -1).join("");

  const distractorPool = words
    .flatMap((w) => w.syllables ?? [])
    .filter((s) => s !== missing);

  const options = buildOptions(
    missing,
    [...new Set(distractorPool)],
    optionCount(age, progress.difficultyBonus),
  );

  return {
    id: `q-complete-${target.id}-${Date.now()}`,
    gameType: "complete-word",
    prompt: `${prefix} + __`,
    promptAudio: target.audio,
    promptEmoji: target.emoji,
    targetText: target.text,
    options,
    correctAnswer: missing,
    syllables,
    contentId: target.id,
  };
}

const BUILDERS: Partial<
  Record<GameType, (age: AgeGroup, progress: PlayerProgress) => GameQuestion | null>
> = {
  "listen-pick": makeListenPick,
  combine: makeCombine,
  "pick-image": makePickImage,
  "arrange-syllables": makeArrange,
  "complete-word": makeComplete,
};

export function generateQuestion(
  gameType: GameType,
  age: AgeGroup,
  progress: PlayerProgress,
): GameQuestion {
  if (isMathGame(gameType)) {
    return generateMathQuestion(gameType, age, progress);
  }

  const question = BUILDERS[gameType]?.(age, progress);
  if (question) return question;

  // Fallback so play never stalls.
  const fallback = makeListenPick(age, progress);
  if (fallback) return fallback;

  return {
    id: `q-fallback-${Date.now()}`,
    gameType: "listen-pick",
    prompt: "Dengar & pilih",
    targetText: "BA",
    options: age === 3 ? ["BA", "MA"] : ["BA", "MA", "SA"],
    correctAnswer: "BA",
    contentId: "syllable-ba",
  };
}

export function generateLevelQuestions(
  gameType: GameType,
  age: AgeGroup,
  progress: PlayerProgress,
  count = 5,
): GameQuestion[] {
  if (isMathGame(gameType)) {
    return generateMathLevelQuestions(gameType, age, progress, count);
  }

  const questions: GameQuestion[] = [];
  const seen = new Set<string>();

  for (let i = 0; i < count * 3 && questions.length < count; i += 1) {
    const q = generateQuestion(gameType, age, progress);
    if (seen.has(q.contentId)) continue;
    seen.add(q.contentId);
    questions.push(q);
  }

  while (questions.length < count) {
    questions.push(generateQuestion(gameType, age, progress));
  }

  return questions;
}

export function checkAnswer(
  question: GameQuestion,
  answer: string,
): boolean {
  if (question.gameType === "arrange-syllables") {
    const expected = (question.syllables ?? []).map((s) => s.toUpperCase());
    const got = answer
      .split("|")
      .map((s) => s.trim().toUpperCase())
      .filter(Boolean);

    // Fallback for older joined answers without delimiter
    if (got.length === 1 && expected.length > 1) {
      return false;
    }

    if (got.length !== expected.length) return false;
    return got.every((part, i) => part === expected[i]);
  }
  // Math answers are numeric strings — compare without case tricks breaking numbers
  if (isMathGame(question.gameType)) {
    return answer.trim() === question.correctAnswer.trim();
  }
  return answer.trim().toUpperCase() === question.correctAnswer.trim().toUpperCase();
}
