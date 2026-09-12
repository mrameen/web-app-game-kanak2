/** Malay number words for kid-friendly math speech. */

const ONES = [
  "kosong",
  "satu",
  "dua",
  "tiga",
  "empat",
  "lima",
  "enam",
  "tujuh",
  "lapan",
  "sembilan",
];

export function numberToMalay(n: number): string {
  const value = Math.trunc(n);
  if (value < 0 || value > 99) return String(value);
  if (value < 10) return ONES[value];
  if (value === 10) return "sepuluh";
  if (value === 11) return "sebelas";
  if (value < 20) return `${ONES[value - 10]} belas`;
  const tens = Math.floor(value / 10);
  const rem = value % 10;
  const tensWord = tens === 1 ? "sepuluh" : `${ONES[tens]} puluh`;
  return rem === 0 ? tensWord : `${tensWord} ${ONES[rem]}`;
}

export function mathCountSpeech(): string {
  return "Berapa banyak ini?";
}

export function mathAddSpeech(a: number, b: number): string {
  return `${numberToMalay(a)} tambah ${numberToMalay(b)}, berapa?`;
}

export function mathSubtractSpeech(a: number, b: number): string {
  return `${numberToMalay(a)} tolak ${numberToMalay(b)}, berapa?`;
}

/** Parse "2 + 3 = ?" or "5 − 2 = ?" prompts from math-engine. */
export function speechFromMathPrompt(
  gameType: string,
  prompt: string,
): string {
  if (gameType === "math-count") return mathCountSpeech();

  const add = prompt.match(/^(\d+)\s*\+\s*(\d+)/);
  if (add) return mathAddSpeech(Number(add[1]), Number(add[2]));

  const sub = prompt.match(/^(\d+)\s*[−\-]\s*(\d+)/);
  if (sub) return mathSubtractSpeech(Number(sub[1]), Number(sub[2]));

  return "Jawab soalan matematik ini";
}
