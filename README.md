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

## PWA

App boleh dipasang ke skrin utama (Add to Home Screen / Install app).

- Manifest: `/manifest.webmanifest`
- Service worker dijana semasa `npm run build` (`@ducanh2912/next-pwa`)
- Offline fallback: `/~offline`
- Ikon: `public/icons/`

Pada telefon: buka app → menu pelayar → **Add to Home Screen** / **Install**.

## Progress

Disimpan dalam localStorage key: `reading-game-player`.

## Docker (Ubuntu server)

Keperluan: Docker + Docker Compose plugin.

```bash
git clone git@github.com:mrameen/web-app-game-kanak2.git
cd web-app-game-kanak2
cp .env.example .env   # optional
docker-compose up -d --build
```

App akan listen di `http://SERVER_IP:3000`.

## Public vs Admin

- Public (`/`): masukkan **nama + umur** sahaja. Tidak papar senarai pemain lain.
- Admin (`/admin`): log masuk untuk padam pemain, reset progress, lihat semua profil.

Default kata laluan admin: `baca@admin`  
Boleh override dengan env `NEXT_PUBLIC_ADMIN_PASSWORD`.
