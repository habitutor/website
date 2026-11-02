import {
  ArrowCircleRightIcon,
  CalendarBlankIcon,
  ClockIcon,
  EyeIcon,
  EyeSlashIcon,
  LockKeyIcon,
  UsersIcon,
  VideoCameraIcon,
} from "@phosphor-icons/react";
import { Link } from "@tanstack/react-router";
import * as m from "motion/react-m";
import { useState } from "react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function PracticeQuestionHeader({ content }: { content: string }) {
  return (
    <div className="relative overflow-hidden bg-tertiary-200">
      <div
        className="absolute top-1/2 -right-12.5 size-45.25 -translate-y-1/2 rounded-full bg-tertiary-400"
        style={{ zIndex: 0 }}
      />

      <div className="relative flex items-center gap-6 px-6 py-4" style={{ zIndex: 1 }}>
        <h1 className="text-xl font-medium text-neutral-1000">{content}</h1>
      </div>
    </div>
  );
}

export function AnswerCollapsible({
  children,
  title = "Jawaban",
  defaultOpen = false,
}: {
  children: React.ReactNode;
  title?: string;
  defaultOpen?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger className="group flex items-center gap-2 transition-opacity hover:opacity-80">
        <p className="font-medium">{title}</p>
        {isOpen ? <EyeIcon className="size-4" /> : <EyeSlashIcon className="size-4" />}
      </CollapsibleTrigger>
      <CollapsibleContent className="mt-2 overflow-hidden">
        <m.div
          initial={{ opacity: 0, y: -10 }}
          animate={isOpen ? { opacity: 1, y: 0 } : { opacity: 0, y: -10 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        >
          {children}
        </m.div>
      </CollapsibleContent>
    </Collapsible>
  );
}

export function PracticeQuestion({
  questionNumber,
  totalQuestions,
  question,
  answer,
  answerTitle = "Jawaban",
}: {
  questionNumber: number;
  totalQuestions: number;
  question: React.ReactNode;
  answer: React.ReactNode;
  answerTitle?: string;
}) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col rounded-md border border-neutral-200 p-4">
        <div className="flex space-x-4">
          <div className="w-fit rounded-sm border border-neutral-200 px-4 py-2">Soal</div>
          <div className="w-fit rounded-sm border border-neutral-200 px-4 py-2">
            {questionNumber}/{totalQuestions}
          </div>
        </div>
        <div>{question}</div>
      </div>

      <AnswerCollapsible title={answerTitle}>
        <div className="text-sm text-muted-foreground">{answer}</div>
      </AnswerCollapsible>
    </div>
  );
}

function formatWibTime(iso: string) {
  return new Intl.DateTimeFormat("id-ID", { timeZone: "Asia/Jakarta", hour: "2-digit", minute: "2-digit" })
    .format(new Date(iso))
    .replace(":", ".");
}

// Tanggal "YYYY-MM-DD" dipecah jadi blok kalender kecil; format lain ditampilkan apa adanya.
function getDateParts(date: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return null;
  const value = new Date(`${date}T00:00:00+07:00`);
  const format = (options: Intl.DateTimeFormatOptions) =>
    new Intl.DateTimeFormat("id-ID", { timeZone: "Asia/Jakarta", ...options }).format(value);
  return { day: format({ day: "2-digit" }), month: format({ month: "short" }), weekday: format({ weekday: "long" }) };
}

function LiveClassAction({ link, locked, joinOpensAt }: { link: string | null; locked: boolean; joinOpensAt: string }) {
  if (locked) {
    return (
      <Link
        to="/premium"
        className="flex w-full sr-action items-center justify-center gap-1.5 rounded-sr-sm bg-sr-sun-500 px-4 py-2.5 text-sm font-bold text-sr-ink"
      >
        <LockKeyIcon weight="fill" className="size-4" /> Buka dengan Premium
      </Link>
    );
  }

  if (link) {
    return (
      <a
        href={link}
        target="_blank"
        rel="noopener noreferrer"
        className="flex w-full sr-action items-center justify-center gap-1.5 rounded-sr-sm bg-sr-blue-500 px-4 py-2.5 text-sm font-bold text-white"
      >
        Gabung Sekarang <ArrowCircleRightIcon weight="fill" className="size-5" />
      </a>
    );
  }

  return (
    <span
      className="flex w-full items-center justify-center gap-1.5 rounded-sr-sm border border-dashed border-sr-line-2 bg-sr-blue-50 px-4 py-2.5 text-sm font-semibold text-sr-muted"
      title="Tombol Gabung aktif 15 menit sebelum kelas dimulai"
    >
      <ClockIcon weight="bold" className="size-4" /> Link dibuka {formatWibTime(joinOpensAt)} WIB
    </span>
  );
}

export function LiveClassCard({
  title,
  date,
  time,
  teacher,
  link,
  locked = false,
  isLive = false,
  joinOpensAt,
}: {
  title: string;
  date: string;
  time: string;
  teacher: string;
  link: string | null;
  locked?: boolean;
  isLive?: boolean;
  joinOpensAt: string;
}) {
  const dateParts = getDateParts(date);
  const displayTime = /^\d{2}:\d{2}:\d{2}$/.test(time) ? time.slice(0, 5) : time;

  return (
    <Card
      className={cn(
        "relative h-full w-full min-w-0 sr-lift gap-4 overflow-hidden rounded-sr-md bg-white p-4 sm:p-5",
        isLive ? "border-2 border-sr-live shadow-sr-2" : "border-sr-line",
      )}
    >
      <VideoCameraIcon
        weight="fill"
        className="pointer-events-none absolute -top-3 -right-3 size-24 rotate-12 text-sr-blue-50"
      />

      <div className="relative flex items-start gap-3">
        <div
          className={cn(
            "flex w-14 shrink-0 flex-col items-center rounded-sr-sm py-1.5 text-center",
            isLive ? "bg-sr-live text-white" : "bg-sr-blue-500 text-white",
          )}
        >
          {dateParts ? (
            <>
              <span className="text-xl leading-none font-extrabold">{dateParts.day}</span>
              <span className="text-[11px] font-semibold uppercase">{dateParts.month}</span>
            </>
          ) : (
            <CalendarBlankIcon weight="fill" className="my-1 size-6" />
          )}
        </div>
        <div className="min-w-0 space-y-1">
          {isLive ? (
            <span className="flex w-fit items-center gap-1.5 rounded-full bg-sr-live/10 px-2 py-0.5 text-[11px] font-bold text-sr-live">
              <span className="size-1.5 animate-pulse rounded-full bg-sr-live" /> Sedang berlangsung
            </span>
          ) : (
            <p className="text-xs font-semibold text-sr-muted capitalize">{dateParts?.weekday ?? date}</p>
          )}
          <h3 className="line-clamp-2 min-h-12 text-base leading-snug font-bold text-sr-ink" title={title}>
            {title}
          </h3>
        </div>
      </div>

      <div className="relative flex flex-wrap gap-2 text-xs font-semibold text-sr-ink-2">
        <span className="inline-flex items-center gap-1 rounded-full bg-sr-blue-50 px-2.5 py-1">
          <ClockIcon weight="bold" className="size-3.5 text-sr-blue-600" /> {displayTime} WIB
        </span>
        <span className="inline-flex min-w-0 items-center gap-1 rounded-full bg-sr-sun-100 px-2.5 py-1">
          <UsersIcon weight="bold" className="size-3.5 shrink-0 text-sr-amber-700" />
          <span className="truncate">{teacher}</span>
        </span>
      </div>

      <div className="relative mt-auto">
        <LiveClassAction link={link} locked={locked} joinOpensAt={joinOpensAt} />
      </div>
    </Card>
  );
}
