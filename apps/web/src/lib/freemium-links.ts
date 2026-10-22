export const FREEMIUM_LINKS = {
  instagram: "https://www.instagram.com/habitutor.id/",
  tiktok: "https://www.tiktok.com/@habitutor.id?lang=id-ID",
  whatsappGroup: "https://chat.whatsapp.com/BYJqvPu29KBK5ZjOHjqjIc?s=cl&p=i&mlu=4&ilr=4",
} as const;

export const FREEMIUM_PRICE_LABEL = "Rp10.000";

export function isFreemiumLinkReady(value: string) {
  return !value.startsWith("ISI_");
}

const DAY_MS = 24 * 60 * 60 * 1000;
const MONTHS_ID = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

/** Jadwal TKA 2026 (WIB). Ubah di sini kalau jadwal berubah. */
export const TKA_START = Date.UTC(2026, 9, 26);
export const TKA_END = Date.UTC(2026, 10, 8);
/** Pendaftaran TO 1 ditutup di tanggal ini; TO berikutnya dibuka per 3 hari. */
const FIRST_BATCH_END = Date.UTC(2026, 9, 24);
const BATCH_DAYS = 3;

/** Tanggal kalender WIB (hari ini) sebagai UTC midnight, supaya selisih hari akurat. */
function jakartaDay(now: Date) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value);
  return Date.UTC(get("year"), get("month") - 1, get("day"));
}

function formatDay(ms: number) {
  const d = new Date(ms);
  return `${d.getUTCDate()} ${MONTHS_ID[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

function formatRange(startMs: number, endMs: number) {
  const a = new Date(startMs);
  const b = new Date(endMs);
  if (a.getUTCMonth() === b.getUTCMonth()) {
    return `${a.getUTCDate()}–${b.getUTCDate()} ${MONTHS_ID[b.getUTCMonth()]} ${b.getUTCFullYear()}`;
  }
  const startLabel = `${a.getUTCDate()} ${MONTHS_ID[a.getUTCMonth()]}`;
  const sameYear = a.getUTCFullYear() === b.getUTCFullYear();
  return `${sameYear ? startLabel : `${startLabel} ${a.getUTCFullYear()}`} – ${formatDay(endMs)}`;
}

/** Teks pendaftaran untuk batch TO yang sedang berjalan hari ini. */
export function getRegistrationLabel(now: Date = new Date()) {
  const today = jakartaDay(now);
  if (today <= FIRST_BATCH_END) return `sampai ${formatDay(FIRST_BATCH_END)}`;
  const index = Math.floor((today - FIRST_BATCH_END - DAY_MS) / (BATCH_DAYS * DAY_MS));
  const start = FIRST_BATCH_END + DAY_MS + index * BATCH_DAYS * DAY_MS;
  return formatRange(start, start + (BATCH_DAYS - 1) * DAY_MS);
}

/** Kalimat pembuka BC: H-N dihitung otomatis dari tanggal mulai TKA. */
export function getCountdownLine(now: Date = new Date()) {
  const daysLeft = Math.round((TKA_START - jakartaDay(now)) / DAY_MS);
  if (daysLeft > 0) return `H-${daysLeft} TKA dan kamu belum tahu seberapa siap? 😬`;
  if (jakartaDay(now) <= TKA_END) return "TKA sudah dimulai dan kamu belum tahu seberapa siap? 😬";
  return "Mau tahu seberapa siap kamu? 😬";
}

/** Teks BC yang disalin siswa. Tanggal dan H-N otomatis, tidak perlu ubah kode tiap batch. */
export function buildBroadcastText(now: Date = new Date()) {
  return `🎊 TO TKA GRATIS HABITUTOR 🎊

${getCountdownLine(now)}
Yuk ukur kemampuan kamu sekarang sebelum terlambat!

TO TKA Habitutor hadir dengan soal yang disesuaikan dengan framework dan kisi-kisi resmi terbaru dari Kemendikdasmen.

MAPEL WAJIB:
🟢 Bahasa Indonesia
🟢 Matematika
🟢 Bahasa Inggris

MAPEL PILIHAN (pilih 2):
🟡 Matematika Tingkat Lanjut
🟡 Fisika · Kimia · Biologi
🟡 Ekonomi · Sosiologi · Geografi · Sejarah
🟡 Bahasa Indonesia Tingkat Lanjut
🟡 Bahasa Inggris Tingkat Lanjut

Bebas pilih 2 mata pelajaran.

📅 Catat waktunya:
📝 Pendaftaran: ${getRegistrationLabel(now)}
🏆 Hasil dan skor langsung keluar di web setelah kamu selesai mengerjakan. Pembahasan khusus pengguna premium atau akses berbayar ${FREEMIUM_PRICE_LABEL}

⭐ Kenapa TO Habitutor?
🔵 Soal sesuai kisi-kisi dan framework penilaian TKA
🔴 Analisis skor untuk membantu mengetahui kelemahan kamu

Cara daftar:
1️⃣ Follow Instagram @habitutor.id
2️⃣ Follow TikTok @habitutor.id
3️⃣ Buka https://habitutor.id lalu pilih TO
4️⃣ Upload 3 foto bukti (follow IG, follow TikTok, share BC ke 5 grup WA)
5️⃣ TO langsung terbuka setelah bukti terkirim

🆓 GRATIS — kuota terbatas!
👉 https://habitutor.id

Ada pertanyaan? DM @habitutor.id`;
}
