import {
  ArrowLeftIcon,
  CalendarBlankIcon,
  CheckCircleIcon,
  ClockIcon,
  CrownIcon,
  FileArrowDownIcon,
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
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { orpc } from "@/utils/orpc";
import { RecordingLockedDialog } from "./-components/recording-locked-dialog";
import { RegisterDialog } from "./-components/register-dialog";
import { useJoinEvent, usePtnTourSettings, useWatchRecording } from "./-hooks";
import {
  formatLongDate,
  formatTime,
  getAccessBadge,
  getEventStatus,
  getSpotsLabel,
  isPremiumLocked,
  parseRundown,
  type PtnEvent,
  useCountdown,
} from "./-lib";

export const Route = createFileRoute("/ptntour/$slug/")({
  validateSearch: type({ "daftar?": "boolean" }),
  component: EventDetailPage,
});

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
      <div className="rounded-sr-xl border border-sr-line bg-white p-8 text-center shadow-sr-1">
        <h1 className="text-2xl font-black text-sr-ink">Event tidak ditemukan</h1>
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

  const cta = (
    <PrimaryAction
      event={event}
      isPremium={isPremium}
      loggedIn={Boolean(session?.user)}
      canJoin={canJoin}
      canWatchNow={canWatchNow}
      joining={join.isPending}
      watching={watch.isPending}
      onJoin={() => join.mutate({ eventId: event.id })}
      onWatch={() => watch.mutate(event.slug)}
      onRegister={() => setDialogOpen(true)}
    />
  );

  return (
    <>
      <Link
        to="/ptntour"
        className="inline-flex w-fit items-center gap-2 text-sm font-bold text-sr-blue-600 hover:text-sr-blue-700"
      >
        <ArrowLeftIcon weight="bold" /> Semua event
      </Link>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,26rem)_1fr] lg:gap-10">
        <div className="mx-auto w-full max-w-[22rem] lg:max-w-none">
          <img
            src={event.posterUrl}
            alt={`Poster ${event.title}`}
            className="aspect-4/5 w-full rounded-sr-xl object-cover shadow-sr-2"
          />
        </div>

        <div className="flex min-w-0 flex-col gap-5">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold",
                  status.tone === "bg-white/95 text-sr-ink" ? "bg-sr-blue-50 text-sr-blue-700" : status.tone,
                )}
              >
                {status.key === "live" && <span className="size-2 animate-pulse rounded-full bg-white" />}
                {status.label}
              </span>
              <span className="rounded-full bg-sr-sun-100 px-3 py-1 text-xs font-bold text-sr-amber-700">
                {event.category}
              </span>
              <span className={cn("rounded-full px-2.5 py-1 text-[11px] font-black", getAccessBadge(event).tone)}>
                {getAccessBadge(event).label}
              </span>
            </div>
            <h1 className="mt-3 text-3xl leading-tight font-black text-sr-ink sm:text-4xl">{event.title}</h1>
            <p className="mt-3 text-base leading-relaxed text-sr-muted">{event.description}</p>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center sm:gap-3">
            <InfoBox
              icon={<CalendarBlankIcon weight="fill" />}
              label="Tanggal"
              value={formatLongDate(event.startsAt)}
            />
            <InfoBox icon={<ClockIcon weight="fill" />} label="Jam" value={formatTime(event.startsAt)} />
            <InfoBox icon={<UsersThreeIcon weight="fill" />} label="Peserta" value={getSpotsLabel(event)} />
          </div>

          <div className="flex items-center gap-3 rounded-sr-lg border border-sr-line bg-white p-4 shadow-sr-1">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-sr-blue-50 text-lg font-black text-sr-blue-700">
              {event.tutor
                .replace(/^Kak\s+/i, "")
                .charAt(0)
                .toUpperCase()}
            </span>
            <div className="min-w-0">
              <p className="text-xs font-bold text-sr-muted uppercase">Pemateri</p>
              <p className="truncate font-black text-sr-ink">{event.tutor}</p>
              <p className="truncate text-sm text-sr-muted">{event.campus}</p>
            </div>
          </div>

          <Countdown event={event} />

          <div className="hidden flex-wrap items-center gap-3 sm:flex">
            {cta}
            <Button variant="outline" className="rounded-full" onClick={share}>
              <ShareNetworkIcon /> Bagikan
            </Button>
          </div>
          {event.registered && event.whatsappGroupUrl && event.phase !== "ended" && (
            <Button asChild variant="outline" className="w-fit">
              <a href={event.whatsappGroupUrl} target="_blank" rel="noreferrer">
                <WhatsappLogoIcon weight="fill" className="text-emerald-600" /> Gabung grup WA event
              </a>
            </Button>
          )}
        </div>
      </div>

      {event.longDescription && (
        <Section title="Tentang event ini">
          <p className="text-sm leading-relaxed whitespace-pre-line text-sr-ink-2 sm:text-base">
            {event.longDescription}
          </p>
        </Section>
      )}

      {rundown.length > 0 && (
        <Section title="Rundown acara">
          <ol className="space-y-3">
            {rundown.map((item, index) => (
              <li key={`${item.time}-${index.toString()}`} className="flex gap-3">
                <span className="mt-0.5 w-16 shrink-0 rounded-full bg-sr-blue-50 px-2 py-1 text-center text-xs font-bold text-sr-blue-700">
                  {item.time || "•"}
                </span>
                <span className="text-sm text-sr-ink-2 sm:text-base">{item.text}</span>
              </li>
            ))}
          </ol>
        </Section>
      )}

      {materials && materials.length > 0 && (
        <Section title="Materi & Bonus" hint="Terbuka setelah kamu mendaftar.">
          <div className="grid gap-3 sm:grid-cols-2">
            {materials.map((material) => (
              <div
                key={material.id}
                className="flex items-center gap-3 rounded-sr-md border border-sr-line bg-white p-3 text-sm font-semibold"
              >
                <span
                  className={cn(
                    "flex size-9 shrink-0 items-center justify-center rounded-sr-sm",
                    material.locked ? "bg-sr-ivory text-sr-muted" : "bg-sr-blue-50 text-sr-blue-600",
                  )}
                >
                  {material.locked ? <LockKeyIcon weight="fill" /> : <FileArrowDownIcon weight="fill" />}
                </span>
                <span className="min-w-0">
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
                    className="ml-auto shrink-0 text-xs font-bold text-sr-blue-600 hover:underline"
                  >
                    Buka
                  </a>
                )}
              </div>
            ))}
          </div>
        </Section>
      )}

      {event.phase === "ended" && !isPremium && <UpsellBanner event={event} />}

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
}) {
  const status = getEventStatus(event, isPremium);
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
        <Button size="lg" variant="outline" disabled>
          Event selesai
        </Button>
      );
    }
    if (canWatchNow) {
      return (
        <Button size="lg" disabled={watching} onClick={onWatch}>
          <PlayCircleIcon weight="fill" /> {watching ? "Membuka…" : "Tonton Rekaman"}
        </Button>
      );
    }
  }
  if (event.registered) {
    return (
      <Button size="lg" variant="outline" disabled>
        <CheckCircleIcon weight="fill" className="text-sr-live" /> Sudah Terdaftar
      </Button>
    );
  }
  if (status.key === "full") {
    return (
      <Button size="lg" disabled>
        Kuota Penuh
      </Button>
    );
  }
  if (isPremiumLocked(event, isPremium)) {
    return (
      <Button size="lg" asChild>
        <Link to="/premium">Khusus Premium · Lihat Paket</Link>
      </Button>
    );
  }
  const label = event.phase === "ended" ? "Daftar untuk Tonton Rekaman" : "Daftar Gratis";
  if (!loggedIn) {
    return (
      <Button size="lg" asChild>
        <Link to="/login" search={{ redirect: `/ptntour/${event.slug}?daftar=true` }}>
          {label}
        </Link>
      </Button>
    );
  }
  return (
    <Button size="lg" onClick={onRegister}>
      {label}
    </Button>
  );
}

function Countdown({ event }: { event: PtnEvent }) {
  const label = useCountdown(event.startsAt, event.phase === "upcoming");
  if (event.phase !== "upcoming" || !label) return null;
  return (
    <p className="inline-flex w-fit items-center gap-2 rounded-full bg-sr-sun-100 px-4 py-2 text-sm font-bold text-sr-amber-700">
      <ClockIcon weight="fill" /> Mulai {label}
    </p>
  );
}

function InfoBox({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-sr-md border border-sr-line bg-white p-2.5 shadow-sr-1 sm:p-3">
      <span className="text-sr-blue-500 [&>svg]:mx-auto [&>svg]:size-5">{icon}</span>
      <p className="mt-1 text-[11px] text-sr-muted">{label}</p>
      <p className="text-xs leading-tight font-bold text-sr-ink sm:text-sm">{value}</p>
    </div>
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
    <div className="grid gap-6 lg:grid-cols-[minmax(0,26rem)_1fr]">
      <div className="mx-auto aspect-4/5 w-full max-w-[22rem] animate-pulse rounded-sr-xl bg-sr-blue-50 lg:max-w-none" />
      <div className="space-y-4">
        <div className="h-6 w-40 animate-pulse rounded-full bg-sr-blue-50" />
        <div className="h-10 w-4/5 animate-pulse rounded-full bg-sr-blue-50" />
        <div className="h-20 w-full animate-pulse rounded-sr-md bg-sr-blue-50" />
      </div>
    </div>
  );
}
