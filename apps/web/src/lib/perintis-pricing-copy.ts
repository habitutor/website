export function formatRupiah(amount: number) {
  return `Rp${amount.toLocaleString("id-ID")}`;
}

export const PERINTIS_SLUG = "perintis2027" as const;

export const PERINTIS_FALLBACK_PRICING = {
  originalPrice: 500_000,
  earlyBirdPrice: 249_000,
  regularPrice: 349_000,
  earlyBirdQuota: 50,
} as const;

export const PERINTIS_PRICING_COPY = {
  label: "Paket Perintis 2027",
  suffix: "akses penuh sampai hari-H SNBT",
  priceSuffix: "sekali bayar",
  urgencyEarlyBird: (regularPrice: number) =>
    `Harga naik jadi ${formatRupiah(regularPrice)} setelah 50 pendaftar pertama`,
  urgencyRegular: "Slot early bird udah habis — harga reguler berlaku",
  comparison: "Platform belajar lain: Rp250–400rb per bulan.\n\nIni sekali bayar, sampai hari-H SNBT!",
  ctaLabel: "Amankan Slot Lo",
  footerNote: "Langsung aktif setelah bayar · QRIS / transfer bank · Sekali bayar, tanpa biaya bulanan",
  proofStrip: "Lebih dari 60% siswa Habitutor yang melapor lolos PTN di SNBT 2026 — hampir 2x rata-rata nasional.",
  features: [
    "200+ video belajar (fundamental, materi prioritas, kelas habit dan anti-burnout)",
    "Ribuan bank soal per subtes SNBT dari yang mudah sampai HOTS",
    "20x try out soal asli SNBT tahun-tahun lalu + analisis detail",
    "100+ sesi live: bahas materi, soal asli, masterclass, mentoring bulanan dan mingguan, TKA",
    "Komunitas Discord + grup WA angkatan 2027, ada kuis harian, reminder, bahas soal, dan belajar bareng",
    "Streak harian, progress tracker, template belajar",
    "Mabok vocab & reading habits: meningkatkan skill literasi, vocabulary, dan ketahanan untuk SNBT",
    "Aplikasi di App Store & Play Store + AI tutor + fitur lainnya (rilis Agustus): otomatis dapet, tanpa bayar lagi",
    "Fitur dan aplikasi akan terus berkembang, bayar sekarang dengan harga lebih murah!",
  ],
} as const;

export const PERINTIS_FAQ = [
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
    answer: "Web Habitutor.id (aplikasi menyusul Agustus, gratis buat member).",
  },
] as const;
