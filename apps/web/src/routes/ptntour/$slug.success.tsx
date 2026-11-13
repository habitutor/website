import { CalendarPlusIcon, CheckCircleIcon, CrownIcon, WhatsappLogoIcon } from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Link, Navigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { COMMUNITY_LINKS } from "@/lib/community-links";
import { orpc } from "@/utils/orpc";
import { formatLongDate, formatTime, getGoogleCalendarUrl } from "./-lib";

export const Route = createFileRoute("/ptntour/$slug/success")({ component: RegistrationSuccessPage });

function RegistrationSuccessPage() {
  const { slug } = Route.useParams();
  const { data: session, isPending: sessionPending } = authClient.useSession();
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
      <div className="rounded-sr-xl border border-sr-line bg-white p-6 text-center shadow-sr-2 sm:p-8">
        <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-sr-live/10 text-sr-live">
          <CheckCircleIcon weight="fill" className="size-9" />
        </div>
        <h1 className="mt-5 text-2xl font-black text-sr-ink sm:text-3xl">Kamu udah terdaftar!</h1>
        <p className="mt-2 text-sm leading-relaxed text-sr-muted">
          {event.title} · {formatLongDate(event.startsAt)}, {formatTime(event.startsAt)}.
          <br />
          Tombol Join Zoom aktif 15 menit sebelum acara dimulai.
        </p>

        <div className="mt-6 grid gap-3 text-left">
          {event.whatsappGroupUrl && (
            <Button asChild className="h-auto justify-start gap-3 rounded-sr-md px-4 py-3">
              <a href={event.whatsappGroupUrl} target="_blank" rel="noreferrer">
                <WhatsappLogoIcon weight="fill" className="size-5" />
                <span>
                  Join Grup WA Event
                  <span className="block text-xs font-normal opacity-80">Info Zoom dan reminder ada di sini</span>
                </span>
              </a>
            </Button>
          )}
          <Button asChild variant="outline" className="h-auto justify-start gap-3 rounded-sr-md px-4 py-3">
            <a href={COMMUNITY_LINKS.whatsappChannel} target="_blank" rel="noreferrer">
              <WhatsappLogoIcon weight="fill" className="size-5 text-emerald-600" />
              <span>
                Follow WhatsApp Channel Habitutor
                <span className="block text-xs font-normal text-sr-muted">Biar nggak ketinggalan event berikutnya</span>
              </span>
            </a>
          </Button>
          <Button asChild variant="outline" className="h-auto justify-start gap-3 rounded-sr-md px-4 py-3">
            <a href={calendarUrl} target="_blank" rel="noreferrer">
              <CalendarPlusIcon className="size-5" />
              <span>
                Add to Calendar
                <span className="block text-xs font-normal text-sr-muted">Pengingat langsung di Google Calendar</span>
              </span>
            </a>
          </Button>
        </div>

        <div className="mt-6 flex flex-col items-center gap-2 text-sm">
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
        <div className="relative overflow-hidden rounded-sr-xl sr-card-blue p-5 text-white shadow-sr-2">
          <div className="pointer-events-none absolute -top-12 -right-8 size-40 rounded-full bg-white/10" />
          <div className="relative flex items-start gap-3">
            <CrownIcon weight="fill" className="mt-0.5 size-6 shrink-0 text-sr-sun-400" />
            <div>
              <p className="font-black">Siap lanjut belajar lebih serius?</p>
              <p className="mt-1 text-sm text-white/85">
                Premium membuka live class, semua rekaman event, dan bank soal lengkap untuk SNBT.
              </p>
              <Button
                asChild
                size="sm"
                className="mt-3 border-transparent text-sr-ink shadow-sr-sun [background:var(--sr-grad-sun)]"
              >
                <Link to="/premium">Lihat Paket Premium</Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
