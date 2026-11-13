import {
  ArrowLeftIcon,
  CalendarBlankIcon,
  CheckCircleIcon,
  ClockIcon,
  FileArrowDownIcon,
  LockKeyIcon,
  SparkleIcon,
} from "@phosphor-icons/react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PTN_TOUR_EVENTS } from "./data";
import { orpc } from "@/utils/orpc";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";

export const Route = createFileRoute("/ptntour/$slug")({
  head: ({ params }) => {
    const event = PTN_TOUR_EVENTS.find((item) => item.slug === params.slug);
    return {
      meta: [
        { title: event ? `${event.title} | Habitutor` : "Event PTN Tour | Habitutor" },
        { name: "description", content: event?.description ?? "Event gratis Habitutor." },
      ],
    };
  },
  component: EventDetailPage,
});

function EventDetailPage() {
  const { slug } = Route.useParams();
  const queryClient = useQueryClient();
  const { data: session } = authClient.useSession();
  const { data: profile } = useQuery({ ...orpc.profile.me.queryOptions(), enabled: Boolean(session?.user) });
  const [registrationOpen, setRegistrationOpen] = useState(false);
  const [schoolName, setSchoolName] = useState("");
  const [classLevel, setClassLevel] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [dreamCampus, setDreamCampus] = useState("");
  const [educationLevel, setEducationLevel] = useState("");
  const [consented, setConsented] = useState(false);
  const { data: apiEvent, isPending } = useQuery(orpc.ptnTour.detail.queryOptions({ input: { slug } }));
  const { data: myEvents } = useQuery({ ...orpc.ptnTour.me.queryOptions(), enabled: Boolean(session?.user) });
  const fallback = PTN_TOUR_EVENTS.find((item) => item.slug === slug);
  const event = apiEvent
    ? {
        ...apiEvent,
        date: new Date(apiEvent.startsAt).toLocaleDateString("id-ID", {
          day: "numeric",
          month: "short",
          year: "numeric",
        }),
        time: new Date(apiEvent.startsAt).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) + " WIB",
        poster: apiEvent.posterUrl,
        bonus: [],
        whatsappGroupUrl: apiEvent.whatsappGroupUrl,
        zoomUrl: apiEvent.zoomUrl,
        recordingUrl: apiEvent.recordingUrl,
      }
    : fallback;
  const isRegistered = Boolean(event && (event.registered || myEvents?.some((item) => item.slug === event.slug)));
  const { data: materials } = useQuery({
    ...orpc.ptnTour.materials.queryOptions({ input: { slug } }),
    enabled: Boolean(session?.user) && isRegistered,
  });
  const registerMutation = useMutation(
    orpc.ptnTour.register.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries({ queryKey: orpc.ptnTour.list.queryKey() });
        await queryClient.invalidateQueries({ queryKey: orpc.ptnTour.me.queryKey() });
        await queryClient.invalidateQueries({ queryKey: orpc.ptnTour.detail.queryKey({ input: { slug } }) });
        setRegistrationOpen(false);
        window.location.href = `/ptntour/${slug}/success`;
      },
      onError: (error) => toast.error("Pendaftaran gagal", { description: error.message }),
    }),
  );
  const joinMutation = useMutation(
    orpc.ptnTour.join.mutationOptions({
      onSuccess: ({ zoomUrl }) => window.open(zoomUrl, "_blank", "noopener,noreferrer"),
      onError: (error) => toast.error("Belum bisa join Zoom", { description: error.message }),
    }),
  );
  const [watching, setWatching] = useState(false);
  const watchRecording = async () => {
    setWatching(true);
    try {
      const { recordingUrl } = await queryClient.fetchQuery(orpc.ptnTour.watch.queryOptions({ input: { slug } }));
      window.open(recordingUrl, "_blank", "noopener,noreferrer");
    } catch (error) {
      toast.error("Rekaman belum bisa diputar", {
        description: error instanceof Error ? error.message : "Coba lagi nanti.",
      });
    } finally {
      setWatching(false);
    }
  };
  if (isPending && !event)
    return (
      <Container className="py-16">
        <p className="text-sm text-sr-muted">Memuat detail event...</p>
      </Container>
    );
  if (!event)
    return (
      <Container className="py-16">
        <h1 className="text-2xl font-black">Event tidak ditemukan</h1>
        <Link to="/ptntour">
          <Button className="mt-4">Kembali ke PTN Tour</Button>
        </Link>
      </Container>
    );
  return (
    <Container className="flex flex-col gap-8 py-10 pb-20 sm:py-14">
      <Link to="/ptntour" className="flex items-center gap-2 text-sm font-bold text-sr-blue-500">
        <ArrowLeftIcon />
        Semua event
      </Link>
      <div className="grid gap-8 lg:grid-cols-[minmax(0,420px)_1fr]">
        <img
          src={event.poster}
          alt={`Poster ${event.title}`}
          className="aspect-4/5 w-full rounded-sr-xl object-cover shadow-sr-2"
        />
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge className="bg-sr-yellow-300 text-sr-ink">{event.category}</Badge>
            <Badge variant="outline">{event.status}</Badge>
          </div>
          <h1 className="mt-4 text-3xl font-black text-sr-ink sm:text-5xl">{event.title}</h1>
          <p className="mt-4 text-lg leading-relaxed text-sr-muted">{event.description}</p>
          <p className="mt-6 font-bold text-sr-ink">
            {event.tutor} · {event.campus}
          </p>
          <div className="mt-5 flex flex-wrap gap-3 text-sm text-sr-muted">
            <span className="flex items-center gap-2">
              <CalendarBlankIcon className="text-sr-blue-500" />
              {event.date}
            </span>
            <span className="flex items-center gap-2">
              <ClockIcon className="text-sr-blue-500" />
              {event.time}
            </span>
          </div>
          <div className="mt-6 grid gap-2 sm:grid-cols-2">
            <div className="rounded-sr-md bg-sr-blue-50 p-3">
              <p className="text-xs text-sr-muted">Tutor</p>
              <p className="mt-1 font-bold text-sr-ink">{event.tutor}</p>
            </div>
            <div className="rounded-sr-md bg-sr-sun-100 p-3">
              <p className="text-xs text-sr-muted">Yang kamu dapat</p>
              <p className="mt-1 font-bold text-sr-ink">{event.bonus.length} bonus materi</p>
            </div>
          </div>
          {event.status === "Selesai" ? (
            <Button className="mt-8 w-full sm:w-auto" disabled={watching} onClick={watchRecording}>
              {watching ? "Membuka rekaman..." : "Tonton Rekaman"}
            </Button>
          ) : isRegistered ? (
            event.id && event.zoomUrl ? (
              <Button
                className="mt-8 w-full sm:w-auto"
                disabled={joinMutation.isPending}
                onClick={() => joinMutation.mutate({ eventId: event.id as number })}
              >
                {joinMutation.isPending ? "Membuka Zoom..." : "Join Zoom"}
              </Button>
            ) : (
              <Button className="mt-8 w-full sm:w-auto" variant="outline" disabled>
                ✓ Sudah Terdaftar
              </Button>
            )
          ) : session?.user && event.id ? (
            <Button
              className="mt-8 w-full sm:w-auto"
              onClick={() => {
                setPhoneNumber(profile?.phoneNumber ?? "");
                setDreamCampus(profile?.dreamCampus ?? "");
                setEducationLevel(profile?.educationLevel ?? "");
                setRegistrationOpen(true);
              }}
            >
              Daftar Gratis
            </Button>
          ) : (
            <Button className="mt-8 w-full sm:w-auto" asChild>
              <Link to="/login" search={{ redirect: `/ptntour/${event.slug}` }}>
                Daftar Gratis
              </Link>
            </Button>
          )}
        </div>
      </div>
      <section className="rounded-sr-xl border border-sr-line bg-white p-5 shadow-sr-1 sm:p-7">
        <div className="flex items-start gap-3">
          <div className="rounded-full bg-sr-sun-100 p-2 text-sr-amber-700">
            <SparkleIcon />
          </div>
          <div>
            <h2 className="text-xl font-black text-sr-ink">Materi & Bonus</h2>
            <p className="mt-1 text-sm text-sr-muted">Bonus yang kamu dapatkan setelah mendaftar event ini.</p>
          </div>
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {(
            materials ??
            event.bonus.map((label, index) => ({ id: `fallback-${index}`, label, fileUrl: "", fileType: "PDF" }))
          ).map((bonus) => (
            <div
              key={bonus.id}
              className="flex items-center gap-3 rounded-sr-md border border-sr-line p-3 text-sm font-semibold"
            >
              {bonus.fileUrl ? (
                <FileArrowDownIcon className="text-sr-blue-500" />
              ) : (
                <LockKeyIcon className="text-sr-muted" />
              )}
              <span>
                {bonus.label}
                <span className="block text-xs font-normal text-sr-muted">{bonus.fileType}</span>
              </span>
              {bonus.fileUrl ? (
                <a
                  href={bonus.fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="ml-auto text-xs font-bold text-sr-blue-500"
                >
                  Buka
                </a>
              ) : (
                <span className="ml-auto text-xs font-bold text-sr-muted">Daftar untuk buka</span>
              )}
            </div>
          ))}
        </div>
      </section>
      {event.status === "Selesai" && !session?.user?.isPremium && (
        <section className="rounded-sr-xl bg-sr-blue-50 p-5 sm:p-6">
          <h2 className="font-black text-sr-ink">Mau akses rekaman lebih lama?</h2>
          <p className="mt-1 text-sm text-sr-muted">
            Akun gratis bisa menonton selama 30 hari. Premium memberikan akses rekaman selamanya.
          </p>
          <Button asChild className="mt-4">
            <Link to="/premium">Lihat Paket Premium</Link>
          </Button>
        </section>
      )}
      <Dialog open={registrationOpen} onOpenChange={setRegistrationOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Daftar event</DialogTitle>
            <DialogDescription>Lengkapi data singkat ini sebelum mengikuti event.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 py-2">
            <div className="grid gap-1.5">
              <Label htmlFor="event-phone">Nomor WhatsApp</Label>
              <Input
                id="event-phone"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="08xxxxxxxxxx"
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="event-school">Asal sekolah</Label>
              <Input
                id="event-school"
                value={schoolName}
                onChange={(e) => setSchoolName(e.target.value)}
                placeholder="Nama sekolah"
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="event-class">Kelas</Label>
              <Input
                id="event-class"
                value={classLevel}
                onChange={(e) => setClassLevel(e.target.value)}
                placeholder="Contoh: 12 SMA"
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="event-campus">Target PTN</Label>
              <Input
                id="event-campus"
                value={dreamCampus}
                onChange={(e) => setDreamCampus(e.target.value)}
                placeholder="Contoh: UI"
              />
            </div>
            <label className="flex items-start gap-2 text-sm text-sr-muted">
              <input
                type="checkbox"
                checked={consented}
                onChange={(e) => setConsented(e.target.checked)}
                className="mt-1"
              />
              Saya menyetujui penggunaan data untuk pendaftaran dan informasi event Habitutor.
            </label>
          </div>
          <DialogFooter>
            <Button
              className="w-full"
              disabled={
                !consented || !phoneNumber || !schoolName || !classLevel || !dreamCampus || registerMutation.isPending
              }
              onClick={() =>
                registerMutation.mutate({
                  eventId: event.id as number,
                  schoolName,
                  classLevel,
                  phoneNumber,
                  dreamCampus,
                  educationLevel: educationLevel || "SMA",
                })
              }
            >
              {registerMutation.isPending ? "Mendaftarkan..." : "Konfirmasi Pendaftaran"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Container>
  );
}
