import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type SectionCardProps = {
  title?: ReactNode;
  action?: ReactNode;
  className?: string;
  children: ReactNode;
};

export function SectionCard({ title, action, className, children }: SectionCardProps) {
  return (
    <section
      className={cn(
        "relative w-full rounded-sr-lg border border-sr-line bg-white/85 p-4 shadow-sr-1 md:p-10",
        className,
      )}
    >
      {(title || action) && (
        <div className="mb-3 flex items-center justify-between gap-3">
          {title && <h2 className="text-lg font-extrabold text-sr-ink md:text-xl">{title}</h2>}
          {action}
        </div>
      )}
      {children}
    </section>
  );
}
