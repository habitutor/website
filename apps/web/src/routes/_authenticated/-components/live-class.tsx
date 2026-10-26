import { ArrowLeftIcon, ArrowRightIcon } from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { LiveClassCard } from "@/components/classes/practice";
import { orpc } from "@/utils/orpc";

function useNow(intervalMs: number) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), intervalMs);
    return () => window.clearInterval(id);
  }, [intervalMs]);
  return now;
}

function ScheduleLink() {
  return (
    <Link to="/live-class" className="shrink-0 text-sm font-semibold text-primary-300 hover:underline">
      Lihat semua jadwal
    </Link>
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
  // Di HP satu kartu selebar area carousel supaya tepi kanannya tidak terpotong; 304px selama belum terukur.
  const cardWidth = containerWidth > 0 && containerWidth < 640 ? containerWidth : 304;
  const maxIndex = Math.max(0, items.length - visible);

  const next = () => {
    setCurrent((prev) => (prev >= maxIndex ? 0 : prev + 1));
  };

  const prev = () => {
    setCurrent((value) => (value <= 0 ? maxIndex : value - 1));
  };

  if (!items || items.length === 0) {
    return (
      <section className="rounded-2xl border bg-neutral-100 p-4 md:p-10">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-medium">Live Class bersama Mentor</h2>
          <ScheduleLink />
        </div>
        <div className="flex flex-col items-center justify-center space-y-6 py-8 text-center">
          <img src="/avatar/pencil-blue-avatar.webp" alt="Belum ada kelas" className="h-40 w-auto" />
          <p className="text-2xl font-bold text-black">Tunggu ya, Mentor terbaikmu akan segera hadir!</p>
        </div>
      </section>
    );
  }

  return (
    <section className="relative rounded-2xl border bg-neutral-100 p-4 md:p-10">
      <div className="mb-2 flex items-center justify-between gap-3">
        <h2 className="font-medium">Live Class bersama Mentor</h2>
        <ScheduleLink />
      </div>
      <div className="w-full">
        <div ref={containerRef} className="relative w-full overflow-hidden">
          <div
            className="flex transition-transform duration-500 ease-out"
            style={{
              gap: 10,
              transform: `translateX(-${current * (cardWidth + 10)}px)`,
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
              className="static top-1/2 left-5 rounded-lg bg-primary-200 p-2 text-white md:absolute"
              aria-label="Previous live class"
            >
              <ArrowLeftIcon size={20} />
            </button>

            <button
              type="button"
              onClick={next}
              className="static top-1/2 right-5 rounded-lg bg-primary-200 p-2 text-white md:absolute"
              aria-label="Next live class"
            >
              <ArrowRightIcon size={20} />
            </button>
          </div>
        )}
      </div>
    </section>
  );
};
