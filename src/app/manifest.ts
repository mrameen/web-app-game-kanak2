import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Baca Ceria — Belajar Membaca",
    short_name: "Baca Ceria",
    description:
      "Permainan membaca Bahasa Melayu untuk kanak-kanak umur 3–6 tahun.",
    start_url: "/",
    display: "standalone",
    background_color: "#e0f2fe",
    theme_color: "#7dd3fc",
    orientation: "portrait",
    lang: "ms",
    categories: ["education", "games", "kids"],
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512-maskable.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
