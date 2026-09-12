# Baca Ceria

Permainan membaca Bahasa Melayu untuk kanak-kanak umur 3–5 tahun (internal MVP).

## Stack

- Next.js (App Router)
- React + TypeScript
- Tailwind CSS
- Lucide React
- localStorage (tiada backend / auth / database)

## Mulakan

```bash
npm install
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000).

## Routes

| Route | Fungsi |
| --- | --- |
| `/` | Pilih / tambah pemain |
| `/player` | Dashboard pemain |
| `/play?game=listen-pick` | Main mini game |
| `/progress` | Progress ringkas |
| `/settings` | Bunyi, volume, reset, tukar pemain |

Game types: `listen-pick`, `combine`, `pick-image`, `arrange-syllables`, `complete-word`.

## Kandungan

Edit `src/data/reading-content.json` untuk tambah huruf, suku kata, perkataan, atau ayat.

## Audio

Struktur folder:

```text
public/audio/
  letters/
  syllables/
  words/
  sentences/
  ui/
```

Jika fail `.mp3` belum wujud, app guna **SpeechSynthesis** (`ms-MY`) sebagai fallback melalui `playAudio(text, audioUrl?)`.

## Progress

Disimpan dalam localStorage key: `reading-game-player`.
