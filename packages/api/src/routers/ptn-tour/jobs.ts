import { logger } from "@habitutor/shared/logger";
import { deleteCloudinaryImageByUrl } from "../../lib/cloudinary";
import { renderEventReminderEmail, sendEmail } from "../../lib/mailer";
import { ptnTourRepo } from "./repo";

const SWEEP_INTERVAL_MS = 5 * 60 * 1000;
const PURGE_EVERY_N_SWEEPS = 72; // ~6 jam

const siteUrl = () =>
  (process.env.APP_URL || process.env.CORS_ORIGIN?.split(",")[0] || "https://habitutor.id").trim().replace(/\/$/, "");

const formatWhen = (date: Date) =>
  `${date.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Jakarta" })}, ${date
    .toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "Asia/Jakarta" })
    .replace(":", ".")} WIB`;

/** Kirim pengingat H-1 dan 1 jam. Tiap pendaftar hanya diberi tanda terkirim setelah email diterima. */
export async function sendDueEventReminders(now = new Date()) {
  const due = await ptnTourRepo.dueReminders({ now });
  let sent = 0;
  for (const item of due) {
    const ok = await sendEmail({
      to: item.email,
      subject:
        item.kind === "day"
          ? `Besok: ${item.title} (event gratis Habitutor)`
          : `1 jam lagi: ${item.title} dimulai`,
      html: renderEventReminderEmail({
        name: item.name,
        title: item.title,
        whenLabel: formatWhen(item.startsAt),
        eventUrl: `${siteUrl()}/ptntour/${item.slug}`,
        kind: item.kind,
        whatsappGroupUrl: item.whatsappGroupUrl,
      }),
    });
    if (!ok) continue;
    await ptnTourRepo.markReminderSent({ registrationId: item.registrationId, kind: item.kind });
    sent += 1;
  }
  return { due: due.length, sent };
}

export async function purgeExpiredPtnTourProofs() {
  const { deleted, urls } = await ptnTourRepo.purgeExpiredProofs();
  for (const url of urls) await deleteCloudinaryImageByUrl(url);
  return deleted;
}

let timer: ReturnType<typeof setInterval> | null = null;
let running = false;
let sweeps = 0;

async function sweep() {
  if (running) return;
  running = true;
  try {
    const result = await sendDueEventReminders();
    if (result.due > 0) logger.info("PTN Tour reminders processed", result);
    if (sweeps % PURGE_EVERY_N_SWEEPS === 0) {
      const deleted = await purgeExpiredPtnTourProofs();
      if (deleted > 0) logger.info("PTN Tour proofs purged", { deleted });
    }
    sweeps += 1;
  } catch (error) {
    logger.error("PTN Tour sweep failed", { error });
  } finally {
    running = false;
  }
}

export function startPtnTourJobs() {
  if (timer) return;
  timer = setInterval(sweep, SWEEP_INTERVAL_MS);
  void sweep();
}

export function stopPtnTourJobs() {
  if (!timer) return;
  clearInterval(timer);
  timer = null;
}
