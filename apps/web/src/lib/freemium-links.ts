export const FREEMIUM_LINKS = {
  instagram: "https://www.instagram.com/habitutor.id/",
  tiktok: "https://www.tiktok.com/@habitutor.id?lang=id-ID",
  whatsappGroup: "https://chat.whatsapp.com/BYJqvPu29KBK5ZjOHjqjIc?s=cl&p=i&mlu=4&ilr=4",
  broadcastText: `🎊 TO TKA GRATIS HABITUTOR 🎊

H-[X] TKA dan kamu belum tahu seberapa siap? 😬
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
📝 Pendaftaran: [tanggal]
🏆 Pembahasan: [tanggal] — khusus pengguna premium atau akses berbayar Rp10.000
📊 Pengumuman hasil: [tanggal]

⭐ Kenapa TO Habitutor?
🔵 Soal sesuai kisi-kisi dan framework penilaian TKA
🔴 Analisis skor untuk membantu mengetahui kelemahan kamu

Cara daftar:
1️⃣ Follow Instagram @habitutor.id
2️⃣ Follow TikTok @habitutor.id
3️⃣ Klik link pendaftaran
4️⃣ Isi form dan tunggu informasi pengerjaan melalui WhatsApp atau email

🆓 GRATIS — kuota terbatas!
👉 https://habitutor.id

Ada pertanyaan? DM @habitutor.id`,
} as const;

export const FREEMIUM_PRICE_LABEL = "Rp10.000";

export function isFreemiumLinkReady(value: string) {
  return !value.startsWith("ISI_");
}
