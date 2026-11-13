import {
  ArrowLeftIcon,
  CalendarBlankIcon,
  CalendarPlusIcon,
  CaretDownIcon,
  CheckCircleIcon,
  ClockIcon,
  CrownIcon,
  FileArrowDownIcon,
  GiftIcon,
  LockKeyIcon,
  PlayCircleIcon,
  ShareNetworkIcon,
  UsersThreeIcon,
  VideoCameraIcon,
  WhatsappLogoIcon,
} from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { type } from "arktype";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { TiltCard } from "@/routes/-home/motion-bits";
import { orpc } from "@/utils/orpc";
import { CountdownTiles } from "./-components/countdown-tiles";
import { RecordingLockedDialog } from "./-components/recording-locked-dialog";
import { RegisterDialog } from "./-components/register-dialog";
import { useJoinEvent, usePtnTourSettings, useWatchRecording } from "./-hooks";
import {
  formatLongDate,
  formatTime,
  getAccessBadge,
  getEventStatus,
  getGoogleCalendarUrl,
  getSpotsFill,
  getSpotsLabel,
  isPremiumLocked,
  parseRundown,
  type PtnEvent,
} from "./-lib";

export const Route = createFileRoute("/ptntour/$slug/")({
  validateSearch: type({ "daftar?": "boolean" }),
  component: EventDetailPage,
});

const fadeUp = {
  initial: { opacity: 0, y: 22 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-40px" },
  transition: { duration: 0.55, ease: [0.2, 0.7, 0.2, 1] as const },
};

function EventDetailPage() {
  const { slug } = Route.useParams();
  const { daftar } = Route.useSearch();
  const { data: session } = authClient.useSession();
  const isPremium = Boolean(session?.user.isPremium);
  const { data: event, isPending } = useQuery({
    ...orpc.ptnTour.detail.queryOptions({ input: { slug } }),
    queryKey: [...orpc.ptnTour.detail.queryKey({ input: { slug } }), session?.user.id ?? "anon"],
  });
  const { data: materials } = useQuery({
    ...orpc.ptnTour.materials.queryOptions({ input: { slug } }),
    queryKey: [...orpc.ptnTour.materials.queryKey({ input: { slug } }), session?.user.id ?? "anon"],
  });
  const [dialogOpen, setDialogOpen] = useState(false);
  const join = useJoinEvent();
  const watch = useWatchRecording();

  // Setelah login dari tombol "Daftar Gratis", pengguna kembali ke sini dan formulir langsung terbuka.
  const autoOpen = Boolean(daftar && session?.user && event && !event.registered && event.phase !== "ended");
  const registerOpen = dialogOpen || autoOpen;

  if (isPending) return <DetailSkeleton />;
  if (!event) {
    return (
      <div className="flex flex-col items-center rounded-sr-xl border border-sr-line bg-white p-8 text-center shadow-sr-1">
        <img src="/avatar/confused-avatar.webp" alt="" aria-hidden className="h-28 w-auto" />
        <h1 className="mt-3 text-2xl font-black text-sr-ink">Event tidak ditemukan</h1>
        <p className="mt-2 text-sm text-sr-muted">Link event mungkin salah atau event sudah tidak tayang.</p>
        <Button asChild className="mt-5">
          <Link to="/ptntour">Lihat semua event</Link>
        </Button>
      </div>
    );
  }

  const status = getEventStatus(event, isPremium);
  const rundown = parseRundown(event.rundown);
  const canJoin = status.key === "live" && (event.registered || isPremium);
  const canWatchNow = event.phase === "ended" && event.hasRecording && (event.registered || isPremium);
  const access = getAccessBadge(event);
  const fill = getSpotsFill(event);
  const share = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) await navigator.share({ title: event.title, text: event.description, url });
      else {
        await navigator.clipboard.writeText(url);
        toast.success("Link event disalin");
      }
    } catch {
      /* dibatalkan pengguna */
    }
  };

  const ctaProps = {
    event,
    isPremium,
    loggedIn: Boolean(session?.user),
    canJoin,
    canWatchNow,
    joining: join.isPending,
    watching: watch.isPending,
    onJoin: () => join.mutate({ eventId: event.id }),
    onWatch: () => watch.mutate(event.slug),
    onRegister: () => setDialogOpen(true),
  };
  const cta = <PrimaryAction {...ctaProps} />;
  const ctaHero = <PrimaryAction {...ctaProps} onDark />;

  return (
    <>
      <Link
        to="/ptntour"
        className="inline-flex w-fit items-center gap-2 text-sm font-bold text-sr-blue-600 transition-transform hover:-translate-x-0.5 hover:text-sr-blue-700"
      >
        <ArrowLeftIcon weight="bold" /> Semua event
      </Link>

      <section className="relative overflow-hidden rounded-sr-xl sr-card-blue text-white shadow-sr-3">
        <img
          src={event.posterUrl}
          alt=""
          aria-hidden
          className="pointer-events-none absolute inset-0 size-full scale-125 object-cover opacity-25 blur-3xl"
        />
        <div className="pointer-events-none absolute -top-24 -right-16 size-72 rounded-full bg-white/10" />
        <div className="relative grid gap-6 p-5 sm:p-8 lg:grid-cols-[17rem_1fr] lg:gap-10 lg:p-10">
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.6, ease: [0.2, 0.7, 0.2, 1] }}
            className="mx-auto w-full max-w-60 lg:max-w-none"
          >
            <TiltCard maxTilt={7}>
              <img
                src={event.posterUrl}
                alt={`Poster ${event.title}`}
                className="aspect-4/5 w-full rounded-sr-lg object-cover shadow-[0_24px_50px_-18px_rgb(0_0_0/0.55)] ring-1 ring-white/25"
              />
            </TiltCard>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.2, 0.7, 0.2, 1] }}
            className="flex min-w-0 flex-col gap-4"
          >
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold",
                  status.tone === "bg-white/95 text-sr-ink" ? "bg-white text-sr-blue-700" : status.tone,
                )}
              >
                {status.key === "live" && <span className="size-2 animate-pulse rounded-full bg-white" />}
                {status.label}
              </span>
              <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-bold ring-1 ring-white/20">
                {event.category}
              </span>
              <span className={cn("rounded-full px-2.5 py-1 text-[11px] font-black", access.tone)}>{access.label}</span>
            </div>

            <h1 className="text-[28px] leading-[1.15] font-black text-balance sm:text-4xl lg:text-[44px]">
              {event.title}
            </h1>
            <p className="max-w-2xl text-sm leading-relaxed text-white/85 sm:text-base">{event.description}</p>

            <div className="flex flex-wrap gap-2 text-xs font-bold sm:text-sm">
              <HeroChip icon={<CalendarBlankIcon weight="fill" />}>{formatLongDate(event.startsAt)}</HeroChip>
              <HeroChip icon={<ClockIcon weight="fill" />}>
                {formatTime(event.startsAt)} · {event.durationMinutes} menit
              </HeroChip>
              <HeroChip icon={<UsersThreeIcon weight="fill" />}>{getSpotsLabel(event)}</HeroChip>
            </div>

            <div className="flex items-center gap-3 rounded-sr-lg bg-white/10 p-3 ring-1 ring-white/20 backdrop-blur sm:w-fit sm:pr-6">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-sr-sun-400 text-lg font-black text-sr-ink">
                {event.tutor
                  .replace(/^Kak\s+/i, "")
                  .charAt(0)
                  .toUpperCase()}
              </span>
              <div className="min-w-0">
                <p className="text-[10px] font-bold tracking-wider text-white/70 uppercase">Pemateri</p>
                <p className="truncate font-black">{event.tutor}</p>
                <p className="truncate text-xs text-white/80">{event.campus}</p>
              </div>
            </div>

            <CountdownTiles event={event} />
            {event.phase === "upcoming" && event.scheduleStatus === "rescheduled" && (
              <p className="w-fit rounded-full bg-sr-sun-400 px-3 py-1 text-xs font-black text-sr-ink">
                Jadwal baru, cek tanggal di atas
              </p>
            )}

            <div className="hidden flex-wrap items-center gap-3 pt-1 sm:flex">
              {ctaHero}
              <Button
                variant="outline"
                className="rounded-full border-white/40 bg-white/10 text-white hover:bg-white/20 hover:text-white"
                onClick={share}
              >
                <ShareNetworkIcon /> Bagikan
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[1fr_20rem] lg:items-start">
        <div className="flex min-w-0 flex-col gap-6">
          <motion.div {...fadeUp}>
            <Benefits event={event} materialCount={materials?.length ?? 0} />
          </motion.div>

          {event.longDescription && (
            <motion.div {...fadeUp}>
              <Section title="Tentang event ini">
                <p className="text-sm leading-relaxed whitespace-pre-line text-sr-ink-2 sm:text-base">
                  {event.longDescription}
                </p>
              </Section>
            </motion.div>
          )}

          {rundown.length > 0 && (
            <motion.div {...fadeUp}>
              <Section title="Rundown acara">
                <ol className="relative ml-2 space-y-5 border-l-2 border-sr-blue-100 pl-6">
                  {rundown.map((item, index) => (
                    <li key={`${item.time}-${index.toString()}`} className="relative">
                      <span className="absolute top-1 -left-[33px] size-3.5 rounded-full border-[3px] border-white bg-sr-blue-500 ring-2 ring-sr-blue-200" />
                      {item.time && (
                        <span className="inline-block rounded-full bg-sr-blue-50 px-2.5 py-0.5 text-xs font-black text-sr-blue-700">
                          {item.time}
                        </span>
                      )}
                      <p className="mt-1 text-sm font-semibold text-sr-ink sm:text-base">{item.text}</p>
                    </li>
                  ))}
                </ol>
              </Section>
            </motion.div>
          )}

          {materials && materials.length > 0 && (
            <motion.div {...fadeUp}>
              <Section title="Materi & Bonus" hint="Terbuka sesuai aturan tiap materi.">
                <div className="grid gap-3 sm:grid-cols-2">
                  {materials.map((material) => (
                    <div
                      key={material.id}
                      className={cn(
                        "flex items-center gap-3 rounded-sr-md border p-3 text-sm font-semibold transition-all",
                        material.locked
                          ? "border-sr-line bg-sr-ivory/60"
                          : "border-sr-blue-100 bg-sr-blue-50/40 hover:-translate-y-0.5 hover:shadow-sr-1",
                      )}
                    >
                      <span
                        className={cn(
                          "flex size-10 shrink-0 items-center justify-center rounded-sr-sm text-lg",
                          material.locked ? "bg-white text-sr-muted" : "bg-sr-blue-500 text-white",
                        )}
                      >
                        {material.locked ? <LockKeyIcon weight="fill" /> : <FileArrowDownIcon weight="fill" />}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sr-ink">{material.label}</span>
                        <span className="block text-xs font-normal text-sr-muted">
                          {material.fileType}
                          {material.locked &&
                            (material.unlockAt === "after_event"
                              ? " · terbuka setelah event selesai"
                              : " · daftar untuk membuka")}
                        </span>
                      </span>
                      {material.fileUrl && (
                        <a
                          href={material.fileUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="shrink-0 rounded-full bg-sr-blue-500 px-3 py-1 text-xs font-bold text-white hover:bg-sr-blue-600"
                        >
                          Buka
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </Section>
            </motion.div>
          )}

          <motion.div {...fadeUp}>
            <Faq event={event} />
          </motion.div>

          {event.phase === "ended" && !isPremium && <UpsellBanner event={event} />}
        </div>

        <motion.aside
          {...fadeUp}
          className="flex flex-col gap-4 lg:sticky lg:top-28"
          aria-label="Ringkasan event"
        >
          <div className="rounded-sr-xl border border-sr-line bg-white p-5 shadow-sr-2">
            <p className="text-xs font-bold tracking-wider text-sr-muted uppercase">Ringkasan</p>
            <dl className="mt-3 space-y-3 text-sm">
              <SummaryRow label="Tanggal" value={formatLongDate(event.startsAt)} />
              <SummaryRow label="Jam" value={`${formatTime(event.startsAt)} (${event.durationMinutes} menit)`} />
              <SummaryRow label="Akses" value={event.accessMode === "premium" ? "Khusus Premium" : access.label === "GRATIS" ? "Gratis untuk semua" : "Sebagian gratis"} />
            </dl>
            {fill !== null && (
              <div className="mt-4">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-sr-ink-2">Kuota</span>
                  <span className={fill >= 0.8 ? "text-destructive" : "text-sr-blue-600"}>{getSpotsLabel(event)}</span>
                </div>
                <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-sr-blue-50">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.max(6, fill * 100)}%` }}
                    transition={{ duration: 0.9, ease: [0.2, 0.7, 0.2, 1], delay: 0.3 }}
                    className={cn(
                      "h-full rounded-full",
                      fill >= 0.8 ? "bg-destructive" : "bg-linear-to-r from-sr-blue-400 to-sr-blue-600",
                    )}
                  />
                </div>
              </div>
            )}
            <div className="mt-5 flex flex-col gap-2">
              {event.registered && event.phase !== "ended" && (
                <Button asChild variant="outline" className="justify-start rounded-full">
                  <a href={getGoogleCalendarUrl(event, window.location.origin)} target="_blank" rel="noreferrer">
                    <CalendarPlusIcon /> Tambah ke kalender
                  </a>
                </Button>
              )}
              {event.registered && event.whatsappGroupUrl && event.phase !== "ended" && (
                <Button asChild variant="outline" className="justify-start rounded-full">
                  <a href={event.whatsappGroupUrl} target="_blank" rel="noreferrer">
                    <WhatsappLogoIcon weight="fill" className="text-emerald-600" /> Gabung grup WA event
                  </a>
                </Button>
              )}
              <Button variant="outline" className="justify-start rounded-full" onClick={share}>
                <ShareNetworkIcon /> Bagikan ke teman
              </Button>
            </div>
          </div>
        </motion.aside>
      </div>

      {/* Tombol daftar menempel di bawah layar pada HP */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-sr-line bg-white/95 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-[0_-8px_24px_-12px_rgb(35_86_232/0.25)] backdrop-blur sm:hidden">
        <div className="mx-auto flex max-w-md items-center gap-2 pr-14">
          <div className="min-w-0 flex-1 [&>*]:w-full">{cta}</div>
          <Button
            variant="outline"
            size="icon"
            className="shrink-0 rounded-full"
            onClick={share}
            aria-label="Bagikan event"
          >
            <ShareNetworkIcon />
          </Button>
        </div>
      </div>

      <RecordingLockedDialog message={watch.locked} onClose={watch.closeLocked} />
      <RegisterDialog event={event} isPremium={isPremium} open={registerOpen} onOpenChange={setDialogOpen} />
    </>
  );
}

function HeroChip({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/12 px-3 py-1.5 ring-1 ring-white/20 backdrop-blur [&>svg]:size-4 [&>svg]:text-sr-sun-400">
      {icon}
      {children}
    </span>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <dt className="text-sr-muted">{label}</dt>
      <dd className="text-right font-bold text-sr-ink">{value}</dd>
    </div>
  );
}

/** Empat alasan ikut, supaya calon peserta langsung paham apa yang didapat. */
function Benefits({ event, materialCount }: { event: PtnEvent; materialCount: number }) {
  const items = [
    {
      icon: <VideoCameraIcon weight="fill" />,
      title: "Live interaktif di Zoom",
      text: "Tanya langsung ke mentor, jawabannya hari itu juga.",
      tone: "bg-emerald-50 text-emerald-600",
    },
    {
      icon: <PlayCircleIcon weight="fill" />,
      title: "Rekaman bisa ditonton ulang",
      text: event.recordingFreeDays > 0 ? `Akun gratis bisa menonton ${event.recordingFreeDays} hari.` : "Tonton ulang selama event tayang.",
      tone: "bg-sr-blue-50 text-sr-blue-600",
    },
    {
      icon: <GiftIcon weight="fill" />,
      title: "Materi & bonus",
      text: materialCount > 0 ? `${materialCount} materi siap diunduh.` : "Materi pendukung dari mentor.",
      tone: "bg-sr-sun-100 text-sr-amber-700",
    },
    {
      icon: <WhatsappLogoIcon weight="fill" />,
      title: "Grup WhatsApp event",
      text: "Info Zoom dan pengingat langsung ke HP kamu.",
      tone: "bg-emerald-50 text-emerald-600",
    },
  ];
  return (
    <section className="rounded-sr-xl border border-sr-line bg-white p-5 shadow-sr-1 sm:p-7">
      <h2 className="text-lg font-black text-sr-ink sm:text-xl">Yang kamu dapatkan</h2>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {items.map((item) => (
          <div
            key={item.title}
            className="flex items-start gap-3 rounded-sr-md border border-sr-line bg-sr-ivory/40 p-3.5 transition-all hover:-translate-y-0.5 hover:border-sr-blue-200 hover:bg-white hover:shadow-sr-1"
          >
            <span className={cn("flex size-10 shrink-0 items-center justify-center rounded-sr-sm text-xl", item.tone)}>
              {item.icon}
            </span>
            <div className="min-w-0">
              <p className="text-sm font-black text-sr-ink">{item.title}</p>
              <p className="mt-0.5 text-xs leading-relaxed text-sr-muted">{item.text}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function Faq({ event }: { event: PtnEvent }) {
  const items = [
    {
      q: "Kapan tombol Join Zoom aktif?",
      a: "15 menit sebelum acara dimulai, langsung di halaman ini. Kamu juga akan dapat email pengingat 1 hari dan 1 jam sebelumnya.",
    },
    {
      q: "Apa syarat daftar gratis?",
      a: "Follow akun Habitutor dan bagikan poster ke 5 grup, lalu unggah screenshotnya. Kalau tidak sempat, kamu bisa daftar dengan membayar Rp10.000. Member Premium tidak perlu syarat apa pun.",
    },
    {
      q: "Apakah ada rekamannya?",
      a:
        event.accessMode === "mixed"
          ? "Ada. Rekaman event ini khusus member Premium."
          : event.recordingFreeDays > 0
            ? `Ada. Peserta terdaftar bisa menonton ulang sampai ${event.recordingFreeDays} hari setelah acara, member Premium tanpa batas.`
            : "Ada, selama event masih tayang. Member Premium bisa menonton tanpa batas waktu.",
    },
    {
      q: "Bagaimana kalau aku berhalangan hadir?",
      a: "Tidak masalah. Tetap daftar supaya dapat akses rekaman dan materinya setelah acara.",
    },
  ];
  return (
    <Section title="Pertanyaan yang sering muncul">
      <div className="divide-y divide-sr-line">
        {items.map((item) => (
          <details key={item.q} className="group py-3 first:pt-0 last:pb-0">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-bold text-sr-ink marker:hidden sm:text-base [&::-webkit-details-marker]:hidden">
              {item.q}
              <CaretDownIcon weight="bold" className="size-4 shrink-0 text-sr-muted transition-transform duration-300 group-open:rotate-180" />
            </summary>
            <p className="mt-2 text-sm leading-relaxed text-sr-muted">{item.a}</p>
          </details>
        ))}
      </div>
    </Section>
  );
}

function Section({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-sr-xl border border-sr-line bg-white p-5 shadow-sr-1 sm:p-7">
      <div className="mb-4 flex items-center gap-3">
        <span className="h-6 w-1.5 rounded-full bg-sr-sun-500" />
        <div>
          <h2 className="text-lg font-black text-sr-ink sm:text-xl">{title}</h2>
          {hint && <p className="text-xs text-sr-muted">{hint}</p>}
        </div>
      </div>
      {children}
    </section>
  );
}

function PrimaryAction({
  event,
  isPremium,
  loggedIn,
  canJoin,
  canWatchNow,
  joining,
  watching,
  onJoin,
  onWatch,
  onRegister,
  onDark = false,
}: {
  event: PtnEvent;
  isPremium: boolean;
  loggedIn: boolean;
  canJoin: boolean;
  canWatchNow: boolean;
  joining: boolean;
  watching: boolean;
  onJoin: () => void;
  onWatch: () => void;
  onRegister: () => void;
  onDark?: boolean;
}) {
  const status = getEventStatus(event, isPremium);
  // Di atas hero biru, tombol utama memakai gradien matahari dan tombol nonaktif dibuat transparan putih.
  const primary = onDark ? "border-transparent text-sr-ink shadow-sr-sun [background:var(--sr-grad-sun)] hover:brightness-105" : "";
  const quiet = onDark ? "border-white/40 bg-white/15 text-white hover:bg-white/20 disabled:opacity-100" : "";
  if (canJoin) {
    return (
      <Button size="lg" className="bg-sr-live text-white hover:bg-sr-live/90" disabled={joining} onClick={onJoin}>
        <VideoCameraIcon weight="fill" /> {joining ? "Membuka Zoom…" : "Join Zoom"}
      </Button>
    );
  }
  if (event.phase === "ended") {
    if (!event.hasRecording) {
      return (
        <Button size="lg" variant="outline" className={quiet} disabled>
          Event selesai
        </Button>
      );
    }
    if (canWatchNow) {
      return (
        <Button size="lg" className={primary} disabled={watching} onClick={onWatch}>
          <PlayCircleIcon weight="fill" /> {watching ? "Membuka…" : "Tonton Rekaman"}
        </Button>
      );
    }
  }
  if (event.registered) {
    return (
      <Button size="lg" variant="outline" className={quiet} disabled>
        <CheckCircleIcon weight="fill" className={onDark ? "text-emerald-300" : "text-sr-live"} /> Sudah Terdaftar
      </Button>
    );
  }
  if (status.key === "cancelled") {
    return (
      <Button size="lg" className={quiet} disabled>
        Event Dibatalkan
      </Button>
    );
  }
  if (status.key === "full") {
    return (
      <Button size="lg" className={quiet} disabled>
        Kuota Penuh
      </Button>
    );
  }
  if (isPremiumLocked(event, isPremium)) {
    return (
      <Button size="lg" className={primary} asChild>
        <Link to="/premium">Khusus Premium · Lihat Paket</Link>
      </Button>
    );
  }
  const label = event.phase === "ended" ? "Daftar untuk Tonton Rekaman" : "Daftar Gratis";
  if (!loggedIn) {
    return (
      <Button size="lg" className={primary} asChild>
        <Link to="/login" search={{ redirect: `/ptntour/${event.slug}?daftar=true` }}>
          {label}
        </Link>
      </Button>
    );
  }
  return (
    <Button size="lg" className={primary} onClick={onRegister}>
      {label}
    </Button>
  );
}

function UpsellBanner({ event }: { event: PtnEvent }) {
  const { data: settings } = usePtnTourSettings();
  const days = event.recordingFreeDays;
  return (
    <section className="relative overflow-hidden rounded-sr-xl sr-card-blue p-5 text-white shadow-sr-2 sm:p-7">
      <div className="pointer-events-none absolute -top-16 -right-10 size-48 rounded-full bg-white/10" />
      <div className="relative flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <CrownIcon weight="fill" className="mt-1 size-6 shrink-0 text-sr-sun-400" />
          <div>
            <h2 className="font-black">{settings?.promo_title ?? "Mau tonton rekaman tanpa batas waktu?"}</h2>
            <p className="mt-1 text-sm text-white/85">
              {event.accessMode === "mixed"
                ? "Rekaman event ini khusus member Premium."
                : days > 0
                  ? `Akun gratis bisa menonton ${days} hari setelah event.`
                  : "Akun gratis bisa menonton selama event masih tayang."}{" "}
              {settings?.promo_text}
            </p>
          </div>
        </div>
        <Button
          asChild
          className="shrink-0 border-transparent text-sr-ink shadow-sr-sun [background:var(--sr-grad-sun)]"
        >
          <Link to={(settings?.promo_cta_url ?? "/premium") as "/premium"}>
            {settings?.promo_cta_label ?? "Lihat Paket Premium"}
          </Link>
        </Button>
      </div>
    </section>
  );
}

function DetailSkeleton() {
  return (
    <div className="flex flex-col gap-6">
      <div className="h-[34rem] animate-pulse rounded-sr-xl bg-sr-blue-100/60 lg:h-[30rem]" />
      <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
        <div className="space-y-4">
          <div className="h-44 animate-pulse rounded-sr-xl bg-sr-blue-50" />
          <div className="h-56 animate-pulse rounded-sr-xl bg-sr-blue-50" />
        </div>
        <div className="h-64 animate-pulse rounded-sr-xl bg-sr-blue-50" />
      </div>
    </div>
  );
}
