import { CalendarPlusIcon, CheckCircleIcon, WhatsappLogoIcon } from "@phosphor-icons/react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { COMMUNITY_LINKS } from "@/lib/community-links";
import { PTN_TOUR_EVENTS } from "./data";

export const Route = createFileRoute("/ptntour/$slug/success")({ component: RegistrationSuccessPage });

function RegistrationSuccessPage() {
  const { slug } = Route.useParams();
  const event = PTN_TOUR_EVENTS.find((item) => item.slug === slug);
  const calendarUrl = event
    ? `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${event.date.replaceAll(" ", "")}/${event.date.replaceAll(" ", "")}&details=${encodeURIComponent(event.description)}&location=Online`
    : null;

  return (
    <Container className="flex min-h-[70vh] items-center justify-center py-12">
      <div className="w-full max-w-lg rounded-sr-xl border border-sr-line bg-white p-6 text-center shadow-sr-2 sm:p-8">
        <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
          <CheckCircleIcon weight="fill" className="size-9" />
        </div>
        <h1 className="mt-5 text-2xl font-black text-sr-ink sm:text-3xl">Kamu udah terdaftar!</h1>
        <p className="mt-2 text-sm leading-relaxed text-sr-muted">
          Simpan halaman ini. Gabung grup event untuk menerima info Zoom dan reminder.
        </p>
        <div className="mt-7 grid gap-3 text-left">
          {event?.whatsappGroupUrl && (
            <Button asChild className="h-auto justify-start gap-3 rounded-sr-md px-4 py-3">
              <a href={event.whatsappGroupUrl} target="_blank" rel="noreferrer">
                <WhatsappLogoIcon className="size-5" />
                Join Grup WA Event
              </a>
            </Button>
          )}
          <Button asChild variant="outline" className="h-auto justify-start gap-3 rounded-sr-md px-4 py-3">
            <a href={COMMUNITY_LINKS.whatsappChannel} target="_blank" rel="noreferrer">
              <WhatsappLogoIcon className="size-5 text-emerald-600" />
              Follow WhatsApp Channel Habitutor
            </a>
          </Button>
          {calendarUrl && (
            <Button asChild variant="outline" className="h-auto justify-start gap-3 rounded-sr-md px-4 py-3">
              <a href={calendarUrl} target="_blank" rel="noreferrer">
                <CalendarPlusIcon className="size-5" />
                Add to Calendar
              </a>
            </Button>
          )}
        </div>
        <Link to="/ptntour" className="mt-6 inline-block text-sm font-bold text-sr-blue-600">
          Kembali ke daftar event
        </Link>
      </div>
    </Container>
  );
}
