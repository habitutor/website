import { formatRupiah } from "@/lib/perintis-pricing-copy";

export const GROUP_BUY_FALLBACK = {
  price: 199_000,
  fullPrice: 349_000,
  requiredMembers: 3,
  windowHours: 48,
} as const;

export const GROUP_BUY_COPY = {
  label: "Patungan Bertiga",
  tagline: "Ajak 2 teman, semua bayar lebih murah",
  ctaStart: "Mulai Patungan",
  ctaJoin: "Gabung & Bayar",
  rules: [
    `Lo bayar ${formatRupiah(GROUP_BUY_FALLBACK.price)} sekarang (harga normal ${formatRupiah(GROUP_BUY_FALLBACK.fullPrice)}).`,
    `Ajak 2 teman lewat link undangan — mereka juga bayar ${formatRupiah(GROUP_BUY_FALLBACK.price)}.`,
    `Akses Premium terbuka untuk semuanya begitu ${GROUP_BUY_FALLBACK.requiredMembers} orang sudah bayar dalam ${GROUP_BUY_FALLBACK.windowHours} jam.`,
  ],
  importantNote:
    "Penting: akses Premium belum aktif setelah lo bayar — akses baru terbuka setelah 3 orang lengkap membayar.",
  failureTitle: "Kalau grupnya nggak penuh dalam 48 jam?",
  failureOptions: [
    `Bayar selisihnya (${formatRupiah(GROUP_BUY_FALLBACK.fullPrice - GROUP_BUY_FALLBACK.price)}) untuk langsung dapat Premium dengan harga normal, atau`,
    `Refund penuh ${formatRupiah(GROUP_BUY_FALLBACK.price)} — diproses manual, maksimal 7 hari kerja.`,
  ],
} as const;

export function buildGroupBuyInviteUrl(inviteCode: string) {
  return `${window.location.origin}/group-buy/${inviteCode}`;
}

export function buildGroupBuyWhatsAppMessage({
  inviteCode,
  paidCount,
  requiredMembers,
}: {
  inviteCode: string;
  paidCount: number;
  requiredMembers: number;
}) {
  const remaining = Math.max(requiredMembers - paidCount, 1);
  return [
    "Eh, gua lagi patungan Paket Perintis 2027 di Habitutor buat persiapan SNBT! 📚",
    "",
    `Kalau kita bertiga gabung, semuanya cuma bayar ${formatRupiah(GROUP_BUY_FALLBACK.price)} (normalnya ${formatRupiah(GROUP_BUY_FALLBACK.fullPrice)}).`,
    `Tinggal butuh ${remaining} orang lagi, dan waktunya cuma 48 jam. Buruan gabung di sini:`,
    "",
    buildGroupBuyInviteUrl(inviteCode),
  ].join("\n");
}

export function buildWhatsAppShareUrl(message: string) {
  return `https://wa.me/?text=${encodeURIComponent(message)}`;
}
