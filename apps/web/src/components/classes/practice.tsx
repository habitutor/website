import {
  ArrowCircleRightIcon,
  CalendarBlankIcon,
  ClockIcon,
  EyeIcon,
  EyeSlashIcon,
  UsersIcon,
} from "@phosphor-icons/react";
import * as m from "motion/react-m";
import { useState } from "react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Card } from "@/components/ui/card";

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

export function LiveClassCard({
  title,
  date,
  time,
  teacher,
  link,
}: {
  title: string;
  date: string;
  time: string;
  teacher: string;
  link: string;
}) {
  const displayDate = /^\d{4}-\d{2}-\d{2}$/.test(date)
    ? `${date.slice(8, 10)}-${date.slice(5, 7)}-${date.slice(0, 4)}`
    : date;
  const displayTime = /^\d{2}:\d{2}:\d{2}$/.test(time) ? time.slice(0, 5) : time;

  return (
    <Card className="relative w-full gap-4 space-y-1 overflow-hidden rounded-[10px] border border-tertiary-200 bg-background p-4 sm:p-5 md:w-75">
      <div className="flex w-full flex-row items-start justify-between gap-4">
        <h3 className="text-lg font-bold">{title}</h3>
        <a href={link} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-primary-300">
          <ArrowCircleRightIcon size={24} className="text-tertiary-600" />
        </a>
      </div>
      <div>
        <div className="flex flex-row items-center gap-1">
          <CalendarBlankIcon size={16} className="inline-block" />
          <p className="text-sm">{displayDate}</p>
        </div>
        <div className="flex flex-row items-center gap-1">
          <ClockIcon size={16} className="inline-block" />
          <p className="text-sm">{displayTime}</p>
        </div>
        <div className="flex flex-row items-center gap-1">
          <UsersIcon size={16} className="inline-block" />
          <p className="text-sm">{teacher}</p>
        </div>
      </div>
      <img src="/avatar/live-class-avatar.webp" alt="Live Class" className="absolute right-1 bottom-0" />
    </Card>
  );
}
