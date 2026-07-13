import { PERINTIS_FAQ, PERINTIS_FALLBACK_PRICING, PERINTIS_SLUG, formatRupiah } from "@/lib/perintis-pricing-copy";
import { BooksIcon, FireIcon, type Icon, MicrophoneStageIcon } from "@phosphor-icons/react";

export { formatRupiah, PERINTIS_FALLBACK_PRICING, PERINTIS_SLUG };

type Benefit = {
  icon: Icon;
  iconClassName: string;
  title: string;
  description: string;
};

export const PERINTIS_DATA = {
  hero: {
    title: "Perintis SNBT & TKA 2027, mulai sekarang.",
    subtitle:
      "Belajar bareng sampai hari-H: playlist video, anti burn out starterpack, bank soal, try out, 100+ sesi live, dan komunitas yang jagain lo tetep konsisten.",
    priceSuffix: "sekali bayar, akses penuh sampai SNBT 2027!",
    cta: "Daftar Sekarang",
  },
  proofPoints: ["Lebih dari 60% siswa Habitutor yang melapor lolos PTN di SNBT 2026 — hampir 2x rata-rata nasional."],
  benefits: [
    {
      icon: BooksIcon,
      iconClassName: "bg-tertiary-100 border-tertiary-200 text-primary-300",
      title: "Langsung bisa belajar hari ini",
      description:
        "200+ video (materi prioritas + fundamental + learning how to learn), ribuan bank soal, 20x try out soal asli + analisis detail.",
    },
    {
      icon: MicrophoneStageIcon,
      iconClassName: "bg-secondary-100 border-secondary-200 text-secondary-1000",
      title: "100+ sesi live sampai hari-H (mulai pertengahan Agustus)",
      description:
        "Live class, masterclass, mentoring, live TKA. Agustus–Desember 1–2x/minggu, makin deket SNBT makin intensif.",
    },
    {
      icon: FireIcon,
      iconClassName: "bg-red-100 border-red-200 text-red-500",
      title: "Sistem biar lo gak tumbang di tengah jalan",
      description:
        "Streak harian, pantau progress, mabok vocab, template belajar — plus komunitas Discord & grup WA. 10 bulan itu maraton; lo gak lari sendirian.",
    },
  ] satisfies Benefit[],
  comingSoon: {
    label: "Coming soon — Agustus",
    description:
      "Aplikasi iOS & Android, AI personal tutor, tes minat-jurusan. Daftar sekarang = dapet semuanya otomatis, tanpa bayar lagi.",
  },
  faq: PERINTIS_FAQ,
  closing: {
    title: "Merintis duluan selalu lebih murah daripada nyusul.",
    cta: "Daftar Sekarang",
  },
} as const;
