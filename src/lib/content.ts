import readingContent from "@/data/reading-content.json";
import type { AgeGroup, GameType, ReadingItem } from "./types";

export const ALL_CONTENT = readingContent as ReadingItem[];

export const GAME_META: Record<
  GameType,
  { title: string; emoji: string; description: string; ages: AgeGroup[] }
> = {
  "listen-pick": {
    title: "Dengar & Pilih",
    emoji: "🔊",
    description: "Dengar bunyi, pilih jawapan",
    ages: [3, 4, 5],
  },
  combine: {
    title: "Gabungkan",
    emoji: "🧩",
    description: "Gabung suku kata jadi perkataan",
    ages: [4, 5],
  },
  "pick-image": {
    title: "Pilih Gambar",
    emoji: "🖼️",
    description: "Dengar perkataan, pilih gambar",
    ages: [3, 4, 5],
  },
  "arrange-syllables": {
    title: "Susun Suku Kata",
    emoji: "🔤",
    description: "Susun suku kata dengan betul",
    ages: [4, 5],
  },
  "complete-word": {
    title: "Lengkapkan",
    emoji: "✏️",
    description: "Lengkapkan perkataan",
    ages: [4, 5],
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

export function getItemById(id: string): ReadingItem | undefined {
  return ALL_CONTENT.find((item) => item.id === id);
}

export function getWordsWithEmoji(age: AgeGroup): ReadingItem[] {
  return getContentForAge(age).filter(
    (item) =>
      (item.type === "word" || item.type === "letter") && Boolean(item.emoji),
  );
}
