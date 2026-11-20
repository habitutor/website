import { CalendarPlusIcon, CheckIcon, CrownIcon, WhatsappLogoIcon } from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
import { motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { COMMUNITY_LINKS } from "@/lib/community-links";
import { orpc } from "@/utils/orpc";
import { CountdownTiles } from "./-components/countdown-tiles";
import { usePtnTourSettings } from "./-hooks";
import { formatLongDate, formatTime, getGoogleCalendarUrl } from "./-lib";

export const Route = createFileRoute("/ptntour/$slug/success")({ component: RegistrationSuccessPage });

const CONFETTI = [
  { x: -96, y: -70, color: "bg-sr-sun-400", delay: 0.05 },
  { x: 90, y: -78, color: "bg-sr-blue-400", delay: 0.1 },
  { x: -70, y: 40, color: "bg-emerald-400", delay: 0.15 },
  { x: 84, y: 46, color: "bg-sr-sun-500", delay: 0.2 },
  { x: -118, y: -6, color: "bg-sr-blue-300", delay: 0.12 },
  { x: 120, y: -10, color: "bg-red-300", delay: 0.18 },
] as const;

const rise = (delay: number) => ({
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, delay, ease: [0.2, 0.7, 0.2, 1] as const },
});

function RegistrationSuccessPage() {
  const { slug } = Route.useParams();
  const { data: session, isPending: sessionPending } = authClient.useSession();
  const { data: settings } = usePtnTourSettings();
  const {
    data: event,
    isPending,
    isFetching,
  } = useQuery({
    ...orpc.ptnTour.detail.queryOptions({ input: { slug } }),
    queryKey: [...orpc.ptnTour.detail.queryKey({ input: { slug } }), session?.user.id ?? "anon"],
  });

  // Tunggu data terbaru selesai dimuat; cache lama (belum terdaftar) jangan sampai memicu pengalihan.
  if (isPending || isFetching || sessionPending) {
    return <div className="mx-auto h-96 w-full max-w-lg animate-pulse rounded-sr-xl bg-sr-blue-50" />;
  }
  // Halaman ini hanya bermakna untuk peserta terdaftar; selain itu kembalikan ke detail event.
  if (!event || !event.registered) return <Navigate to="/ptntour/$slug" params={{ slug }} search={{}} replace />;

  const calendarUrl = getGoogleCalendarUrl(event, window.location.origin);

  return (
    <div className="mx-auto flex w-full max-w-lg flex-col gap-4">
      <div className="relative overflow-hidden rounded-sr-xl border border-sr-line bg-white p-6 text-center shadow-sr-3 sm:p-8">
        <div className="pointer-events-none absolute -top-16 left-1/2 size-56 -translate-x-1/2 rounded-full bg-emerald-50" />
        <div className="relative mx-auto flex size-20 items-center justify-center">
          {CONFETTI.map((piece) => (
            <motion.span
              key={`${piece.x}-${piece.y}`}
              aria-hidden
              initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
              animate={{ opacity: [0, 1, 0], scale: [0, 1, 0.6], x: piece.x, y: piece.y, rotate: 120 }}
              transition={{ duration: 1.1, delay: 0.3 + piece.delay, ease: "easeOut" }}
              className={`absolute size-2.5 rounded-full ${piece.color}`}
            />
          ))}
          <motion.span
            aria-hidden
            initial={{ scale: 0.6, opacity: 0.6 }}
            animate={{ scale: 1.9, opacity: 0 }}
            transition={{ duration: 1.2, delay: 0.25, ease: "easeOut" }}
            className="absolute inset-0 rounded-full bg-sr-live/40"
          />
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 15, delay: 0.1 }}
            className="relative flex size-20 items-center justify-center rounded-full bg-sr-live text-white shadow-[0_12px_28px_-8px_rgb(16_185_129/0.6)]"
          >
            <CheckIcon weight="bold" className="size-10" />
          </motion.span>
        </div>

        <motion.h1 {...rise(0.3)} className="relative mt-5 text-2xl font-black text-sr-ink sm:text-3xl">
          Kamu udah terdaftar!
        </motion.h1>
        <motion.p {...rise(0.38)} className="relative mt-2 text-sm leading-relaxed text-sr-muted">
          <strong className="text-sr-ink">{event.title}</strong>
          <br />
          {formatLongDate(event.startsAt)}, {formatTime(event.startsAt)}
        </motion.p>
        <motion.div {...rise(0.46)} className="relative mt-4 flex justify-center">
          <CountdownTiles event={event} tone="light" />
        </motion.div>
        <motion.p {...rise(0.5)} className="relative mt-3 text-xs text-sr-muted">
          Tombol Join Zoom aktif 15 menit sebelum acara dimulai.
        </motion.p>

        <motion.p {...rise(0.55)} className="relative mt-6 text-left text-xs font-black tracking-wider text-sr-muted uppercase">
          Langkah selanjutnya
        </motion.p>
        <div className="relative mt-2 grid gap-3 text-left">
          {event.whatsappGroupUrl && (
            <motion.div {...rise(0.6)}>
              <Button asChild className="sr-sheen h-auto w-full justify-start gap-3 rounded-sr-md px-4 py-3">
                <a href={event.whatsappGroupUrl} target="_blank" rel="noreferrer">
                  <WhatsappLogoIcon weight="fill" className="size-5" />
                  <span>
                    1. Join Grup WA Event
                    <span className="block text-xs font-normal opacity-80">Info Zoom dan reminder ada di sini</span>
                  </span>
                </a>
              </Button>
            </motion.div>
          )}
          <motion.div {...rise(0.66)}>
            <Button asChild variant="outline" className="h-auto w-full justify-start gap-3 rounded-sr-md px-4 py-3">
              <a
                href={settings?.whatsapp_channel_url ?? COMMUNITY_LINKS.whatsappChannel}
                target="_blank"
                rel="noreferrer"
              >
                <WhatsappLogoIcon weight="fill" className="size-5 text-emerald-600" />
                <span>
                  {event.whatsappGroupUrl ? "2" : "1"}. Follow WhatsApp Channel Habitutor
                  <span className="block text-xs font-normal text-sr-muted">Biar nggak ketinggalan event berikutnya</span>
                </span>
              </a>
            </Button>
          </motion.div>
          <motion.div {...rise(0.72)}>
            <Button asChild variant="outline" className="h-auto w-full justify-start gap-3 rounded-sr-md px-4 py-3">
              <a href={calendarUrl} target="_blank" rel="noreferrer">
                <CalendarPlusIcon className="size-5" />
                <span>
                  {event.whatsappGroupUrl ? "3" : "2"}. Add to Calendar
                  <span className="block text-xs font-normal text-sr-muted">Pengingat langsung di Google Calendar</span>
                </span>
              </a>
            </Button>
          </motion.div>
        </div>

        <div className="relative mt-6 flex flex-col items-center gap-2 text-sm">
          <Link
            to="/ptntour/$slug"
            params={{ slug }}
            search={{}}
            className="font-bold text-sr-blue-600 hover:underline"
          >
            Lihat detail event
          </Link>
          <Link to="/ptntour" className="text-sr-muted hover:text-sr-ink">
            Kembali ke daftar event
          </Link>
        </div>
      </div>

      {!session?.user.isPremium && (
        <motion.div
          {...rise(0.85)}
          className="relative overflow-hidden rounded-sr-xl sr-card-blue p-5 text-white shadow-sr-2"
        >
          <div className="pointer-events-none absolute -top-12 -right-8 size-40 rounded-full bg-white/10" />
          <div className="relative flex items-start gap-3">
            <CrownIcon weight="fill" className="mt-0.5 size-6 shrink-0 text-sr-sun-400" />
            <div>
              <p className="font-black">{settings?.promo_title ?? "Siap lanjut belajar lebih serius?"}</p>
              <p className="mt-1 text-sm text-white/85">{settings?.promo_text}</p>
              <Button
                asChild
                size="sm"
                className="mt-3 border-transparent text-sr-ink shadow-sr-sun [background:var(--sr-grad-sun)]"
              >
                <Link to={(settings?.promo_cta_url ?? "/premium") as "/premium"}>
                  {settings?.promo_cta_label ?? "Lihat Paket Premium"}
                </Link>
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
