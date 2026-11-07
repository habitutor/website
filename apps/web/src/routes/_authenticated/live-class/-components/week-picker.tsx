import { CalendarDotsIcon, CaretLeftIcon, CaretRightIcon } from "@phosphor-icons/react";
import { AnimatePresence, motion, type PanInfo } from "motion/react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const SWIPE_THRESHOLD_PX = 50;

type WeekPickerProps = {
  days: string[];
  today: string;
  selectedDate: string;
  isCurrentWeek: boolean;
  hasClassOn: (date: string) => boolean;
  formatDay: (date: string, options: Intl.DateTimeFormatOptions) => string;
  onSelect: (date: string) => void;
  onShiftWeek: (offset: 1 | -1) => void;
  onToday: () => void;
};

function NavButton({ dir, onClick }: { dir: 1 | -1; onClick: () => void }) {
  const Icon = dir === 1 ? CaretRightIcon : CaretLeftIcon;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={dir === 1 ? "Minggu berikutnya" : "Minggu sebelumnya"}
      className="flex size-9 cursor-pointer items-center justify-center rounded-full text-sr-blue-600 transition-all duration-200 hover:bg-white hover:shadow-sr-1 active:scale-90"
    >
      <Icon weight="bold" className="size-4" />
    </button>
  );
}

// Pindah minggu bisa lewat tombol atau digeser (jari/mouse) ke kiri-kanan.
export function WeekPicker({
  days,
  today,
  selectedDate,
  isCurrentWeek,
  hasClassOn,
  formatDay,
  onSelect,
  onShiftWeek,
  onToday,
}: WeekPickerProps) {
  const [direction, setDirection] = useState<1 | -1>(1);
  const first = days[0];
  const last = days[days.length - 1];
  const sameMonth = formatDay(first, { month: "short" }) === formatDay(last, { month: "short" });
  const rangeLabel = sameMonth
    ? `${formatDay(first, { day: "numeric" })}–${formatDay(last, { day: "numeric", month: "short", year: "numeric" })}`
    : `${formatDay(first, { day: "numeric", month: "short" })} – ${formatDay(last, { day: "numeric", month: "short", year: "numeric" })}`;

  const shift = (offset: 1 | -1) => {
    setDirection(offset);
    onShiftWeek(offset);
  };

  const handleDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.x < -SWIPE_THRESHOLD_PX) shift(1);
    else if (info.offset.x > SWIPE_THRESHOLD_PX) shift(-1);
  };

  return (
    <section className="rounded-sr-xl border border-sr-line bg-white p-4 shadow-sr-1 sm:p-6" aria-label="Pilih tanggal">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="flex size-9 items-center justify-center rounded-sr-sm bg-sr-blue-50 text-sr-blue-600">
            <CalendarDotsIcon weight="duotone" className="size-5" />
          </span>
          <div>
            <p className="text-xs font-semibold text-sr-muted">{isCurrentWeek ? "Minggu ini" : "Minggu"}</p>
            <p className="font-extrabold text-sr-ink">{rangeLabel}</p>
          </div>
        </div>

        <div className="flex items-center gap-1 rounded-full border border-sr-line bg-sr-blue-50 p-1">
          <NavButton dir={-1} onClick={() => shift(-1)} />
          <button
            type="button"
            onClick={() => {
              setDirection(1);
              onToday();
            }}
            disabled={isCurrentWeek && selectedDate === today}
            className="h-9 cursor-pointer rounded-full px-3 text-xs font-bold text-sr-blue-700 transition-all duration-200 hover:bg-white hover:shadow-sr-1 disabled:cursor-default disabled:bg-white disabled:shadow-sr-1"
          >
            Hari ini
          </button>
          <NavButton dir={1} onClick={() => shift(1)} />
        </div>
      </div>

      {/* Geser jari dibaca lewat pan di pembungkus (tidak memindahkan elemen); animasi ganti minggu ada di grid.
          Jangan gabungkan drag dengan initial/exit di elemen yang sama: klik tanggal bisa membuat grid tertahan di x 40%. */}
      <motion.div className="touch-pan-y overflow-hidden" onPanEnd={handleDragEnd}>
        <AnimatePresence mode="popLayout" initial={false} custom={direction}>
          <motion.div
            key={first}
            custom={direction}
            initial={{ x: `${direction * 40}%`, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: `${direction * -40}%`, opacity: 0 }}
            transition={{ type: "spring", stiffness: 320, damping: 32 }}
            className="grid grid-cols-7 gap-1.5 sm:gap-3"
          >
            {days.map((date) => {
              const isSelected = date === selectedDate;
              const isToday = date === today;
              const hasClass = hasClassOn(date);
              return (
                <button
                  key={date}
                  type="button"
                  onClick={() => onSelect(date)}
                  aria-pressed={isSelected}
                  aria-label={formatDay(date, { weekday: "long", day: "numeric", month: "long" })}
                  className={cn(
                    "flex cursor-pointer flex-col items-center gap-0.5 rounded-sr-md border py-2 transition-all duration-300 ease-sr-spring sm:py-3",
                    isSelected
                      ? "-translate-y-1 border-transparent bg-(image:--sr-grad-blue) text-white shadow-sr-2"
                      : isToday
                        ? "border-sr-sun-400 bg-sr-sun-100 text-sr-ink hover:-translate-y-0.5"
                        : "border-sr-line bg-white text-sr-ink hover:-translate-y-0.5 hover:border-sr-blue-200 hover:shadow-sr-1",
                  )}
                >
                  <span
                    className={cn(
                      "text-[10px] font-semibold uppercase sm:text-xs",
                      isSelected ? "text-white/80" : "text-sr-muted",
                    )}
                  >
                    <span className={cn(isToday && "sm:hidden")}>{formatDay(date, { weekday: "short" })}</span>
                    {isToday && <span className="hidden sm:inline">Hari ini</span>}
                  </span>
                  <span className="text-lg font-extrabold sm:text-2xl">{formatDay(date, { day: "numeric" })}</span>
                  <span
                    className={cn(
                      "size-1.5 rounded-full",
                      hasClass ? (isSelected ? "bg-sr-sun-400" : "bg-sr-blue-500") : "bg-transparent",
                    )}
                  />
                </button>
              );
            })}
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </section>
  );
}
