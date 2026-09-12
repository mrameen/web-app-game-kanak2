import type { AgeGroup, GameQuestion, PlayerProgress } from "./types";

function shuffle<T>(items: T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function optionCount(age: AgeGroup, bonus: number): number {
  if (age === 3) return Math.min(2 + Math.min(bonus, 1), 3);
  if (age === 4) return 3;
  return Math.min(3 + Math.min(bonus, 1), 4);
}

function maxNumber(age: AgeGroup, bonus: number): number {
  if (age === 3) return 5 + Math.min(bonus, 1);
  if (age === 4) return 8 + Math.min(bonus, 2);
  if (age === 5) return 12 + Math.min(bonus, 3);
  return 20 + Math.min(bonus, 5);
}

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function buildNumberOptions(
  correct: number,
  age: AgeGroup,
  bonus: number,
  max: number,
): string[] {
  const count = optionCount(age, bonus);
  const pool = new Set<number>([correct]);
  let guard = 0;
  while (pool.size < count && guard < 40) {
    guard += 1;
    const n = randInt(Math.max(0, correct - 3), Math.min(max, correct + 3));
    if (n !== correct) pool.add(n);
  }
  while (pool.size < count) {
    pool.add(randInt(0, max));
  }
  return shuffle([...pool].map(String));
}

const COUNT_EMOJIS = ["🍎", "⭐", "🐸", "🎈", "🐶", "🍊", "🐟", "⚽"];

export function makeMathCount(
  age: AgeGroup,
  progress: PlayerProgress,
): GameQuestion {
  const max = Math.min(10, maxNumber(age, progress.difficultyBonus));
  const value = randInt(age === 3 ? 1 : 1, max);
  const emoji = COUNT_EMOJIS[randInt(0, COUNT_EMOJIS.length - 1)];
  const options = buildNumberOptions(
    value,
    age,
    progress.difficultyBonus,
    max,
  );

  return {
    id: `q-math-count-${value}-${Date.now()}`,
    gameType: "math-count",
    prompt: "Berapa banyak?",
    promptEmoji: emoji,
    targetText: String(value),
    options,
    correctAnswer: String(value),
    contentId: `math-count-${value}`,
    countEmoji: emoji.repeat(value),
    countValue: value,
  };
}

export function makeMathAdd(
  age: AgeGroup,
  progress: PlayerProgress,
): GameQuestion {
  const max = maxNumber(age, progress.difficultyBonus);
  const aMax = age <= 3 ? 3 : age === 4 ? 5 : Math.floor(max / 2);
  const a = randInt(1, aMax);
  const b = randInt(1, Math.max(1, Math.min(aMax, max - a)));
  const sum = a + b;
  const options = buildNumberOptions(sum, age, progress.difficultyBonus, max + 2);

  return {
    id: `q-math-add-${a}-${b}-${Date.now()}`,
    gameType: "math-add",
    prompt: `${a} + ${b} = ?`,
    promptEmoji: "➕",
    targetText: String(sum),
    options,
    correctAnswer: String(sum),
    contentId: `math-add-${a}-${b}`,
  };
}

export function makeMathSubtract(
  age: AgeGroup,
  progress: PlayerProgress,
): GameQuestion {
  const max = maxNumber(age, progress.difficultyBonus);
  const a = randInt(age <= 4 ? 2 : 3, Math.min(max, age <= 4 ? 8 : max));
  const b = randInt(1, a);
  const diff = a - b;
  const options = buildNumberOptions(
    diff,
    age,
    progress.difficultyBonus,
    max,
  );

  return {
    id: `q-math-sub-${a}-${b}-${Date.now()}`,
    gameType: "math-subtract",
    prompt: `${a} − ${b} = ?`,
    promptEmoji: "➖",
    targetText: String(diff),
    options,
    correctAnswer: String(diff),
    contentId: `math-sub-${a}-${b}`,
  };
}

export function generateMathQuestion(
  gameType: "math-count" | "math-add" | "math-subtract",
  age: AgeGroup,
  progress: PlayerProgress,
): GameQuestion {
  if (gameType === "math-count") return makeMathCount(age, progress);
  if (gameType === "math-add") return makeMathAdd(age, progress);
  return makeMathSubtract(age, progress);
}

export function generateMathLevelQuestions(
  gameType: "math-count" | "math-add" | "math-subtract",
  age: AgeGroup,
  progress: PlayerProgress,
  count = 5,
): GameQuestion[] {
  return Array.from({ length: count }, () =>
    generateMathQuestion(gameType, age, progress),
  );
}
