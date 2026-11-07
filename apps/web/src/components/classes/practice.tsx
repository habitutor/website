import { EyeIcon, EyeSlashIcon } from "@phosphor-icons/react";
import * as m from "motion/react-m";
import { useState } from "react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

export function PracticeQuestionHeader({ content }: { content: string }) {
  return (
    <div className="relative overflow-hidden rounded-sr-md bg-sr-blue-50">
      <div
        className="absolute top-1/2 -right-12.5 size-45.25 -translate-y-1/2 rounded-full bg-sr-blue-100"
        style={{ zIndex: 0 }}
      />

      <div className="relative flex items-center gap-6 px-6 py-4" style={{ zIndex: 1 }}>
        <h1 className="text-xl font-medium text-sr-ink">{content}</h1>
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
      <div className="flex flex-col gap-3 rounded-sr-md border border-sr-line bg-white p-4 shadow-sr-1">
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-sr-blue-500 px-3 py-1 text-xs font-bold text-white">Soal</span>
          <span className="rounded-full bg-sr-blue-50 px-3 py-1 text-xs font-bold text-sr-blue-700">
            {questionNumber}/{totalQuestions}
          </span>
        </div>
        <div>{question}</div>
      </div>

      <AnswerCollapsible title={answerTitle}>
        <div className="text-sm text-muted-foreground">{answer}</div>
      </AnswerCollapsible>
    </div>
  );
}
