import { ArrowLeftIcon, ArrowRightIcon } from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { LiveClassCard } from "@/components/classes/practice";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { orpc } from "@/utils/orpc";
import { SectionCard } from "./section-card";

function useNow(intervalMs: number) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), intervalMs);
    return () => window.clearInterval(id);
  }, [intervalMs]);
  return now;
}

// Bentuknya sama dengan tombol "Pilih kelas" di Kelas terakhirmu.
function ScheduleLink({ className }: { className?: string }) {
  return (
    <Button className={cn("shrink-0 rounded-full", className)} asChild>
      <Link to="/live-class">
        Lihat jadwal <ArrowRightIcon weight="bold" />
      </Link>
    </Button>
  );
}

export const LiveClass = () => {
  // Disegarkan berkala supaya link Gabung muncul tepat waktu dan kelas yang selesai hilang sendiri.
  const { data: dashboardContent } = useQuery({
    ...orpc.dashboard.content.queryOptions(),
    refetchInterval: 60_000,
  });
  const items = dashboardContent?.liveClasses ?? [];
  const now = useNow(30_000);
  const [current, setCurrent] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const hasItems = items.length > 0;

  // Area carousel baru ada setelah data kelas dimuat, jadi ukur ulang saat daftar kelas muncul.
  useEffect(() => {
    if (!hasItems || !containerRef.current) return;

    const update = () => {
      setContainerWidth(containerRef.current?.offsetWidth ?? 0);
    };

    update();

    const observer = new ResizeObserver(update);
    observer.observe(containerRef.current);

    return () => observer.disconnect();
  }, [hasItems]);

  const getVisible = () => {
    if (containerWidth < 640) return 1;
    if (containerWidth < 1024) return 2;
    return 3;
  };

  const visible = getVisible();
  const gap = 12;
  // Di HP satu kartu selebar area carousel; di tablet/desktop bagi rata lebar kontainer supaya tidak ada ruang kosong di kanan.
  const cardWidth =
    containerWidth > 0
      ? containerWidth < 640
        ? containerWidth
        : Math.floor((containerWidth - (visible - 1) * gap) / visible)
      : 304;
  const maxIndex = Math.max(0, items.length - visible);

  const next = () => {
    setCurrent((prev) => (prev >= maxIndex ? 0 : prev + 1));
  };

  const prev = () => {
    setCurrent((value) => (value <= 0 ? maxIndex : value - 1));
  };

  if (!items || items.length === 0) {
    return (
      <SectionCard title="Live Class">
        <div className="flex flex-col gap-4 rounded-sr-lg border border-sr-line bg-white p-4 shadow-sr-1 sm:flex-row sm:items-center md:gap-6 md:p-6">
          <div className="flex min-w-0 flex-1 items-center gap-4 md:gap-6">
            <img src="/avatar/login-avatar.webp" alt="" className="h-20 w-auto shrink-0 object-contain md:h-24" />
            <div className="min-w-0">
              <p className="font-extrabold text-sr-ink md:text-lg">Belum ada jadwal minggu ini</p>
              <p className="mt-1 text-sm leading-relaxed text-sr-muted">
                Mentor sedang menyiapkan kelas berikutnya. Cek lagi nanti, ya!
              </p>
            </div>
          </div>
          <ScheduleLink className="w-full sm:w-auto" />
        </div>
      </SectionCard>
    );
  }

  return (
    <SectionCard title="Live Class" action={<ScheduleLink />}>
      <div className="w-full">
        <div ref={containerRef} className="relative w-full overflow-hidden">
          <div
            className="flex transition-transform duration-500 ease-out"
            style={{
              gap,
              transform: `translateX(-${current * (cardWidth + gap)}px)`,
            }}
          >
            {items.map((item) => (
              <div
                key={item.id}
                className="flex"
                style={{
                  width: cardWidth,
                  minWidth: cardWidth,
                }}
              >
                <LiveClassCard
                  title={item.title}
                  date={item.date}
                  time={item.time}
                  teacher={item.teacher}
                  link={item.link}
                  locked={item.locked}
                  joinOpensAt={item.joinOpensAt}
                  isLive={now >= Date.parse(item.startsAt) && now < Date.parse(item.endsAt)}
                />
              </div>
            ))}
          </div>
        </div>

        {items.length > 1 && (
          <div className="mt-4 flex items-center justify-between">
            <button
              type="button"
              onClick={prev}
              className="static top-1/2 left-3 z-10 sr-action rounded-full border border-sr-line bg-white p-2.5 text-sr-blue-600 shadow-sr-2 md:absolute"
              aria-label="Previous live class"
            >
              <ArrowLeftIcon size={20} weight="bold" />
            </button>

            <button
              type="button"
              onClick={next}
              className="static top-1/2 right-3 z-10 sr-action rounded-full border border-sr-line bg-white p-2.5 text-sr-blue-600 shadow-sr-2 md:absolute"
              aria-label="Next live class"
            >
              <ArrowRightIcon size={20} weight="bold" />
            </button>
          </div>
        )}
      </div>
    </SectionCard>
  );
};
