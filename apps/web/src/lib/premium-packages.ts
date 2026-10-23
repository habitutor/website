export type PremiumPackageSlug = "paketmandiri2027" | "paketutbk2027" | "paket3bulan" | "paket1bulan";
export type LegacyPremiumPlan = "perintis2027" | "paket2bulan";
export type PremiumPlan = PremiumPackageSlug | LegacyPremiumPlan;

export type PremiumPackage = {
  slug: PremiumPackageSlug;
  name: string;
  normalPrice: number;
  promoPrice: number;
  currentPrice: number;
  isPromo: boolean;
  promoEndsAt: string;
  expiresAt: string | null;
  durationMonths: number | null;
  isAvailable: boolean;
};

export function formatRupiah(amount: number) {
  return `Rp${amount.toLocaleString("id-ID")}`;
}

export function formatWibDate(value: string | Date) {
  return new Intl.DateTimeFormat("id-ID", { dateStyle: "long", timeZone: "Asia/Jakarta" }).format(new Date(value));
}

// Display fallback only: the server decides the amount charged
// (PREMIUM_PACKAGES in packages/api/src/lib/constants.ts). Keep in sync.
const PROMO_ENDS_AT = "2026-10-31T23:59:59.999+07:00";

const FALLBACK_PACKAGES = [
  {
    slug: "paketmandiri2027",
    name: "Paket Sampai Mandiri",
    normalPrice: 350_000,
    promoPrice: 280_000,
    expiresAt: "2027-06-30T23:59:59.999+07:00",
    durationMonths: null,
  },
  {
    slug: "paketutbk2027",
    name: "Paket Sampai UTBK",
    normalPrice: 250_000,
    promoPrice: 200_000,
    expiresAt: "2027-04-30T23:59:59.999+07:00",
    durationMonths: null,
  },
  {
    slug: "paket3bulan",
    name: "Paket 3 Bulan",
    normalPrice: 150_000,
    promoPrice: 120_000,
    expiresAt: null,
    durationMonths: 3,
  },
  {
    slug: "paket1bulan",
    name: "Paket 1 Bulan",
    normalPrice: 100_000,
    promoPrice: 50_000,
    expiresAt: null,
    durationMonths: 1,
  },
] as const;

export function getFallbackPremiumPackages(now = Date.now()): PremiumPackage[] {
  const isPromo = now <= new Date(PROMO_ENDS_AT).getTime();

  return FALLBACK_PACKAGES.map((pkg) => ({
    ...pkg,
    currentPrice: isPromo ? pkg.promoPrice : pkg.normalPrice,
    isPromo,
    promoEndsAt: PROMO_ENDS_AT,
    isAvailable: pkg.expiresAt === null || now < new Date(pkg.expiresAt).getTime(),
  }));
}

export const PREMIUM_PACKAGE_COPY: Record<PremiumPackageSlug, { tagline: string; cta: string }> = {
  paketmandiri2027: { tagline: "akses penuh sampai Ujian Mandiri", cta: "Ambil Paket Sampai Mandiri" },
  paketutbk2027: { tagline: "akses penuh sampai UTBK", cta: "Ambil Paket Sampai UTBK" },
  paket3bulan: { tagline: "persiapan intensif 3 bulan", cta: "Ambil Paket 3 Bulan" },
  paket1bulan: { tagline: "coba dulu, tanpa komitmen panjang", cta: "Ambil Paket 1 Bulan" },
};

export const PREMIUM_PLAN_NAME: Record<PremiumPlan, string> = {
  paketmandiri2027: "Paket Sampai Mandiri",
  paketutbk2027: "Paket Sampai UTBK",
  paket3bulan: "Paket 3 Bulan",
  paket1bulan: "Paket 1 Bulan",
  perintis2027: "Paket Perintis 2027",
  paket2bulan: "Paket 2 Bulan",
};

export function getAccessLabel(pkg: Pick<PremiumPackage, "expiresAt" | "durationMonths">) {
  if (pkg.expiresAt) return `Aktif sampai ${formatWibDate(pkg.expiresAt)}`;
  return `Aktif ${pkg.durationMonths} bulan sejak pembayaran`;
}

export const PREMIUM_PRICING_COPY = {
  footerNote: "Langsung aktif setelah bayar · QRIS / transfer bank · Sekali bayar, tanpa biaya bulanan",
  proofStrip: "Lebih dari 60% siswa Habitutor yang melapor lolos PTN di SNBT 2026 — hampir 2x rata-rata nasional.",
  featuresTitle: "Semua paket mendapat fasilitas Premium yang sama:",
  features: [
    "200+ video belajar (fundamental, materi prioritas, kelas habit dan anti-burnout)",
    "Belajar dari fundamental dan materi tiap subtest",
    "Ribuan bank soal per subtes SNBT dari yang mudah sampai HOTS",
    "20x try out soal asli SNBT tahun-tahun lalu + analisis detail",
    "150+ sesi live: bahas materi, soal asli, masterclass, mentoring bulanan dan mingguan, TKA",
    "TKA INTENSIF — Modul, latihan soal, dan 40+ live class TKA wajib dan pilihan",
    "Komunitas Discord + grup WA angkatan 2027, ada kuis harian, reminder, bahas soal, dan belajar bareng",
    "Streak harian, progress tracker, template belajar",
    "Mabok vocab & reading habits: meningkatkan skill literasi, vocabulary, dan ketahanan untuk SNBT",
    "Aplikasi di App Store & Play Store + AI tutor + fitur lainnya: otomatis dapet, tanpa bayar lagi",
    "Fitur dan aplikasi akan terus berkembang selama masa aktif paketmu",
  ],
} as const;

export const PREMIUM_FAQ = [
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
    answer:
      "Tergantung paket: Paket Sampai UTBK aktif sampai 30 April 2027, Paket Sampai Mandiri sampai 30 Juni 2027, Paket 3 Bulan dan Paket 1 Bulan dihitung sejak pembayaran berhasil. Sekali bayar, gak ada biaya bulanan.",
  },
  {
    id: 4,
    question: "Belajarnya lewat mana?",
    answer: "Web Habitutor.id (aplikasi menyusul, gratis buat member).",
  },
] as const;
