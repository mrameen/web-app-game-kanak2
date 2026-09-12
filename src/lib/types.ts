export type AgeGroup = 3 | 4 | 5 | 6;

export type ContentType = "letter" | "syllable" | "word" | "sentence";

export type GameType =
  | "listen-pick"
  | "combine"
  | "pick-image"
  | "arrange-syllables"
  | "complete-word"
  | "math-count"
  | "math-add"
  | "math-subtract";

export type GameCategory = "reading" | "math";

export interface ReadingItem {
  id: string;
  age: AgeGroup[];
  type: ContentType;
  text: string;
  audio?: string;
  syllables?: string[];
  image?: string;
  emoji?: string;
  meaning?: string;
  difficulty: number;
}

export interface PlayerProgress {
  completedActivities: string[];
  completedWords: string[];
  stars: number;
  correctAnswers: number;
  wrongAnswers: number;
  currentLevel: number;
  streak: number;
  bestStreak: number;
  consecutiveCorrect: number;
  difficultyBonus: number;
  lastPlayedAt: string | null;
}

export interface Player {
  id: string;
  name: string;
  age: AgeGroup;
  progress: PlayerProgress;
  createdAt: string;
}

export interface AppSettings {
  soundEnabled: boolean;
  musicEnabled: boolean;
  volume: number;
}

export interface StorageData {
  players: Player[];
  activePlayerId: string | null;
  settings: AppSettings;
}

export interface GameQuestion {
  id: string;
  gameType: GameType;
  prompt: string;
  promptAudio?: string;
  promptEmoji?: string;
  targetText: string;
  options: string[];
  correctAnswer: string;
  syllables?: string[];
  imageOptions?: { id: string; emoji: string; label: string }[];
  contentId: string;
  /** For math-count: repeated emoji string */
  countEmoji?: string;
  countValue?: number;
}

export interface GameSessionResult {
  correct: boolean;
  starsEarned: number;
  message: string;
  leveledUp: boolean;
}

export const STORAGE_KEY = "reading-game-player";

export const DEFAULT_SETTINGS: AppSettings = {
  soundEnabled: true,
  musicEnabled: false,
  volume: 0.8,
};

export const AGE_GROUPS: AgeGroup[] = [3, 4, 5, 6];

export function createEmptyProgress(): PlayerProgress {
  return {
    completedActivities: [],
    completedWords: [],
    stars: 0,
    correctAnswers: 0,
    wrongAnswers: 0,
    currentLevel: 1,
    streak: 0,
    bestStreak: 0,
    consecutiveCorrect: 0,
    difficultyBonus: 0,
    lastPlayedAt: null,
  };
}
