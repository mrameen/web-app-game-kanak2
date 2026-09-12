import readingContent from "@/data/reading-content.json";
import type {
  AgeGroup,
  GameCategory,
  GameType,
  ReadingItem,
} from "./types";

export const ALL_CONTENT = readingContent as ReadingItem[];

export const GAME_META: Record<
  GameType,
  {
    title: string;
    emoji: string;
    description: string;
    ages: AgeGroup[];
    category: GameCategory;
  }
> = {
  "listen-pick": {
    title: "Dengar & Pilih",
    emoji: "🔊",
    description: "Dengar bunyi, pilih jawapan",
    ages: [3, 4, 5, 6],
    category: "reading",
  },
  combine: {
    title: "Gabungkan",
    emoji: "🧩",
    description: "Gabung suku kata jadi perkataan",
    ages: [4, 5, 6],
    category: "reading",
  },
  "pick-image": {
    title: "Pilih Gambar",
    emoji: "🖼️",
    description: "Dengar perkataan, pilih gambar",
    ages: [3, 4, 5, 6],
    category: "reading",
  },
  "arrange-syllables": {
    title: "Susun Suku Kata",
    emoji: "🔤",
    description: "Susun suku kata dengan betul",
    ages: [4, 5, 6],
    category: "reading",
  },
  "complete-word": {
    title: "Lengkapkan",
    emoji: "✏️",
    description: "Lengkapkan perkataan",
    ages: [4, 5, 6],
    category: "reading",
  },
  "math-count": {
    title: "Kira Objek",
    emoji: "🔢",
    description: "Kira dan pilih nombor",
    ages: [3, 4, 5, 6],
    category: "math",
  },
  "math-add": {
    title: "Tambah",
    emoji: "➕",
    description: "Soalan tambah mudah",
    ages: [3, 4, 5, 6],
    category: "math",
  },
  "math-subtract": {
    title: "Tolak",
    emoji: "➖",
    description: "Soalan tolak mudah",
    ages: [4, 5, 6],
    category: "math",
  },
};

export function getContentForAge(age: AgeGroup): ReadingItem[] {
  return ALL_CONTENT.filter((item) => item.age.includes(age));
}

export function getGamesForAge(age: AgeGroup): GameType[] {
  return (Object.keys(GAME_META) as GameType[]).filter((type) =>
    GAME_META[type].ages.includes(age),
  );
}

export function getGamesForAgeByCategory(
  age: AgeGroup,
  category: GameCategory,
): GameType[] {
  return getGamesForAge(age).filter(
    (type) => GAME_META[type].category === category,
  );
}

export function getItemById(id: string): ReadingItem | undefined {
  return ALL_CONTENT.find((item) => item.id === id);
}

/** Prefer content JSON audio for a letter/syllable/word token. */
export function getAudioForToken(token: string): string | undefined {
  const key = token.trim().toUpperCase();
  if (!key) return undefined;

  const exact =
    ALL_CONTENT.find(
      (item) =>
        item.text.toUpperCase() === key &&
        (item.type === "syllable" || item.type === "letter" || item.type === "word"),
    ) ?? ALL_CONTENT.find((item) => item.text.toUpperCase() === key);

  return exact?.audio;
}

export function getWordsWithEmoji(age: AgeGroup): ReadingItem[] {
  return getContentForAge(age).filter(
    (item) =>
      (item.type === "word" || item.type === "letter") && Boolean(item.emoji),
  );
}
