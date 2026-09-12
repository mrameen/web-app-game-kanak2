import type { PlayerProgress, GameSessionResult } from "./types";

const POSITIVE_MESSAGES = [
  "Hebat! ⭐",
  "Pandainya! 🎉",
  "Bagus! Lagi sekali!",
  "Syabas! 🌟",
  "Cemerlang!",
];

export function getAccuracy(progress: PlayerProgress): number {
  const total = progress.correctAnswers + progress.wrongAnswers;
  if (total === 0) return 0;
  return Math.round((progress.correctAnswers / total) * 100);
}

export function getRandomPositiveMessage(): string {
  return POSITIVE_MESSAGES[Math.floor(Math.random() * POSITIVE_MESSAGES.length)];
}

export function applyCorrectAnswer(
  progress: PlayerProgress,
  contentId: string,
  activityId: string,
): { progress: PlayerProgress; result: GameSessionResult } {
  const consecutiveCorrect = progress.consecutiveCorrect + 1;
  const streak = progress.streak + 1;
  let difficultyBonus = progress.difficultyBonus;
  let leveledUp = false;
  let currentLevel = progress.currentLevel;

  if (consecutiveCorrect > 0 && consecutiveCorrect % 5 === 0) {
    difficultyBonus = Math.min(2, difficultyBonus + 1);
  }

  if ((progress.correctAnswers + 1) % 8 === 0) {
    currentLevel += 1;
    leveledUp = true;
  }

  const completedActivities = progress.completedActivities.includes(activityId)
    ? progress.completedActivities
    : [...progress.completedActivities, activityId];

  const completedWords = progress.completedWords.includes(contentId)
    ? progress.completedWords
    : [...progress.completedWords, contentId];

  const next: PlayerProgress = {
    ...progress,
    stars: progress.stars + 1,
    correctAnswers: progress.correctAnswers + 1,
    consecutiveCorrect,
    streak,
    bestStreak: Math.max(progress.bestStreak, streak),
    difficultyBonus,
    currentLevel,
    completedActivities,
    completedWords,
    lastPlayedAt: new Date().toISOString(),
  };

  return {
    progress: next,
    result: {
      correct: true,
      starsEarned: 1,
      message: getRandomPositiveMessage(),
      leveledUp,
    },
  };
}

export function applyWrongAnswer(progress: PlayerProgress): {
  progress: PlayerProgress;
  result: GameSessionResult;
} {
  let difficultyBonus = progress.difficultyBonus;
  if (progress.consecutiveCorrect === 0) {
    difficultyBonus = Math.max(0, difficultyBonus - 1);
  }

  const next: PlayerProgress = {
    ...progress,
    wrongAnswers: progress.wrongAnswers + 1,
    consecutiveCorrect: 0,
    streak: 0,
    difficultyBonus,
    lastPlayedAt: new Date().toISOString(),
  };

  return {
    progress: next,
    result: {
      correct: false,
      starsEarned: 0,
      message: "Cuba lagi 😊",
      leveledUp: false,
    },
  };
}
