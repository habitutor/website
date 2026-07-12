import { BooksIcon, FireIcon, type Icon, MicrophoneStageIcon } from "@phosphor-icons/react";

export function formatRupiah(amount: number) {
  return `Rp ${amount.toLocaleString("id-ID")}`;
}

export const PERINTIS_SLUG = "perintis2027" as const;

export const PERINTIS_FALLBACK_PRICING = {
  originalPrice: 499_000,
  earlyBirdPrice: 199_000,
  regularPrice: 299_000,
  earlyBirdQuota: 50,
} as const;

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
    priceSuffix: "akses penuh sampai SNBT 2027!",
    cta: "Daftar Sekarang",
    scarcityNote: "Khusus 50 pendaftar pertama. Setelah itu naik Rp 299.000.",
  },
  proofPoints: [
    "7 dari 10 peserta SNBT gagal tiap tahun",
    "Siswa Habitutor: 60% lolos PTN 2026",
    "Dibangun oleh yang udah bantu ratusan ribu siswa",
  ],
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
  pricing: {
    label: "Paket Perintis 2027",
    suffix: "akses penuh sampai hari-H SNBT",
    features: ["Semua video, soal & try out", "100+ sesi live", "Komunitas", "Semua fitur baru otomatis"],
  },
  faq: [
    {
      id: 1,
      question: "Live class-nya mulai kapan?",
      answer: "Pertengahan Agustus. Tapi video, bank soal, try out, dan komunitas bisa lo akses langsung hari ini.",
    },
    {
      id: 2,
      question: "Gua baru naik kelas 12 / masih kelas 11, cocok gak?",
      answer: "Buat kelas 12 itu waktu ideal. Kelas 11 juga boleh banget, makin panjang persiapan makin santai.",
    },
    {
      id: 3,
      question: "Aksesnya sampai kapan?",
      answer: "Sampai hari-H SNBT 2027. Sekali bayar, gak ada biaya bulanan.",
    },
    {
      id: 4,
      question: "Belajarnya lewat mana?",
      answer: "Web habitutor.id (aplikasi menyusul Agustus, gratis buat member).",
    },
  ],
  closing: {
    title: "Merintis duluan selalu lebih murah daripada nyusul.",
    cta: "Daftar Sekarang",
  },
} as const;
