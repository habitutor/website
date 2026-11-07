import { ArrowRightIcon, CaretLeftIcon, CaretRightIcon } from "@phosphor-icons/react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { type MouseEvent, type PointerEvent, useCallback, useEffect, useRef, useState } from "react";
import { LiveClassJoinAction, LiveClassScheduleCard, type LiveClassStatus } from "@/components/classes/live-class-card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { orpc } from "@/utils/orpc";
import { Accent, SectionCard } from "./section-card";

const DRAG_THRESHOLD_PX = 6;
const DASHBOARD_WINDOW_MS = 7 * 24 * 60 * 60 * 1000;
const DASHBOARD_MAX_ITEMS = 6;

function getStatus(startsAt: string, endsAt: string, now: number): LiveClassStatus {
  if (now < Date.parse(startsAt)) return "upcoming";
  return now < Date.parse(endsAt) ? "live" : "ended";
}

// Dashboard memuat jadwal beberapa hari, jadi tiap kartu perlu menyebut harinya.
function formatWibDay(iso: string) {
  return new Intl.DateTimeFormat("id-ID", {
    timeZone: "Asia/Jakarta",
    weekday: "long",
    day: "numeric",
    month: "short",
  }).format(new Date(iso));
}

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

type ScrollState = { canPrev: boolean; canNext: boolean };

// Geser pakai jari, trackpad, atau drag mouse; tombol panah mengikuti posisi scroll.
function useScrollTrack(itemCount: number) {
  const trackRef = useRef<HTMLDivElement>(null);
  const drag = useRef({ active: false, moved: false, startX: 0, startScroll: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [state, setState] = useState<ScrollState>({ canPrev: false, canNext: false });

  const measure = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    const maxScroll = el.scrollWidth - el.clientWidth;
    setState({
      canPrev: el.scrollLeft > 4,
      canNext: el.scrollLeft < maxScroll - 4,
    });
  }, []);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [measure, itemCount]);

  const scrollByCard = (dir: 1 | -1) => {
    const el = trackRef.current;
    const card = el?.firstElementChild as HTMLElement | null;
    if (!el || !card) return;
    el.scrollBy({ left: dir * (card.offsetWidth + 12), behavior: "smooth" });
  };

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== "mouse" || !trackRef.current) return;
    drag.current = { active: true, moved: false, startX: e.clientX, startScroll: trackRef.current.scrollLeft };
  };

  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    const el = trackRef.current;
    if (!drag.current.active || !el) return;
    const delta = e.clientX - drag.current.startX;
    if (!drag.current.moved && Math.abs(delta) < DRAG_THRESHOLD_PX) return;
    if (!drag.current.moved) {
      drag.current.moved = true;
      setIsDragging(true);
      el.setPointerCapture(e.pointerId);
    }
    el.scrollLeft = drag.current.startScroll - delta;
  };

  const endDrag = () => {
    drag.current.active = false;
    setIsDragging(false);
  };

  // Klik pada link/tombol kartu dibatalkan kalau barusan menggeser.
  const onClickCapture = (e: MouseEvent) => {
    if (!drag.current.moved) return;
    e.preventDefault();
    e.stopPropagation();
    drag.current.moved = false;
  };

  return {
    trackRef,
    state,
    isDragging,
    scrollByCard,
    trackProps: {
      onScroll: measure,
      onPointerDown,
      onPointerMove,
      onPointerUp: endDrag,
      onPointerCancel: endDrag,
      onPointerLeave: endDrag,
      onClickCapture,
    },
  };
}

function ArrowButton({ dir, disabled, onClick }: { dir: 1 | -1; disabled: boolean; onClick: () => void }) {
  const Icon = dir === 1 ? CaretRightIcon : CaretLeftIcon;
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={dir === 1 ? "Jadwal berikutnya" : "Jadwal sebelumnya"}
      className="flex size-9 cursor-pointer items-center justify-center rounded-full border border-sr-line bg-white text-sr-blue-600 shadow-sr-1 transition-all duration-200 hover:border-sr-blue-200 hover:bg-sr-blue-50 active:scale-95 disabled:cursor-not-allowed disabled:opacity-35 disabled:shadow-none"
    >
      <Icon weight="bold" className="size-4" />
    </button>
  );
}

export const LiveClass = () => {
  // Disegarkan berkala supaya link Gabung muncul tepat waktu dan kelas yang selesai hilang sendiri.
  const { data: dashboardContent } = useQuery({
    ...orpc.dashboard.content.queryOptions(),
    refetchInterval: 60_000,
  });
  const now = useNow(30_000);
  // Dashboard cukup jadwal terdekat (7 hari, maks. 6 kartu); jadwal lengkap ada di halaman Live Class.
  const items = (dashboardContent?.liveClasses ?? [])
    .filter((item) => Date.parse(item.startsAt) - now <= DASHBOARD_WINDOW_MS)
    .slice(0, DASHBOARD_MAX_ITEMS);
  const { trackRef, state, isDragging, scrollByCard, trackProps } = useScrollTrack(items.length);
  const isScrollable = state.canPrev || state.canNext;

  if (items.length === 0) {
    return (
      <SectionCard
        title={
          <>
            Live Class <Accent>bareng mentor</Accent>
          </>
        }
      >
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
    <SectionCard
      title={
        <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span>
            Live Class <Accent>bareng mentor</Accent>
          </span>
          <span className="rounded-full bg-sr-blue-50 px-2 py-0.5 text-xs font-bold text-sr-blue-600 max-sm:hidden">
            {items.length} jadwal
          </span>
        </span>
      }
      action={
        <div className="flex items-center gap-2">
          {isScrollable && (
            <div className="hidden items-center gap-1.5 md:flex">
              <ArrowButton dir={-1} disabled={!state.canPrev} onClick={() => scrollByCard(-1)} />
              <ArrowButton dir={1} disabled={!state.canNext} onClick={() => scrollByCard(1)} />
            </div>
          )}
          <ScheduleLink />
        </div>
      }
    >
      <div className="relative">
        <div
          ref={trackRef}
          {...trackProps}
          className={cn(
            "-mx-1 flex gap-3 overflow-x-auto overscroll-x-contain scroll-smooth px-1 pt-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
            isDragging ? "cursor-grabbing snap-none [scroll-behavior:auto] select-none" : "snap-x snap-mandatory",
            isScrollable && !isDragging && "md:cursor-grab",
          )}
        >
          {items.map((item) => (
            <div
              key={item.id}
              className="flex w-[85%] shrink-0 snap-start sm:w-[calc((100%-0.75rem)/2)] lg:w-[calc((100%-1.5rem)/3)]"
            >
              <LiveClassScheduleCard
                title={item.title}
                teacher={item.teacher}
                category={item.category}
                startsAt={item.startsAt}
                endsAt={item.endsAt}
                status={getStatus(item.startsAt, item.endsAt, now)}
                dateLabel={formatWibDay(item.startsAt)}
                action={
                  <LiveClassJoinAction
                    link={item.link}
                    lockReason={item.lockReason ?? (item.locked ? "premium" : null)}
                    joinOpensAt={item.joinOpensAt}
                  />
                }
              />
            </div>
          ))}
        </div>

        <div
          className={cn(
            "pointer-events-none absolute inset-y-0 left-0 w-8 bg-linear-to-r from-sr-ivory to-transparent transition-opacity duration-300",
            state.canPrev ? "opacity-100" : "opacity-0",
          )}
        />
        <div
          className={cn(
            "pointer-events-none absolute inset-y-0 right-0 w-8 bg-linear-to-l from-sr-ivory to-transparent transition-opacity duration-300",
            state.canNext ? "opacity-100" : "opacity-0",
          )}
        />
      </div>
    </SectionCard>
  );
};
