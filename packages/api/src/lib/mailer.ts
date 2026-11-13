import { logger } from "@habitutor/shared/logger";
import { Resend } from "resend";

/**
 * Email transaksional untuk event. Pengirim harus alamat di domain yang terverifikasi di Resend
 * (default noreply@habitutor.id). Gmail tidak bisa dipakai sebagai pengirim, tetapi boleh sebagai
 * alamat balasan lewat EVENT_REPLY_TO_EMAIL, sehingga bisa diganti kapan saja tanpa mengubah kode.
 */
const DEFAULT_FROM = "Habitutor <noreply@habitutor.id>";

let client: Resend | null = null;

/**
 * Pengaman: email event hanya terkirim bila EVENT_EMAIL_ENABLED=true. Dengan begitu server lokal/staging yang
 * memakai salinan data asli dan API key yang sama tidak pernah mengirim email ke pengguna sungguhan.
 */
const isEnabled = () => process.env.EVENT_EMAIL_ENABLED === "true";

function getClient() {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  client ??= new Resend(key);
  return client;
}

export type EmailMessage = { to: string; subject: string; html: string };

/** Mengembalikan true kalau email diterima Resend. Dilewati bila belum diaktifkan atau tanpa API key. */
export async function sendEmail(message: EmailMessage) {
  if (!isEnabled()) {
    logger.warn("EVENT_EMAIL_ENABLED bukan 'true', email event dilewati", { subject: message.subject });
    return false;
  }
  const resend = getClient();
  if (!resend) {
    logger.warn("RESEND_API_KEY tidak diatur, email dilewati", { to: "[disembunyikan]", subject: message.subject });
    return false;
  }
  const replyTo = process.env.EVENT_REPLY_TO_EMAIL?.trim();
  const { error } = await resend.emails.send({
    from: process.env.EVENT_EMAIL_FROM?.trim() || DEFAULT_FROM,
    to: message.to,
    subject: message.subject,
    html: message.html,
    ...(replyTo ? { replyTo } : {}),
  });
  if (error) {
    logger.error("Gagal mengirim email event", { error: error.message });
    return false;
  }
  return true;
}

const escapeHtml = (value: string) =>
  value.replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char] ?? char);

export function renderEventReminderEmail({
  name,
  title,
  whenLabel,
  eventUrl,
  kind,
  whatsappGroupUrl,
}: {
  name: string;
  title: string;
  whenLabel: string;
  eventUrl: string;
  kind: "day" | "hour";
  whatsappGroupUrl: string | null;
}) {
  const lead =
    kind === "day"
      ? `Besok kamu ada event gratis <strong>${escapeHtml(title)}</strong>.`
      : `Sebentar lagi, <strong>${escapeHtml(title)}</strong> dimulai dalam sekitar 1 jam.`;
  return `<!doctype html><html><body style="margin:0;background:#f4f7ff;font-family:Arial,Helvetica,sans-serif;color:#17203a">
<table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:24px 12px">
<table width="100%" style="max-width:520px;background:#fff;border-radius:16px;padding:28px">
<tr><td>
<p style="margin:0 0 12px;font-size:15px">Halo ${escapeHtml(name)},</p>
<p style="margin:0 0 12px;font-size:15px;line-height:1.6">${lead}</p>
<p style="margin:0 0 20px;font-size:15px;line-height:1.6">Jadwal: <strong>${escapeHtml(whenLabel)}</strong></p>
<p style="margin:0 0 20px"><a href="${escapeHtml(eventUrl)}" style="display:inline-block;background:#2356e8;color:#fff;text-decoration:none;font-weight:bold;padding:12px 22px;border-radius:999px">Buka halaman event</a></p>
<p style="margin:0 0 8px;font-size:13px;color:#5b6786;line-height:1.6">Tombol Join Zoom aktif 15 menit sebelum acara dimulai, langsung di halaman event.</p>
${whatsappGroupUrl ? `<p style="margin:0;font-size:13px;line-height:1.6"><a href="${escapeHtml(whatsappGroupUrl)}" style="color:#2356e8">Gabung grup WhatsApp event</a> untuk info terbaru.</p>` : ""}
</td></tr></table>
<p style="max-width:520px;font-size:12px;color:#8a94ad;line-height:1.6">Email otomatis dari Habitutor karena kamu mendaftar event ini.</p>
</td></tr></table></body></html>`;
}
